import type { WorkspaceLeaf } from "obsidian";
import { VIEW_TYPES } from "../constants";
import type { NavigatorContext } from "../NavigatorContext";
import { BaseNavigatorView } from "./BaseNavigatorView";
import { pageHeader, recordTable, section } from "./ui";

export class RealNexSyncQueueView extends BaseNavigatorView {
  constructor(leaf: WorkspaceLeaf, plugin: NavigatorContext) { super(leaf, plugin); }
  getViewType(): string { return VIEW_TYPES.realnexQueue; }
  getDisplayText(): string { return "STRIVE RealNex Sync Queue"; }
  getIcon(): string { return "file-spreadsheet"; }

  protected render(): void {
    pageHeader(this.root, "CRM STAGING LAYER", "RealNex Sync Queue", "Review portable, source-aware records before producing a clean RealNex-ready CSV.");
    const eligible = this.plugin.index.all().filter((r) => ["property", "entity", "person", "investor_profile"].includes(r.type));
    const actions = this.root.createDiv({ cls: "strive-action-strip" });
    const exportButton = actions.createEl("button", { cls: "mod-cta", text: `Export All ${eligible.length} Records` });
    exportButton.addEventListener("click", async () => { await this.plugin.exporter.export(eligible); await this.draw(); });
    const selected = new Set<string>();
    const selectedButton = actions.createEl("button", { text: "Export Selected" });
    selectedButton.addEventListener("click", () => void this.plugin.exporter.export(eligible.filter((r) => selected.has(r.id))));
    const block = section(this.root, "Sync-Ready Records", "Blank mapping fields are allowed; human review remains visible");
    const wrap = block.createDiv({ cls: "strive-table-wrap" });
    const table = wrap.createEl("table", { cls: "strive-table" });
    const head = table.createEl("thead").createEl("tr");
    ["Select", "Record", "Type", "RealNex ID", "Confidence", "Human Review", "Updated"].forEach((label) => head.createEl("th", { text: label }));
    const body = table.createEl("tbody");
    for (const record of eligible) {
      const row = body.createEl("tr");
      const checkbox = row.createEl("td").createEl("input", { type: "checkbox" });
      checkbox.addEventListener("change", () => checkbox.checked ? selected.add(record.id) : selected.delete(record.id));
      [record.name, record.type, String(record.realnex_id ?? ""), String(record.confidence_tier ?? ""), record.human_review ? "Required" : "No", String(record.updated ?? "")].forEach((value) => row.createEl("td", { text: value }));
    }
    const exports = section(this.root, "Generated Exports", "CSV files written inside the vault");
    recordTable(exports, this.plugin.index.all().filter((r) => r.path.startsWith("Exports/")), [["File", "name"], ["Path", "path"]]);
  }
}

