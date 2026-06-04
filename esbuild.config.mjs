import esbuild from "esbuild";
import process from "process";
import builtinModules from "builtin-modules";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";

const production = process.argv[2] === "production";
const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const mainPath = path.join(projectRoot, "main.ts");
const projectRequire = createRequire(import.meta.url);
const externalPackages = ["obsidian", "electron"];
const virtualProjectFiles = {
  name: "virtual-project-files",
  setup(build) {
    build.onResolve({ filter: /^\./ }, (args) => {
      const base = path.resolve(args.resolveDir, args.path);
      const candidates = path.extname(base) ? [base] : [`${base}.ts`, `${base}.tsx`, `${base}.js`, `${base}.mjs`, `${base}.cjs`, `${base}.json`, path.join(base, "index.ts"), path.join(base, "index.js")];
      const resolved = candidates.find(existsSync);
      return resolved ? { path: resolved } : undefined;
    });
    build.onResolve({ filter: /^[^./]/ }, (args) => {
      if (args.path.startsWith("node:") || builtinModules.includes(args.path) || externalPackages.includes(args.path) || args.path.startsWith("@codemirror/") || args.path.startsWith("@lezer/")) return { path: args.path, external: true };
      try {
        return { path: projectRequire.resolve(args.path, { paths: [args.resolveDir, projectRoot] }) };
      } catch {
        return undefined;
      }
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
  external: ["obsidian", "electron", "node:*", "@codemirror/*", "@lezer/*", ...builtinModules],
  format: "cjs",
  target: "es2022",
  logLevel: "info",
  sourcemap: production ? false : "inline",
  minify: production,
  treeShaking: true,
  outfile: path.join(projectRoot, "main.js")
});

if (production) {
  await context.rebuild();
  await context.dispose();
} else {
  await context.watch();
}
