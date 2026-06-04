# `/goal` Prompt for Codex — Build STRIVE Navigator Obsidian Plugin

**Project:** STRIVE Navigator  
**Target platform:** Obsidian desktop plugin  
**Use case:** DFW commercial real estate investment-sales intelligence system  
**Date:** 2026-06-04  
**Owner:** Clark Hobbs  
**Execution mode:** Long-running Codex `/goal` task. This is designed for an overnight build session.

---

## 0. Paste This First Into Codex

```text
/goal Build STRIVE Navigator, a working Obsidian plugin and sample vault that turns Obsidian into a premium DFW commercial real estate investment-sales intelligence platform. Continue working until the plugin compiles, loads, creates/reads structured Markdown records, renders the required custom views, generates a realistic demo dataset, validates record schemas, exports a RealNex-ready CSV, and passes the acceptance checklist in this file. Do not stop at a plan or scaffold. If blocked, implement the closest working fallback, document the blocker, continue, and keep driving toward the verifiable end state.
```

After Codex accepts the goal, paste the rest of this file.

---

## 1. Critical Instruction to Codex

You are Codex acting as a senior TypeScript engineer, Obsidian plugin architect, CRE investment-sales workflow designer, graph-database product designer, and enterprise UI engineer.

You are building **STRIVE Navigator**, an Obsidian plugin that transforms an Obsidian vault into a purpose-built commercial real estate investment-sales intelligence platform for STRIVE / DFW brokerage work.

This is **not** a generic note-taking plugin.
This is **not** a basic CRM.
This is **not** just a prettier Dataview dashboard.

This should push Obsidian’s plugin capabilities as far as reasonably possible while staying buildable, stable, and usable.

The desired product feel is:

> **Bloomberg Terminal + Palantir relationship graph + RealNex replacement layer + Obsidian Markdown vault, purpose-built for DFW investment sales.**

The user wants this to make RealNex feel outdated by providing deeper relationships, better data structure, richer UI, AI-agent-friendly ingestion, broker-friendly dashboards, and an investment-sales-specific workflow.

---

## 2. Build Philosophy

The core thesis:

RealNex is a broker CRM and transaction workflow tool. STRIVE Navigator should become the **intelligence layer** above and around RealNex.

Use this architecture rule:

```text
Obsidian Vault = broker-readable intelligence layer
Plugin Index = fast in-vault query/UI layer
Markdown Frontmatter = structured, portable record schema
Relationship Edges = graph intelligence layer
RealNex Export = clean CRM sync/staging layer
Future Postgres/PostGIS = heavy database layer, not required for this MVP
Future AI Agents = ingestion/enrichment layer, not required for this MVP
```

For this MVP, do **not** build live web scraping, paid-platform automation, CoStar automation, RealNex browser automation, or a production database server. Build the plugin, schema, UI, sample data, validation, indexing, relationship graph, and export foundation first.

---

## 3. Product Objective

Build a working Obsidian plugin called **STRIVE Navigator** that helps an investment sales group track, understand, and act on:

- commercial properties
- parcels / CAD records
- legal owner entities
- beneficial owners / principals
- investors / buyers
- tenants
- leases
- loans / debt maturities
- sale comps
- lease comps
- submarkets
- broker activity
- deal signals
- source documents
- relationship edges
- RealNex sync/export status

The plugin should help answer:

- Who owns this property?
- What else does that owner control?
- Which LLCs/entities are related?
- Which principals may control the entity?
- What tenants occupy the property?
- When do leases roll?
- What debt maturity or refinancing risk exists?
- What comps actually matter and why?
- Which buyers would likely buy this property?
- Who at STRIVE owns the relationship?
- Why should a broker call this owner now?
- What is the next recommended action?

---

## 4. Absolute Build Rules

1. Do not stop at a scaffold.
2. Do not only produce documentation.
3. Build a working Obsidian plugin.
4. The plugin must compile.
5. The plugin must load in Obsidian.
6. The plugin must create and read Markdown records using YAML frontmatter.
7. The plugin must render premium custom views inside Obsidian.
8. The plugin must support broker UI mode, agent mode, and raw Markdown mode.
9. The plugin must include a realistic fake DFW sample dataset.
10. The plugin must include deterministic manual test steps.
11. Keep iterating until `npm run build` succeeds.
12. If using PowerShell on Windows fails due to execution policy, use `npm.cmd install` and `npm.cmd run build`.
13. If a feature is too large, implement a working MVP fallback and document the Phase 2 expansion.
14. Do not scrape CoStar, bypass CAPTCHAs, evade rate limits, or automate restricted paid platforms.
15. All imported/enriched data must support source tracking, confidence scoring, and human review flags.
16. Do not overwrite human-written broker notes.
17. Do not silently guess beneficial ownership.
18. If ownership/contact/principal data is inferred, mark it as low confidence and human-review required.
19. All demo/sample data must be fake and clearly marked as fake/demo.
20. Final answer must summarize built features, files changed, build/test status, limitations, and next phase.

