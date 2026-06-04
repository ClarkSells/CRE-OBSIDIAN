import type { WorkspaceLeaf } from "obsidian";
import { VIEW_TYPES } from "../constants";
import type { NavigatorContext } from "../NavigatorContext";
import type { NavigatorRecord } from "../types";
import { BaseNavigatorView } from "./BaseNavigatorView";
import { pageHeader, recordTable, section } from "./ui";

export class CompsBoardView extends BaseNavigatorView {
  constructor(leaf: WorkspaceLeaf, plugin: NavigatorContext) { super(leaf, plugin); }
  getViewType(): string { return VIEW_TYPES.compsBoard; }
  getDisplayText(): string { return "STRIVE Comps Board"; }
  getIcon(): string { return "table-properties"; }

  protected render(): void {
    pageHeader(this.root, "VALUATION INTELLIGENCE", "Comps Intelligence Board", "Comparable evidence with explicit rationale, quality scoring, and source confidence.");
    const controls = this.root.createDiv({ cls: "strive-filter-bar" });
    const kind = controls.createEl("select", { cls: "strive-select" });
    [["all", "All comps"], ["sale_comp", "Sale comps"], ["lease_comp", "Lease comps"]].forEach(([value, label]) => kind.createEl("option", { value, text: label }));
    const asset = controls.createEl("select", { cls: "strive-select" });
    asset.createEl("option", { value: "all", text: "All asset classes" });
    const all = [...this.plugin.index.findByType("sale_comp"), ...this.plugin.index.findByType("lease_comp")];
    const propertyFor = (comp: NavigatorRecord) => this.plugin.index.findById(comp.property);
    [...new Set(all.map((c) => String(c.asset_class ?? propertyFor(c)?.asset_class ?? "")).filter(Boolean))].forEach((value) => asset.createEl("option", { value, text: value }));
    const submarket = controls.createEl("select", { cls: "strive-select" });
    submarket.createEl("option", { value: "all", text: "All submarkets" });
    [...new Set(all.map((c) => String(c.submarket ?? propertyFor(c)?.submarket ?? "")).filter(Boolean))].forEach((value) => submarket.createEl("option", { value, text: this.plugin.index.findById(value)?.name ?? value }));
    const tier = controls.createEl("select", { cls: "strive-select" });
    tier.createEl("option", { value: "all", text: "All confidence tiers" });
    ["A", "B", "C", "D", "F"].forEach((value) => tier.createEl("option", { value, text: `Confidence ${value}` }));
    const start = controls.createEl("input", { cls: "strive-select", type: "date" });
    start.setAttr("aria-label", "Start date");
    const end = controls.createEl("input", { cls: "strive-select", type: "date" });
    end.setAttr("aria-label", "End date");
    const table = section(this.root, "Comparable Ledger", `${all.length} indexed comps`);
    const renderTable = () => {
      table.querySelector(".strive-table-wrap")?.remove();
      table.querySelector(".strive-empty")?.remove();
      const filtered = all.filter((record) => {
        const property = propertyFor(record);
        const recordAsset = record.asset_class ?? property?.asset_class;
        const recordSubmarket = record.submarket ?? property?.submarket;
        const date = String(record.sale_date ?? record.signed_date ?? "");
        return (kind.value === "all" || record.type === kind.value)
          && (asset.value === "all" || recordAsset === asset.value)
          && (submarket.value === "all" || recordSubmarket === submarket.value)
          && (tier.value === "all" || record.confidence_tier === tier.value)
          && (!start.value || date >= start.value)
          && (!end.value || date <= end.value);
      });
      recordTable(table, filtered, [["Comp", "name"], ["Type", "type"], ["Subject", (r) => this.plugin.index.findById(r.property)?.name], ["Distance", (r) => this.distance(r)], ["Date", (r) => r.sale_date ?? r.signed_date], ["Price / Rent PSF", (r) => r.price_psf ?? r.rent_psf], ["Cap Rate", "cap_rate"], ["Buyer / Tenant", (r) => r.buyer ?? this.plugin.index.findById(r.tenant)?.name], ["Quality", "comp_quality_score"], ["Why Comparable", "why_comparable"], ["Confidence", "confidence_tier"]], (r: NavigatorRecord) => this.openRecord(r));
    };
    renderTable();
    kind.addEventListener("change", renderTable);
    asset.addEventListener("change", renderTable);
    submarket.addEventListener("change", renderTable);
    tier.addEventListener("change", renderTable);
    start.addEventListener("change", renderTable);
    end.addEventListener("change", renderTable);
  }

  private distance(comp: NavigatorRecord): string {
    if (comp.distance_miles !== undefined && comp.distance_miles !== "") return `${Number(comp.distance_miles).toFixed(1)} mi`;
    const subject = this.plugin.index.findById(comp.property) ?? this.plugin.store.findById(String(comp.property));
    if (!subject || !Number.isFinite(Number(subject.lat)) || !Number.isFinite(Number(subject.lng)) || !Number.isFinite(Number(comp.lat)) || !Number.isFinite(Number(comp.lng))) return "Not mapped";
    return `${this.plugin.spatial.distanceMiles(Number(subject.lat), Number(subject.lng), Number(comp.lat), Number(comp.lng)).toFixed(1)} mi`;
  }
}
