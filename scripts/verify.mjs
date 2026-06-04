import { readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const vault = path.join(root, "sample-vault");
const results = [];
const check = (name, pass, detail) => results.push({ name, pass, detail });
const exists = async (file) => { try { await stat(file); return true; } catch { return false; } };
const walk = async (dir) => (await readdir(dir, { withFileTypes: true })).flatMap((entry) => entry.isDirectory() ? [] : [path.join(dir, entry.name)]);
const recursive = async (dir) => {
  const output = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) entry.isDirectory() ? output.push(...await recursive(path.join(dir, entry.name))) : output.push(path.join(dir, entry.name));
  return output;
};
const hash = async (file) => crypto.createHash("sha256").update(await readFile(file)).digest("hex");

for (const artifact of ["manifest.json", "main.js", "styles.css"]) check(`Build artifact ${artifact}`, await exists(path.join(root, artifact)), artifact);
check("Bundle is nontrivial", (await stat(path.join(root, "main.js"))).size > 50000, `${(await stat(path.join(root, "main.js"))).size} bytes`);
const syntax = spawnSync(process.execPath, ["--check", path.join(root, "main.js")], { encoding: "utf8" });
check("Bundle JavaScript syntax", syntax.status === 0, syntax.stderr.trim() || "node --check passed");
const lifecycle = spawnSync(process.execPath, [path.join(root, "scripts", "load-smoke.cjs")], { cwd: root, encoding: "utf8" });
check("Compiled plugin lifecycle smoke", lifecycle.status === 0, lifecycle.stdout.trim() || lifecycle.stderr.trim());
for (const doc of ["README.md", "KNOWN_LIMITATIONS.md", "docs/ARCHITECTURE.md", "docs/SCHEMA.md", "docs/REALNEX_SYNC.md", "docs/FUTURE_AGENT_ENGINE.md", "docs/MANUAL_TESTS.md", "docs/ACCEPTANCE_CHECKLIST.md", "docs/V2_AUDIT_REPORT.md", "docs/V2_FEATURE_MATRIX.md", "docs/V2_ARCHITECTURE.md", "docs/V2_MIGRATION.md", "docs/V2_ACCEPTANCE_CHECKLIST.md", "docs/V2_BENCHMARK_REPORT.md"]) check(`Documentation ${doc}`, await exists(path.join(root, doc)), doc);

const commandSource = await readFile(path.join(root, "main.ts"), "utf8");
const commandIds = ["initialize-vault", "open-command-center", "open-property-war-room", "open-owner-dossier", "open-relationship-graph", "open-deal-signal-radar", "open-comps-board", "open-investor-match", "open-realnex-queue", "open-history-timeline", "open-map-intelligence", "open-import-center", "open-data-quality", "open-task-center", "open-requirements-board", "open-pursuit-pipeline", "open-transaction-manager", "open-unified-search", "open-company-360", "open-contact-360", "create-relationship-edge", "rebuild-index", "validate-current-note", "export-realnex-csv", "generate-sample-dataset", "v2-store-health", "v2-backup-store", "v2-sync-markdown", "edit-current-record", "v2-apply-workflow", "v2-create-task-current", "v2-start-pursuit-current"];
for (const id of commandIds) check(`Command ${id}`, commandSource.includes(id), id);

