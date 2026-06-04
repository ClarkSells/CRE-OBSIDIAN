import { Notice, TFile, Vault } from "obsidian";
import initSqlJs from "sql.js/dist/sql-asm.js";
import type { Database, SqlValue } from "sql.js";
import { V2_SCHEMA_VERSION } from "../constants";
import type { FieldAssertion, NavigatorRecord, RecordEvent, RecordType, StoreHealth, TemporalEdge } from "../types";
import { timestamp } from "../utils/format";

const STORE_PATH = "System/strive-navigator-v2.sqlite";
const BACKUP_FOLDER = "System/Backups";

export class AnalyticalStore {
  private db?: Database;
  private healthState: StoreHealth = { ready: false, schemaVersion: 0, recordCount: 0, edgeCount: 0, eventCount: 0, assertionCount: 0 };

  constructor(private vault: Vault) {}

  async initialize(): Promise<StoreHealth> {
    try {
      await this.ensureFolder("System");
      await this.ensureFolder(BACKUP_FOLDER);
      const SQL = await initSqlJs();
      const existing = this.vault.getAbstractFileByPath(STORE_PATH);
      const bytes = existing instanceof TFile ? new Uint8Array(await this.vault.readBinary(existing)) : undefined;
      this.db = bytes?.length ? new SQL.Database(bytes) : new SQL.Database();
      await this.migrate();
      await this.save();
      return this.refreshHealth();
    } catch (error) {
      this.healthState = { ...this.healthState, ready: false, degradedReason: error instanceof Error ? error.message : String(error) };
      console.error("STRIVE Navigator analytical store degraded", error);
      return this.healthState;
    }
  }

  health(): StoreHealth {
    return { ...this.healthState };
  }

  async backup(reason = "manual"): Promise<string | undefined> {
    if (!this.db) return undefined;
    const existing = this.vault.getAbstractFileByPath(STORE_PATH);
    if (!(existing instanceof TFile)) return undefined;
    const stamp = new Date().toISOString().replace(/[.:]/g, "-");
    const path = `${BACKUP_FOLDER}/strive-v2-${reason}-${stamp}.sqlite`;
    await this.vault.createBinary(path, await this.vault.readBinary(existing));
    return path;
  }

  async save(): Promise<void> {
    if (!this.db) return;
    const data = this.db.export();
    const existing = this.vault.getAbstractFileByPath(STORE_PATH);
    if (existing instanceof TFile) await this.vault.modifyBinary(existing, data.buffer as ArrayBuffer);
    else await this.vault.createBinary(STORE_PATH, data.buffer as ArrayBuffer);
    this.healthState.lastSaved = timestamp();
  }

  async syncMarkdownRecords(records: NavigatorRecord[]): Promise<void> {
    if (!this.db) return;
    this.db.run("BEGIN");
    try {
      for (const record of records) {
        this.upsertRecordInternal(record, true);
        this.db.run(
          `INSERT OR IGNORE INTO record_events (id, record_id, event_type, occurred_at, actor, summary, data_json, dedupe_key)
           VALUES (?, ?, 'markdown_migrated', ?, 'STRIVE Navigator', ?, ?, ?)`,
          [`event_migration_${record.id}`, record.id, timestamp(), `${record.name} projected into V2 analytical store`, JSON.stringify({ path: record.path, type: record.type }), `v2-migration:${record.id}`]
        );
      }
      this.db.run("COMMIT");
      await this.save();
      this.refreshHealth();
    } catch (error) {
      this.db.run("ROLLBACK");
      throw error;
    }
  }

  async upsertRecord(record: NavigatorRecord, promoted = false, importBatchId?: string): Promise<void> {
    if (!this.db) return;
    this.upsertRecordInternal(record, promoted, importBatchId);
    await this.save();
    this.refreshHealth();
  }

  async upsertRecords(records: NavigatorRecord[], promoted = false, importBatchId?: string): Promise<void> {
    if (!this.db) return;
    this.db.run("BEGIN");
    try {
      for (const record of records) this.upsertRecordInternal(record, promoted, importBatchId);
      this.db.run("COMMIT");
      await this.save();
      this.refreshHealth();
    } catch (error) {
      this.db.run("ROLLBACK");
      throw error;
    }
  }

  allRecords(type?: RecordType): NavigatorRecord[] {
    if (!this.db) return [];
    const rows = type
      ? this.query("SELECT * FROM records WHERE type = ? ORDER BY name", [type])
      : this.query("SELECT * FROM records ORDER BY name");
    return rows.map((row) => this.rowToRecord(row));
  }

