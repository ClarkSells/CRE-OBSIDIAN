import { App, FuzzySuggestModal } from "obsidian";
import type { NavigatorRecord } from "../types";

export class SelectRecordModal extends FuzzySuggestModal<NavigatorRecord> {
  constructor(app: App, private records: NavigatorRecord[], private onChoose: (record: NavigatorRecord) => void) { super(app); }
  getItems(): NavigatorRecord[] { return this.records; }
  getItemText(record: NavigatorRecord): string { return `${record.name} · ${record.type}`; }
  onChooseItem(record: NavigatorRecord): void { this.onChoose(record); }
}

