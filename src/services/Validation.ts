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
    if (record.type === "relationship_edge" && record.from === record.to) issues.push({ severity: "error", field: "from/to", message: "Relationship edge cannot point to itself." });
    if (record.type === "task" && !record.status) issues.push({ severity: "error", field: "status", message: "Task requires a status." });
    if (record.type === "task" && record.due_date && Number.isNaN(new Date(String(record.due_date)).getTime())) issues.push({ severity: "error", field: "due_date", message: "Task due date is invalid." });
    if (record.type === "pursuit" && (!record.stage || !record.assigned_broker)) issues.push({ severity: "warning", field: "stage/assigned_broker", message: "Pursuit should have a stage and assigned broker." });
    if (record.type === "transaction" && !record.status) issues.push({ severity: "error", field: "status", message: "Transaction requires a status." });
    if (record.probability !== undefined && record.probability !== "" && (Number(record.probability) < 0 || Number(record.probability) > 100)) issues.push({ severity: "error", field: "probability", message: "Probability must be between 0 and 100." });
    if (record.lat !== undefined && record.lat !== "" && (Number(record.lat) < -90 || Number(record.lat) > 90)) issues.push({ severity: "error", field: "lat", message: "Latitude must be between -90 and 90." });
    if (record.lng !== undefined && record.lng !== "" && (Number(record.lng) < -180 || Number(record.lng) > 180)) issues.push({ severity: "error", field: "lng", message: "Longitude must be between -180 and 180." });
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
