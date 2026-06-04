import type { WorkspaceLeaf } from "obsidian";
import { VIEW_TYPES } from "../constants";
import type { NavigatorContext } from "../NavigatorContext";
import type { NavigatorRecord } from "../types";
import { money } from "../utils/format";
import { BaseNavigatorView } from "./BaseNavigatorView";
import { confidence, factGrid, pageHeader, recordTable, section, warningPanel } from "./ui";

export class OwnerDossierView extends BaseNavigatorView {
  constructor(leaf: WorkspaceLeaf, plugin: NavigatorContext) { super(leaf, plugin); }
  getViewType(): string { return VIEW_TYPES.ownerDossier; }
  getDisplayText(): string { return "STRIVE Owner Dossier"; }
  getIcon(): string { return "contact-round"; }

  protected render(): void {
    const active = this.plugin.app.workspace.getActiveFile();
    this.focusRecord = this.plugin.index.all().find((r) => r.path === active?.path && (r.type === "entity" || r.type === "person")) ?? this.plugin.index.findByType("entity")[0];
    if (!this.focusRecord) return void pageHeader(this.root, "RELATIONSHIP INTELLIGENCE", "Owner Dossier", "Create an entity or generate demo data to begin.");
    const owner = this.focusRecord;
    const edges = this.plugin.index.relationshipsFor(owner.id);
    const related = edges.map((e) => this.plugin.index.findById(e.from === owner.id ? e.to : e.from)).filter((r): r is NavigatorRecord => Boolean(r));
    const deepRelated = this.plugin.graph.neighborhood(owner.id, 3).nodes.filter((record) => record.id !== owner.id);
    const properties = this.plugin.index.findByType("property").filter((p) => p.owner_entity === owner.id || p.beneficial_owner === owner.id || related.some((r) => r.id === p.id));
    const portfolio = properties.reduce((sum, p) => sum + Number(p.assessed_value || 0), 0);
    pageHeader(this.root, "OWNER / ENTITY DOSSIER", owner.name, "Entity piercing, source confidence, relationship ownership, and controlled-property intelligence.");
    const status = this.root.createDiv({ cls: "strive-status-row" });
    confidence(status, owner.confidence_tier);
    warningPanel(this.root, this.plugin.validation.validate(owner));
    factGrid(this.root, [["Record Type", owner.type], ["Entity Type / Role", owner.entity_type ?? owner.role], ["Registered Agent", this.plugin.index.findById(owner.registered_agent)?.name ?? owner.registered_agent], ["Principal Office", owner.principal_office_address], ["Piercing Status", owner.piercing_status], ["STRIVE Relationship Owner", owner.relationship_owner_at_strive], ["Properties Controlled", properties.length], ["Estimated Portfolio Value", money(portfolio)]]);
    const prop = section(this.root, "Properties Owned / Controlled", `${properties.length} known properties · ${money(portfolio)} assessed value`);
    recordTable(prop, properties, [["Property", "name"], ["Submarket", "submarket"], ["Asset", "asset_class"], ["Assessed Value", "assessed_value"], ["Signal Score", "deal_signal_score"]], (r) => this.openRecord(r));
    const rel = section(this.root, "Known and Possible Relationships", `${related.length} indexed graph relationships`);
    recordTable(rel, related, [["Related Record", "name"], ["Type", "type"], ["Confidence", "confidence_tier"], ["Source Status", "source_status"]], (r) => this.openRecord(r));
    const deep = section(this.root, "Three-Hop Control And Relationship Network", `${deepRelated.length} related records`);
    recordTable(deep, deepRelated, [["Record", "name"], ["Type", "type"], ["Confidence", "confidence_tier"], ["Updated", "updated"]], (r) => this.openRecord(r));
    const source = section(this.root, "Source Trail / Human Review", "Inferred control is never presented as confirmed");
    source.createDiv({ cls: "strive-warning-panel", text: "Demo ownership and principal relationships are synthetic, confidence tier C, and require human review before broker use." });
    this.agentInspector(owner);
  }
}
