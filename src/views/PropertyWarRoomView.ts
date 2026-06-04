import type { WorkspaceLeaf } from "obsidian";
import { VIEW_TYPES } from "../constants";
import type { NavigatorContext } from "../NavigatorContext";
import type { NavigatorRecord } from "../types";
import { BaseNavigatorView } from "./BaseNavigatorView";
import { confidence, factGrid, pageHeader, recordTable, section, warningPanel } from "./ui";

export class PropertyWarRoomView extends BaseNavigatorView {
  private selectedId?: string;
  constructor(leaf: WorkspaceLeaf, plugin: NavigatorContext) { super(leaf, plugin); }
  getViewType(): string { return VIEW_TYPES.propertyWarRoom; }
  getDisplayText(): string { return "STRIVE Property War Room"; }
  getIcon(): string { return "building-2"; }

  protected render(): void {
    const active = this.plugin.app.workspace.getActiveFile();
    const properties = this.plugin.index.findByType("property");
    this.focusRecord = this.plugin.index.findById(this.selectedId) ?? this.plugin.index.all().find((record) => record.path === active?.path && record.type === "property") ?? properties[0];
    if (!this.focusRecord) {
      pageHeader(this.root, "PROPERTY INTELLIGENCE", "Property War Room", "Generate the demo dataset or create a property to begin.");
      return;
    }
    const property = this.focusRecord;
    const linked = this.plugin.index.linkedProperty(property);
    pageHeader(this.root, "PROPERTY WAR ROOM", property.name, `${String(property.address ?? "")}, ${String(property.city ?? "")}, TX · ${String(property.asset_class ?? "").toUpperCase()}`);
    const actions = this.root.createDiv({ cls: "strive-action-strip" });
    actions.createEl("button", { text: "Open Map" }).addEventListener("click", () => void this.plugin.openView(VIEW_TYPES.mapIntelligence));
    actions.createEl("button", { text: "Open Relationship Explorer" }).addEventListener("click", () => void this.plugin.openView(VIEW_TYPES.relationshipGraph));
    actions.createEl("button", { text: "Open History" }).addEventListener("click", () => void this.plugin.openView(VIEW_TYPES.historyTimeline));
    const selector = this.root.createEl("select", { cls: "strive-select" });
    properties.forEach((record) => selector.createEl("option", { value: record.id, text: record.name }));
    selector.value = property.id;
    selector.addEventListener("change", () => { this.selectedId = selector.value; void this.draw(); });
    const status = this.root.createDiv({ cls: "strive-status-row" });
    confidence(status, property.confidence_tier);
    status.createSpan({ cls: "strive-badge is-warning", text: property.human_review ? "Human Review Required" : "Source Verified" });
    status.createSpan({ cls: "strive-badge is-alert", text: `Signal Score ${String(property.deal_signal_score ?? "—")}` });
    warningPanel(this.root, this.plugin.validation.validate(property));
    factGrid(this.root, [["Asset", `${property.asset_class} / ${property.asset_subtype}`], ["Submarket", this.plugin.index.findById(property.submarket)?.name ?? property.submarket], ["Building SF", property.building_sf], ["Land Acres", property.land_acres], ["Year Built", property.year_built], ["Assessed Value", property.assessed_value, "money"], ["Last Sale", property.last_sale_price, "money"], ["Owner Entity", this.plugin.index.findById(property.owner_entity)?.name ?? property.owner_entity]]);
    this.linkedSection("Ownership Chain", linked.entities, [["Entity", "name"], ["Piercing Status", "piercing_status"], ["Registered Agent", "registered_agent"], ["Confidence", "confidence_tier"]]);
    const chain = this.plugin.graph.ownershipChain(property.id);
    this.linkedSection("Deep Ownership And Control Network", chain.nodes.filter((record) => record.id !== property.id), [["Record", "name"], ["Type", "type"], ["Confidence", "confidence_tier"], ["Source", "source_status"]]);
    this.linkedSection("Parcel / CAD Facts", linked.parcels, [["Parcel", "parcel_id"], ["County", "county"], ["Total Value", "total_value"], ["Owner Raw", "owner_name_raw"]]);
    this.linkedSection("Tenant Roster", linked.tenants, [["Tenant", "name"], ["Type", "tenant_type"], ["Credit", "credit_quality"], ["Expansion", "expansion_status"]]);
    this.linkedSection("Lease Rollover", linked.leases, [["Lease", "name"], ["End", "lease_end"], ["SF", "leased_sf"], ["Risk", "rollover_risk_score"]]);
    this.linkedSection("Debt / Refi Risk", linked.loans, [["Loan", "name"], ["Lender", "lender"], ["Maturity", "maturity_date"], ["Refi Risk", "refi_risk_score"]]);
    this.linkedSection("Sale Comps", linked.saleComps, [["Comp", "name"], ["Sale Date", "sale_date"], ["Price", "sale_price"], ["Quality", "comp_quality_score"]]);
    this.linkedSection("Lease Comps", linked.leaseComps, [["Comp", "name"], ["Rent PSF", "rent_psf"], ["Term", "term_months"], ["Quality", "comp_quality_score"]]);
    this.linkedSection("Broker Activity", linked.activities, [["Activity", "name"], ["Broker", "broker"], ["Outcome", "outcome"], ["Next Step", "next_step"]]);
    this.linkedSection("Deal Signals / Next Recommended Action", linked.signals.sort((a, b) => Number(b.signal_strength) - Number(a.signal_strength)), [["Signal", "name"], ["Strength", "signal_strength"], ["Evidence", "evidence"], ["Broker Action", "recommended_action"]]);
    const ai = section(this.root, "AI Brief Placeholder", "Future local-agent workspace");
    ai.createDiv({ cls: "strive-ai-brief", text: "Agent-ready source trails and structured records are available. Future brief generation must remain source-aware, confidence-labeled, and append-only." });
    this.agentInspector(property);
  }

  private linkedSection(title: string, records: NavigatorRecord[], columns: Array<[string, keyof NavigatorRecord | ((record: NavigatorRecord) => unknown)]>): void {
    const block = section(this.root, title, `${records.length} linked record${records.length === 1 ? "" : "s"}`);
    recordTable(block, records, columns, (record) => this.openRecord(record));
  }
}
