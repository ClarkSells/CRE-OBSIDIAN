import { FileManager, Notice, TFile, Vault, normalizePath } from "obsidian";
import { TYPE_FIELDS, BODY_TEMPLATES } from "../schemas";
import { TYPE_FOLDERS, TYPE_PREFIXES } from "../constants";
import type { NavigatorRecord, RecordType } from "../types";
import { slugify, today } from "../utils/format";
import { defaultBody, toMarkdown } from "../utils/markdown";

export class RecordFactory {
  constructor(private vault: Vault, private fileManager: FileManager) {}

  async create(type: RecordType, name: string, extras: Record<string, unknown> = {}, _open = false): Promise<TFile> {
    const id = String(extras.id ?? `${TYPE_PREFIXES[type]}_${Date.now().toString(36)}`);
    const base: Record<string, unknown> = {
      type,
      id,
      name,
      created: today(),
      updated: today(),
      confidence_tier: "C",
      source_status: "unknown",
      human_review: true,
      realnex_id: "",
      tags: [`strive/${type}`]
    };
    for (const field of TYPE_FIELDS[type]) base[field] = "";
    const record = { ...base, ...extras, type, id, name };
    const folder = TYPE_FOLDERS[type];
    await this.ensureFolder(folder);
    const fileName = `${id} - ${slugify(name)}.md`;
    const path = normalizePath(`${folder}/${fileName}`);
    const existing = this.vault.getAbstractFileByPath(path);
    if (existing instanceof TFile) return existing;
    const body = defaultBody(type, name);
    const file = await this.vault.create(path, toMarkdown(record, body));
    return file;
  }

  async updateFrontmatter(file: TFile, updates: Record<string, unknown>): Promise<void> {
    await this.fileManager.processFrontMatter(file, (frontmatter) => {
      Object.assign(frontmatter, updates, { updated: today() });
    });
  }

  async createInteractive(type: RecordType, name: string): Promise<TFile> {
    const file = await this.create(type, name, {}, true);
    new Notice(`STRIVE Navigator: created ${type.replace(/_/g, " ")} "${name}".`);
    return file;
  }

  getSections(type: RecordType): string[] {
    return BODY_TEMPLATES[type] ?? ["Summary", "Broker Notes", "Source Trail"];
  }

  private async ensureFolder(folder: string): Promise<void> {
    let current = "";
    for (const part of folder.split("/")) {
      current = current ? `${current}/${part}` : part;
      if (!this.vault.getAbstractFileByPath(current)) await this.vault.createFolder(current);
    }
  }
}
