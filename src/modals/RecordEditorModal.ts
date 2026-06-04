import { App, Modal, Notice, Setting } from "obsidian";
import { TYPE_FIELDS } from "../schemas";
import type { NavigatorRecord } from "../types";
import { HistoryService } from "../services/HistoryService";
import { RecordFactory } from "../services/RecordFactory";

export class RecordEditorModal extends Modal {
  private values: Record<string, unknown>;

  constructor(app: App, private record: NavigatorRecord, private factory: RecordFactory, private history: HistoryService, private onSaved: () => Promise<void>) {
    super(app);
    this.values = { ...record };
  }

  onOpen(): void {
    this.modalEl.addClass("strive-record-editor-modal");
    this.titleEl.setText(`Edit ${this.record.name}`);
    this.contentEl.createEl("p", { text: "Structured edits update frontmatter only. Handwritten Markdown body text is preserved." });
    const fields = ["name", "confidence_tier", "source_status", "human_review", ...TYPE_FIELDS[this.record.type]].filter((field, index, all) => all.indexOf(field) === index);
    const form = this.contentEl.createDiv({ cls: "strive-editor-grid" });
    for (const field of fields) this.renderField(form, field);
    new Setting(this.contentEl).addButton((button) => button.setButtonText("Save changes").setCta().onClick(() => void this.save()));
  }

  private renderField(container: HTMLElement, field: string): void {
    const current = this.record[field];
    const setting = new Setting(container).setName(field.replace(/_/g, " "));
    if (typeof current === "boolean" || field === "human_review") {
      setting.addToggle((toggle) => toggle.setValue(Boolean(current)).onChange((value) => this.values[field] = value));
    } else if (Array.isArray(current) || ["notes", "summary", "evidence", "description", "data", "steps", "filters"].includes(field)) {
      setting.addTextArea((input) => input.setValue(this.display(current)).onChange((value) => this.values[field] = this.parse(value, Array.isArray(current))));
    } else {
      setting.addText((input) => input.setValue(this.display(current)).onChange((value) => this.values[field] = this.parse(value, false)));
    }
  }

  private async save(): Promise<void> {
    if (!this.record.file) return void new Notice("STRIVE Navigator: promote this analytical record before editing its Markdown dossier.");
    const updates = Object.fromEntries(Object.entries(this.values).filter(([key, value]) => !["file", "path", "id", "type", "created"].includes(key) && JSON.stringify(value) !== JSON.stringify(this.record[key])));
    await this.factory.updateFrontmatter(this.record.file, updates);
    await this.history.record(this.record.id, "record_edited", `${this.record.name} edited`, { changed_fields: Object.keys(updates), previous: Object.fromEntries(Object.keys(updates).map((key) => [key, this.record[key]])), next: updates });
    for (const [field, value] of Object.entries(updates)) {
      if (["owner_entity", "beneficial_owner", "registered_agent", "principal_office_address", "mailing_address", "relationship_status"].includes(field)) {
        await this.history.assert(this.record.id, field, value, { confidence: this.values.confidence_tier as never, reviewStatus: this.values.human_review ? "pending" : "accepted" });
      }
    }
    await this.onSaved();
    new Notice(`STRIVE Navigator: saved ${Object.keys(updates).length} field changes.`);
    this.close();
  }

  private display(value: unknown): string {
    if (value === undefined || value === null) return "";
    return typeof value === "object" ? JSON.stringify(value, null, 2) : String(value);
  }

  private parse(value: string, arrayExpected: boolean): unknown {
    const trimmed = value.trim();
    if (!trimmed) return arrayExpected ? [] : "";
    if (trimmed === "true" || trimmed === "false") return trimmed === "true";
    if (/^-?\d+(\.\d+)?$/.test(trimmed)) return Number(trimmed);
    if (arrayExpected && !trimmed.startsWith("[")) return trimmed.split(",").map((item) => item.trim()).filter(Boolean);
    if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
      try { return JSON.parse(trimmed); } catch { return value; }
    }
    return value;
  }
}

