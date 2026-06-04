import type { WorkspaceLeaf } from "obsidian";
import { VIEW_TYPES } from "../constants";
import type { NavigatorContext } from "../NavigatorContext";
import type { NavigatorRecord } from "../types";
import { asStringArray, money } from "../utils/format";
import { BaseNavigatorView } from "./BaseNavigatorView";
import { badge, pageHeader, section } from "./ui";

interface Match { investor: NavigatorRecord; score: number; reasons: string[]; }

export class InvestorMatchView extends BaseNavigatorView {
  constructor(leaf: WorkspaceLeaf, plugin: NavigatorContext) { super(leaf, plugin); }
  getViewType(): string { return VIEW_TYPES.investorMatch; }
  getDisplayText(): string { return "STRIVE Investor Match"; }
  getIcon(): string { return "scan-search"; }

  protected render(): void {
    const active = this.plugin.app.workspace.getActiveFile();
    this.focusRecord = this.plugin.index.all().find((r) => r.path === active?.path && r.type === "property") ?? this.plugin.index.findByType("property")[0];
    if (!this.focusRecord) return void pageHeader(this.root, "BUYER INTELLIGENCE", "Investor Match", "Create a property or generate demo data to begin.");
    const property = this.focusRecord;
    pageHeader(this.root, "BUYER INTELLIGENCE", `Investor Match · ${property.name}`, `${property.asset_class} · ${this.plugin.index.findById(property.submarket)?.name ?? property.submarket} · ${money(property.assessed_value)}`);
    const matches = this.plugin.index.findByType("investor_profile").map((investor) => this.score(investor, property)).sort((a, b) => b.score - a.score);
    const block = section(this.root, "Ranked Buyer Universe", "Deterministic MVP scoring with a visible explanation");
    const grid = block.createDiv({ cls: "strive-match-grid" });
    for (const match of matches) {
      const card = grid.createDiv({ cls: "strive-match-card" });
      card.addEventListener("click", () => this.openRecord(match.investor));
      const score = card.createDiv({ cls: "strive-match-score", text: String(match.score) });
      score.setAttr("title", "Buyer confidence score");
      card.createEl("h3", { text: match.investor.name });
      card.createDiv({ cls: "strive-muted", text: `${String(match.investor.buyer_type)} · Relationship owner: ${String(match.investor.relationship_owner_at_strive ?? "Unassigned")}` });
      const reasons = card.createDiv({ cls: "strive-reasons" });
      match.reasons.forEach((reason) => badge(reasons, reason, "is-positive"));
    }
    this.agentInspector(property);
  }

  private score(investor: NavigatorRecord, property: NavigatorRecord): Match {
    let score = 0;
    const reasons: string[] = [];
    const add = (points: number, label: string) => { score += points; reasons.push(`+${points} ${label}`); };
    if (asStringArray(investor.asset_preferences).includes(String(property.asset_class))) add(25, "asset match");
    if (asStringArray(investor.submarket_preferences).includes(String(property.submarket))) add(20, "submarket match");
    const value = Number(property.assessed_value);
    if (value >= Number(investor.deal_size_min) && value <= Number(investor.deal_size_max)) add(20, "deal size");
    if (["private", "family_office", "syndicator", "institutional", "REIT"].includes(String(investor.buyer_type))) add(15, "buyer fit");
    if (asStringArray(investor.recent_acquisitions).length) add(15, "recent activity");
    if (["warm", "active", "client"].includes(String(investor.relationship_status))) add(10, "warm relationship");
    if (String(investor.exchange_status).includes("1031")) add(10, "1031 active");
    if (investor.relationship_status === "do_not_contact") { score -= 20; reasons.push("-20 do not contact"); }
    if (["D", "F"].includes(String(investor.confidence_tier))) { score -= 15; reasons.push("-15 low confidence"); }
    return { investor, score, reasons };
  }
}

