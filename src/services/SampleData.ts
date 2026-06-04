import { Notice } from "obsidian";
import { RELATIONSHIP_TYPES } from "../constants";
import type { RecordType } from "../types";
import { RecordFactory } from "./RecordFactory";
import { MetadataIndex } from "./MetadataIndex";

const markets = [
  ["far-north-dallas", "Far North Dallas", "Dallas", "retail"],
  ["west-fort-worth", "West Fort Worth", "Tarrant", "retail"],
  ["south-dallas", "South Dallas", "Dallas", "industrial"],
  ["las-colinas", "Irving / Las Colinas", "Dallas", "office"],
  ["plano-frisco", "Plano / Frisco", "Collin", "office"],
  ["great-southwest", "Lower Great Southwest", "Dallas/Tarrant", "industrial"],
  ["east-dallas", "East Dallas", "Dallas", "multifamily"],
  ["north-fort-worth", "North Fort Worth Logistics", "Tarrant/Denton", "industrial"]
] as const;

const properties = [
  ["Beltline Market Center", "18420 Meridian Gate", "Dallas", "far-north-dallas", "retail", "neighborhood_center", 84200, 15900000],
  ["Ridgmar Commerce Row", "6720 Calmont Exchange", "Fort Worth", "west-fort-worth", "retail", "strip_center", 46200, 8750000],
  ["Trinity Small Bay Works", "3911 Dawn Commerce Way", "Dallas", "south-dallas", "industrial", "small_bay", 118000, 12100000],
  ["Las Colinas Meridian Tower", "5225 Summit Canal Drive", "Irving", "las-colinas", "office", "suburban_office", 176000, 23800000],
  ["Legacy Park Exchange", "7112 Copper Star Parkway", "Plano", "plano-frisco", "office", "creative_office", 132000, 19600000],
  ["GSW Logistics Court", "2821 Prairie Link Road", "Grand Prairie", "great-southwest", "industrial", "distribution", 244000, 28400000],
  ["White Rock Flats", "4880 Garland Crest Avenue", "Dallas", "east-dallas", "multifamily", "garden", 164000, 26750000],
  ["Alliance Gateway Logistics", "13600 Northline Freight Drive", "Fort Worth", "north-fort-worth", "industrial", "logistics", 318000, 41500000],
  ["Frisco Railhead Offices", "10910 Lantern Bend", "Frisco", "plano-frisco", "office", "medical_office", 88500, 14750000],
  ["Oak Cliff Maker Yards", "2418 Foundry Vista", "Dallas", "south-dallas", "industrial", "flex", 72600, 7950000],
  ["Camp Bowie Retail Exchange", "6117 Camp Summit Boulevard", "Fort Worth", "west-fort-worth", "retail", "urban_retail", 59800, 11900000],
  ["Irving Tech Commons", "3401 Hidden Spur Road", "Irving", "las-colinas", "office", "flex_office", 104000, 13250000]
] as const;

const entityNames = ["Meridian Gate Holdings LLC", "Ridgmar Exchange Partners LP", "Trinity Dawn Industrial LLC", "Summit Canal Offices LLC", "Copper Star Capital LLC", "Prairie Link Logistics Fund LP", "Garland Crest Residential LLC", "Northline Freight Holdings LLC", "Lantern Bend Medical LLC", "Foundry Vista Partners LLC"];
const peopleNames = ["Avery Cole", "Morgan Vance", "Jordan Ellis", "Taylor Rowan", "Cameron Hale", "Reese Sutton", "Parker Lane", "Casey Monroe"];
const investorNames = ["Blue Mesa Private Capital", "Red River Exchange Group", "Juniper Family Office", "Northgate Industrial Partners", "Harborline Realty Fund", "Crescent Sun Investments", "Lone Prairie Acquisitions", "Silver Elm Property Group"];
const tenantNames = ["Northstar Grocer", "Cedar Trail Fitness", "MetroLab Supply", "BrightSpan Dental", "VectorWorks Fabrication", "Prairie Coffee House", "Slate Medical Imaging", "Origin Logistics", "Trellis Learning Center", "Foundry Kitchen", "Vertex Data Services", "Sunline Pharmacy", "Keystone Packaging", "Urban Field Market", "Clearview Therapy"];
const saleCompNames = ["Preston Hollow Retail Trade", "Bryant Irvin Shops Trade", "South Loop Industrial Trade", "Walnut Hill Office Trade", "Frisco Medical Trade", "Arlington Distribution Trade", "Lakewood Apartments Trade", "Alliance Logistics Trade", "Plano Parkway Office Trade", "Cedars Flex Trade", "Westover Retail Trade", "Las Colinas Flex Trade", "Addison Retail Trade", "Mansfield Industrial Trade", "Richardson Office Trade"];

