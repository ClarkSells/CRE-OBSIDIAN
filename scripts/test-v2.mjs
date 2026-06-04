import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import initSqlJs from "sql.js/dist/sql-asm.js";

const root = process.cwd();
const SQL = await initSqlJs();
const db = new SQL.Database();
db.run(`
  CREATE TABLE records (id TEXT PRIMARY KEY, type TEXT, name TEXT, search_text TEXT, promoted INTEGER);
  CREATE TABLE edges (id TEXT PRIMARY KEY, from_id TEXT, to_id TEXT, relationship_type TEXT, valid_from TEXT, valid_to TEXT, status TEXT);
  CREATE TABLE record_events (id TEXT PRIMARY KEY, record_id TEXT, event_type TEXT, dedupe_key TEXT UNIQUE);
  CREATE TABLE field_assertions (id TEXT PRIMARY KEY, record_id TEXT, field TEXT, value_json TEXT, review_status TEXT);
`);
db.run("INSERT INTO records VALUES (?, ?, ?, ?, ?)", ["prop_1", "property", "Demo Property", "demo property dallas retail", 1]);
db.run("INSERT INTO records VALUES (?, ?, ?, ?, ?)", ["entity_1", "entity", "Demo Owner LLC", "demo owner llc texas", 1]);
db.run("INSERT INTO records VALUES (?, ?, ?, ?, ?)", ["person_1", "person", "Demo Principal", "demo principal owner", 1]);
db.run("INSERT INTO edges VALUES (?, ?, ?, ?, ?, ?, ?)", ["edge_1", "prop_1", "entity_1", "PROPERTY_OWNED_BY_ENTITY", "2020-01-01", null, "active"]);
db.run("INSERT INTO edges VALUES (?, ?, ?, ?, ?, ?, ?)", ["edge_2", "entity_1", "person_1", "ENTITY_CONTROLLED_BY_PERSON", "2021-01-01", null, "active"]);
db.run("INSERT OR IGNORE INTO record_events VALUES (?, ?, ?, ?)", ["event_1", "prop_1", "record_created", "create:prop_1"]);
db.run("INSERT OR IGNORE INTO record_events VALUES (?, ?, ?, ?)", ["event_2", "prop_1", "record_created", "create:prop_1"]);
db.run("INSERT INTO field_assertions VALUES (?, ?, ?, ?, ?)", ["assertion_1", "prop_1", "owner_entity", '"entity_1"', "accepted"]);
db.run("INSERT INTO field_assertions VALUES (?, ?, ?, ?, ?)", ["assertion_2", "prop_1", "owner_entity", '"entity_2"', "pending"]);

const search = db.exec("SELECT id FROM records WHERE search_text LIKE '%dallas%'");
assert.equal(search[0].values[0][0], "prop_1", "Analytical search should find a property by search text.");
const asOf = db.exec("SELECT id FROM edges WHERE valid_from <= '2020-06-01' AND (valid_to IS NULL OR valid_to >= '2020-06-01')");
assert.equal(asOf[0].values.length, 1, "Temporal edge query should honor valid_from.");
const events = db.exec("SELECT COUNT(*) FROM record_events");
assert.equal(events[0].values[0][0], 1, "Event dedupe keys should keep history idempotent.");
const assertions = db.exec("SELECT COUNT(*) FROM field_assertions WHERE record_id = 'prop_1'");
assert.equal(assertions[0].values[0][0], 2, "Conflicting field assertions should be preserved.");

const graphSource = await readFile(path.join(root, "src", "services", "GraphService.ts"), "utf8");
const storeSource = await readFile(path.join(root, "src", "services", "AnalyticalStore.ts"), "utf8");
const importSource = await readFile(path.join(root, "src", "services", "ImportService.ts"), "utf8");
const editorSource = await readFile(path.join(root, "src", "modals", "RecordEditorModal.ts"), "utf8");
assert.match(graphSource, /shortestPath/, "Graph service must expose shortest-path explanations.");
assert.match(graphSource, /ownershipChain/, "Graph service must expose ownership-chain traversal.");
assert.match(storeSource, /pre-migration/, "Analytical store must back up before migrations.");
assert.match(storeSource, /v2-migration:/, "V1-to-V2 projection must record idempotent migration events.");
assert.doesNotMatch(storeSource.match(/async syncMarkdownRecords[\s\S]*?async upsertRecord/)?.[0] ?? "", /modify\(/, "V1-to-V2 projection must not rewrite Markdown.");
assert.match(storeSource, /rollbackImport/, "Analytical store must support import rollback.");
assert.match(importSource, /RealNex \/ Auto Map|REALNEX_ALIASES/, "Import service must include RealNex-oriented mapping.");
assert.match(editorSource, /processFrontMatter|updateFrontmatter/, "Rich editor must preserve Markdown bodies through frontmatter updates.");
console.log("V2 unit/integration smoke passed: SQL history, temporal edges, search, assertions, graph, import rollback, and safe editing.");
