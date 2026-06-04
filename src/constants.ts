import type { RecordType } from "./types";

export const PLUGIN_NAME = "STRIVE Navigator";
export const VIEW_TYPES = {
  commandCenter: "strive-command-center",
  propertyWarRoom: "strive-property-war-room",
  ownerDossier: "strive-owner-dossier",
  relationshipGraph: "strive-relationship-graph",
  signalRadar: "strive-signal-radar",
  compsBoard: "strive-comps-board",
  investorMatch: "strive-investor-match",
  realnexQueue: "strive-realnex-queue"
} as const;

export const REQUIRED_FOLDERS = [
  "Properties", "Parcels", "Entities", "People", "Companies", "Investors", "Tenants",
  "Leases", "Loans", "Comps", "Comps/Sales", "Comps/Leases", "Submarkets",
  "Deal Signals", "Broker Notes", "Dashboards", "Templates", "Sources", "Imports",
  "Exports", "System", "System/Relationship Edges"
];

export const TYPE_FOLDERS: Record<RecordType, string> = {
  property: "Properties",
  parcel: "Parcels",
  entity: "Entities",
  person: "People",
  investor_profile: "Investors",
  tenant: "Tenants",
  lease: "Leases",
  loan: "Loans",
  sale_comp: "Comps/Sales",
  lease_comp: "Comps/Leases",
  submarket: "Submarkets",
  broker_activity: "Broker Notes",
  deal_signal: "Deal Signals",
  source_document: "Sources",
  relationship_edge: "System/Relationship Edges"
};

export const TYPE_PREFIXES: Record<RecordType, string> = {
  property: "prop", parcel: "parcel", entity: "entity", person: "person",
  investor_profile: "investor", tenant: "tenant", lease: "lease", loan: "loan",
  sale_comp: "salecomp", lease_comp: "leasecomp", submarket: "submarket",
  broker_activity: "activity", deal_signal: "signal", source_document: "source",
  relationship_edge: "edge"
};

export const TYPE_LABELS: Record<RecordType, string> = {
  property: "Property", parcel: "Parcel", entity: "Entity", person: "Person",
  investor_profile: "Investor Profile", tenant: "Tenant", lease: "Lease", loan: "Loan",
  sale_comp: "Sale Comp", lease_comp: "Lease Comp", submarket: "Submarket",
  broker_activity: "Broker Activity", deal_signal: "Deal Signal",
  source_document: "Source Document", relationship_edge: "Relationship Edge"
};

export const RELATIONSHIP_TYPES = [
  "PROPERTY_OWNED_BY_ENTITY", "PROPERTY_SITS_ON_PARCEL", "PROPERTY_OCCUPIED_BY_TENANT",
  "PROPERTY_GOVERNED_BY_LEASE", "PROPERTY_FINANCED_BY_LOAN", "PROPERTY_LOCATED_IN_SUBMARKET",
  "PROPERTY_COMPARABLE_TO_SALE_COMP", "PROPERTY_COMPARABLE_TO_LEASE_COMP",
  "ENTITY_CONTROLLED_BY_PERSON", "ENTITY_PARENT_OF_ENTITY", "ENTITY_SHARES_ADDRESS_WITH_ENTITY",
  "ENTITY_SHARES_REGISTERED_AGENT_WITH_ENTITY", "PERSON_CONTROLS_ENTITY",
  "INVESTOR_LIKELY_BUYER_FOR_PROPERTY", "BROKER_CONTACTED_PERSON",
  "DEAL_SIGNAL_POINTS_TO_PROPERTY", "LOAN_CREATES_REFI_RISK_FOR_PROPERTY",
  "LEASE_CREATES_ROLLOVER_RISK_FOR_PROPERTY"
];

