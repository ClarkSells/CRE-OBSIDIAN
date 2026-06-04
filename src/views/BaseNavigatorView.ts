import { ItemView, WorkspaceLeaf } from "obsidian";
import type { NavigatorContext } from "../NavigatorContext";
import type { NavigatorRecord, UiMode } from "../types";

export abstract class BaseNavigatorView extends ItemView {
  protected mode: UiMode;
  protected root!: HTMLElement;
  protected focusRecord?: NavigatorRecord;

  constructor(leaf: WorkspaceLeaf, protected plugin: NavigatorContext) {
    super(leaf);
    this.mode = plugin.settings.defaultMode;
  }

  async onOpen(): Promise<void> {
    await this.plugin.rebuildIndex(false);
    await this.draw();
  }

  async draw(): Promise<void> {
    this.contentEl.empty();
    this.contentEl.addClass("strive-navigator");
    this.root = this.contentEl.createDiv({ cls: `strive-shell strive-${this.mode}-mode` });
    this.renderModeBar();
    await this.render();
  }

  protected abstract render(): Promise<void> | void;

  protected renderModeBar(): void {
    const bar = this.root.createDiv({ cls: "strive-mode-bar" });
    bar.createSpan({ cls: "strive-terminal-mark", text: "STRIVE / NAVIGATOR" });
    const buttons = bar.createDiv({ cls: "strive-mode-buttons" });
    for (const mode of ["broker", "agent"] as UiMode[]) {
      const button = buttons.createEl("button", { cls: this.mode === mode ? "is-active" : "", text: `${mode[0].toUpperCase()}${mode.slice(1)} Mode` });
      button.addEventListener("click", () => { this.mode = mode; void this.draw(); });
    }
    const raw = buttons.createEl("button", { text: "Raw Markdown" });
    raw.addEventListener("click", () => {
      const file = this.focusRecord?.file ?? this.plugin.app.workspace.getActiveFile();
      if (file) void this.plugin.app.workspace.getLeaf(false).openFile(file);
    });
  }

  protected agentInspector(record: NavigatorRecord): void {
    if (this.mode !== "agent") return;
    const block = this.root.createDiv({ cls: "strive-agent-inspector" });
    block.createDiv({ cls: "strive-eyebrow", text: "AGENT MODE / MACHINE-READABLE RECORD" });
    const pre = block.createEl("pre");
    const clean = Object.fromEntries(Object.entries(record).filter(([key]) => !["file"].includes(key)));
    pre.setText(JSON.stringify(clean, null, 2));
  }

  protected openRecord(record: NavigatorRecord): void {
    void this.plugin.openRecord(record.id);
  }
}
