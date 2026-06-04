import type { WorkspaceLeaf } from "obsidian";
import { VIEW_TYPES } from "../constants";
import type { NavigatorContext } from "../NavigatorContext";
import type { NavigatorRecord } from "../types";
import { BaseNavigatorView } from "./BaseNavigatorView";
import { factGrid, pageHeader, recordTable, section } from "./ui";

export class Company360View extends BaseNavigatorView {
  constructor(leaf: WorkspaceLeaf, plugin: NavigatorContext) { super(leaf, plugin); }
  getViewType(): string { return VIEW_TYPES.company360; }
  getDisplayText(): string { return "STRIVE Company 360"; }
  getIcon(): string { return "building"; }
  protected render(): void {
    const active = this.plugin.app.workspace.getActiveFile();
    this.focusRecord = active ? this.plugin.index.findByPath(active.path) : undefined;
    const companies = [...new Map([...this.plugin.store.allRecords("company"), ...this.plugin.index.findByType("company")].map((r) => [r.id, r])).values()];
    const company = this.focusRecord?.type === "company" ? this.focusRecord : companies[0];
    if (!company) return void pageHeader(this.root, "RELATIONSHIP OPERATING VIEW", "Company 360", "Create or import a company to begin.");
    this.focusRecord = company;
    pageHeader(this.root, "RELATIONSHIP OPERATING VIEW", company.name, "People, entities, properties, activity, tasks, pursuits, and transactions around one organization.");
    factGrid(this.root, [["Company Type", company.company_type], ["Website", company.website], ["Phone", company.phone], ["Relationship Status", company.relationship_status], ["STRIVE Owner", company.relationship_owner_at_strive], ["Last Contacted", company.last_contacted]]);
    const related = this.related(company);
    for (const [title, records] of related) {
      const block = section(this.root, title, `${records.length} records`);
      recordTable(block, records, [["Name", "name"], ["Type", "type"], ["Status", (r) => r.status ?? r.relationship_status], ["Updated", "updated"]], (r) => this.openRecord(r));
    }
    this.agentInspector(company);
  }
  private related(company: NavigatorRecord): Array<[string, NavigatorRecord[]]> {
    const all = [...this.plugin.store.allRecords(), ...this.plugin.index.all()];
    const linked = (types: string[]) => [...new Map(all.filter((r) => types.includes(r.type) && (r.company === company.id || r.related_company === company.id || (Array.isArray(r.related_records) && r.related_records.includes(company.id)))).map((r) => [r.id, r])).values()];
    return [["People", linked(["person"])], ["Properties And Entities", linked(["property", "entity"])], ["Tasks And Activity", linked(["task", "broker_activity"])], ["Pursuits And Transactions", linked(["pursuit", "transaction"])]];
  }
}