  findById(id: string): NavigatorRecord | undefined {
    if (!this.db) return undefined;
    const row = this.query("SELECT * FROM records WHERE id = ? LIMIT 1", [id])[0];
    return row ? this.rowToRecord(row) : undefined;
  }

  search(text: string, limit = 100): NavigatorRecord[] {
    if (!this.db || !text.trim()) return [];
    const terms = text.toLowerCase().split(/\s+/).filter(Boolean);
    const where = terms.map(() => "search_text LIKE ?").join(" AND ");
    return this.query(`SELECT * FROM records WHERE ${where} ORDER BY promoted DESC, updated DESC LIMIT ?`, [...terms.map((term) => `%${term}%`), limit]).map((row) => this.rowToRecord(row));
  }

  async removeByPath(path: string): Promise<void> {
    if (!this.db) return;
    this.db.run("DELETE FROM records WHERE path = ?", [path]);
    await this.save();
    this.refreshHealth();
  }

  async addEvent(event: RecordEvent): Promise<void> {
    if (!this.db) return;
    this.db.run(
      `INSERT OR IGNORE INTO record_events (id, record_id, event_type, occurred_at, actor, summary, data_json, batch_id, dedupe_key)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [event.id, event.record_id, event.event_type, event.occurred_at, event.actor, event.summary, JSON.stringify(event.data), event.batch_id ?? null, event.dedupe_key ?? null]
    );
    await this.save();
    this.refreshHealth();
  }

  eventsFor(recordId?: string, limit = 250): RecordEvent[] {
    if (!this.db) return [];
    const rows = recordId
      ? this.query("SELECT * FROM record_events WHERE record_id = ? ORDER BY occurred_at DESC LIMIT ?", [recordId, limit])
      : this.query("SELECT * FROM record_events ORDER BY occurred_at DESC LIMIT ?", [limit]);
    return rows.map((row) => ({
      id: String(row.id), record_id: String(row.record_id), event_type: String(row.event_type),
      occurred_at: String(row.occurred_at), actor: String(row.actor), summary: String(row.summary),
      data: this.parseJson(row.data_json), batch_id: this.optional(row.batch_id), dedupe_key: this.optional(row.dedupe_key)
    }));
  }

  async addAssertion(assertion: FieldAssertion): Promise<void> {
    if (!this.db) return;
    this.db.run(
      `INSERT OR REPLACE INTO field_assertions
       (id, record_id, field, value_json, valid_from, valid_to, observed_at, source_id, confidence, reviewer, review_status, supersedes_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [assertion.id, assertion.record_id, assertion.field, JSON.stringify(assertion.value), assertion.valid_from ?? null, assertion.valid_to ?? null, assertion.observed_at, assertion.source_id ?? null, assertion.confidence, assertion.reviewer ?? null, assertion.review_status, assertion.supersedes_id ?? null]
    );
    await this.save();
    this.refreshHealth();
  }

  assertionsFor(recordId: string, field?: string): FieldAssertion[] {
    if (!this.db) return [];
    const rows = field
      ? this.query("SELECT * FROM field_assertions WHERE record_id = ? AND field = ? ORDER BY observed_at DESC", [recordId, field])
      : this.query("SELECT * FROM field_assertions WHERE record_id = ? ORDER BY observed_at DESC", [recordId]);
    return rows.map((row) => ({
      id: String(row.id), record_id: String(row.record_id), field: String(row.field), value: this.parseJson(row.value_json),
      valid_from: this.optional(row.valid_from), valid_to: this.optional(row.valid_to), observed_at: String(row.observed_at),
      source_id: this.optional(row.source_id), confidence: String(row.confidence) as FieldAssertion["confidence"],
      reviewer: this.optional(row.reviewer), review_status: String(row.review_status) as FieldAssertion["review_status"],
      supersedes_id: this.optional(row.supersedes_id)
    }));
  }

  temporalEdges(asOf?: string): TemporalEdge[] {
    if (!this.db) return [];
    const rows = asOf
      ? this.query("SELECT * FROM edges WHERE (valid_from IS NULL OR valid_from <= ?) AND (valid_to IS NULL OR valid_to >= ?)", [asOf, asOf])
      : this.query("SELECT * FROM edges WHERE status != 'inactive'");
    return rows.map((row) => ({
      id: String(row.id), from: String(row.from_id), to: String(row.to_id), relationship_type: String(row.relationship_type),
      confidence: String(row.confidence || "C") as TemporalEdge["confidence"], status: String(row.status || "active") as TemporalEdge["status"],
      weight: Number(row.weight || 1), valid_from: this.optional(row.valid_from), valid_to: this.optional(row.valid_to),
      evidence_ids: this.parseJson(row.evidence_json, []), last_verified: this.optional(row.last_verified),
      human_review: Boolean(row.human_review), source: this.optional(row.source)
    }));
  }

  async createImportBatch(batch: NavigatorRecord): Promise<void> {
    await this.upsertRecord(batch, false);
  }

  async rollbackImport(batchId: string): Promise<number> {
    if (!this.db) return 0;
    const count = Number(this.query("SELECT COUNT(*) AS total FROM records WHERE import_batch_id = ? AND promoted = 0", [batchId])[0]?.total ?? 0);
    this.db.run("DELETE FROM records WHERE import_batch_id = ? AND promoted = 0", [batchId]);
    this.db.run("UPDATE records SET status = 'rolled_back', rollback_status = 'complete' WHERE id = ?", [batchId]);
    await this.addEvent({ id: `event_rollback_${batchId}`, record_id: batchId, event_type: "import_rolled_back", occurred_at: timestamp(), actor: "STRIVE Navigator", summary: `Rolled back ${count} imported records`, data: { count }, batch_id: batchId, dedupe_key: `rollback:${batchId}` });
    await this.save();
    this.refreshHealth();
    return count;
  }

  async mergeRecords(primaryId: string, duplicateId: string): Promise<NavigatorRecord> {
    if (!this.db) throw new Error("Analytical store is not ready.");
    const primary = this.findById(primaryId);
    const duplicate = this.findById(duplicateId);
    if (!primary || !duplicate) throw new Error("Both merge records must exist.");
    if (duplicate.promoted) throw new Error("Promoted Markdown records require manual merge review and cannot be deleted automatically.");
    const merged = this.mergeValues(duplicate, primary) as NavigatorRecord;
    merged.id = primary.id; merged.name = primary.name; merged.type = primary.type; merged.path = primary.path;
    this.db.run("BEGIN");
    try {
      this.upsertRecordInternal(merged, Boolean(primary.promoted), primary.import_batch_id as string | undefined);
      for (const record of this.allRecords()) {
        if (record.id === primaryId || record.id === duplicateId) continue;
        const replaced = this.replaceReference(record, duplicateId, primaryId);
        if (JSON.stringify(replaced) !== JSON.stringify(record)) this.upsertRecordInternal(replaced, Boolean(record.promoted), record.import_batch_id as string | undefined);
      }
      this.db.run("UPDATE edges SET from_id = ? WHERE from_id = ?", [primaryId, duplicateId]);
      this.db.run("UPDATE edges SET to_id = ? WHERE to_id = ?", [primaryId, duplicateId]);
      this.db.run("DELETE FROM edges WHERE from_id = to_id");
      this.db.run("UPDATE record_events SET record_id = ? WHERE record_id = ?", [primaryId, duplicateId]);
      this.db.run("UPDATE field_assertions SET record_id = ? WHERE record_id = ?", [primaryId, duplicateId]);
      this.db.run("DELETE FROM records WHERE id = ?", [duplicateId]);
      this.db.run("COMMIT");
      await this.save();
      this.refreshHealth();
      return merged;
    } catch (error) {
      this.db.run("ROLLBACK");
      throw error;
    }
  }

  async splitRecord(recordId: string, newId: string, newName: string): Promise<NavigatorRecord> {
    const record = this.findById(recordId);
    if (!record) throw new Error("Record to split was not found.");
    const clone = { ...record, id: newId, name: newName, path: "", promoted: false, human_review: true, confidence_tier: "C", source_status: "inferred", split_from: recordId, updated: timestamp() } as NavigatorRecord;
    await this.upsertRecord(clone, false);
    return clone;
  }

  queryRows(sql: string, params: SqlValue[] = []): Record<string, SqlValue>[] {
    return this.query(sql, params);
  }

  private async migrate(): Promise<void> {
    if (!this.db) return;
    const current = this.readSchemaVersion();
    if (current > 0 && current < V2_SCHEMA_VERSION) await this.backup(`pre-migration-v${current}`);
    this.db.run(`
      CREATE TABLE IF NOT EXISTS metadata (key TEXT PRIMARY KEY, value TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS records (
        id TEXT PRIMARY KEY, type TEXT NOT NULL, name TEXT NOT NULL, data_json TEXT NOT NULL,
        path TEXT, promoted INTEGER NOT NULL DEFAULT 0, source_status TEXT, confidence_tier TEXT,
        human_review INTEGER NOT NULL DEFAULT 1, updated TEXT, search_text TEXT NOT NULL,
        import_batch_id TEXT, status TEXT, rollback_status TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_records_type ON records(type);
      CREATE INDEX IF NOT EXISTS idx_records_path ON records(path);
      CREATE INDEX IF NOT EXISTS idx_records_batch ON records(import_batch_id);
      CREATE TABLE IF NOT EXISTS edges (
        id TEXT PRIMARY KEY, from_id TEXT NOT NULL, to_id TEXT NOT NULL, relationship_type TEXT NOT NULL,
        confidence TEXT, status TEXT, weight REAL, valid_from TEXT, valid_to TEXT, evidence_json TEXT,
        last_verified TEXT, human_review INTEGER, source TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_edges_from ON edges(from_id);
      CREATE INDEX IF NOT EXISTS idx_edges_to ON edges(to_id);
      CREATE TABLE IF NOT EXISTS record_events (
        id TEXT PRIMARY KEY, record_id TEXT NOT NULL, event_type TEXT NOT NULL, occurred_at TEXT NOT NULL,
        actor TEXT, summary TEXT, data_json TEXT, batch_id TEXT, dedupe_key TEXT UNIQUE
      );
      CREATE INDEX IF NOT EXISTS idx_events_record ON record_events(record_id, occurred_at);
      CREATE TABLE IF NOT EXISTS field_assertions (
        id TEXT PRIMARY KEY, record_id TEXT NOT NULL, field TEXT NOT NULL, value_json TEXT NOT NULL,
        valid_from TEXT, valid_to TEXT, observed_at TEXT NOT NULL, source_id TEXT, confidence TEXT,
        reviewer TEXT, review_status TEXT, supersedes_id TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_assertions_record ON field_assertions(record_id, field);
    `);
    this.ensureColumn("records", "status", "TEXT");
    this.ensureColumn("records", "rollback_status", "TEXT");
    this.ensureColumn("records", "import_batch_id", "TEXT");
    this.ensureColumn("edges", "valid_from", "TEXT");
    this.ensureColumn("edges", "valid_to", "TEXT");
    this.ensureColumn("edges", "evidence_json", "TEXT");
    this.db.run("INSERT OR REPLACE INTO metadata (key, value) VALUES ('schema_version', ?)", [String(V2_SCHEMA_VERSION)]);
  }

  private readSchemaVersion(): number {
    if (!this.db) return 0;
    try {
      return Number(this.query("SELECT value FROM metadata WHERE key = 'schema_version' LIMIT 1")[0]?.value ?? 0);
    } catch {
      return 0;
    }
  }

  private ensureColumn(table: string, column: string, definition: string): void {
    if (!this.db) return;
    const columns = this.query(`PRAGMA table_info(${table})`).map((row) => String(row.name));
    if (!columns.includes(column)) this.db.run(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }

  private upsertRecordInternal(record: NavigatorRecord, promoted: boolean, importBatchId?: string): void {
    if (!this.db) return;
    const clean = Object.fromEntries(Object.entries(record).filter(([key]) => key !== "file"));
    const searchText = this.buildSearchText(clean);
    this.db.run(
      `INSERT INTO records (id, type, name, data_json, path, promoted, source_status, confidence_tier, human_review, updated, search_text, import_batch_id, status, rollback_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET type=excluded.type, name=excluded.name, data_json=excluded.data_json,
       path=COALESCE(excluded.path, records.path), promoted=MAX(records.promoted, excluded.promoted),
       source_status=excluded.source_status, confidence_tier=excluded.confidence_tier,
       human_review=excluded.human_review, updated=excluded.updated, search_text=excluded.search_text,
       import_batch_id=COALESCE(records.import_batch_id, excluded.import_batch_id), status=excluded.status`,
      [record.id, record.type, record.name, JSON.stringify(clean), record.path || null, promoted ? 1 : 0,
        record.source_status ?? null, record.confidence_tier ?? null, record.human_review ? 1 : 0,
        String(record.updated ?? timestamp()), searchText, importBatchId ?? null, this.sqlText(record.status), this.sqlText(record.rollback_status)]
    );
    if (record.type === "relationship_edge") this.upsertEdge(record);
  }

  private upsertEdge(record: NavigatorRecord): void {
    if (!this.db || !record.from || !record.to || !record.relationship_type) return;
    this.db.run(
      `INSERT OR REPLACE INTO edges (id, from_id, to_id, relationship_type, confidence, status, weight, valid_from, valid_to, evidence_json, last_verified, human_review, source)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [record.id, String(record.from), String(record.to), String(record.relationship_type), String(record.confidence ?? record.confidence_tier ?? "C"),
        String(record.status ?? "active"), Number(record.weight ?? 1), this.sqlText(record.valid_from), this.sqlText(record.valid_to),
        JSON.stringify(record.evidence_ids ?? []), this.sqlText(record.last_verified ?? record.date_observed), record.human_review ? 1 : 0, this.sqlText(record.source)]
    );
  }

  private rowToRecord(row: Record<string, SqlValue>): NavigatorRecord {
    const data = this.parseJson(row.data_json) as NavigatorRecord;
    return { ...data, id: String(row.id), type: String(row.type) as RecordType, name: String(row.name), path: String(row.path ?? data.path ?? ""), promoted: Boolean(row.promoted), import_batch_id: this.optional(row.import_batch_id) };
  }

  private buildSearchText(record: Record<string, unknown>): string {
    return Object.values(record).flatMap((value) => Array.isArray(value) ? value : [value]).filter((value) => ["string", "number"].includes(typeof value)).join(" ").toLowerCase();
  }

  private mergeValues(base: unknown, preferred: unknown): unknown {
    if (Array.isArray(base) || Array.isArray(preferred)) return [...new Set([...(Array.isArray(base) ? base : base ? [base] : []), ...(Array.isArray(preferred) ? preferred : preferred ? [preferred] : [])])];
    if (this.isObject(base) && this.isObject(preferred)) {
      const keys = new Set([...Object.keys(base), ...Object.keys(preferred)]);
      return Object.fromEntries([...keys].map((key) => [key, this.mergeValues(base[key], preferred[key])]));
    }
    return preferred === undefined || preferred === null || preferred === "" ? base : preferred;
  }

  private replaceReference(value: unknown, from: string, to: string): NavigatorRecord {
    const replace = (item: unknown): unknown => {
      if (item === from) return to;
      if (Array.isArray(item)) return item.map(replace);
      if (this.isObject(item)) return Object.fromEntries(Object.entries(item).map(([key, nested]) => [key, replace(nested)]));
      return item;
    };
    return replace(value) as NavigatorRecord;
  }

  private isObject(value: unknown): value is Record<string, unknown> {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
  }

  private query(sql: string, params: SqlValue[] = []): Record<string, SqlValue>[] {
    if (!this.db) return [];
    const statement = this.db.prepare(sql);
    try {
      statement.bind(params);
      const rows: Record<string, SqlValue>[] = [];
      while (statement.step()) rows.push(statement.getAsObject());
      return rows;
    } finally {
      statement.free();
    }
  }

  private refreshHealth(): StoreHealth {
    if (!this.db) return this.healthState;
    this.healthState = {
      ready: true,
      schemaVersion: this.readSchemaVersion(),
      recordCount: Number(this.query("SELECT COUNT(*) AS total FROM records")[0]?.total ?? 0),
      edgeCount: Number(this.query("SELECT COUNT(*) AS total FROM edges")[0]?.total ?? 0),
      eventCount: Number(this.query("SELECT COUNT(*) AS total FROM record_events")[0]?.total ?? 0),
      assertionCount: Number(this.query("SELECT COUNT(*) AS total FROM field_assertions")[0]?.total ?? 0),
      lastSaved: this.healthState.lastSaved
    };
    return this.health();
  }

  private parseJson<T = Record<string, unknown>>(value: unknown, fallback = {} as T): T {
    try { return JSON.parse(String(value ?? "")) as T; } catch { return fallback; }
  }

  private optional(value: unknown): string | undefined {
    return value === null || value === undefined || value === "" ? undefined : String(value);
  }

  private sqlText(value: unknown): string | null {
    return value === null || value === undefined || value === "" ? null : String(value);
  }

  private async ensureFolder(folder: string): Promise<void> {
    let current = "";
    for (const part of folder.split("/")) {
      current = current ? `${current}/${part}` : part;
      if (!this.vault.getAbstractFileByPath(current)) await this.vault.createFolder(current);
    }
  }

  notifyHealth(): void {
    const health = this.health();
    new Notice(health.ready
      ? `STRIVE V2 store healthy: ${health.recordCount} records, ${health.edgeCount} edges, schema v${health.schemaVersion}.`
      : `STRIVE V2 store degraded: ${health.degradedReason ?? "unknown reason"}`);
  }
}
