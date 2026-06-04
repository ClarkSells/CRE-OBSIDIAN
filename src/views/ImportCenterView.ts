import { Notice, TFile, type WorkspaceLeaf } from "obsidian";
import { VIEW_TYPES } from "../constants";
import type { NavigatorContext } from "../NavigatorContext";
import type { ImportPreview, RecordType } from "../types";
import { BaseNavigatorView } from "./BaseNavigatorView";
import { badge, empty, pageHeader, section } from "./ui";

export class ImportCenterView extends BaseNavigatorView {
  private selected?: TFile;
  private preview?: ImportPreview;
  constructor(leaf: WorkspaceLeaf, plugin: NavigatorContext) { super(leaf, plugin); }
  getViewType(): string { return VIEW_TYPES.importCenter; }
  getDisplayText(): string { return "STRIVE CSV Import Center"; }
  getIcon(): string { return "file-input"; }
  protected render(): void {
    pageHeader(this.root, "CONTROLLED DATA INGESTION", "CSV Import Center", "Preview, map, deduplicate, import, promote, reconcile, and safely roll back user-controlled CSV files.");
    const files = this.plugin.app.vault.getFiles().filter((file) => file.extension.toLowerCase() === "csv");
    const controls = this.root.createDiv({ cls: "strive-action-strip" });
    const select = controls.createEl("select", { cls: "strive-select" });
    select.createEl("option", { value: "", text: "Select a CSV file…" });
    for (const file of files) select.createEl("option", { value: file.path, text: file.path });
    const previewButton = controls.createEl("button", { text: "Preview and auto-map" });
    const saveProfileButton = controls.createEl("button", { text: "Save mapping profile" });
    const importButton = controls.createEl("button", { cls: "mod-cta", text: "Import batch" });
    select.addEventListener("change", () => this.selected = this.plugin.app.vault.getAbstractFileByPath(select.value) as TFile);
    previewButton.addEventListener("click", () => void this.loadPreview());
    saveProfileButton.addEventListener("click", async () => {
      if (!this.preview) return void new Notice("STRIVE Navigator: preview a CSV before saving its mapping profile.");
      const profile = await this.plugin.importer.saveMappingProfile(`CSV Mapping · ${this.selected?.basename ?? "Untitled"}`, this.preview.inferredType, this.preview.mappings);
      new Notice(`STRIVE V2 saved mapping profile ${profile.name}.`);
    });
    importButton.addEventListener("click", () => void this.runImport());
    this.renderPreview();
    this.renderBatches();
  }

  private async loadPreview(): Promise<void> {
    if (!this.selected) return void new Notice("STRIVE Navigator: select a CSV file first.");
    this.preview = await this.plugin.importer.previewFile(this.selected);
    await this.draw();
  }

  private async runImport(): Promise<void> {
    if (!this.selected) return void new Notice("STRIVE Navigator: select a CSV file first.");
    this.preview ??= await this.plugin.importer.previewFile(this.selected);
    const result = await this.plugin.importer.importFile(this.selected, this.preview.inferredType, this.preview.mappings, "RealNex / Auto Map");
    new Notice(`STRIVE V2 import complete: ${result.created} created, ${result.duplicates} duplicates, ${result.errors.length} errors.`);
    await this.draw();
  }

  private renderPreview(): void {
    const block = section(this.root, "Import Preview", this.preview ? `${this.preview.rows.length} sample rows · inferred ${this.preview.inferredType}` : "Select a CSV file");
    if (!this.preview) return empty(block, "CSV files placed anywhere in the vault can be previewed and imported. Built-in aliases recognize common RealNex columns.");
    const mapping = block.createDiv({ cls: "strive-mapping-grid" });
    for (const item of this.preview.mappings) {
      const row = mapping.createDiv({ cls: "strive-edge-row" });
      row.createSpan({ text: item.sourceColumn });
      row.createSpan({ cls: "strive-muted", text: ` → ${item.targetField || "skip"}` });
    }
    const wrap = block.createDiv({ cls: "strive-table-wrap" });
    const table = wrap.createEl("table", { cls: "strive-table" });
    const head = table.createEl("thead").createEl("tr");
    this.preview.headers.forEach((header) => head.createEl("th", { text: header }));
    const body = table.createEl("tbody");
    for (const record of this.preview.rows.slice(0, 15)) {
      const row = body.createEl("tr");
      this.preview.headers.forEach((header) => row.createEl("td", { text: record[header] ?? "" }));
    }
  }

  private renderBatches(): void {
    const batches = this.plugin.store.allRecords("import_batch").sort((a, b) => String(b.updated).localeCompare(String(a.updated)));
    const block = section(this.root, "Import Batch History", `${batches.length} batches · ${this.plugin.importer.mappingProfiles().length} saved mapping profiles`);
    for (const batch of batches) {
      const row = block.createDiv({ cls: "strive-import-batch" });
      const top = row.createDiv({ cls: "strive-status-row" });
      badge(top, batch.status || "unknown", batch.status === "complete" ? "is-positive" : "is-warning");
      top.createEl("strong", { text: batch.name });
      row.createDiv({ cls: "strive-muted", text: `${String(batch.row_count ?? 0)} rows · ${String(batch.created_count ?? 0)} created · ${String(batch.skipped_count ?? 0)} skipped · ${String(batch.mapping_profile ?? "")}` });
      if (batch.rollback_status !== "complete") row.createEl("button", { text: "Roll back unpromoted records" }).addEventListener("click", async () => {
        const count = await this.plugin.importer.rollback(batch.id);
        new Notice(`STRIVE V2 rolled back ${count} unpromoted records from ${batch.name}.`);
        await this.draw();
      });
    }
  }
}
