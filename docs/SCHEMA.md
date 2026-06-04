# Record Schema

Every structured note requires:

`type`, `id`, `name`, `created`, `updated`, `confidence_tier`, `source_status`, `human_review`, `realnex_id`, and `tags`.

## Confidence Tiers

- `A`: confirmed primary/direct source
- `B`: strongly supported cross-reference
- `C`: plausible inference; human review preferred
- `D`: weak or unverified; human review required
- `F`: conflicting or failed validation; do not rely on it

## Record Types And Folders

| Type | ID Prefix | Folder | Purpose |
|---|---|---|---|
| `property` | `prop_` | `Properties/` | Physical asset and broker brief |
| `parcel` | `parcel_` | `Parcels/` | CAD/GIS/tax-account facts |
| `entity` | `entity_` | `Entities/` | Legal owner and piercing trail |
| `person` | `person_` | `People/` | Principal/contact relationship |
| `investor_profile` | `investor_` | `Investors/` | Buyer thesis and preferences |
| `tenant` | `tenant_` | `Tenants/` | Occupier intelligence |
| `lease` | `lease_` | `Leases/` | Rent, rollover, and clause facts |
| `loan` | `loan_` | `Loans/` | Debt and refinance risk |
| `sale_comp` | `salecomp_` | `Comps/Sales/` | Sale evidence and rationale |
| `lease_comp` | `leasecomp_` | `Comps/Leases/` | Lease evidence |
| `submarket` | `submarket_` | `Submarkets/` | DFW context |
| `broker_activity` | `activity_` | `Broker Notes/` | Calls, meetings, and next steps |
| `deal_signal` | `signal_` | `Deal Signals/` | Evidence-backed reason to act |
| `source_document` | `source_` | `Sources/` | Source trail |
| `relationship_edge` | `edge_` | `System/Relationship Edges/` | Explicit graph connection |
| `company` | `company_` | `Companies/` | Company relationship operating view |
| `task` | `task_` | `Tasks/` | Assigned, due, and recurring action |
| `requirement` | `requirement_` | `Requirements/` | Buyer need and acquisition criteria |
| `pursuit` | `pursuit_` | `Pursuits/` | Investment-sales revenue pursuit |
| `transaction` | `transaction_` | `Transactions/` | Deal execution and milestones |
| `document` | `document_` | `Documents/` | Linked document metadata |
| `timeline_template` | `timeline_` | `System/Timeline Templates/` | Reusable workflow steps |
| `saved_view` | `savedview_` | `System/Saved Views/` | Saved search, graph, map, or board state |
| `import_batch` | `import_` | `System/Import Batches/` | Source, mapping, result, and rollback ledger |
| `data_issue` | `issue_` | `System/Data Issues/` | Duplicate, orphan, stale, or conflict queue |
| `record_event` | `event_` | `System/Record Events/` | Immutable historical event |
| `field_assertion` | `assertion_` | `System/Field Assertions/` | Sourced temporal field claim |

Type-specific fields are declared in `src/schemas.ts`. Blank values are allowed during staged research; validation surfaces material gaps.

## Relationship Types

The plugin supports ownership, parcel, tenant, lease, loan, submarket, comp, entity-control, shared-address, registered-agent, investor-match, broker-contact, deal-signal, refinance-risk, and rollover-risk edges. Every uncertain edge carries confidence, source, and human-review context.

V2 relationship edges additionally support `status`, `weight`, `valid_from`, `valid_to`, `evidence_ids`, and `last_verified`. This enables current-state and as-of graph queries.
