import type { WorkspaceLeaf } from "obsidian";
import { VIEW_TYPES } from "../constants";
import type { NavigatorContext } from "../NavigatorContext";
import { BaseNavigatorView } from "./BaseNavigatorView";
import { badge, empty, pageHeader, section } from "./ui";

export class HistoryTimelineView extends BaseNavigatorView {
  constructor(leaf: WorkspaceLeaf, plugin: NavigatorContext) { super(leaf, plugin); }
  getViewType(): string { return VIEW_TYPES.historyTimeline; }
  getDisplayText(): string { return "STRIVE History Timeline"; }
  getIcon(): string { return "history"; }
  protected render(): void {
    const active = this.plugin.app.workspace.getActiveFile();
    this.focusRecord = active ? this.plugin.index.findByPath(active.path) : undefined;
    pageHeader(this.root, "TEMPORAL INTELLIGENCE", "History Timeline", this.focusRecord ? `Immutable event and assertion history for ${this.focusRecord.name}.` : "Immutable event history across records, imports, workflows, and field assertions.");
    const events = this.plugin.store.eventsFor(this.focusRecord?.id, 500);
    const block = section(this.root, "Event Ledger", `${events.length} events`);
    if (!events.length) return empty(block, "No V2 events recorded yet. Create or edit a record, or run a CSV import.");
    const timeline = block.createDiv({ cls: "strive-timeline" });
    for (const event of events) {
      const item = timeline.createDiv({ cls: "strive-timeline-item" });
      const top = item.createDiv({ cls: "strive-status-row" });
      badge(top, event.event_type);
      top.createSpan({ cls: "strive-muted", text: `${event.occurred_at} · ${event.actor}` });
      item.createEl("h3", { text: event.summary });
      item.createEl("pre", { text: JSON.stringify(event.data, null, 2) });
    }
  }
}

