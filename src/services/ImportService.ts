import { TFile, Vault } from "obsidian";
import type { ImportMapping, ImportPreview, ImportResult, NavigatorRecord, RecordType } from "../types";
import { timestamp } from "../utils/format";
import { AnalyticalStore } from "./AnalyticalStore";
import { HistoryService } from "./HistoryService";
import { RecordFactory } from "./RecordFactory";

const REALNEX_ALIASES: Record<string, string> = {
  "record type": "type", "realnexid": "realnex_id", "realnex id": "realnex_id",
  "property name": "name", "contact name": "name", "company name": "name",
  "address 1": "address", "property address": "address", "primary phone": "phone_office",
  "mobile phone": "phone_mobile", "email address": "email_business", "contact email": "email_business",
  "owner": "owner_entity", "primary owner": "owner_entity", "market": "submarket",
  "property type": "asset_class", "square feet": "building_sf", "building size": "building_sf"
};

export class ImportService {
  constructor(private vault: Vault, private store: AnalyticalStore, private history: HistoryService, private factory: RecordFactory) {}

  async previewFile(file: TFile, limit = 25): Promise<ImportPreview> {
    const text = await this.vault.cachedRead(file);
    return this.preview(text, limit);
  }

  preview(csv: string, limit = 25): ImportPreview {
    const parsed = this.parseCsv(csv);
    const headers = parsed[0] ?? [];
    const rows = parsed.slice(1, limit + 1).map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])));
    const mappings = headers.map((header) => ({ sourceColumn: header, targetField: this.inferTarget(header) }));
    const inferredType = this.inferRecordType(headers);
    const duplicateCandidates = this.findDuplicateCandidates(rows, mappings);
    return { headers, rows, inferredType, mappings, duplicateCandidates };
  }

  async importFile(file: TFile, type?: RecordType, mappings?: ImportMapping[], profileName = "Auto Map"): Promise<ImportResult> {
    const text = await this.vault.cachedRead(file);
    const preview = this.preview(text, 25);
    return this.importCsv(text, type ?? preview.inferredType, mappings ?? preview.mappings, file.path, profileName);
  }

  async importCsv(csv: string, type: RecordType, mappings: ImportMapping[], sourceFile = "pasted.csv", profileName = "Auto Map"): Promise<ImportResult> {
    await this.store.backup("pre-import");
    const parsed = this.parseCsv(csv);
    const headers = parsed[0] ?? [];
    const batchId = `import_${Date.now().toString(36)}`;
    const result: ImportResult = { batchId, created: 0, updated: 0, skipped: 0, duplicates: 0, errors: [] };
    const batch: NavigatorRecord = {
      type: "import_batch", id: batchId, name: `Import ${sourceFile}`, path: "", source_file: sourceFile,
      source_hash: this.simpleHash(csv), mapping_profile: profileName, record_type: type, row_count: Math.max(parsed.length - 1, 0),
      status: "running", created_count: 0, updated_count: 0, skipped_count: 0, error_count: 0,
      rollback_status: "available", created: timestamp(), updated: timestamp(), confidence_tier: "C", source_status: "imported", human_review: true
    };
    await this.store.createImportBatch(batch);
    const existing = this.store.allRecords();
    const records: NavigatorRecord[] = [];
    for (let rowIndex = 1; rowIndex < parsed.length; rowIndex++) {
      try {
        const source = Object.fromEntries(headers.map((header, index) => [header, parsed[rowIndex][index] ?? ""]));
        const mapped = this.applyMappings(source, mappings);
        mapped.type = type;
        if (!mapped.name && !mapped.address && !mapped.email_business) { result.skipped += 1; continue; }
        const duplicate = this.findDuplicate(mapped, existing);
        if (duplicate) {
          result.duplicates += 1;
          result.skipped += 1;
          await this.history.record(duplicate.id, "import_duplicate_detected", `Potential duplicate in ${sourceFile}`, { batch_id: batchId, row: rowIndex, source }, "STRIVE Importer", batchId);
          await this.store.upsertRecord({
            type: "data_issue", id: `issue_${batchId}_${rowIndex}`, name: `Import duplicate: ${String(mapped.name ?? mapped.address ?? duplicate.name)}`, path: "",
            issue_type: "duplicate", severity: "warning", record_ids: [duplicate.id], description: `Potential duplicate found in ${sourceFile} row ${rowIndex}.`,
            status: "open", recommended_action: "Review and merge, promote, or reject.", import_batch_id: batchId,
            created: timestamp(), updated: timestamp(), confidence_tier: "C", source_status: "imported", human_review: true
          });
          continue;
        }
        const id = String(mapped.id || `${type}_${batchId}_${rowIndex}`);
        records.push({
          ...mapped, type, id, name: String(mapped.name || mapped.address || mapped.email_business || id), path: "",
          created: timestamp(), updated: timestamp(), confidence_tier: "C", source_status: "imported",
          human_review: true, import_batch_id: batchId, import_source_row: rowIndex, import_source_values: source
        } as NavigatorRecord);
        result.created += 1;
      } catch (error) {
        result.errors.push(`Row ${rowIndex}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    await this.store.upsertRecords(records, false, batchId);
    batch.status = result.errors.length ? "completed_with_errors" : "complete";
    batch.created_count = result.created; batch.updated_count = result.updated; batch.skipped_count = result.skipped; batch.error_count = result.errors.length; batch.updated = timestamp();
    await this.store.upsertRecord(batch);
    await this.history.record(batchId, "import_completed", `Imported ${result.created} records from ${sourceFile}`, { ...result }, "STRIVE Importer", batchId, `import:${batch.source_hash}`);
    return result;
  }

  async promote(recordId: string): Promise<TFile | undefined> {
    const record = this.store.findById(recordId);
    if (!record || record.promoted) return record?.file;
    const file = await this.factory.create(record.type, record.name, { ...record, path: undefined });
    await this.store.upsertRecord({ ...record, path: file.path }, true, record.import_batch_id as string | undefined);
    await this.history.record(record.id, "record_promoted", "Imported analytical record promoted to Markdown dossier", { path: file.path }, "STRIVE Navigator");
    return file;
  }

  rollback(batchId: string): Promise<number> {
    return this.store.rollbackImport(batchId);
  }

  mappingProfile(headers: string[]): ImportMapping[] {
    return headers.map((header) => ({ sourceColumn: header, targetField: this.inferTarget(header) }));
  }

  async saveMappingProfile(name: string, recordType: RecordType, mappings: ImportMapping[]): Promise<NavigatorRecord> {
    const profile: NavigatorRecord = {
      type: "saved_view", id: `savedview_import_${Date.now().toString(36)}`, name, path: "", view_type: "csv_import_mapping",
      filters: { record_type: recordType }, columns: mappings, sort: "", owner: "STRIVE", shared: true,
      created: timestamp(), updated: timestamp(), confidence_tier: "A", source_status: "verified", human_review: false
    };
    await this.store.upsertRecord(profile);
    await this.history.record(profile.id, "mapping_profile_saved", `${name} import mapping saved`, { record_type: recordType, mappings });
    return profile;
  }

  mappingProfiles(): NavigatorRecord[] {
    return this.store.allRecords("saved_view").filter((record) => record.view_type === "csv_import_mapping");
  }

  private parseCsv(csv: string): string[][] {
    const rows: string[][] = [];
    let row: string[] = [];
    let field = "";
    let quoted = false;
    for (let i = 0; i < csv.length; i++) {
      const char = csv[i];
      const next = csv[i + 1];
      if (char === '"' && quoted && next === '"') { field += '"'; i += 1; }
      else if (char === '"') quoted = !quoted;
      else if (char === "," && !quoted) { row.push(field.trim()); field = ""; }
      else if ((char === "\n" || char === "\r") && !quoted) {
        if (char === "\r" && next === "\n") i += 1;
        row.push(field.trim()); field = "";
        if (row.some((value) => value !== "")) rows.push(row);
        row = [];
      } else field += char;
    }
    row.push(field.trim());
    if (row.some((value) => value !== "")) rows.push(row);
    return rows;
  }

  private inferTarget(header: string): string {
    const normalized = header.trim().toLowerCase().replace(/[_-]+/g, " ");
    return REALNEX_ALIASES[normalized] ?? normalized.replace(/\s+/g, "_");
  }

  private inferRecordType(headers: string[]): RecordType {
    const normalized = headers.map((header) => this.inferTarget(header));
    if (normalized.includes("parcel_id") || normalized.includes("tax_account")) return "parcel";
    if (normalized.includes("lease_end") || normalized.includes("rent_psf")) return "lease";
    if (normalized.includes("maturity_date") || normalized.includes("loan_amount")) return "loan";
    if (normalized.includes("email_business") || normalized.includes("phone_mobile")) return "person";
    if (normalized.includes("entity_name") || normalized.includes("sos_file_number")) return "entity";
    if (normalized.includes("address") || normalized.includes("building_sf")) return "property";
    return "company";
  }

  private applyMappings(source: Record<string, string>, mappings: ImportMapping[]): Record<string, unknown> {
    const mapped: Record<string, unknown> = {};
    for (const mapping of mappings) {
      if (!mapping.targetField) continue;
      const value = source[mapping.sourceColumn] ?? "";
      if (value !== "") mapped[mapping.targetField] = this.coerce(value);
    }
    return mapped;
  }

  private coerce(value: string): string | number | boolean {
    if (/^(true|false)$/i.test(value)) return value.toLowerCase() === "true";
    const numeric = Number(value.replace(/[$,%]/g, ""));
    if (value.trim() && Number.isFinite(numeric) && /^[\s$+-]?[\d,.]+%?\s*$/.test(value)) return numeric;
    return value;
  }

  private findDuplicateCandidates(rows: Record<string, string>[], mappings: ImportMapping[]): number {
    const mapped = rows.map((row) => this.applyMappings(row, mappings));
    const seen = new Set<string>();
    let duplicates = 0;
    for (const row of mapped) {
      const key = this.dedupeKey(row);
      if (key && seen.has(key)) duplicates += 1;
      if (key) seen.add(key);
    }
    return duplicates;
  }

  private findDuplicate(record: Record<string, unknown>, existing: NavigatorRecord[]): NavigatorRecord | undefined {
    const id = String(record.id ?? "");
    if (id) {
      const match = existing.find((candidate) => candidate.id === id);
      if (match) return match;
    }
    const key = this.dedupeKey(record);
    if (!key) return undefined;
    return existing.find((candidate) => {
      const candidateKey = this.dedupeKey(candidate);
      return candidateKey === key || (candidate.type === record.type && this.similarity(candidateKey, key) >= 0.93);
    });
  }

  private dedupeKey(record: Record<string, unknown>): string {
    const value = record.normalized_address ?? record.address ?? record.email_business ?? record.phone_mobile ?? record.phone_office ?? record.parcel_id ?? record.entity_name ?? record.name;
    return value ? String(value).toLowerCase().replace(/[^a-z0-9]/g, "") : "";
  }

  private simpleHash(value: string): string {
    let hash = 2166136261;
    for (let i = 0; i < value.length; i++) hash = Math.imul(hash ^ value.charCodeAt(i), 16777619);
    return (hash >>> 0).toString(16);
  }

  private similarity(a: string, b: string): number {
    if (!a || !b) return 0;
    if (a === b) return 1;
    const pairs = (value: string) => new Set(Array.from({ length: Math.max(0, value.length - 1) }, (_, index) => value.slice(index, index + 2)));
    const left = pairs(a); const right = pairs(b);
    const overlap = [...left].filter((pair) => right.has(pair)).length;
    return (2 * overlap) / Math.max(1, left.size + right.size);
  }
}
