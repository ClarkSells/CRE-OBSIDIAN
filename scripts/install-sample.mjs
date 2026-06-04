import { copyFile, mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const vault = path.join(root, "sample-vault");
const pluginDir = path.join(vault, ".obsidian", "plugins", "strive-navigator");
const folders = ["Properties", "Parcels", "Entities", "People", "Companies", "Investors", "Tenants", "Leases", "Loans", "Comps/Sales", "Comps/Leases", "Submarkets", "Deal Signals", "Broker Notes", "Tasks", "Requirements", "Pursuits", "Transactions", "Documents", "Dashboards", "Templates", "Sources", "Imports", "Exports", "System/Relationship Edges", "System/Timeline Templates", "System/Saved Views", "System/Import Batches", "System/Data Issues", "System/Record Events", "System/Field Assertions", "System/Backups"];

const catalogs = {
  submarket: ["Far North Dallas", "West Fort Worth", "South Dallas", "Irving Las Colinas", "Plano Frisco", "Lower Great Southwest", "East Dallas", "North Fort Worth Logistics"],
  property: ["Beltline Market Center", "Ridgmar Commerce Row", "Trinity Small Bay Works", "Las Colinas Meridian Tower", "Legacy Park Exchange", "GSW Logistics Court", "White Rock Flats", "Alliance Gateway Logistics", "Frisco Railhead Offices", "Oak Cliff Maker Yards", "Camp Bowie Retail Exchange", "Irving Tech Commons"],
  parcel: Array.from({ length: 12 }, (_, i) => `Demo CAD Parcel ${10001 + i}`),
  entity: ["Meridian Gate Holdings LLC", "Ridgmar Exchange Partners LP", "Trinity Dawn Industrial LLC", "Summit Canal Offices LLC", "Copper Star Capital LLC", "Prairie Link Logistics Fund LP", "Garland Crest Residential LLC", "Northline Freight Holdings LLC", "Lantern Bend Medical LLC", "Foundry Vista Partners LLC"],
  person: ["Avery Cole", "Morgan Vance", "Jordan Ellis", "Taylor Rowan", "Cameron Hale", "Reese Sutton", "Parker Lane", "Casey Monroe"],
  investor_profile: ["Blue Mesa Private Capital", "Red River Exchange Group", "Juniper Family Office", "Northgate Industrial Partners", "Harborline Realty Fund", "Crescent Sun Investments", "Lone Prairie Acquisitions", "Silver Elm Property Group"],
  tenant: ["Northstar Grocer", "Cedar Trail Fitness", "MetroLab Supply", "BrightSpan Dental", "VectorWorks Fabrication", "Prairie Coffee House", "Slate Medical Imaging", "Origin Logistics", "Trellis Learning Center", "Foundry Kitchen", "Vertex Data Services", "Sunline Pharmacy", "Keystone Packaging", "Urban Field Market", "Clearview Therapy"],
  lease: Array.from({ length: 15 }, (_, i) => `Demo Lease ${String(i + 1).padStart(2, "0")}`),
  loan: Array.from({ length: 8 }, (_, i) => `Demo Senior Loan ${i + 1}`),
  sale_comp: Array.from({ length: 15 }, (_, i) => `DFW Sale Comparable ${i + 1}`),
  lease_comp: Array.from({ length: 10 }, (_, i) => `DFW Lease Comparable ${i + 1}`),
  deal_signal: Array.from({ length: 20 }, (_, i) => `Priority Deal Signal ${i + 1}`),
  broker_activity: Array.from({ length: 10 }, (_, i) => `Broker Follow-Up ${i + 1}`),
  relationship_edge: Array.from({ length: 70 }, (_, i) => `Relationship Edge ${i + 1}`),
  company: Array.from({ length: 6 }, (_, i) => `Demo Investment Company ${i + 1}`),
  task: Array.from({ length: 16 }, (_, i) => `Demo Broker Task ${i + 1}`),
  requirement: Array.from({ length: 8 }, (_, i) => `Demo Buyer Requirement ${i + 1}`),
  pursuit: Array.from({ length: 10 }, (_, i) => `Demo Investment Sales Pursuit ${i + 1}`),
  transaction: Array.from({ length: 6 }, (_, i) => `Demo Transaction ${i + 1}`),
  document: Array.from({ length: 8 }, (_, i) => `Demo Source Document ${i + 1}`),
  timeline_template: ["Investment Sales Prospecting", "BOV Pursuit", "Listing Launch", "Transaction Execution", "Post-Close Follow-Up"],
  saved_view: ["High Signal Properties", "Active Owner Pursuits", "Upcoming Closings"]
};

const typeFolder = {
  property: "Properties", parcel: "Parcels", entity: "Entities", person: "People",
  investor_profile: "Investors", tenant: "Tenants", lease: "Leases", loan: "Loans",
  sale_comp: "Comps/Sales", lease_comp: "Comps/Leases", submarket: "Submarkets",
  deal_signal: "Deal Signals", broker_activity: "Broker Notes", relationship_edge: "System/Relationship Edges",
  company: "Companies", task: "Tasks", requirement: "Requirements", pursuit: "Pursuits", transaction: "Transactions",
  document: "Documents", timeline_template: "System/Timeline Templates", saved_view: "System/Saved Views"
};

const prefix = { property: "prop", parcel: "parcel", entity: "entity", person: "person", investor_profile: "investor", tenant: "tenant", lease: "lease", loan: "loan", sale_comp: "salecomp", lease_comp: "leasecomp", submarket: "submarket", deal_signal: "signal", broker_activity: "activity", relationship_edge: "edge", company: "company", task: "task", requirement: "requirement", pursuit: "pursuit", transaction: "transaction", document: "document", timeline_template: "timeline", saved_view: "savedview" };
const propertyAddresses = ["18420 Meridian Gate", "6720 Calmont Exchange", "3911 Dawn Commerce Way", "5225 Summit Canal Drive", "7112 Copper Star Parkway", "2821 Prairie Link Road", "4880 Garland Crest Avenue", "13600 Northline Freight Drive", "10910 Lantern Bend", "2418 Foundry Vista", "6117 Camp Summit Boulevard", "3401 Hidden Spur Road"];
const assetClasses = ["retail", "retail", "industrial", "office", "office", "industrial", "multifamily", "industrial", "office", "industrial", "retail", "office"];

function scalar(value) {
  if (typeof value === "boolean" || typeof value === "number") return String(value);
  if (Array.isArray(value)) return `[${value.map((x) => JSON.stringify(x)).join(", ")}]`;
  return JSON.stringify(String(value ?? ""));
}

function markdown(record) {
  const yaml = Object.entries(record).map(([key, value]) => `${key}: ${scalar(value)}`).join("\n");
  return `---\n${yaml}\n---\n\n# ${record.name}\n\n> Fake STRIVE Navigator demo record. Do not use as verified market data.\n\n## Broker Notes\n\nHuman-written notes remain editable and are never silently overwritten.\n\n## Source Trail\n\nSynthetic demo source only.\n`;
}

function extras(type, i) {
  const p = (i % 12) + 1;
  if (type === "property") return { address: propertyAddresses[i], city: ["Dallas", "Fort Worth", "Dallas", "Irving", "Plano", "Grand Prairie", "Dallas", "Fort Worth", "Frisco", "Dallas", "Fort Worth", "Irving"][i], state: "TX", county: i === 1 || i === 7 || i === 10 ? "Tarrant" : "Dallas", lat: Number((32.66 + (i % 4) * .16).toFixed(5)), lng: Number((-97.42 + (i % 5) * .24).toFixed(5)), submarket: `submarket_demo_${(i % 8) + 1}`, asset_class: assetClasses[i], asset_subtype: "demo_asset", building_sf: 52000 + i * 21000, land_acres: 3 + i, year_built: 1990 + i, owner_entity: `entity_demo_${(i % 10) + 1}`, beneficial_owner: `person_demo_${(i % 8) + 1}`, parcel_ids: [`parcel_demo_${p}`], tenant_ids: [`tenant_demo_${(i % 15) + 1}`], lease_ids: [`lease_demo_${(i % 15) + 1}`], loan_ids: i < 8 ? [`loan_demo_${i + 1}`] : [], sale_comp_ids: [`salecomp_demo_${(i % 15) + 1}`], lease_comp_ids: i < 10 ? [`leasecomp_demo_${i + 1}`] : [], assessed_value: 8000000 + i * 2750000, deal_signal_score: 97 - i * 3 };
  if (type === "parcel") return { parcel_id: `DEMO-CAD-${10001 + i}`, matched_property: `prop_demo_${p}`, county: "Dallas", situs_address: propertyAddresses[i], total_value: 8000000 + i * 2750000 };
  if (type === "entity") return { entity_name: catalogs.entity[i], entity_type: i % 2 ? "LP" : "LLC", state_of_formation: "TX", registered_agent: `person_demo_${(i % 8) + 1}`, properties_owned: [`prop_demo_${p}`], known_principals: [`person_demo_${(i % 8) + 1}`], piercing_status: i % 3 ? "simple" : "layered" };
  if (type === "person") return { full_name: catalogs.person[i], role: "owner", entities_controlled: [`entity_demo_${i + 1}`], relationship_owner_at_strive: ["Clark", "Jordan", "Taylor"][i % 3], relationship_status: i % 2 ? "cold" : "warm", email_business: "demo@example.invalid", phone_office: "555-0100" };
  if (type === "investor_profile") return { investor_name: catalogs.investor_profile[i], buyer_type: ["private", "family_office", "syndicator", "institutional"][i % 4], asset_preferences: [assetClasses[i]], submarket_preferences: [`submarket_demo_${i + 1}`], deal_size_min: 5000000, deal_size_max: 45000000, exchange_status: i % 3 === 0 ? "active_1031" : "none", relationship_status: i % 2 ? "cold" : "warm" };
  if (type === "tenant") return { tenant_name: catalogs.tenant[i], industry: ["retail", "healthcare", "logistics"][i % 3], tenant_type: ["anchor", "inline", "industrial_user", "office_user"][i % 4], credit_quality: "regional" };
  if (type === "lease") return { property: `prop_demo_${p}`, tenant: `tenant_demo_${i + 1}`, leased_sf: 5000 + i * 1300, lease_start: "2022-01-01", lease_end: `${2027 + (i % 5)}-12-31`, rent_psf: 15 + i, lease_type: i % 2 ? "modified_gross" : "NNN", rollover_risk_score: 45 + i * 3 };
  if (type === "loan") return { property: `prop_demo_${p}`, borrower_entity: `entity_demo_${i + 1}`, lender: "Demo National Bank", loan_amount: 5000000 + i * 2500000, maturity_date: `${2026 + (i % 4)}-12-15`, rate_type: i % 2 ? "fixed" : "floating", refi_risk_score: 60 + i * 4 };
  if (type === "sale_comp") return { property: `prop_demo_${p}`, sale_date: "2025-06-15", sale_price: 7000000 + i * 1800000, price_psf: 120 + i * 7, cap_rate: 5.75 + (i % 5) * .3, buyer: catalogs.investor_profile[i % 8], asset_class: assetClasses[i % 12], comp_quality_score: 65 + i * 2, why_comparable: "Similar DFW asset and pricing context.", why_not_comparable: "Synthetic distance and tenancy require review." };
  if (type === "lease_comp") return { property: `prop_demo_${p}`, tenant: `tenant_demo_${(i % 15) + 1}`, signed_date: "2025-04-15", sf: 6000 + i * 1500, rent_psf: 17 + i, lease_type: "NNN", term_months: 60, submarket: `submarket_demo_${(i % 8) + 1}`, comp_quality_score: 70 + i * 2 };
  if (type === "submarket") return { market: "DFW", county_or_counties: ["Dallas", "Tarrant"], asset_class_focus: [assetClasses[i]], vacancy: "7.4%", rent_growth: "3.1%" };
  if (type === "deal_signal") return { property: `prop_demo_${p}`, signal_type: ["loan_maturity", "long_hold_period", "tenant_rollover", "out_of_state_owner", "entity_forfeiture", "refinance_risk"][i % 6], signal_strength: 98 - i * 2, trigger: "Synthetic demo trigger", evidence: "Synthetic evidence requiring human confirmation.", recommended_action: "Confirm source trail and call owner.", assigned_broker: ["Clark", "Jordan", "Taylor"][i % 3], status: "new" };
  if (type === "broker_activity") return { related_property: `prop_demo_${p}`, related_contact: `person_demo_${(i % 8) + 1}`, activity_type: "call", broker: ["Clark", "Jordan"][i % 2], date: "2026-05-20", outcome: "Demo call outcome.", next_step: "Confirm capital plan." };
  if (type === "relationship_edge") {
    const group = Math.floor(i / 12);
    const relationship = ["PROPERTY_OWNED_BY_ENTITY", "PROPERTY_SITS_ON_PARCEL", "PROPERTY_OCCUPIED_BY_TENANT", "DEAL_SIGNAL_POINTS_TO_PROPERTY", "ENTITY_CONTROLLED_BY_PERSON", "PERSON_CONTROLS_ENTITY"][group] ?? "PROPERTY_OWNED_BY_ENTITY";
    const targets = [`entity_demo_${(i % 10) + 1}`, `parcel_demo_${p}`, `tenant_demo_${(i % 15) + 1}`, `signal_demo_${(i % 20) + 1}`, `person_demo_${(i % 8) + 1}`, `company_demo_${(i % 6) + 1}`];
    return { from: group === 3 ? targets[group] : group >= 4 ? `entity_demo_${(i % 10) + 1}` : `prop_demo_${p}`, to: group === 3 ? `prop_demo_${p}` : targets[group], relationship_type: relationship, confidence: "C", status: group >= 4 ? "inferred" : "active", weight: group >= 4 ? .65 : 1, valid_from: "2020-01-01", last_verified: "2026-06-04", date_observed: "2026-06-04" };
  }
  if (type === "company") return { company_name: catalogs.company[i], company_type: ["investment_firm", "family_office", "developer"][i % 3], people: [`person_demo_${(i % 8) + 1}`], entities: [`entity_demo_${(i % 10) + 1}`], properties: [`prop_demo_${p}`], relationship_owner_at_strive: ["Clark", "Jordan", "Taylor"][i % 3], relationship_status: i % 2 ? "warm" : "active" };
  if (type === "task") return { status: i % 5 ? "open" : "complete", priority: i % 4 ? "normal" : "urgent", assigned_to: ["Clark", "Jordan", "Taylor"][i % 3], due_date: `2026-06-${String(2 + i).padStart(2, "0")}`, related_records: [`prop_demo_${p}`], next_action: "Complete the source-aware broker action." };
  if (type === "requirement") return { investor: `investor_demo_${i + 1}`, contacts: [`person_demo_${i + 1}`], asset_preferences: [assetClasses[i]], submarket_preferences: [`submarket_demo_${i + 1}`], deal_size_min: 7000000, deal_size_max: 38000000, target_close_date: "2026-12-15", status: "active", assigned_broker: ["Clark", "Jordan", "Taylor"][i % 3], matched_properties: [`prop_demo_${p}`] };
  if (type === "pursuit") return { property: `prop_demo_${p}`, owner: `entity_demo_${(i % 10) + 1}`, stage: ["research", "relationship", "valuation", "pitch", "listing"][i % 5], probability: 20 + (i % 5) * 15, expected_fee: 85000 + i * 24000, assigned_broker: ["Clark", "Jordan", "Taylor"][i % 3], next_action: "Advance owner relationship with verified intelligence." };
  if (type === "transaction") return { property: `prop_demo_${p}`, pursuit: `pursuit_demo_${i + 1}`, buyer: `investor_demo_${i + 1}`, seller: `entity_demo_${i + 1}`, status: ["due_diligence", "under_contract", "closing"][i % 3], target_close_date: "2026-08-15", price: 12000000 + i * 2500000, commission_estimate: 240000 + i * 50000, probability: 70 + i * 5, milestones: ["PSA executed", "Due diligence", "Financing", "Closing"] };
  if (type === "document") return { document_type: ["OM", "rent_roll", "T12", "PSA"][i % 4], file_path: `Sources/demo-${i + 1}.pdf`, related_records: [`prop_demo_${p}`], document_date: "2026-05-01", status: "demo", version: 1 };
  if (type === "timeline_template") return { workflow_type: ["prospecting", "bov", "listing", "transaction", "post_close"][i], description: "Demo V2 workflow template.", steps: ["Research", "Prepare", "Execute", "Follow up"], active: true };
  if (type === "saved_view") return { view_type: ["map", "pursuit_pipeline", "transaction_manager"][i], filters: { demo: true }, columns: [], sort: "updated_desc", owner: "STRIVE", shared: true };
  return {};
}

await rm(vault, { recursive: true, force: true });
for (const folder of folders) await mkdir(path.join(vault, folder), { recursive: true });
await mkdir(pluginDir, { recursive: true });
await writeFile(path.join(vault, ".obsidian", "community-plugins.json"), JSON.stringify(["strive-navigator"], null, 2));
await writeFile(path.join(vault, ".obsidian", "app.json"), JSON.stringify({ alwaysUpdateLinks: true, showUnsupportedFiles: true }, null, 2));
for (const file of ["manifest.json", "main.js", "styles.css"]) await copyFile(path.join(root, file), path.join(pluginDir, file));

for (const [type, names] of Object.entries(catalogs)) {
  for (let i = 0; i < names.length; i++) {
    const record = { type, id: `${prefix[type]}_demo_${i + 1}`, name: names[i], created: "2026-06-04", updated: "2026-06-04", confidence_tier: "C", source_status: "demo", human_review: true, realnex_id: "", tags: ["strive/demo", `strive/${type}`], ...extras(type, i) };
    const file = `${record.id} - ${String(record.name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}.md`;
    await writeFile(path.join(vault, typeFolder[type], file), markdown(record));
  }
}

const csvHeader = "RecordType,RealNexID,Name,Address,City,State,Zip,County,Submarket,AssetClass,AssetSubtype,BuildingSF,LandAcres,YearBuilt,OwnerEntity,BeneficialOwner,PrimaryContact,Phone,Email,LastSaleDate,LastSalePrice,AssessedValue,DealSignalScore,ConfidenceTier,HumanReview,SourceStatus,LastUpdated,Notes";
const csvRows = catalogs.property.map((name, i) => `property,,\"${name}\",\"${propertyAddresses[i]}\",,TX,,,,${assetClasses[i]},,,,,entity_demo_${(i % 10) + 1},person_demo_${(i % 8) + 1},,,,,,,${8000000 + i * 2750000},${97 - i * 3},C,true,demo,2026-06-04,Fake demo record`);
await writeFile(path.join(vault, "Exports", "realnex_export_2026-06-04_00-00-00.csv"), [csvHeader, ...csvRows].join("\r\n"));
await writeFile(path.join(vault, "Dashboards", "STRIVE Navigator.md"), "# STRIVE Navigator\n\nOpen the Command Center from the command palette. All records in this vault are fake demo data.\n");
await writeFile(path.join(vault, "Imports", "demo-realnex-import.csv"), "RecordType,RealNexID,Property Name,Property Address,City,State,Property Type,Building Size,Owner,DealSignalScore\nproperty,RNX-DEMO-1,Demo Import Retail Center,9000 Example Commerce Way,Dallas,TX,retail,78000,Demo Import Holdings LLC,82\nproperty,RNX-DEMO-2,Demo Import Industrial Park,9100 Example Commerce Way,Fort Worth,TX,industrial,145000,Demo Import Holdings LLC,76\n");
await writeFile(path.join(vault, "Imports", "demo-dfw-overlay.geojson"), JSON.stringify({ type: "FeatureCollection", features: [{ type: "Feature", properties: { name: "Demo DFW Intelligence Zone" }, geometry: { type: "Polygon", coordinates: [[[-97.25, 32.72], [-96.75, 32.72], [-96.75, 33.08], [-97.25, 33.08], [-97.25, 32.72]]] } }] }, null, 2));
await writeFile(path.join(vault, "README.md"), "# STRIVE Navigator Sample Vault\n\nThis vault contains fake DFW demo records and a preinstalled STRIVE Navigator plugin build. Open it in Obsidian, enable community plugins, then run `STRIVE Navigator: Open Command Center`.\n");
console.log(`Installed plugin and ${Object.values(catalogs).reduce((sum, items) => sum + items.length, 0)} demo records into ${vault}`);
