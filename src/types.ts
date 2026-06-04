import type { TFile } from "obsidian";

export const RECORD_TYPES = [
  "property", "parcel", "entity", "person", "investor_profile", "tenant", "lease",
  "loan", "sale_comp", "lease_comp", "submarket", "broker_activity", "deal_signal",
  "source_document", "relationship_edge"
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
}