export class SampleDataService {
  constructor(private factory: RecordFactory, private index: MetadataIndex) {}

  async generate(): Promise<Record<RecordType, number>> {
    const counts = {} as Record<RecordType, number>;
    const create = async (type: RecordType, id: string, name: string, extras: Record<string, unknown> = {}) => {
      await this.factory.create(type, name, { id, source_status: "demo", human_review: true, confidence_tier: "C", tags: ["strive/demo", `strive/${type}`], ...extras });
      counts[type] = (counts[type] ?? 0) + 1;
    };

    for (const [slug, name, counties, focus] of markets) await create("submarket", `submarket_${slug}`, name, { market: "DFW", county_or_counties: counties, asset_class_focus: [focus], summary: `Demo intelligence brief for ${name}.`, vacancy: "7.4%", rent_growth: "3.1%", cap_rate_range: "5.75%-7.25%", active_buyer_types: ["private", "family_office"], key_corridors: ["Primary DFW corridor"] });
    for (let i = 0; i < entityNames.length; i++) await create("entity", `entity_demo_${i + 1}`, entityNames[i], { entity_name: entityNames[i], normalized_entity_name: entityNames[i].toUpperCase(), entity_type: i % 3 === 1 ? "LP" : "LLC", state_of_formation: "TX", sos_file_number: `DEMO-${800100 + i}`, sos_status: i === 7 ? "human_review" : "active", registered_agent: `person_demo_${(i % 8) + 1}`, properties_owned: [`prop_demo_${(i % 12) + 1}`], known_principals: [`person_demo_${(i % 8) + 1}`], piercing_status: i % 4 === 0 ? "layered" : "simple" });
    for (let i = 0; i < peopleNames.length; i++) await create("person", `person_demo_${i + 1}`, peopleNames[i], { full_name: peopleNames[i], role: "owner", company: entityNames[i % entityNames.length], entities_controlled: [`entity_demo_${i + 1}`], properties_controlled: [`prop_demo_${i + 1}`], email_business: `${peopleNames[i].toLowerCase().replace(" ", ".")}@example.invalid`, phone_office: "555-0100", relationship_owner_at_strive: ["Clark", "Jordan", "Taylor"][i % 3], last_contacted: `2026-0${(i % 5) + 1}-15`, relationship_status: i % 3 === 0 ? "warm" : "cold" });
    for (let i = 0; i < investorNames.length; i++) await create("investor_profile", `investor_demo_${i + 1}`, investorNames[i], { investor_name: investorNames[i], buyer_type: ["private", "family_office", "syndicator", "institutional"][i % 4], asset_preferences: [properties[i][4]], submarket_preferences: [properties[i][3], properties[(i + 3) % 12][3]], deal_size_min: 5000000, deal_size_max: 45000000, risk_profile: ["core_plus", "value_add", "opportunistic"][i % 3], recent_acquisitions: [saleCompNames[i]], exchange_status: i % 3 === 0 ? "active_1031" : "none", relationship_owner_at_strive: ["Clark", "Jordan", "Taylor"][i % 3], relationship_status: i % 2 === 0 ? "warm" : "cold", last_contacted: "2026-04-18" });
    for (let i = 0; i < tenantNames.length; i++) await create("tenant", `tenant_demo_${i + 1}`, tenantNames[i], { tenant_name: tenantNames[i], industry: ["retail", "healthcare", "logistics", "professional_services"][i % 4], credit_quality: ["regional", "local", "strong"][i % 3], tenant_type: ["anchor", "inline", "industrial_user", "office_user"][i % 4], traffic_driver_score: 55 + (i * 3) % 40, expansion_status: i % 4 === 0 ? "expanding" : "stable", bankruptcy_risk: "low" });
    for (let i = 0; i < properties.length; i++) {
      const [name, address, city, market, assetClass, subtype, sf, value] = properties[i];
      const entity = `entity_demo_${(i % 10) + 1}`;
      await create("property", `prop_demo_${i + 1}`, name, { address, normalized_address: `${address}, ${city}, TX`, city, county: city === "Fort Worth" ? "Tarrant" : city === "Plano" || city === "Frisco" ? "Collin" : "Dallas", state: "TX", zip: `75${200 + i}`, submarket: `submarket_${market}`, asset_class: assetClass, asset_subtype: subtype, building_sf: sf, land_acres: Number((sf / 43560 * 1.7).toFixed(2)), year_built: 1988 + i * 2, parcel_ids: [`parcel_demo_${i + 1}`], owner_entity: entity, beneficial_owner: `person_demo_${(i % 8) + 1}`, loan_ids: i < 8 ? [`loan_demo_${i + 1}`] : [], tenant_ids: [`tenant_demo_${i + 1}`], lease_ids: [`lease_demo_${i + 1}`], sale_comp_ids: [`salecomp_demo_${i + 1}`], lease_comp_ids: i < 10 ? [`leasecomp_demo_${i + 1}`] : [], last_sale_date: `20${14 + (i % 8)}-06-15`, last_sale_price: Math.round(value * 0.72), assessed_value: value, deal_signal_score: 55 + (i * 7) % 43 });
      await create("parcel", `parcel_demo_${i + 1}`, `${name} Parcel`, { parcel_id: `DEMO-CAD-${10000 + i}`, county: city === "Fort Worth" ? "Tarrant" : "Dallas", cad_url: "https://example.invalid/demo-cad", gis_url: "https://example.invalid/demo-gis", legal_description: `DEMO ADDITION BLK ${i + 1} LOT 1`, situs_address: address, owner_name_raw: entityNames[i % 10], owner_mailing_address: "100 Demo Records Way, Dallas, TX", tax_account: `DEMO-${90000 + i}`, land_value: Math.round(value * 0.2), improvement_value: Math.round(value * 0.8), total_value: value, taxes_due: 0, matched_property: `prop_demo_${i + 1}` });
    }
    for (let i = 0; i < 15; i++) await create("lease", `lease_demo_${i + 1}`, `${tenantNames[i]} at ${properties[i % 12][0]}`, { property: `prop_demo_${(i % 12) + 1}`, tenant: `tenant_demo_${i + 1}`, suite: `${100 + i}`, leased_sf: 5200 + i * 1200, lease_start: "2022-01-01", lease_end: `${2026 + (i % 6)}-12-31`, remaining_term_months: 7 + i * 4, rent_psf: 14 + i * 0.75, annual_rent: (5200 + i * 1200) * (14 + i * 0.75), lease_type: i % 2 === 0 ? "NNN" : "modified_gross", renewal_probability: i % 3 === 0 ? "low" : "medium", below_market_flag: i % 4 === 0, mark_to_market_upside: i % 4 === 0 ? "12%" : "3%", rollover_risk_score: 45 + (i * 5) % 50 });
    for (let i = 0; i < 8; i++) await create("loan", `loan_demo_${i + 1}`, `${properties[i][0]} Senior Loan`, { property: `prop_demo_${i + 1}`, borrower_entity: `entity_demo_${(i % 10) + 1}`, lender: ["Demo National Bank", "Example Life Co", "Sample Debt Fund"][i % 3], loan_amount: Math.round(properties[i][7] * 0.62), origination_date: `202${i % 4}-03-01`, maturity_date: `${2026 + (i % 4)}-${String((i % 12) + 1).padStart(2, "0")}-15`, interest_rate: 4.25 + i * 0.2, rate_type: i % 3 === 0 ? "floating" : "fixed", loan_type: ["bank", "life_co", "debt_fund"][i % 3], estimated_ltv: 62, estimated_dscr: 1.25, distress_flag: i === 0, refi_risk_score: 55 + i * 5 });
    for (let i = 0; i < 15; i++) await create("sale_comp", `salecomp_demo_${i + 1}`, saleCompNames[i], { property: `prop_demo_${(i % 12) + 1}`, sale_date: `202${3 + (i % 3)}-${String((i % 12) + 1).padStart(2, "0")}-10`, sale_price: 7200000 + i * 1650000, price_psf: 110 + i * 8, cap_rate: 5.6 + (i % 5) * 0.35, noi: 520000 + i * 95000, buyer: investorNames[i % 8], seller: entityNames[(i + 3) % 10], buyer_type: "private", seller_type: "private", brokerage: "Demo Brokerage", source: "Demo source", asset_class: properties[i % 12][4], asset_subtype: properties[i % 12][5], occupancy: `${88 + (i % 11)}%`, year_built: 1990 + i, sf: properties[i % 12][6], acreage: 3 + i * 0.4, comp_quality_score: 62 + (i * 2) % 35, why_comparable: "Similar DFW submarket, size, and buyer profile.", why_not_comparable: "Demo distance and tenancy differences require review." });
    for (let i = 0; i < 10; i++) await create("lease_comp", `leasecomp_demo_${i + 1}`, `${tenantNames[(i + 2) % 15]} Lease Comp`, { property: `prop_demo_${(i % 12) + 1}`, tenant: `tenant_demo_${((i + 2) % 15) + 1}`, signed_date: `202${4 + (i % 2)}-06-01`, commencement_date: `202${4 + (i % 2)}-09-01`, sf: 6000 + i * 1400, rent_psf: 16 + i * 0.85, lease_type: i % 2 === 0 ? "NNN" : "modified_gross", term_months: 60 + i * 6, ti_allowance: 8 + i, free_rent: `${i % 5} months`, escalations: "3% annual", submarket: `submarket_${properties[i][3]}`, comp_quality_score: 68 + i * 3, source: "Demo broker survey" });
    const signalTypes = ["loan_maturity", "long_hold_period", "tenant_rollover", "out_of_state_owner", "entity_forfeiture", "broker_relationship_gap", "recent_nearby_comp", "exchange_1031_likelihood", "refinance_risk", "tax_delinquency"];
    for (let i = 0; i < 20; i++) await create("deal_signal", `signal_demo_${i + 1}`, `${properties[i % 12][0]}: ${signalTypes[i % signalTypes.length].replace(/_/g, " ")}`, { property: `prop_demo_${(i % 12) + 1}`, signal_type: signalTypes[i % signalTypes.length], signal_strength: 98 - i * 2, signal_date: "2026-06-04", trigger: `Demo ${signalTypes[i % signalTypes.length]} trigger`, evidence: "Synthetic evidence for workflow demonstration only.", recommended_action: "Review source trail, confirm facts, then schedule an owner call.", assigned_broker: ["Clark", "Jordan", "Taylor"][i % 3], status: i % 4 === 0 ? "reviewed" : "new" });
    for (let i = 0; i < 10; i++) await create("broker_activity", `activity_demo_${i + 1}`, `${peopleNames[i % 8]} follow-up`, { related_property: `prop_demo_${(i % 12) + 1}`, related_contact: `person_demo_${(i % 8) + 1}`, related_entity: `entity_demo_${(i % 10) + 1}`, activity_type: ["call", "email", "meeting"][i % 3], broker: ["Clark", "Jordan", "Taylor"][i % 3], date: "2026-05-20", outcome: "Demo conversation logged; facts require confirmation.", next_step: "Confirm timing and capital plan.", sentiment: "positive", relationship_temperature: i % 2 === 0 ? "warm" : "cold" });
    for (let i = 0; i < 40; i++) {
      const p = (i % 12) + 1;
      const group = Math.floor(i / 12);
      const targets = [`entity_demo_${(i % 10) + 1}`, `parcel_demo_${p}`, `tenant_demo_${(i % 15) + 1}`, `signal_demo_${(i % 20) + 1}`];
      const relationships = ["PROPERTY_OWNED_BY_ENTITY", "PROPERTY_SITS_ON_PARCEL", "PROPERTY_OCCUPIED_BY_TENANT", "DEAL_SIGNAL_POINTS_TO_PROPERTY"];
      await create("relationship_edge", `edge_demo_${i + 1}`, `${relationships[group]} ${p}`, { from: group === 3 ? targets[group] : `prop_demo_${p}`, to: group === 3 ? `prop_demo_${p}` : targets[group], relationship_type: relationships[group] ?? RELATIONSHIP_TYPES[i % RELATIONSHIP_TYPES.length], confidence: "C", source: "demo", date_observed: "2026-06-04", notes: "Synthetic relationship edge." });
    }
    await this.index.rebuild();
    new Notice(`STRIVE Navigator: generated demo dataset (${Object.values(counts).reduce((a, b) => a + b, 0)} records).`);
    return counts;
  }
}

