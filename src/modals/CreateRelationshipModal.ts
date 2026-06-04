import { App, Modal, Notice, Setting } from "obsidian";
import { RELATIONSHIP_TYPES } from "../constants";

export interface RelationshipInput { from: string; to: string; relationship_type: string; notes: string; }

export class CreateRelationshipModal extends Modal {
  private value: RelationshipInput = { from: "", to: "", relationship_type: RELATIONSHIP_TYPES[0], notes: "" };
  constructor(app: App, private onSubmit: (value: RelationshipInput) => Promise<void>) { super(app); }

  onOpen(): void {
    this.titleEl.setText("Create Relationship Edge");
    new Setting(this.contentEl).setName("From record ID").addText((input) => input.onChange((value) => this.value.from = value.trim()));
    new Setting(this.contentEl).setName("To record ID").addText((input) => input.onChange((value) => this.value.to = value.trim()));
    new Setting(this.contentEl).setName("Relationship type").addDropdown((dropdown) => {
      RELATIONSHIP_TYPES.forEach((type) => dropdown.addOption(type, type.replace(/_/g, " ")));
      dropdown.onChange((value) => this.value.relationship_type = value);
    });
    new Setting(this.contentEl).setName("Notes").addTextArea((input) => input.onChange((value) => this.value.notes = value));
    new Setting(this.contentEl).addButton((button) => button.setButtonText("Create edge").setCta().onClick(async () => {
      if (!this.value.from || !this.value.to) return void new Notice("STRIVE Navigator: from and to record IDs are required.");
      await this.onSubmit(this.value);
      this.close();
    }));
  }
}