---

## 5. Technical Stack

Use:

- TypeScript
- Obsidian Plugin API
- Markdown frontmatter
- Obsidian `MetadataCache`
- Obsidian `Vault` API
- custom `ItemView` views
- custom `Modal` forms
- custom `PluginSettingTab`
- CSS for premium dark enterprise styling
- lightweight schema validation using TypeScript and/or `zod`
- CSV generation using native code or `papaparse`
- date utilities using native Date or `date-fns`
- optional simple SVG/HTML relationship graph for MVP

Keep dependencies lean. Prefer:

```text
obsidian
typescript
esbuild
zod
papaparse
date-fns
lucide-icons, optional
```

Avoid heavy frameworks unless truly needed. Do not introduce React unless you can integrate it cleanly and still compile reliably.

---

## 6. Reference Repositories / Docs to Use

Study these patterns if internet/GitHub access is available:

```text
https://github.com/obsidianmd/obsidian-sample-plugin
https://docs.obsidian.md
https://github.com/blacksmithgu/obsidian-dataview
https://blacksmithgu.github.io/obsidian-dataview/
https://github.com/coddingtonbear/obsidian-local-rest-api
https://github.com/javalent/obsidian-leaflet
```

Use them for architectural inspiration only. Do not blindly copy code.

Most important references:

- Official Obsidian sample plugin for plugin scaffolding and build patterns.
- Official Obsidian developer docs for custom views, commands, modals, settings, and metadata.
- Dataview for the concept of treating an Obsidian vault as a queryable metadata database.
- Local REST API for future agent ingestion, but do not require it for this MVP.

---

## 7. Expected Repository Structure

Build or conform the repo to this structure:

```text
strive-navigator-obsidian/
  CODEX_GOAL_STRIVE_NAVIGATOR_OBSIDIAN.md
  README.md
  plugin/
    manifest.json
    package.json
    tsconfig.json
    esbuild.config.mjs
    main.ts
    styles.css
    src/
      constants.ts
      types.ts
      schemas.ts
      utils/
        ids.ts
        dates.ts
        markdown.ts
        frontmatter.ts
        csv.ts
        scoring.ts
      services/
        vaultFolders.ts
        recordFactory.ts
        metadataIndex.ts
        relationshipIndex.ts
        validation.ts
        sampleData.ts
        realnexExport.ts
      views/
        CommandCenterView.ts
        PropertyWarRoomView.ts
        OwnerDossierView.ts
        RelationshipGraphView.ts
        DealSignalRadarView.ts
        CompsBoardView.ts
        InvestorMatchView.ts
        RealNexSyncQueueView.ts
      modals/
        CreateRecordModal.ts
        CreateRelationshipModal.ts
        SelectRecordModal.ts
      settings/
        SettingsTab.ts
  sample-vault/
    README.md
  docs/
    ARCHITECTURE.md
    SCHEMA.md
    REALNEX_SYNC.md
    FUTURE_AGENT_ENGINE.md
    MANUAL_TESTS.md
  imports/
  exports/
```

If a simpler structure is needed for build reliability, simplify but preserve clear organization.

---

## 8. Required Obsidian Vault Folder Structure

The plugin must create or expect these folders inside the vault:

```text
Properties/
Parcels/
Entities/
People/
Companies/
Investors/
Tenants/
Leases/
Loans/
Comps/Sales/
Comps/Leases/
Submarkets/
Deal Signals/
Broker Notes/
Dashboards/
Templates/
Sources/
Imports/
Exports/
System/
```

Implement command:

```text
STRIVE Navigator: Initialize Vault Structure
```

Behavior:

- Create missing folders.
- Do not delete or overwrite existing folders.
- Create starter dashboard note if missing.
- Create starter template notes if missing.
- Report success in a notice.

---

## 9. Core Record System

Every major object is a Markdown note with YAML frontmatter. The Markdown body remains readable and editable by humans.

Every record must include these base fields:

```yaml
type:
id:
name:
created:
updated:
confidence_tier: C
source_status: demo | imported | verified | inferred | conflicting | unknown
human_review: true
realnex_id:
tags:
```

Use predictable ID prefixes:

```text
prop_       Property
parcel_     Parcel
entity_     Entity
person_     Person / Principal
investor_   Investor Profile
tenant_     Tenant
lease_      Lease
loan_       Loan
salecomp_   Sale Comp
leasecomp_  Lease Comp
submarket_  Submarket
activity_   Broker Activity
signal_     Deal Signal
source_     Source Document
edge_       Relationship Edge
```

