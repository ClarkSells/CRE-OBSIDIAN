import { App, Modal, Setting } from "obsidian";
import { TYPE_LABELS } from "../constants";
import type { RecordType } from "../types";

export class CreateRecordModal extends Modal {
  private name = "";
  constructor(app: App, private type: RecordType, private onSubmit: (name: string) => void) { super(app); }

  onOpen(): void {
    this.titleEl.setText(`Create ${TYPE_LABELS[this.type]}`);
    this.contentEl.createEl("p", { text: "Creates a structured Markdown record. Frontmatter can be enriched without overwriting the human-written body." });
    new Setting(this.contentEl).setName("Record name").setDesc("Use a broker-readable name.").addText((text) => {
      text.setPlaceholder(TYPE_LABELS[this.type]).onChange((value) => this.name = value.trim());
      window.setTimeout(() => text.inputEl.focus(), 30);
    });
    new Setting(this.contentEl).addButton((button) => button.setButtonText("Create record").setCta().onClick(() => {
      if (!this.name) return;
      this.close();
      this.onSubmit(this.name);
    }));
  }

  onClose(): void { this.contentEl.empty(); }
}

