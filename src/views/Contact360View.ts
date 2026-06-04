import type { WorkspaceLeaf } from "obsidian";
import { VIEW_TYPES } from "../constants";
import type { NavigatorContext } from "../NavigatorContext";
import type { NavigatorRecord } from "../types";
import { BaseNavigatorView } from "./BaseNavigatorView";
import { confidence, factGrid, pageHeader, recordTable, section } from "./ui";

export class Contact360View extends BaseNavigatorView {
  constructor(leaf: WorkspaceLeaf, plugin: NavigatorContext) { super(leaf, plugin); }
  getViewType(): string { return VIEW_TYPES.contact360; }
  getDisplayText(): string { return "STRIVE Contact 360"; }
  getIcon(): string { return "contact"; }
  protected render(): void {
    const active = this.plugin.app.workspace.getActiveFile();
    const activeRecord = active ? this.plugin.index.findByPath(active.path) : undefined;
    const contacts = [...new Map([...this.plugin.store.allRecords("person"), ...this.plugin.index.findByType("person")].map((r) => [r.id, r])).values()];
    const contact = activeRecord?.type === "person" ? activeRecord : contacts[0];
    if (!contact) return void pageHeader(this.root, "RELATIONSHIP OPERATING VIEW", "Contact 360", "Create or import a person to begin.");
    this.focusRecord = contact;
    pageHeader(this.root, "RELATIONSHIP OPERATING VIEW", contact.name, "Relationship ownership, controlled entities, properties, contact history, tasks, pursuits, and transaction participation.");
    const status = this.root.createDiv({ cls: "strive-status-row" }); confidence(status, contact.confidence_tier);
    factGrid(this.root, [["Role", contact.role], ["Company", contact.company], ["Relationship Status", contact.relationship_status], ["STRIVE Owner", contact.relationship_owner_at_strive], ["Last Contacted", contact.last_contacted], ["Email", contact.email_business], ["Office Phone", contact.phone_office], ["Mobile", contact.phone_mobile]]);
    const graph = this.plugin.graph.neighborhood(contact.id, 3);
    this.renderRecords("Relationship And Control Network", graph.nodes.filter((record) => record.id !== contact.id));
    const all = [...this.plugin.store.allRecords(), ...this.plugin.index.all()];
    this.renderRecords("Tasks And Activity", this.linked(all, contact.id, ["task", "broker_activity"]));
    this.renderRecords("Pursuits And Transactions", this.linked(all, contact.id, ["pursuit", "transaction"]));
    const history = section(this.root, "Contact History", `${this.plugin.store.eventsFor(contact.id).length} immutable events`);
    recordTable(history, this.plugin.store.eventsFor(contact.id).map((event) => ({ type: "record_event", id: event.id, name: event.summary, path: "", event_type: event.event_type, occurred_at: event.occurred_at, actor: event.actor } as NavigatorRecord)), [["Event", "name"], ["Type", "event_type"], ["Date", "occurred_at"], ["Actor", "actor"]]);
    this.agentInspector(contact);
  }
  private linked(records: NavigatorRecord[], id: string, types: string[]): NavigatorRecord[] {
    return [...new Map(records.filter((record) => types.includes(record.type) && (
      [record.related_contact, record.buyer, record.seller, record.owner].includes(id)
      || (Array.isArray(record.contacts) && record.contacts.includes(id))
      || (Array.isArray(record.related_records) && record.related_records.includes(id))
    )).map((record) => [record.id, record])).values()];
  }
  private renderRecords(title: string, records: NavigatorRecord[]): void {
    const block = section(this.root, title, `${records.length} records`);
    recordTable(block, records, [["Name", "name"], ["Type", "type"], ["Status", (record) => record.status ?? record.relationship_status], ["Updated", "updated"]], (record) => this.openRecord(record));
  }
}
