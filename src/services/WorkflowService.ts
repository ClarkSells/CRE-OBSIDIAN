import type { NavigatorRecord } from "../types";
import { timestamp } from "../utils/format";
import { AnalyticalStore } from "./AnalyticalStore";
import { HistoryService } from "./HistoryService";
import { RecordFactory } from "./RecordFactory";

interface TimelineStep { name: string; offset_days?: number; priority?: string; }

export class WorkflowService {
  constructor(private store: AnalyticalStore, private factory: RecordFactory, private history: HistoryService) {}

  async applyTemplate(template: NavigatorRecord, relatedRecord: NavigatorRecord, assignedTo = "Unassigned"): Promise<NavigatorRecord[]> {
    const tasks: NavigatorRecord[] = [];
    for (const [index, step] of this.steps(template.steps).entries()) {
      const due = new Date();
      due.setDate(due.getDate() + Number(step.offset_days ?? index));
      const task: NavigatorRecord = {
        type: "task", id: `task_${Date.now().toString(36)}_${index}`, name: step.name, path: "",
        status: "open", priority: step.priority ?? "normal", assigned_to: assignedTo,
        due_date: due.toISOString().slice(0, 10), related_records: [relatedRecord.id], timeline_template: template.id,
        created: timestamp(), updated: timestamp(), confidence_tier: "A", source_status: "verified", human_review: false
      };
      await this.store.upsertRecord(task);
      tasks.push(task);
    }
    await this.history.record(relatedRecord.id, "workflow_applied", `${template.name} workflow applied`, { template_id: template.id, task_ids: tasks.map((task) => task.id) });
    return tasks;
  }

  async transitionPursuit(pursuit: NavigatorRecord, stage: string): Promise<void> {
    const previous = pursuit.stage;
    pursuit.stage = stage;
    pursuit.updated = timestamp();
    await this.store.upsertRecord(pursuit, Boolean(pursuit.file));
    if (pursuit.file) await this.factory.updateFrontmatter(pursuit.file, { stage });
    await this.history.record(pursuit.id, "pursuit_stage_changed", `${pursuit.name} moved from ${String(previous)} to ${stage}`, { previous, stage });
  }

  async completeTask(task: NavigatorRecord): Promise<NavigatorRecord | undefined> {
    task.status = "complete";
    task.completed_date = timestamp().slice(0, 10);
    task.updated = timestamp();
    await this.store.upsertRecord(task, Boolean(task.file));
    if (task.file) await this.factory.updateFrontmatter(task.file, { status: "complete", completed_date: task.completed_date });
    await this.history.record(task.id, "task_completed", `${task.name} completed`, {});
    const recurrence = String(task.recurrence ?? "").toLowerCase();
    if (!recurrence) return undefined;
    const days = recurrence === "weekly" ? 7 : recurrence === "monthly" ? 30 : Number(recurrence.match(/\d+/)?.[0] ?? 0);
    if (!days) return undefined;
    const due = new Date(String(task.due_date || new Date().toISOString()));
    due.setDate(due.getDate() + days);
    const next = { ...task, id: `task_${Date.now().toString(36)}`, name: task.name, path: "", status: "open", completed_date: "", due_date: due.toISOString().slice(0, 10), created: timestamp(), updated: timestamp(), promoted: false } as NavigatorRecord;
    await this.store.upsertRecord(next);
    await this.history.record(next.id, "recurring_task_created", `Recurring task created from ${task.name}`, { previous_task_id: task.id });
    return next;
  }

  private steps(value: unknown): TimelineStep[] {
    if (Array.isArray(value)) return value.map((step) => typeof step === "string" ? { name: step } : step as TimelineStep);
    if (typeof value === "string") {
      try { return this.steps(JSON.parse(value)); } catch { return value.split(",").map((name) => ({ name: name.trim() })).filter((step) => step.name); }
    }
    return [];
  }
}