---

## 10. Record Types and Minimum Schemas

### 10.1 Property

Folder: `Properties/`

```yaml
type: property
id:
name:
address:
normalized_address:
city:
county:
state: TX
zip:
submarket:
lat:
lng:
asset_class: retail | industrial | office | multifamily | land | mixed_use | medical | other
asset_subtype:
building_sf:
rentable_sf:
land_acres:
year_built:
year_renovated:
zoning:
parking_spaces:
parking_ratio:
stories:
frontage:
traffic_count:
parcel_ids:
owner_entity:
beneficial_owner:
property_manager:
leasing_broker:
last_sale_date:
last_sale_price:
assessed_value:
land_value:
improvement_value:
tax_amount:
tax_delinquency_status:
loan_ids:
tenant_ids:
lease_ids:
sale_comp_ids:
lease_comp_ids:
deal_signal_score:
confidence_tier:
source_status:
human_review:
realnex_id:
created:
updated:
tags:
```

Body sections:

```markdown
# Property Brief

## 90-Second Broker Summary

## Ownership

## Tenancy / Lease Notes

## Debt / Refi Risk

## Comps Rationale

## Deal Signals

## Broker Notes

## Source Trail

## AI Agent Input Block
```

### 10.2 Parcel

Folder: `Parcels/`

```yaml
type: parcel
id:
name:
parcel_id:
county:
cad_url:
gis_url:
legal_description:
situs_address:
owner_name_raw:
owner_mailing_address:
tax_account:
land_value:
improvement_value:
total_value:
taxes_due:
tax_history:
exemptions:
deed_reference:
geometry_placeholder:
matched_property:
confidence_tier:
source_status:
human_review:
created:
updated:
tags:
```

### 10.3 Entity

Folder: `Entities/`

```yaml
type: entity
id:
name:
entity_name:
normalized_entity_name:
entity_type: LLC | LP | INC | CORP | TRUST | REIT | INDIVIDUAL | FUND | OTHER
state_of_formation:
sos_file_number:
sos_status:
formation_date:
registered_agent:
registered_agent_address:
principal_office_address:
mailing_address:
parent_entity:
child_entities:
related_entities:
properties_owned:
known_principals:
possible_principals:
piercing_status: unstarted | simple | layered | blocked | human_review | complete
source_links:
confidence_tier:
source_status:
human_review:
realnex_id:
created:
updated:
tags:
```

Body sections:

```markdown
# Entity Dossier

## Summary

## Entity Piercing Trail

## Known Relationships

## Properties Owned

## Possible Principals

## Source Trail

## Human Review Notes
```

### 10.4 Person / Principal

Folder: `People/`

```yaml
type: person
id:
name:
full_name:
aliases:
role: owner | investor | broker | lender | attorney | developer | property_manager | other
company:
entities_controlled:
properties_controlled:
email_business:
phone_office:
phone_mobile:
linkedin:
mailing_address_business:
relationship_owner_at_strive:
last_contacted:
last_contact_result:
relationship_status: unknown | cold | warm | active | client | do_not_contact
confidence_tier:
source_status:
human_review:
realnex_id:
created:
updated:
tags:
```

### 10.5 Investor Profile

Folder: `Investors/`

```yaml
type: investor_profile
id:
name:
investor_name:
principal_contacts:
company:
buyer_type: private | family_office | syndicator | institutional | REIT | developer | owner_user | exchange_1031 | other
asset_preferences:
submarket_preferences:
deal_size_min:
deal_size_max:
cap_rate_target:
equity_available_estimate:
debt_preference:
risk_profile: core | core_plus | value_add | opportunistic | unknown
recent_acquisitions:
recent_dispositions:
known_broker_relationships:
exchange_status:
last_contacted:
relationship_owner_at_strive:
confidence_tier:
source_status:
human_review:
realnex_id:
created:
updated:
tags:
```

### 10.6 Tenant

Folder: `Tenants/`

```yaml
type: tenant
id:
name:
tenant_name:
brand_parent:
industry:
credit_quality:
tenant_type: anchor | junior_anchor | inline | pad | industrial_user | office_user | medical | other
website:
naics_code:
traffic_driver_score:
expansion_status:
bankruptcy_risk:
other_properties_in_db:
confidence_tier:
source_status:
human_review:
created:
updated:
tags:
```

### 10.7 Lease

Folder: `Leases/`

