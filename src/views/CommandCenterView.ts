import type { WorkspaceLeaf } from "obsidian";
import { VIEW_TYPES } from "../constants";
import type { NavigatorContext } from "../NavigatorContext";
import type { NavigatorRecord } from "../types";
import { BaseNavigatorView } from "./BaseNavigatorView";
import { badge, confidence, kpi, pageHeader, recordTable, section } from "./ui";

export class CommandCenterView extends BaseNavigatorView {
  constructor(leaf: WorkspaceLeaf, plugin: NavigatorContext) { super(leaf, plugin); }
  getViewType(): string { return VIEW_TYPES.commandCenter; }
  getDisplayText(): string { return "STRIVE Command Center"; }
  getIcon(): string { return "layout-dashboard"; }

  protected render(): void {
    pageHeader(this.root, "DFW INVESTMENT SALES INTELLIGENCE", "STRIVE Command Center", "A broker-ready operating picture across ownership, debt, tenancy, comps, and relationship signals.");
    const actions = this.root.createDiv({ cls: "strive-action-strip" });
    [["New Property", "property"], ["New Entity", "entity"], ["New Signal", "deal_signal"]].forEach(([label, type]) => {
      actions.createEl("button", { text: label }).addEventListener("click", () => void this.plugin.createRecord(type as never));
    });
    Object.entries({
      "War Room": VIEW_TYPES.propertyWarRoom, "Owner Dossier": VIEW_TYPES.ownerDossier,
      "Relationship Graph": VIEW_TYPES.relationshipGraph, "Signal Radar": VIEW_TYPES.signalRadar,
      "Comps Board": VIEW_TYPES.compsBoard, "Investor Match": VIEW_TYPES.investorMatch,
      "Map Intelligence": VIEW_TYPES.mapIntelligence, "History": VIEW_TYPES.historyTimeline,
      "Tasks": VIEW_TYPES.taskCenter, "Requirements": VIEW_TYPES.requirementsBoard,
      "Pursuit Pipeline": VIEW_TYPES.pursuitPipeline, "Transactions": VIEW_TYPES.transactionManager,
      "Import Center": VIEW_TYPES.importCenter, "Data Quality": VIEW_TYPES.dataQuality,
      "Unified Search": VIEW_TYPES.unifiedSearch, "RealNex Queue": VIEW_TYPES.realnexQueue
    }).forEach(([label, type]) => actions.createEl("button", { text: label }).addEventListener("click", () => void this.plugin.openView(type)));

    const counts = this.plugin.index.counts();
    const validation = this.plugin.validation.validateAll(this.plugin.index.all());
    const kpis = this.root.createDiv({ cls: "strive-kpi-grid" });
    kpi(kpis, "Properties", counts.property);
    kpi(kpis, "Parcels", counts.parcel);
    kpi(kpis, "Entities", counts.entity);
    kpi(kpis, "People", counts.person);
    kpi(kpis, "Investors", counts.investor_profile);
    kpi(kpis, "Tenants", counts.tenant);
    kpi(kpis, "Leases", counts.lease);
    kpi(kpis, "Loans", counts.loan);
    kpi(kpis, "Comps", counts.sale_comp + counts.lease_comp);
    kpi(kpis, "Active Signals", this.plugin.index.findByType("deal_signal").filter((r) => r.status !== "dismissed").length, "is-alert");
    kpi(kpis, "High-Confidence Ownership", this.plugin.index.findByType("property").filter((r) => ["A", "B"].includes(String(r.confidence_tier)) && Boolean(r.owner_entity)).length);
    kpi(kpis, "Human Review Queue", this.plugin.index.all().filter((r) => r.human_review === true).length, "is-warning");
    kpi(kpis, "RealNex Sync Queue", this.plugin.index.all().filter((r) => ["property", "entity", "person", "investor_profile"].includes(r.type)).length);
    kpi(kpis, "Validation Flags", validation.size, validation.size ? "is-warning" : "");
    kpi(kpis, "Analytical Universe", this.plugin.store.health().recordCount);
    kpi(kpis, "Open Tasks", this.plugin.store.allRecords("task").filter((record) => record.status !== "complete").length);
    kpi(kpis, "Pipeline Fee", this.plugin.store.allRecords("pursuit").reduce((sum, record) => sum + Number(record.expected_fee || 0) * Number(record.probability || 0) / 100, 0).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }));
    kpi(kpis, "Data Quality Issues", Object.values(this.plugin.quality.summary(this.plugin.settings.staleRecordDays)).reduce((sum, value) => sum + value, 0), "is-warning");

    const signalSection = section(this.root, "Priority Deal Signals", "Sorted by signal strength");
    const signals = this.plugin.index.findByType("deal_signal").sort((a, b) => Number(b.signal_strength) - Number(a.signal_strength)).slice(0, 10);
    recordTable(signalSection, signals, [["Signal", "name"], ["Strength", "signal_strength"], ["Property", (r) => this.plugin.index.findById(r.property)?.name], ["Broker Action", "recommended_action"], ["Status", "status"]], (r) => this.openRecord(r));

    const recent = section(this.root, "Recently Updated", "Highest-confidence records surfaced first");
    const records = this.plugin.index.all().sort((a, b) => String(b.updated).localeCompare(String(a.updated))).slice(0, 10);
    const cards = recent.createDiv({ cls: "strive-card-grid" });
    for (const record of records) this.recordCard(cards, record);
  }

  private recordCard(container: HTMLElement, record: NavigatorRecord): void {
    const card = container.createDiv({ cls: "strive-record-card" });
    card.addEventListener("click", () => this.openRecord(record));
    badge(card, record.type.replace(/_/g, " "));
    card.createEl("h3", { text: record.name });
    card.createDiv({ cls: "strive-muted", text: String(record.address ?? record.updated ?? "") });
    confidence(card, record.confidence_tier);
  }
}
