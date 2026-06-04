import { App, Modal } from "obsidian";
import type { NavigatorRecord, ValidationIssue } from "../types";

export class ValidationModal extends Modal {
  constructor(app: App, private record: NavigatorRecord, private issues: ValidationIssue[]) { super(app); }
  onOpen(): void {
    this.titleEl.setText(`Validation · ${this.record.name}`);
    this.contentEl.createDiv({ cls: this.issues.length ? "strive-warning-panel" : "strive-success-panel", text: this.issues.length ? `${this.issues.length} issue(s) found.` : "Record passed validation." });
    for (const issue of this.issues) {
      const row = this.contentEl.createDiv({ cls: `strive-validation-row is-${issue.severity}` });
      row.createEl("strong", { text: `${issue.severity.toUpperCase()} · ${issue.field}` });
      row.createEl("p", { text: issue.message });
    }
  }
}

