import type { WorkspaceLeaf } from "obsidian";
import { VIEW_TYPES } from "../constants";
import type { NavigatorContext } from "../NavigatorContext";
import { BaseNavigatorView } from "./BaseNavigatorView";
import { badge, confidence, pageHeader, section } from "./ui";

export class DealSignalRadarView extends BaseNavigatorView {
  constructor(leaf: WorkspaceLeaf, plugin: NavigatorContext) { super(leaf, plugin); }
  getViewType(): string { return VIEW_TYPES.signalRadar; }
  getDisplayText(): string { return "STRIVE Deal Signal Radar"; }
  getIcon(): string { return "radar"; }

  protected render(): void {
    pageHeader(this.root, "BROKER ACTION QUEUE", "Deal Signal Radar", "Prioritized reasons to call, grounded in source confidence and explicit human review.");
    const filter = this.root.createEl("select", { cls: "strive-select" });
    filter.createEl("option", { value: "all", text: "All signal types" });
    const signals = this.plugin.index.findByType("deal_signal").sort((a, b) => Number(b.signal_strength) - Number(a.signal_strength));
    [...new Set(signals.map((s) => String(s.signal_type)))].forEach((type) => filter.createEl("option", { value: type, text: type.replace(/_/g, " ") }));
    const block = section(this.root, "Ranked Signals", `${signals.length} opportunities`);
    const renderCards = (type = "all") => {
      block.querySelector(".strive-signal-grid")?.remove();
      const grid = block.createDiv({ cls: "strive-signal-grid" });
      for (const signal of signals.filter((s) => type === "all" || s.signal_type === type)) {
        const card = grid.createDiv({ cls: `strive-signal-card strength-${Math.floor(Number(signal.signal_strength) / 10)}` });
        card.addEventListener("click", () => this.openRecord(signal));
        const top = card.createDiv({ cls: "strive-signal-top" });
        badge(top, signal.signal_type, "is-alert");
        top.createSpan({ cls: "strive-signal-score", text: String(signal.signal_strength) });
        card.createEl("h3", { text: this.plugin.index.findById(signal.property)?.name ?? signal.name });
        card.createDiv({ cls: "strive-muted", text: String(signal.trigger ?? "") });
        card.createEl("p", { text: String(signal.evidence ?? "") });
        card.createDiv({ cls: "strive-action-callout", text: `Broker Action: ${String(signal.recommended_action ?? "Review signal")}` });
        const footer = card.createDiv({ cls: "strive-card-footer" });
        confidence(footer, signal.confidence_tier);
        badge(footer, signal.status);
        badge(footer, signal.assigned_broker);
      }
    };
    renderCards();
    filter.addEventListener("change", () => renderCards(filter.value));
  }
}

