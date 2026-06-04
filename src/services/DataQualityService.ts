import type { NavigatorRecord, ValidationIssue } from "../types";
import { AnalyticalStore } from "./AnalyticalStore";
import { MetadataIndex } from "./MetadataIndex";
import { ValidationService } from "./Validation";

export interface DataQualityIssue {
  id: string;
  issueType: "validation" | "duplicate" | "orphan" | "stale" | "conflict";
  severity: "error" | "warning";
  recordIds: string[];
  message: string;
}

export class DataQualityService {
  constructor(private index: MetadataIndex, private store: AnalyticalStore, private validation: ValidationService) {}

  scan(staleDays = 180): DataQualityIssue[] {
    const records = this.combinedRecords();
    const recordIds = new Set(records.map((record) => record.id));
    const issues: DataQualityIssue[] = this.store.allRecords("data_issue").filter((record) => record.status !== "resolved").map((record) => ({
      id: record.id,
      issueType: ["validation", "duplicate", "orphan", "stale", "conflict"].includes(String(record.issue_type)) ? record.issue_type as DataQualityIssue["issueType"] : "validation",
      severity: record.severity === "error" ? "error" : "warning",
      recordIds: Array.isArray(record.record_ids) ? record.record_ids.map(String) : [],
      message: String(record.description ?? record.name)
    }));
    for (const record of records) {
      for (const issue of this.validation.validate(record)) issues.push(this.validationIssue(record, issue));
      for (const [field, id] of this.references(record)) {
        if (id && !recordIds.has(id)) {
          issues.push({ id: `orphan:${record.id}:${field}:${id}`, issueType: "orphan", severity: "error", recordIds: [record.id], message: `${record.name} references missing ${field} record ${id}.` });
        }
      }
      if (record.updated && Date.now() - new Date(String(record.updated)).getTime() > staleDays * 86400000) {
        issues.push({ id: `stale:${record.id}`, issueType: "stale", severity: "warning", recordIds: [record.id], message: `${record.name} has not been updated in ${staleDays}+ days.` });
      }
    }
    for (const [key, group] of this.duplicateGroups(records)) {
      issues.push({ id: `duplicate:${key}`, issueType: "duplicate", severity: "warning", recordIds: group.map((record) => record.id), message: `Potential duplicate cluster: ${group.map((record) => record.name).join(", ")}.` });
    }
    const accepted = new Map<string, Set<string>>();
    for (const row of this.store.queryRows("SELECT record_id, field, value_json FROM field_assertions WHERE review_status = 'accepted'")) {
      const key = `${String(row.record_id)}|${String(row.field)}`;
      const values = accepted.get(key) ?? new Set<string>();
      values.add(String(row.value_json));
      accepted.set(key, values);
    }
    for (const [key, values] of accepted) if (values.size > 1) {
      const [recordId, field] = key.split("|");
      const record = records.find((candidate) => candidate.id === recordId);
      issues.push({ id: `conflict:${recordId}:${field}`, issueType: "conflict", severity: "error", recordIds: [recordId], message: `${record?.name ?? recordId} has conflicting accepted assertions for ${field}.` });
    }
    return issues;
  }

  summary(staleDays = 180): Record<string, number> {
    const issues = this.scan(staleDays);
    return Object.fromEntries(["validation", "duplicate", "orphan", "stale", "conflict"].map((type) => [type, issues.filter((issue) => issue.issueType === type).length]));
  }

  private combinedRecords(): NavigatorRecord[] {
    const records = [...this.store.allRecords(), ...this.index.all()];
    return [...new Map(records.map((record) => [record.id, record])).values()];
  }

  private validationIssue(record: NavigatorRecord, issue: ValidationIssue): DataQualityIssue {
    return { id: `validation:${record.id}:${issue.field}`, issueType: "validation", severity: issue.severity, recordIds: [record.id], message: issue.message };
  }

  private references(record: NavigatorRecord): Array<[string, string]> {
    const fields = ["owner_entity", "beneficial_owner", "property", "tenant", "borrower_entity", "investor", "pursuit", "transaction", "buyer", "seller", "from", "to"];
    return fields.flatMap((field) => Array.isArray(record[field]) ? (record[field] as unknown[]).map((value) => [field, String(value)] as [string, string]) : record[field] ? [[field, String(record[field])]] : []);
  }

  private duplicateGroups(records: NavigatorRecord[]): Map<string, NavigatorRecord[]> {
    const groups = new Map<string, NavigatorRecord[]>();
    for (const record of records) {
      const value = record.normalized_address ?? record.address ?? record.email_business ?? record.phone_mobile ?? record.parcel_id ?? record.entity_name;
      if (!value) continue;
      const key = `${record.type}:${String(value).toLowerCase().replace(/[^a-z0-9]/g, "")}`;
      groups.set(key, [...(groups.get(key) ?? []), record]);
    }
    return new Map([...groups].filter(([, group]) => group.length > 1));
  }
}
