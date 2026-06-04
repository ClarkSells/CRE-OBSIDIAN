import type { WorkspaceLeaf } from "obsidian";
import { VIEW_TYPES } from "../constants";
import type { NavigatorContext } from "../NavigatorContext";
import { BaseNavigatorView } from "./BaseNavigatorView";
import { badge, kpi, pageHeader, section } from "./ui";

export class DataQualityView extends BaseNavigatorView {
  constructor(leaf: WorkspaceLeaf, plugin: NavigatorContext) { super(leaf, plugin); }
  getViewType(): string { return VIEW_TYPES.dataQuality; }
  getDisplayText(): string { return "STRIVE Data Quality Center"; }
  getIcon(): string { return "shield-alert"; }
  protected render(): void {
    const issues = this.plugin.quality.scan(this.plugin.settings.staleRecordDays);
    const summary = this.plugin.quality.summary(this.plugin.settings.staleRecordDays);
    pageHeader(this.root, "TRUST AND REVIEW", "Data Quality Center", "Resolve duplicates, broken references, stale intelligence, validation failures, and conflicting assertions.");
    const kpis = this.root.createDiv({ cls: "strive-kpi-grid" });
    Object.entries(summary).forEach(([label, count]) => kpi(kpis, label, count, count ? "is-warning" : ""));
    const block = section(this.root, "Issue Queue", `${issues.length} actionable issues`);
    const list = block.createDiv({ cls: "strive-issue-list" });
    for (const issue of issues.slice(0, 500)) {
      const row = list.createDiv({ cls: `strive-issue-row is-${issue.severity}` });
      const top = row.createDiv({ cls: "strive-status-row" });
      badge(top, issue.issueType, issue.severity === "error" ? "is-alert" : "is-warning");
      top.createSpan({ cls: "strive-muted", text: issue.recordIds.join(", ") });
      row.createDiv({ text: issue.message });
      if (issue.recordIds[0]) row.addEventListener("click", () => void this.plugin.openRecord(issue.recordIds[0]));
      if (issue.issueType === "duplicate" && issue.recordIds.length > 1) {
        const actions = row.createDiv({ cls: "strive-action-strip" });
        actions.addEventListener("click", (event) => event.stopPropagation());
        actions.createEl("button", { text: "Merge second into first" }).addEventListener("click", async () => {
          try {
            const merged = await this.plugin.store.mergeRecords(issue.recordIds[0], issue.recordIds[1]);
            await this.plugin.history.record(merged.id, "records_merged", `Merged ${issue.recordIds[1]} into ${merged.name}`, { primary_id: merged.id, duplicate_id: issue.recordIds[1] });
            await this.draw();
          } catch (error) {
            row.createDiv({ cls: "strive-warning-panel", text: error instanceof Error ? error.message : String(error) });
          }
        });
        actions.createEl("button", { text: "Create review split" }).addEventListener("click", async () => {
          const source = this.plugin.store.findById(issue.recordIds[0]);
          if (!source) return;
          await this.plugin.store.splitRecord(source.id, `${source.id}_split_${Date.now().toString(36)}`, `${source.name} · Review Split`);
          await this.plugin.history.record(source.id, "record_split_for_review", `${source.name} split into a review candidate`, {});
          await this.draw();
        });
      }
    }
  }
}