```yaml
type: lease
id:
name:
property:
tenant:
suite:
leased_sf:
lease_start:
lease_end:
remaining_term_months:
rent_psf:
annual_rent:
lease_type: NNN | gross | modified_gross | industrial_gross | ground | other
escalations:
options:
renewal_probability:
expense_recoveries:
ti_lc_notes:
co_tenancy_clause:
exclusive_use:
kickout_clause:
dark_clause:
guarantor:
below_market_flag:
mark_to_market_upside:
rollover_risk_score:
confidence_tier:
source_status:
human_review:
created:
updated:
tags:
```

### 10.8 Loan

Folder: `Loans/`

```yaml
type: loan
id:
name:
property:
borrower_entity:
lender:
loan_amount:
origination_date:
maturity_date:
interest_rate:
rate_type: fixed | floating | unknown
loan_type: bank | CMBS | life_co | agency | debt_fund | seller_financing | unknown
estimated_ltv:
estimated_dscr:
estimated_debt_yield:
assumable:
prepayment_penalty:
distress_flag:
refi_risk_score:
confidence_tier:
source_status:
human_review:
created:
updated:
tags:
```

### 10.9 Sale Comp

Folder: `Comps/Sales/`

```yaml
type: sale_comp
id:
name:
property:
sale_date:
sale_price:
price_psf:
cap_rate:
noi:
buyer:
seller:
buyer_type:
seller_type:
brokerage:
source:
asset_class:
asset_subtype:
occupancy:
year_built:
sf:
acreage:
comp_quality_score:
why_comparable:
why_not_comparable:
confidence_tier:
source_status:
human_review:
created:
updated:
tags:
```

### 10.10 Lease Comp

Folder: `Comps/Leases/`

```yaml
type: lease_comp
id:
name:
property:
tenant:
signed_date:
commencement_date:
sf:
rent_psf:
lease_type:
term_months:
ti_allowance:
free_rent:
escalations:
submarket:
comp_quality_score:
source:
confidence_tier:
source_status:
human_review:
created:
updated:
tags:
```

### 10.11 Submarket

Folder: `Submarkets/`

```yaml
type: submarket
id:
name:
market: DFW
county_or_counties:
asset_class_focus:
summary:
vacancy:
availability:
rent_growth:
cap_rate_range:
active_buyer_types:
key_corridors:
notes:
confidence_tier:
source_status:
human_review:
created:
updated:
tags:
```

### 10.12 Broker Activity

Folder: `Broker Notes/`

```yaml
type: broker_activity
id:
name:
related_property:
related_contact:
related_entity:
activity_type: call | email | meeting | tour | valuation | pitch | follow_up | note
broker:
date:
outcome:
next_step:
sentiment: positive | neutral | negative | unknown
relationship_temperature: cold | warm | hot | active | dead | unknown
confidence_tier:
source_status:
human_review:
created:
updated:
tags:
```

### 10.13 Deal Signal

Folder: `Deal Signals/`

```yaml
type: deal_signal
id:
name:
property:
signal_type: loan_maturity | long_hold_period | tax_delinquency | recent_permit | tenant_rollover | anchor_expiration | ownership_change | entity_forfeiture | portfolio_sale_pattern | recent_nearby_comp | exchange_1031_likelihood | out_of_state_owner | broker_relationship_gap | vacancy_risk | redevelopment_pressure | refinance_risk | other
signal_strength:
signal_date:
trigger:
evidence:
recommended_action:
assigned_broker:
status: new | reviewed | contacted | dismissed | converted
confidence_tier:
source_status:
human_review:
created:
updated:
tags:
```

### 10.14 Source Document

Folder: `Sources/`

```yaml
type: source_document
id:
name:
source_type: CAD | deed | SOS | market_report | broker_note | RealNex | rent_roll | T12 | lease | OM | email | other
source_url:
source_file:
related_records:
source_date:
retrieved_date:
confidence_tier:
created:
updated:
tags:
```

### 10.15 Relationship Edge

Folder: `System/Edges/` or `System/Relationship Edges/`

```yaml
type: relationship_edge
id:
name:
from:
to:
relationship_type:
confidence:
source:
date_observed:
notes:
human_review:
created:
updated:
tags:
```

Required relationship types:

```text
PROPERTY_OWNED_BY_ENTITY
PROPERTY_SITS_ON_PARCEL
PROPERTY_OCCUPIED_BY_TENANT
PROPERTY_GOVERNED_BY_LEASE
PROPERTY_FINANCED_BY_LOAN
PROPERTY_LOCATED_IN_SUBMARKET
PROPERTY_COMPARABLE_TO_SALE_COMP
PROPERTY_COMPARABLE_TO_LEASE_COMP
ENTITY_CONTROLLED_BY_PERSON
ENTITY_PARENT_OF_ENTITY
ENTITY_SHARES_ADDRESS_WITH_ENTITY
ENTITY_SHARES_REGISTERED_AGENT_WITH_ENTITY
PERSON_CONTROLS_ENTITY
INVESTOR_LIKELY_BUYER_FOR_PROPERTY
BROKER_CONTACTED_PERSON
DEAL_SIGNAL_POINTS_TO_PROPERTY
LOAN_CREATES_REFI_RISK_FOR_PROPERTY
LEASE_CREATES_ROLLOVER_RISK_FOR_PROPERTY
```