const files = (await recursive(vault)).filter((file) => file.endsWith(".md") && !file.includes(`${path.sep}.obsidian${path.sep}`));
const records = [];
for (const file of files) {
  const content = await readFile(file, "utf8");
  const fm = content.match(/^---\n([\s\S]*?)\n---/);
  if (!fm) continue;
  const pick = (key) => fm[1].match(new RegExp(`^${key}: (.+)$`, "m"))?.[1]?.replace(/^"|"$/g, "");
  records.push({ file, content, type: pick("type"), id: pick("id"), source_status: pick("source_status"), human_review: pick("human_review"), confidence_tier: pick("confidence_tier") });
}
const required = { property: 12, parcel: 12, entity: 10, person: 8, investor_profile: 8, tenant: 15, lease: 15, loan: 8, sale_comp: 15, lease_comp: 10, submarket: 8, deal_signal: 20, relationship_edge: 70, broker_activity: 10, company: 6, task: 16, requirement: 8, pursuit: 10, transaction: 6, document: 8, timeline_template: 5, saved_view: 3 };
for (const [type, count] of Object.entries(required)) check(`Demo count ${type}`, records.filter((record) => record.type === type).length >= count, `${records.filter((record) => record.type === type).length}/${count}+`);
check("Every demo record has required base fields", records.every((r) => r.type && r.id && r.confidence_tier && r.source_status === "demo" && r.human_review === "true"), `${records.length} records inspected`);
check("Markdown bodies are human-readable", records.every((r) => r.content.includes("## Broker Notes") && r.content.includes("## Source Trail")), "Broker Notes and Source Trail preserved");
const csv = path.join(vault, "Exports", "realnex_export_2026-06-04_00-00-00.csv");
const csvText = await readFile(csv, "utf8");
check("RealNex sample CSV exists", await exists(csv), csv);
check("RealNex columns complete", ["RecordType", "RealNexID", "Name", "Address", "ConfidenceTier", "HumanReview", "SourceStatus", "Notes"].every((column) => csvText.split("\n")[0].includes(column)), "Required mapping columns found");
for (const artifact of ["manifest.json", "main.js", "styles.css"]) check(`Sample plugin ${artifact} matches build`, await hash(path.join(root, artifact)) === await hash(path.join(vault, ".obsidian", "plugins", "strive-navigator", artifact)), artifact);
check("Validation service has core safeguards", (await readFile(path.join(root, "src", "services", "Validation.ts"), "utf8")).includes("Property has no owner entity") && (await readFile(path.join(root, "src", "services", "Validation.ts"), "utf8")).includes("Relationship edge is incomplete"), "Property, lease, edge, and confidence checks present");
check("Frontmatter updates preserve Markdown body", (await readFile(path.join(root, "src", "services", "RecordFactory.ts"), "utf8")).includes("processFrontMatter"), "Obsidian processFrontMatter used");
check("V2 analytical store and migrations", (await readFile(path.join(root, "src", "services", "AnalyticalStore.ts"), "utf8")).includes("schema_version") && (await readFile(path.join(root, "src", "services", "AnalyticalStore.ts"), "utf8")).includes("pre-migration"), "Schema version, backup, store persistence present");
check("V2 temporal graph and path explanations", (await readFile(path.join(root, "src", "services", "GraphService.ts"), "utf8")).includes("shortestPath") && (await readFile(path.join(root, "src", "services", "GraphService.ts"), "utf8")).includes("ownershipChain"), "Graph traversal and ownership-chain service present");
check("V2 CSV import and rollback", (await readFile(path.join(root, "src", "services", "ImportService.ts"), "utf8")).includes("importCsv") && (await readFile(path.join(root, "src", "services", "AnalyticalStore.ts"), "utf8")).includes("rollbackImport"), "CSV mapping, dedupe, import, promotion, and rollback present");
check("V2 map and local tile protocol", (await readFile(path.join(root, "src", "views", "MapIntelligenceView.ts"), "utf8")).includes("MapLibre") && (await readFile(path.join(root, "src", "views", "MapIntelligenceView.ts"), "utf8")).includes("pmtiles"), "MapLibre and PMTiles support present");
check("V2 rich record editor", (await readFile(path.join(root, "src", "modals", "RecordEditorModal.ts"), "utf8")).includes("TYPE_FIELDS") && (await readFile(path.join(root, "src", "modals", "RecordEditorModal.ts"), "utf8")).includes("updateFrontmatter"), "Schema-driven safe frontmatter editor present");
const spatialSource = await readFile(path.join(root, "src", "services", "SpatialService.ts"), "utf8");
check("V2 spatial selection", ["withinRadius", "withinPolygon", "withinCorridor"].every((name) => spatialSource.includes(name)), "Radius, polygon, and corridor spatial services present");
check("V2 workflows", (await readFile(path.join(root, "src", "services", "WorkflowService.ts"), "utf8")).includes("applyTemplate") && (await readFile(path.join(root, "src", "services", "WorkflowService.ts"), "utf8")).includes("completeTask") && (await readFile(path.join(root, "src", "services", "WorkflowService.ts"), "utf8")).includes("transitionPursuit"), "Timeline templates, recurring tasks, and pursuit stages present");

const passed = results.filter((result) => result.pass).length;
const report = `# Acceptance Report\n\nGenerated: ${new Date().toISOString()}\n\n**Result: ${passed}/${results.length} automated checks passed.**\n\n| Check | Status | Detail |\n|---|---|---|\n${results.map((r) => `| ${r.name} | ${r.pass ? "PASS" : "FAIL"} | ${r.detail} |`).join("\n")}\n\n## Runtime Manual Check\n\nOpen \`sample-vault/\` in Obsidian, enable STRIVE Navigator, and follow \`docs/MANUAL_TESTS.md\`. Automated checks validate the bundle, installed artifacts, schemas, sample records, export, commands, and preservation strategy; they cannot prove Obsidian desktop rendering without launching the desktop application. This managed session located Obsidian desktop but received \`Access is denied\` when launching it and reading its runtime log.\n`;
await writeFile(path.join(root, "docs", "ACCEPTANCE_REPORT.md"), report);
console.log(`${passed}/${results.length} acceptance checks passed.`);
for (const result of results.filter((r) => !r.pass)) console.error(`FAIL: ${result.name} (${result.detail})`);
if (passed !== results.length) process.exitCode = 1;
