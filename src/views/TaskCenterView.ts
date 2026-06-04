import type { WorkspaceLeaf } from "obsidian";
import { VIEW_TYPES } from "../constants";
import type { NavigatorContext } from "../NavigatorContext";
import type { NavigatorRecord } from "../types";
import { BaseNavigatorView } from "./BaseNavigatorView";
import { badge, pageHeader, section } from "./ui";

export class TaskCenterView extends BaseNavigatorView {
  constructor(leaf: WorkspaceLeaf, plugin: NavigatorContext) { super(leaf, plugin); }
  getViewType(): string { return VIEW_TYPES.taskCenter; }
  getDisplayText(): string { return "STRIVE Task Center"; }
  getIcon(): string { return "list-checks"; }
  protected render(): void {
    pageHeader(this.root, "BROKER EXECUTION", "Task Center", "Overdue, today, upcoming, and completed actions tied to the relationship and deal graph.");
    const tasks = this.records();
    const today = new Date().toISOString().slice(0, 10);
    const groups: Array<[string, NavigatorRecord[]]> = [
      ["Overdue", tasks.filter((task) => task.status !== "complete" && String(task.due_date || "9999") < today)],
      ["Today", tasks.filter((task) => task.status !== "complete" && task.due_date === today)],
      ["Upcoming", tasks.filter((task) => task.status !== "complete" && String(task.due_date || "") > today)],
      ["Completed", tasks.filter((task) => task.status === "complete")]
    ];
    const board = this.root.createDiv({ cls: "strive-kanban" });
    for (const [title, records] of groups) {
      const lane = section(board, title, `${records.length} tasks`);
      for (const task of records.slice(0, 100)) {
        const card = lane.createDiv({ cls: "strive-record-card" });
        card.addEventListener("click", () => this.openRecord(task));
        badge(card, task.priority || "normal", task.priority === "urgent" ? "is-alert" : "");
        card.createEl("h3", { text: task.name });
        card.createDiv({ cls: "strive-muted", text: `Due ${String(task.due_date || "unscheduled")} · ${String(task.assigned_to || "unassigned")}` });
        if (task.next_action) card.createDiv({ cls: "strive-action-callout", text: String(task.next_action) });
        if (task.status !== "complete") card.createEl("button", { text: "Complete task" }).addEventListener("click", async (event) => {
          event.stopPropagation();
          await this.plugin.workflow.completeTask(task);
          await this.draw();
        });
      }
    }
  }
  private records(): NavigatorRecord[] { return [...new Map([...this.plugin.store.allRecords("task"), ...this.plugin.index.findByType("task")].map((r) => [r.id, r])).values()]; }
}
