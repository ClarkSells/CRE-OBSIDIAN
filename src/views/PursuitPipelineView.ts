import type { WorkspaceLeaf } from "obsidian";
import { VIEW_TYPES } from "../constants";
import type { NavigatorContext } from "../NavigatorContext";
import { money, text } from "../utils/format";
import { BaseNavigatorView } from "./BaseNavigatorView";
import { badge, pageHeader, section } from "./ui";

const STAGES = ["research", "relationship", "valuation", "pitch", "listing", "under_contract", "won", "lost"];
export class PursuitPipelineView extends BaseNavigatorView {
  constructor(leaf: WorkspaceLeaf, plugin: NavigatorContext) { super(leaf, plugin); }
  getViewType(): string { return VIEW_TYPES.pursuitPipeline; }
  getDisplayText(): string { return "STRIVE Pursuit Pipeline"; }
  getIcon(): string { return "kanban-square"; }
  protected render(): void {
    pageHeader(this.root, "REVENUE PIPELINE", "Pursuit Pipeline", "Stage, probability, expected fee, ownership, next action, and aging in one operating view.");
    const records = [...new Map([...this.plugin.store.allRecords("pursuit"), ...this.plugin.index.findByType("pursuit")].map((r) => [r.id, r])).values()];
    const board = this.root.createDiv({ cls: "strive-kanban strive-kanban-wide" });
    for (const stage of STAGES) {
      const pursuits = records.filter((record) => String(record.stage || "research") === stage);
      const lane = section(board, stage.replace(/_/g, " "), `${pursuits.length} · ${money(pursuits.reduce((sum, record) => sum + Number(record.expected_fee || 0), 0))}`);
      for (const pursuit of pursuits) {
        const card = lane.createDiv({ cls: "strive-record-card" });
        card.addEventListener("click", () => this.openRecord(pursuit));
        badge(card, `${text(pursuit.probability, "0")}%`);
        card.createEl("h3", { text: pursuit.name });
        card.createDiv({ cls: "strive-muted", text: `${money(pursuit.expected_fee)} · ${text(pursuit.assigned_broker)}` });
        card.createDiv({ cls: "strive-action-callout", text: text(pursuit.next_action, "No next action") });
        const nextStage = STAGES[Math.min(STAGES.indexOf(stage) + 1, STAGES.length - 1)];
        if (nextStage !== stage) card.createEl("button", { text: `Move to ${nextStage.replace(/_/g, " ")}` }).addEventListener("click", async (event) => {
          event.stopPropagation();
          await this.plugin.workflow.transitionPursuit(pursuit, nextStage);
          await this.draw();
        });
      }
    }
  }
}
