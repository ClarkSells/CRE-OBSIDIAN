import type { WorkspaceLeaf } from "obsidian";
import { VIEW_TYPES } from "../constants";
import type { NavigatorContext } from "../NavigatorContext";
import { BaseNavigatorView } from "./BaseNavigatorView";
import { badge, pageHeader, section } from "./ui";
import { money, text } from "../utils/format";

export class RequirementsBoardView extends BaseNavigatorView {
  constructor(leaf: WorkspaceLeaf, plugin: NavigatorContext) { super(leaf, plugin); }
  getViewType(): string { return VIEW_TYPES.requirementsBoard; }
  getDisplayText(): string { return "STRIVE Requirements Board"; }
  getIcon(): string { return "clipboard-search"; }
  protected render(): void {
    pageHeader(this.root, "BUYER NEEDS", "Requirements Board", "Active acquisition criteria connected to buyers, brokers, matched properties, and timing.");
    const records = [...new Map([...this.plugin.store.allRecords("requirement"), ...this.plugin.index.findByType("requirement")].map((r) => [r.id, r])).values()];
    const block = section(this.root, "Active Requirements", `${records.length} buyer needs`);
    const grid = block.createDiv({ cls: "strive-card-grid" });
    for (const record of records) {
      const card = grid.createDiv({ cls: "strive-record-card" });
      card.addEventListener("click", () => this.openRecord(record));
      badge(card, record.status || "active", "is-positive");
      card.createEl("h3", { text: record.name });
      card.createDiv({ cls: "strive-muted", text: `${text(record.asset_preferences)} · ${text(record.submarket_preferences)}` });
      card.createDiv({ cls: "strive-action-callout", text: `${money(record.deal_size_min)} to ${money(record.deal_size_max)} · Target ${text(record.target_close_date)}` });
    }
  }
}

