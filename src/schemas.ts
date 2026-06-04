import type { RecordType } from "./types";

export const TYPE_FIELDS: Record<RecordType, string[]> = {
  property: ["address", "normalized_address", "city", "county", "state", "zip", "submarket", "asset_class", "asset_subtype", "building_sf", "land_acres", "year_built", "owner_entity", "beneficial_owner", "last_sale_date", "last_sale_price", "assessed_value", "deal_signal_score"],
  parcel: ["parcel_id", "county", "cad_url", "gis_url", "legal_description", "situs_address", "owner_name_raw", "owner_mailing_address", "tax_account", "land_value", "improvement_value", "total_value", "taxes_due", "matched_property"],
  entity: ["entity_name", "normalized_entity_name", "entity_type", "state_of_formation", "sos_file_number", "sos_status", "formation_date", "registered_agent", "principal_office_address", "mailing_address", "parent_entity", "child_entities", "related_entities", "properties_owned", "known_principals", "possible_principals", "piercing_status"],
  person: ["full_name", "aliases", "role", "company", "entities_controlled", "properties_controlled", "email_business", "phone_office", "phone_mobile", "linkedin", "relationship_owner_at_strive", "last_contacted", "last_contact_result", "relationship_status"],
  investor_profile: ["investor_name", "principal_contacts", "company", "buyer_type", "asset_preferences", "submarket_preferences", "deal_size_min", "deal_size_max", "cap_rate_target", "risk_profile", "recent_acquisitions", "recent_dispositions", "known_broker_relationships", "exchange_status", "last_contacted", "relationship_owner_at_strive"],
  tenant: ["tenant_name", "brand_parent", "industry", "credit_quality", "tenant_type", "website", "naics_code", "traffic_driver_score", "expansion_status", "bankruptcy_risk", "other_properties_in_db"],
  lease: ["property", "tenant", "suite", "leased_sf", "lease_start", "lease_end", "remaining_term_months", "rent_psf", "annual_rent", "lease_type", "escalations", "options", "renewal_probability", "below_market_flag", "mark_to_market_upside", "rollover_risk_score"],
  loan: ["property", "borrower_entity", "lender", "loan_amount", "origination_date", "maturity_date", "interest_rate", "rate_type", "loan_type", "estimated_ltv", "estimated_dscr", "estimated_debt_yield", "assumable", "prepayment_penalty", "distress_flag", "refi_risk_score"],
  sale_comp: ["property", "sale_date", "sale_price", "price_psf", "cap_rate", "noi", "buyer", "seller", "buyer_type", "seller_type", "brokerage", "source", "asset_class", "asset_subtype", "occupancy", "year_built", "sf", "acreage", "comp_quality_score", "why_comparable", "why_not_comparable"],
  lease_comp: ["property", "tenant", "signed_date", "commencement_date", "sf", "rent_psf", "lease_type", "term_months", "ti_allowance", "free_rent", "escalations", "submarket", "comp_quality_score", "source"],
  submarket: ["market", "county_or_counties", "asset_class_focus", "summary", "vacancy", "availability", "rent_growth", "cap_rate_range", "active_buyer_types", "key_corridors", "notes"],
  broker_activity: ["related_property", "related_contact", "related_entity", "activity_type", "broker", "date", "outcome", "next_step", "sentiment", "relationship_temperature"],
  deal_signal: ["property", "signal_type", "signal_strength", "signal_date", "trigger", "evidence", "recommended_action", "assigned_broker", "status"],
  source_document: ["source_type", "source_url", "source_file", "related_records", "source_date", "retrieved_date"],
  relationship_edge: ["from", "to", "relationship_type", "confidence", "status", "weight", "valid_from", "valid_to", "evidence_ids", "last_verified", "source", "date_observed", "notes"],
  company: ["company_name", "company_type", "website", "phone", "address", "city", "state", "zip", "people", "entities", "properties", "relationship_owner_at_strive", "relationship_status", "last_contacted"],
  task: ["status", "priority", "assigned_to", "due_date", "completed_date", "recurrence", "related_records", "next_action", "timeline_template"],
  requirement: ["investor", "contacts", "asset_preferences", "submarket_preferences", "deal_size_min", "deal_size_max", "target_close_date", "exchange_status", "status", "assigned_broker", "matched_properties"],
  pursuit: ["property", "owner", "contacts", "stage", "probability", "expected_fee", "assigned_broker", "next_action", "next_action_date", "target_close_date", "requirements", "transaction"],
  transaction: ["property", "pursuit", "buyer", "seller", "contacts", "status", "contract_date", "target_close_date", "close_date", "price", "commission_estimate", "probability", "milestones", "documents", "assigned_broker"],
  document: ["document_type", "file_path", "source_url", "related_records", "document_date", "status", "version", "checksum"],
  timeline_template: ["workflow_type", "description", "steps", "active"],
  saved_view: ["view_type", "filters", "columns", "sort", "owner", "shared"],
  import_batch: ["source_file", "source_hash", "mapping_profile", "record_type", "row_count", "status", "created_count", "updated_count", "skipped_count", "error_count", "rollback_status"],
  data_issue: ["issue_type", "severity", "record_ids", "description", "status", "recommended_action", "assigned_to"],
  record_event: ["record_id", "event_type", "occurred_at", "actor", "summary", "data", "batch_id", "dedupe_key"],
  field_assertion: ["record_id", "field", "value", "valid_from", "valid_to", "observed_at", "source_id", "confidence", "reviewer", "review_status", "supersedes_id"]
};

export const BODY_TEMPLATES: Partial<Record<RecordType, string[]>> = {
  property: ["Property Brief", "90-Second Broker Summary", "Ownership", "Tenancy / Lease Notes", "Debt / Refi Risk", "Comps Rationale", "Deal Signals", "Broker Notes", "Source Trail", "AI Agent Input Block"],
  entity: ["Entity Dossier", "Summary", "Entity Piercing Trail", "Known Relationships", "Properties Owned", "Possible Principals", "Source Trail", "Human Review Notes"],
  person: ["Principal Dossier", "Relationship Summary", "Entities Controlled", "Properties Controlled", "Broker Notes", "Source Trail"],
  investor_profile: ["Investor Profile", "Acquisition Thesis", "Known Relationships", "Recent Activity", "Broker Notes"],
  deal_signal: ["Deal Signal Brief", "Evidence", "Recommended Broker Action", "Human Review Notes"],
  company: ["Company 360", "Relationship Summary", "People", "Entities", "Properties", "Activity", "Source Trail"],
  task: ["Task", "Context", "Outcome"],
  requirement: ["Buyer Requirement", "Acquisition Criteria", "Matched Properties", "Broker Notes"],
  pursuit: ["Pursuit Brief", "Strategy", "Next Actions", "Activity", "Documents"],
  transaction: ["Transaction Brief", "Milestones", "Participants", "Documents", "Broker Notes"],
  document: ["Document Record", "Summary", "Related Records", "Source Trail"]
};
