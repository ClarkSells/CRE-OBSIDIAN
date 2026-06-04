import type { WorkspaceLeaf } from "obsidian";
import { VIEW_TYPES } from "../constants";
import type { NavigatorContext } from "../NavigatorContext";
import type { NavigatorRecord } from "../types";
import { BaseNavigatorView } from "./BaseNavigatorView";
import { pageHeader, recordTable, section } from "./ui";

export class UnifiedSearchView extends BaseNavigatorView {
  private lastResults: NavigatorRecord[] = [];
  constructor(leaf: WorkspaceLeaf, plugin: NavigatorContext) { super(leaf, plugin); }
  getViewType(): string { return VIEW_TYPES.unifiedSearch; }
  getDisplayText(): string { return "STRIVE Unified Search"; }
  getIcon(): string { return "search"; }
  protected render(): void {
    pageHeader(this.root, "GLOBAL INTELLIGENCE SEARCH", "Unified Search", "Search promoted Markdown and the full analytical universe by names, aliases, addresses, contacts, IDs, parcels, and relationships.");
    const input = this.root.createEl("input", { cls: "strive-search-input", type: "search", placeholder: "Search the STRIVE intelligence universe…" });
    const actions = this.root.createDiv({ cls: "strive-action-strip" });
    actions.createEl("button", { text: "Save current search" }).addEventListener("click", async () => {
      if (!input.value.trim()) return;
      const file = await this.plugin.factory.create("saved_view", `Search: ${input.value.trim()}`, { view_type: "unified_search", filters: { query: input.value.trim() }, columns: ["name", "type", "source_status", "confidence_tier"], sort: "relevance", owner: "STRIVE", shared: true });
      await this.plugin.rebuildIndex(false);
      const saved = this.plugin.index.findByPath(file.path);
      if (saved) await this.plugin.history.record(saved.id, "saved_search_created", `${saved.name} created`, { query: input.value.trim() });
    });
    actions.createEl("button", { text: "Promote analytical results" }).addEventListener("click", async () => {
      for (const record of this.lastResults.filter((result) => !result.file).slice(0, 100)) await this.plugin.importer.promote(record.id);
      await this.plugin.rebuildIndex(false);
    });
    const block = section(this.root, "Results", "Enter at least two characters");
    const render = () => {
      block.querySelector(".strive-table-wrap")?.remove(); block.querySelector(".strive-empty")?.remove();
      if (input.value.trim().length < 2) return;
      this.lastResults = [...new Map([...this.plugin.store.search(input.value, 200), ...this.plugin.index.search(input.value)].map((r) => [r.id, r])).values()] as NavigatorRecord[];
      recordTable(block, this.lastResults, [["Name", "name"], ["Type", "type"], ["Address / Company", (r) => r.address ?? r.company ?? r.entity_name], ["Source", "source_status"], ["Confidence", "confidence_tier"], ["Promoted", (r) => r.file ? "Markdown" : "Analytical"]], (r) => this.openRecord(r));
    };
    input.addEventListener("input", render);
    window.setTimeout(() => input.focus(), 30);
  }
}
