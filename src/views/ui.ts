import type { NavigatorRecord, ValidationIssue } from "../types";
import { money, text } from "../utils/format";

export function pageHeader(container: HTMLElement, eyebrow: string, title: string, description: string): HTMLElement {
  const header = container.createDiv({ cls: "strive-page-header" });
  const copy = header.createDiv();
  copy.createDiv({ cls: "strive-eyebrow", text: eyebrow });
  copy.createEl("h1", { text: title });
  copy.createEl("p", { text: description });
  return header;
}

export function section(container: HTMLElement, title: string, subtitle?: string): HTMLElement {
  const block = container.createDiv({ cls: "strive-section" });
  const heading = block.createDiv({ cls: "strive-section-heading" });
  heading.createEl("h2", { text: title });
  if (subtitle) heading.createEl("span", { text: subtitle });
  return block;
}

export function kpi(container: HTMLElement, label: string, value: string | number, tone = ""): HTMLElement {
  const card = container.createDiv({ cls: `strive-kpi ${tone}` });
  card.createDiv({ cls: "strive-kpi-label", text: label });
  card.createDiv({ cls: "strive-kpi-value", text: String(value) });
  return card;
}

export function badge(container: HTMLElement, value: unknown, tone?: string): HTMLElement {
  return container.createSpan({ cls: `strive-badge ${tone ?? ""}`, text: text(value) });
}

export function confidence(container: HTMLElement, value: unknown): HTMLElement {
  return badge(container, `Confidence ${text(value, "?")}`, `confidence-${String(value).toLowerCase()}`);
}

export function empty(container: HTMLElement, message: string): void {
  container.createDiv({ cls: "strive-empty", text: message });
}

export function factGrid(container: HTMLElement, facts: Array<[string, unknown, ("money" | "text" | "badge")?]>): void {
  const grid = container.createDiv({ cls: "strive-fact-grid" });
  for (const [label, value, format = "text"] of facts) {
    const item = grid.createDiv({ cls: "strive-fact" });
    item.createDiv({ cls: "strive-fact-label", text: label });
    if (format === "badge") badge(item, value);
    else item.createDiv({ cls: "strive-fact-value", text: format === "money" ? money(value) : text(value) });
  }
}

export function recordTable(container: HTMLElement, records: NavigatorRecord[], columns: Array<[string, keyof NavigatorRecord | ((record: NavigatorRecord) => unknown)]>, onOpen?: (record: NavigatorRecord) => void): void {
  if (records.length === 0) return empty(container, "No linked records in the current index.");
  const wrap = container.createDiv({ cls: "strive-table-wrap" });
  const table = wrap.createEl("table", { cls: "strive-table" });
  const head = table.createEl("thead").createEl("tr");
  for (const [label] of columns) head.createEl("th", { text: label });
  const body = table.createEl("tbody");
  for (const record of records) {
    const row = body.createEl("tr");
    if (onOpen) row.addEventListener("click", () => onOpen(record));
    for (const [, accessor] of columns) {
      const value = typeof accessor === "function" ? accessor(record) : record[accessor];
      row.createEl("td", { text: text(value) });
    }
  }
}

export function warningPanel(container: HTMLElement, issues: ValidationIssue[]): void {
  if (issues.length === 0) return;
  const panel = container.createDiv({ cls: "strive-warning-panel" });
  panel.createEl("strong", { text: `${issues.length} validation flag${issues.length === 1 ? "" : "s"}` });
  for (const issue of issues) panel.createDiv({ text: `${issue.severity.toUpperCase()}: ${issue.message}` });
}

export function openRecord(record: NavigatorRecord): void {
  void record.file?.vault.getAbstractFileByPath(record.path);
}