---

## 11. Required Main Views

Build these Obsidian custom ItemViews.

### 11.1 STRIVE Command Center

Command:

```text
STRIVE Navigator: Open Command Center
```

View should show:

- total properties
- total parcels
- total entities
- total people
- total investors
- total tenants
- total leases
- total loans
- total comps
- active deal signals
- high-confidence ownership records
- human review queue
- RealNex sync queue
- top 10 deal signals
- recently updated records
- quick-create buttons
- quick-open buttons for all major views

Design:

- premium dark dashboard
- KPI cards
- compact tables
- warning cards for human review
- strong visual hierarchy

### 11.2 Property War Room

Command:

```text
STRIVE Navigator: Open Property War Room
```

When a property note is active, use that property. If no property is active, show property selector/fallback list.

Show:

- property summary card
- asset class/subtype
- submarket
- valuation facts
- parcel/CAD facts
- ownership chain
- tenant roster
- lease rollover summary
- debt maturity/refi risk
- sale comps
- lease comps
- broker activity
- deal signals
- AI brief placeholder area
- next recommended action
- confidence/source panel
- raw note link/open button

### 11.3 Owner / Entity Dossier

Command:

```text
STRIVE Navigator: Open Owner Dossier
```

For entity/person notes, show:

- entity/person facts
- registered agent
- principal office
- related entities
- known/possible principals
- properties owned/controlled
- estimated portfolio value from linked property records
- relationship owner at STRIVE
- contact confidence
- source trail
- piercing status
- human review warnings

### 11.4 Relationship Graph View

Command:

```text
STRIVE Navigator: Open Relationship Graph
```

Render visual network of:

- property
- parcel
- entity
- person
- investor
- tenant
- lease
- loan
- comp
- deal signal

MVP fallback is acceptable:

- Use custom HTML/SVG/CSS graph if a full graph library is too heavy.
- Must still show nodes and edges visually.
- Nodes should be clickable if feasible.
- Edges should display relationship labels.
- At minimum, render demo graph from sample dataset.

### 11.5 Deal Signal Radar

Command:

```text
STRIVE Navigator: Open Deal Signal Radar
```

Dashboard sorted by signal strength.

Signal types to display/filter:

- loan maturity
- long hold period
- tax delinquency
- lease rollover
- anchor expiration
- out-of-state owner
- entity forfeiture
- recent permit
- recent nearby comp
- stale broker relationship
- 1031 likelihood
- refinance risk

Each card/row should show:

- property
- signal strength
- reason/trigger
- evidence
- recommended action
- assigned broker
- status
- confidence tier
- human review flag

### 11.6 Comps Intelligence Board

Command:

```text
STRIVE Navigator: Open Comps Board
```

Show sale and lease comps with:

- subject property link
- distance placeholder
- sale date / lease date
- price
- price/SF
- cap rate
- NOI
- buyer
- seller
- tenant
- lease terms
- comp quality score
- why comparable / why not comparable
- source/confidence

Include filters:

- asset class
- submarket
- comp type
- date range
- confidence tier

### 11.7 Investor Match View

Command:

```text
STRIVE Navigator: Open Investor Match View
```

For a selected property, rank likely buyers based on:

- asset preference match
- submarket preference match
- deal size range match
- prior acquisitions
- 1031 status
- relationship owner
- last contact
- buyer confidence score

MVP scoring formula can be simple and deterministic.

Example:

```text
+25 asset class match
+20 submarket match
+20 deal size in range
+15 recent acquisition in similar subtype
+10 warm/active relationship
+10 1031/exchange flag
```

### 11.8 RealNex Sync Queue

Command:

```text
STRIVE Navigator: Open RealNex Sync Queue
```

Show records ready to export to RealNex.

Must support:

- export selected property/contact/entity records to CSV
- export all updated records to CSV
- include RealNex ID if present
- include source/confidence columns
- write CSV to `Exports/`
- show path of generated CSV in notice

Do not attempt direct RealNex automation in MVP.

---

## 12. Required Commands

Implement these commands:

```text
STRIVE Navigator: Initialize Vault Structure
STRIVE Navigator: Open Command Center
STRIVE Navigator: Open Property War Room
STRIVE Navigator: Open Owner Dossier
STRIVE Navigator: Open Relationship Graph
STRIVE Navigator: Open Deal Signal Radar
STRIVE Navigator: Open Comps Board
STRIVE Navigator: Open Investor Match View
STRIVE Navigator: Open RealNex Sync Queue
STRIVE Navigator: Create Property
STRIVE Navigator: Create Parcel
STRIVE Navigator: Create Entity
STRIVE Navigator: Create Person
STRIVE Navigator: Create Investor Profile
STRIVE Navigator: Create Tenant
STRIVE Navigator: Create Lease
STRIVE Navigator: Create Loan
STRIVE Navigator: Create Sale Comp
STRIVE Navigator: Create Lease Comp
STRIVE Navigator: Create Submarket
STRIVE Navigator: Create Deal Signal
STRIVE Navigator: Create Broker Activity
STRIVE Navigator: Create Relationship Edge
STRIVE Navigator: Rebuild STRIVE Index
STRIVE Navigator: Validate Current Note
STRIVE Navigator: Export RealNex CSV
STRIVE Navigator: Generate Sample Dataset
```

Each command should display useful success/error notices.

---

## 13. Broker Mode / Agent Mode / Raw Mode

Major views should support three mental modes.

### Broker Mode

Clean UI cards/forms:

- fast read
- executive summary
- clear next actions
- no YAML required
- good for brokers before calls/meetings

### Agent Mode

Structured machine-readable sections:

- append-only ingestion blocks
- source trail
- confidence fields
- validation warnings
- no silent overwrites
- human review flags

### Raw Markdown Mode

User can open/edit the underlying note normally.

Required behavior:

- plugin must never destroy handwritten body text
- plugin may update frontmatter carefully
- plugin must preserve all Markdown body sections
- if note is malformed, validation should flag instead of corrupting

---

## 14. UI / Design Requirements

The UI must look expensive, not default/cheap.

Style direction:

```text
premium dark mode
black / charcoal / deep navy base
gold or electric blue accent
glassmorphism cards used sparingly
dense but readable dashboards
color-coded confidence tiers
color-coded signal strength
investment-banking / command-center feel
no childish colors
no default ugly tables if avoidable
```

Use strong labels:

```text
Confidence Tier A
Human Review Required
Source Verified
Likely Decision Maker
Refi Risk
Rollover Risk
Broker Action
RealNex Sync Ready
Entity Piercing Status
Relationship Owner
```

CSS should include:

- KPI cards
- pill badges
- status chips
- warning panels
- table styling
- graph node styling
- high-density responsive layout
- readable spacing

---

## 15. Confidence Scoring Rules

Implement these confidence tiers:

```text
A = Confirmed from primary source or direct verified source
B = Strongly supported by multiple sources or reliable cross-reference
C = Inferred but plausible; human review preferred
D = Weak/unverified; human review required
F = Conflicting or failed validation; do not rely on this record
```

Display confidence tier visually everywhere.

Human review rule:

```text
If confidence_tier is C, D, or F for ownership/contact/principal fields, show a warning.
```

Do not present inferred beneficial ownership as confirmed.

---

## 16. Deal Signal Scoring Rules

Implement basic signal scoring for demo/MVP.

Suggested signal base scores:

```text
loan_maturity within 0-6 months: 95
loan_maturity within 6-12 months: 85
loan_maturity within 12-24 months: 70
long_hold_period 10+ years: 75
long_hold_period 7-10 years: 60
tax_delinquency: 85
anchor_expiration within 24 months: 80
tenant_rollover over 30% of SF within 24 months: 75
out_of_state_owner: 55
entity_forfeiture: 90
broker_relationship_gap 6+ months: 50
recent_permit major capex: 60
recent_nearby_comp high pricing: 55
exchange_1031_likelihood: 70
```

The Deal Signal Radar should sort descending by `signal_strength`.

---

## 17. Investor Match Scoring Rules

Implement basic matching formula:

```text
+25 asset class match
+20 submarket match
+20 deal size within range
+15 buyer type appropriate for asset
+15 recent acquisition/disposition similarity
+10 warm/active STRIVE relationship
+10 1031/exchange status
-20 do_not_contact relationship status
-15 confidence tier D/F
```

Display a score and explanation for each investor match.

---

## 18. RealNex CSV Export Requirements

Implement CSV export to `Exports/`.

Filename format:

```text
realnex_export_YYYY-MM-DD_HH-mm-ss.csv
```

Include at least these columns:

```text
RecordType
RealNexID
Name
Address
City
State
Zip
County
Submarket
AssetClass
AssetSubtype
BuildingSF
LandAcres
YearBuilt
OwnerEntity
BeneficialOwner
PrimaryContact
Phone
Email
LastSaleDate
LastSalePrice
AssessedValue
DealSignalScore
ConfidenceTier
HumanReview
SourceStatus
LastUpdated
Notes
```

For records that do not map perfectly, leave blank fields rather than failing.

---

## 19. Sample Dataset Requirements

Create command:

```text
STRIVE Navigator: Generate Sample Dataset
```

Must create realistic but fake DFW demo data:

- 12 properties
- 12 parcels
- 10 entities
- 8 people/principals
- 8 investors
- 15 tenants
- 15 leases
- 8 loans
- 15 sale comps
- 10 lease comps
- 8 submarkets
- 20 deal signals
- 40 relationship edges
- 10 broker activities

Every sample note must include:

```yaml
source_status: demo
human_review: true
```

Sample data should cover:

- Far North Dallas retail
- West Fort Worth retail
- South Dallas small-bay industrial
- Irving / Las Colinas office
- Plano / Frisco office
- Lower Great Southwest industrial
- East Dallas multifamily
- North Fort Worth logistics

Use fake names and fake addresses that look realistic. Do not use real people’s personal contact data.

---

## 20. Validation Requirements

Command:

```text
STRIVE Navigator: Validate Current Note
```

It should:

- detect missing required base fields
- detect unknown record type
- detect missing ID
- detect missing confidence tier
- detect missing source status
- detect inferred/low-confidence fields without human review
- warn if property has no owner entity
- warn if lease has no property or tenant
- warn if relationship edge has missing `from`, `to`, or `relationship_type`
- show a clear Notice and/or modal with validation results

Also build a validation service used by the views.

---

## 21. Metadata Index Requirements

Create an internal indexer that scans Markdown files and reads frontmatter.

Index should group records by type:

```ts
property
parcel
entity
person
investor_profile
tenant
lease
loan
sale_comp
lease_comp
submarket
broker_activity
deal_signal
source_document
relationship_edge
```

The indexer should support:

- rebuild index command
- counts by type
- find records by ID
- find records by type
- find relationships from/to ID
- find linked records for a property
- simple text search by name/address

Do not rely entirely on Dataview. Build your own lightweight index inside the plugin.

---

## 22. Build Strategy / Implementation Order

Work in this order:

1. Create `PLAN.md` with implementation sequence.
2. Immediately begin implementation. Do not wait for approval.
3. Scaffold plugin from Obsidian sample plugin pattern.
4. Implement manifest/package/build config.
5. Implement constants/types/schemas.
6. Implement folder initialization.
7. Implement note creation helpers.
8. Implement metadata indexer.
9. Implement relationship indexer.
10. Implement sample dataset generator.
11. Implement Command Center.
12. Implement Property War Room.
13. Implement Owner Dossier.
14. Implement Relationship Graph MVP.
15. Implement Deal Signal Radar.
16. Implement Comps Board.
17. Implement Investor Match View.
18. Implement RealNex CSV export.
19. Implement validation.
20. Polish CSS.
21. Add README.
22. Add architecture docs.
23. Run `npm install`.
24. Run `npm run build`.
25. Fix TypeScript/build errors.
26. Re-run build.
27. Document manual test steps.
28. Final acceptance checklist.

Do not spend the whole run planning. The plan should be brief, then code.

---

## 23. Acceptance Criteria

The goal is complete only when all feasible MVP criteria are satisfied:

1. `npm install` succeeds or dependency issues are documented with fallback.
2. `npm run build` succeeds.
3. `manifest.json`, `main.js`, and `styles.css` are produced.
4. Plugin can be copied into `.obsidian/plugins/strive-navigator/`.
5. Plugin loads in Obsidian without known fatal console errors.
6. Vault structure command creates all required folders.
7. Sample dataset command creates demo records.
8. Command Center opens and displays counts.
9. Property War Room opens and shows linked property data.
10. Owner Dossier opens and shows related properties/entities.
11. Relationship Graph opens and displays demo nodes/edges.
12. Deal Signal Radar opens and sorts signals by strength.
13. Comps Board opens and displays sale/lease comps.
14. Investor Match View opens and ranks demo buyers.
15. RealNex Sync Queue exports CSV to `Exports/`.
16. Validate Current Note catches missing required fields.
17. Existing Markdown body notes are preserved when metadata updates.
18. README explains installation and testing.
19. `docs/ARCHITECTURE.md` explains schema, views, and future Postgres/agent integration.
20. `docs/SCHEMA.md` documents record types.
21. `docs/REALNEX_SYNC.md` documents export strategy.
22. `docs/FUTURE_AGENT_ENGINE.md` documents future data ingestion/enrichment strategy.

