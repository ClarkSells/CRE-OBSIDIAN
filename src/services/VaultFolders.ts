import { Notice, Vault } from "obsidian";
import { REQUIRED_FOLDERS } from "../constants";
import { toMarkdown } from "../utils/markdown";
import { today } from "../utils/format";

export class VaultFolders {
  constructor(private vault: Vault) {}

  async initialize(showNotice = true): Promise<number> {
    let created = 0;
    for (const folder of REQUIRED_FOLDERS) {
      if (!this.vault.getAbstractFileByPath(folder)) {
        await this.vault.createFolder(folder);
        created += 1;
      }
    }
    created += await this.createStarterFiles();
    if (showNotice) new Notice(`STRIVE Navigator: vault ready (${created} items created).`);
    return created;
  }

  private async createStarterFiles(): Promise<number> {
    const files: Array<[string, string]> = [
      ["Dashboards/STRIVE Navigator.md", "# STRIVE Navigator\n\nUse the command palette to open the STRIVE Command Center.\n"],
      ["Templates/Property Template.md", toMarkdown({ type: "template", id: "template_property", name: "Property Template", created: today(), updated: today(), confidence_tier: "C", source_status: "unknown", human_review: true, realnex_id: "", tags: ["strive/template"] })],
      ["Templates/Entity Template.md", toMarkdown({ type: "template", id: "template_entity", name: "Entity Template", created: today(), updated: today(), confidence_tier: "C", source_status: "unknown", human_review: true, realnex_id: "", tags: ["strive/template"] })]
    ];
    let created = 0;
    for (const [path, content] of files) {
      if (!this.vault.getAbstractFileByPath(path)) {
        await this.vault.create(path, content);
        created += 1;
      }
    }
    return created;
  }
}
