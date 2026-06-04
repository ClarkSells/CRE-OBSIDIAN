import esbuild from "esbuild";
import process from "process";
import builtinModules from "builtin-modules";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { readFile } from "node:fs/promises";

const production = process.argv[2] === "production";
const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const mainPath = path.join(projectRoot, "main.ts");
const virtualProjectFiles = {
  name: "virtual-project-files",
  setup(build) {
    build.onResolve({ filter: /^\./ }, (args) => {
      const base = path.resolve(args.resolveDir, args.path);
      const resolved = path.extname(base) ? base : `${base}.ts`;
      return { path: resolved };
    });
    build.onLoad({ filter: /\.ts$/ }, async (args) => ({
      contents: await readFile(args.path, "utf8"),
      loader: "ts",
      resolveDir: path.dirname(args.path),
      watchFiles: [args.path]
    }));
  }
};
const context = await esbuild.context({
  absWorkingDir: projectRoot,
  banner: { js: "/* STRIVE Navigator */" },
  stdin: {
    contents: await readFile(mainPath, "utf8"),
    loader: "ts",
    resolveDir: projectRoot,
    sourcefile: "main.ts"
  },
  plugins: [virtualProjectFiles],
  bundle: true,
  external: ["obsidian", "electron", "@codemirror/*", "@lezer/*", ...builtinModules],
  format: "cjs",
  target: "es2022",
  logLevel: "info",
  sourcemap: production ? false : "inline",
  treeShaking: true,
  outfile: path.join(projectRoot, "main.js")
});

if (production) {
  await context.rebuild();
  await context.dispose();
} else {
  await context.watch();
}