If any criterion cannot be fully satisfied, implement the closest working fallback, mark it clearly in `KNOWN_LIMITATIONS.md`, and continue.

---

## 24. Manual Test Script to Create

Create `docs/MANUAL_TESTS.md` with steps like:

```markdown
# Manual Tests

## Test 1: Install Plugin
1. Run `npm install`.
2. Run `npm run build`.
3. Copy `manifest.json`, `main.js`, and `styles.css` to `.obsidian/plugins/strive-navigator/`.
4. Open Obsidian and enable STRIVE Navigator.
5. Expected: plugin enables without fatal error.

## Test 2: Initialize Vault
1. Run command `STRIVE Navigator: Initialize Vault Structure`.
2. Expected: required folders exist.

## Test 3: Generate Sample Dataset
1. Run command `STRIVE Navigator: Generate Sample Dataset`.
2. Expected: demo notes are created in proper folders.

## Test 4: Command Center
1. Run command `STRIVE Navigator: Open Command Center`.
2. Expected: dashboard shows counts and top deal signals.

## Test 5: Property War Room
1. Open a demo property note.
2. Run command `STRIVE Navigator: Open Property War Room`.
3. Expected: linked owner, tenants, leases, loans, comps, and signals appear.

## Test 6: RealNex Export
1. Run command `STRIVE Navigator: Export RealNex CSV`.
2. Expected: CSV appears in `Exports/`.
```

---

## 25. Documentation Requirements

Create/update:

### README.md

Must include:

- what STRIVE Navigator is
- install steps
- development steps
- build steps
- how to load in Obsidian
- first commands to run
- demo data warning
- known limitations

### docs/ARCHITECTURE.md

Must include:

- Obsidian vault as intelligence layer
- Markdown frontmatter schema
- plugin metadata indexer
- relationship edge model
- views/components overview
- future Postgres/PostGIS layer
- future AI agent ingestion layer

### docs/SCHEMA.md

Must include:

- all record types
- required fields
- confidence tiers
- folder locations
- relationship types

### docs/REALNEX_SYNC.md

Must include:

- MVP CSV export strategy
- why direct RealNex automation is deferred
- how RealNex IDs should be preserved
- import/export mapping notes

### docs/FUTURE_AGENT_ENGINE.md

Must include:

- future Local REST API integration
- CSV importers
- public CAD/GIS importer strategy
- Texas SOS workflow strategy
- entity-piercing workflow
- local LLM brief generator
- deal signal monitor
- no paid-platform scraping rule

### KNOWN_LIMITATIONS.md

Must include:

- incomplete features
- fallback implementations
- future improvements

---

## 26. Safety / Compliance Rules

Do not include code that:

- bypasses CAPTCHAs
- evades rate limits
- scrapes restricted paid platforms
- violates CoStar or paid database terms
- guesses beneficial ownership without confidence labels
- overwrites human broker notes without confirmation
- stores real personal contact data in demo records

Every uncertain ownership/contact/principal relationship must be marked:

```yaml
confidence_tier: C
human_review: true
```

or worse.

---

## 27. Future Architecture to Document but Not Fully Build

Document these as Phase 2/3:

- Postgres/PostGIS backend
- DuckDB/sql.js local analytical layer
- Local REST API ingestion
- CAD/GIS public data importer
- Texas SOS entity research workflow
- RealNex two-way sync
- local LLM broker brief generator
- map layer
- entity-piercing workflow automation
- lease abstraction assistant
- debt maturity monitor
- 1031 buyer tracker
- OCR/PDF source extraction
- bulk import from STRIVE’s existing 150,000-record database

Do not let these distract from the MVP build.

---

## 28. Quality Bar

This should feel like a serious enterprise tool.

Bad output:

- only a README
- only a schema document
- only a single sidebar
- ugly default HTML
- no sample data
- no build verification
- no relationship model
- no RealNex export

Good output:

- compiles
- loads in Obsidian
- creates folders
- creates demo data
- renders premium dashboards
- indexes records
- shows relationship graph
- exports RealNex CSV
- validates notes
- preserves Markdown
- clearly documents next phases

---

## 29. Final Response Required From Codex

When finished, report:

1. Summary of what was built.
2. Files changed/created.
3. Build commands run and results.
4. Manual test status.
5. Acceptance criteria status.
6. Known limitations.
7. Exact install steps for Obsidian.
8. Next recommended build phase.

Do not claim success unless `npm run build` actually passed or you clearly disclose why it could not be run.

---

## 30. Final Reminder

This is a goal-mode overnight build. Keep moving.

If blocked:

1. Document blocker.
2. Implement fallback.
3. Continue.

Do not ask for approval unless absolutely impossible to proceed.

