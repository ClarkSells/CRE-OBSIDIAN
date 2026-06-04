import type { TFile } from "obsidian";

export const RECORD_TYPES = [
  "property", "parcel", "entity", "person", "investor_profile", "tenant", "lease",
  "loan", "sale_comp", "lease_comp", "submarket", "broker_activity", "deal_signal",
  "source_document", "relationship_edge", "company", "task", "requirement", "pursuit",
  "transaction", "document", "timeline_template", "saved_view", "import_batch",
  "data_issue", "record_event", "field_assertion"
] as const;

export type RecordType = typeof RECORD_TYPES[number];
export type ConfidenceTier = "A" | "B" | "C" | "D" | "F";
export type UiMode = "broker" | "agent";

export interface NavigatorRecord {
  type: RecordType;
  id: string;
  name: string;
  path: string;
  file?: TFile;
  created?: string;
  updated?: string;
  confidence_tier?: ConfidenceTier;
  source_status?: string;
  human_review?: boolean;
  realnex_id?: string;
  tags?: string[];
  [key: string]: unknown;
}

export interface ValidationIssue {
  severity: "error" | "warning";
  field: string;
  message: string;
}

export interface LinkedPropertyRecords {
  property: NavigatorRecord;
  parcels: NavigatorRecord[];
  entities: NavigatorRecord[];
  people: NavigatorRecord[];
  tenants: NavigatorRecord[];
  leases: NavigatorRecord[];
  loans: NavigatorRecord[];
  saleComps: NavigatorRecord[];
  leaseComps: NavigatorRecord[];
  activities: NavigatorRecord[];
  signals: NavigatorRecord[];
  edges: NavigatorRecord[];
}

export interface NavigatorSettings {
  defaultMode: UiMode;
  exportHumanReviewRecords: boolean;
  accent: "gold" | "blue";
  mapStyleUrl: string;
  analyticalStoreEnabled: boolean;
  staleRecordDays: number;
}

export interface StoreHealth {
  ready: boolean;
  schemaVersion: number;
  recordCount: number;
  edgeCount: number;
  eventCount: number;
  assertionCount: number;
  lastSaved?: string;
  degradedReason?: string;
}

export interface RecordEvent {
  id: string;
  record_id: string;
  event_type: string;
  occurred_at: string;
  actor: string;
  summary: string;
  data: Record<string, unknown>;
  batch_id?: string;
  dedupe_key?: string;
}

export interface FieldAssertion {
  id: string;
  record_id: string;
  field: string;
  value: unknown;
  valid_from?: string;
  valid_to?: string;
  observed_at: string;
  source_id?: string;
  confidence: ConfidenceTier;
  reviewer?: string;
  review_status: "pending" | "accepted" | "rejected" | "superseded";
  supersedes_id?: string;
}

export interface TemporalEdge {
  id: string;
  from: string;
  to: string;
  relationship_type: string;
  confidence: ConfidenceTier;
  status: "active" | "inactive" | "disputed" | "inferred";
  weight: number;
  valid_from?: string;
  valid_to?: string;
  evidence_ids: string[];
  last_verified?: string;
  human_review: boolean;
  source?: string;
}

export interface GraphNeighborhood {
  nodes: NavigatorRecord[];
  edges: TemporalEdge[];
}

export interface GraphPath {
  nodes: NavigatorRecord[];
  edges: TemporalEdge[];
  explanation: string[];
}

export interface ImportMapping {
  sourceColumn: string;
  targetField: string;
}

export interface ImportPreview {
  headers: string[];
  rows: Record<string, string>[];
  inferredType: RecordType;
  mappings: ImportMapping[];
  duplicateCandidates: number;
}

export interface ImportResult {
  batchId: string;
  created: number;
  updated: number;
  skipped: number;
  duplicates: number;
  errors: string[];
}
