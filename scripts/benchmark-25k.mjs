import { performance } from "node:perf_hooks";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import initSqlJs from "sql.js/dist/sql-asm.js";

const results = [];
const measure = async (name, target, action) => {
  const start = performance.now();
  const value = await action();
  const ms = performance.now() - start;
  results.push({ name, ms, target, pass: ms <= target, value });
  return value;
};

const SQL = await measure("SQL engine cold initialization", 15000, () => initSqlJs());
const db = new SQL.Database();
db.run("CREATE TABLE records (id TEXT PRIMARY KEY, type TEXT, name TEXT, search_text TEXT, lat REAL, lng REAL, asset_class TEXT, updated TEXT); CREATE INDEX idx_type ON records(type); CREATE TABLE edges (id TEXT PRIMARY KEY, from_id TEXT, to_id TEXT, relationship_type TEXT); CREATE INDEX idx_from ON edges(from_id); CREATE INDEX idx_to ON edges(to_id);");
const csv = ["id,name,address,asset_class,lat,lng"];
await measure("25,000-row CSV generation and analytical import", 120000, () => {
  db.run("BEGIN");
  const statement = db.prepare("INSERT INTO records VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
  const edge = db.prepare("INSERT INTO edges VALUES (?, ?, ?, ?)");
  for (let i = 0; i < 25000; i++) {
    const asset = ["retail", "industrial", "office", "multifamily"][i % 4];
    const lat = 32.55 + (i % 100) * .006;
    const lng = -97.5 + (i % 120) * .006;
    statement.run([`record_${i}`, asset === "retail" ? "property" : "company", `DFW Intelligence Record ${i}`, `dfw intelligence record ${i} ${asset} owner ${i % 500}`, lat, lng, asset, "2026-06-04"]);
    edge.run([`edge_${i}`, `record_${i}`, `record_${(i + 1) % 25000}`, i % 3 ? "RELATED_TO" : "PROPERTY_OWNED_BY_ENTITY"]);
    csv.push(`record_${i},"DFW Intelligence Record ${i}","${1000 + i} Demo Way",${asset},${lat},${lng}`);
  }
  statement.free(); edge.free(); db.run("COMMIT");
});
const bytes = db.export();
await measure("Warm database reload", 3000, () => new SQL.Database(bytes));
await measure("Search results", 250, () => db.exec("SELECT id, name FROM records WHERE search_text LIKE '%owner 42%' LIMIT 100"));
await measure("Focused graph query", 500, () => {
  const adjacency = new Map();
  const rows = db.exec("SELECT from_id, to_id FROM edges")[0].values;
  for (const [from, to] of rows) {
    adjacency.set(from, [...(adjacency.get(from) ?? []), to]);
    adjacency.set(to, [...(adjacency.get(to) ?? []), from]);
  }
  const visited = new Set(["record_1"]); let frontier = ["record_1"];
  for (let depth = 0; depth < 4; depth++) {
    const next = [];
    for (const id of frontier) for (const other of adjacency.get(id) ?? []) if (!visited.has(other)) { visited.add(other); next.push(other); }
    frontier = next;
  }
  return visited.size;
});
await measure("Map filter refresh", 750, () => {
  const rows = db.exec("SELECT id, lat, lng, asset_class FROM records WHERE type = 'property' OR asset_class = 'retail'")[0].values;
  return rows.filter(([, lat, lng]) => Number(lat) > 32.65 && Number(lat) < 33.05 && Number(lng) > -97.35 && Number(lng) < -96.65).length;
});
await measure("25,000-row CSV parse fallback", 120000, () => csv.join("\n").split(/\r?\n/).slice(1).map((row) => row.split(",")));

const report = `# V2 25,000-Record Benchmark\n\nGenerated: ${new Date().toISOString()}\n\n| Benchmark | Result | Target | Status |\n|---|---:|---:|---|\n${results.map((result) => `| ${result.name} | ${result.ms.toFixed(1)} ms | ${result.target} ms | ${result.pass ? "PASS" : "FAIL"} |`).join("\n")}\n\nThe benchmark uses a deterministic 25,000-record and 25,000-edge analytical fixture. Desktop Obsidian rendering remains covered by the manual checklist.\n`;
await writeFile(path.join(process.cwd(), "docs", "V2_BENCHMARK_REPORT.md"), report);
console.log(results.map((result) => `${result.pass ? "PASS" : "FAIL"} ${result.name}: ${result.ms.toFixed(1)}ms / ${result.target}ms`).join("\n"));
if (results.some((result) => !result.pass)) process.exitCode = 1;

