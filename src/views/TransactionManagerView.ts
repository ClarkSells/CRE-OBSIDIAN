import type { WorkspaceLeaf } from "obsidian";
import { VIEW_TYPES } from "../constants";
import type { NavigatorContext } from "../NavigatorContext";
import { BaseNavigatorView } from "./BaseNavigatorView";
import { pageHeader, recordTable, section } from "./ui";
import { money } from "../utils/format";

export class TransactionManagerView extends BaseNavigatorView {
  constructor(leaf: WorkspaceLeaf, plugin: NavigatorContext) { super(leaf, plugin); }
  getViewType(): string { return VIEW_TYPES.transactionManager; }
  getDisplayText(): string { return "STRIVE Transaction Manager"; }
  getIcon(): string { return "briefcase-business"; }
  protected render(): void {
    pageHeader(this.root, "DEAL EXECUTION", "Transaction Manager", "Milestones, due dates, participants, documents, probability, and commission visibility.");
    const records = [...new Map([...this.plugin.store.allRecords("transaction"), ...this.plugin.index.findByType("transaction")].map((r) => [r.id, r])).values()];
    const block = section(this.root, "Transactions", `${records.length} active and historical transactions`);
    recordTable(block, records, [["Transaction", "name"], ["Status", "status"], ["Property", (r) => this.plugin.store.findById(String(r.property))?.name ?? this.plugin.index.findById(r.property)?.name], ["Target Close", "target_close_date"], ["Price", (r) => money(r.price)], ["Probability", "probability"], ["Commission", (r) => money(r.commission_estimate)], ["Broker", "assigned_broker"]], (r) => this.openRecord(r));
  }
}

