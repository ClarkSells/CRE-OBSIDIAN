import { RECORD_TYPES, type NavigatorRecord, type ValidationIssue } from "../types";

const BASE_FIELDS = ["type", "id", "name", "created", "updated", "confidence_tier", "source_status", "human_review"];

export class ValidationService {
  validate(record: NavigatorRecord): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    for (const field of BASE_FIELDS) {
      if (record[field] === undefined || record[field] === null || record[field] === "") {
        issues.push({ severity: "error", field, message: `Missing required base field: ${field}` });
      }
    }
    if (!RECORD_TYPES.includes(record.type)) issues.push({ severity: "error", field: "type", message: `Unknown record type: ${String(record.type)}` });
    if (!["A", "B", "C", "D", "F"].includes(String(record.confidence_tier))) issues.push({ severity: "error", field: "confidence_tier", message: "Confidence tier must be A, B, C, D, or F." });
    if (["C", "D", "F"].includes(String(record.confidence_tier)) && record.human_review !== true) {
      issues.push({ severity: "warning", field: "human_review", message: "Low-confidence records require human_review: true." });
    }
    if (record.type === "property" && !record.owner_entity) issues.push({ severity: "warning", field: "owner_entity", message: "Property has no owner entity." });
    if (record.type === "lease" && (!record.property || !record.tenant)) issues.push({ severity: "error", field: "property/tenant", message: "Lease must link to a property and tenant." });
    if (record.type === "relationship_edge" && (!record.from || !record.to || !record.relationship_type)) issues.push({ severity: "error", field: "from/to/relationship_type", message: "Relationship edge is incomplete." });
    return issues;
  }

  validateAll(records: NavigatorRecord[]): Map<string, ValidationIssue[]> {
    const result = new Map<string, ValidationIssue[]>();
    for (const record of records) {
      const issues = this.validate(record);
      if (issues.length) result.set(record.id, issues);
    }
    return result;
  }
}
