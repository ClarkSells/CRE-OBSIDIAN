import { PluginSettingTab, Setting } from "obsidian";
import type { NavigatorContext } from "../NavigatorContext";

export class NavigatorSettingsTab extends PluginSettingTab {
  constructor(private context: NavigatorContext & { saveSettings(): Promise<void> }) { super(context.app, context as never); }

  display(): void {
    this.containerEl.empty();
    this.containerEl.createEl("h2", { text: "STRIVE Navigator Settings" });
    new Setting(this.containerEl).setName("Default view mode").setDesc("Broker mode prioritizes decisions; Agent mode exposes structured records.").addDropdown((dropdown) => dropdown.addOptions({ broker: "Broker Mode", agent: "Agent Mode" }).setValue(this.context.settings.defaultMode).onChange(async (value) => {
      this.context.settings.defaultMode = value as "broker" | "agent";
      await this.context.saveSettings();
    }));
    new Setting(this.containerEl).setName("Accent color").setDesc("Choose the premium dashboard accent.").addDropdown((dropdown) => dropdown.addOptions({ gold: "Gold", blue: "Electric Blue" }).setValue(this.context.settings.accent).onChange(async (value) => {
      this.context.settings.accent = value as "gold" | "blue";
      await this.context.saveSettings();
      document.body.toggleClass("strive-accent-blue", value === "blue");
    }));
    new Setting(this.containerEl).setName("Export human-review records").setDesc("Keep review status visible in CSV exports.").addToggle((toggle) => toggle.setValue(this.context.settings.exportHumanReviewRecords).onChange(async (value) => {
      this.context.settings.exportHumanReviewRecords = value;
      await this.context.saveSettings();
    }));
    new Setting(this.containerEl).setName("Analytical store").setDesc("Enable the local V2 analytical store for imports, history, graph, and workflows.").addToggle((toggle) => toggle.setValue(this.context.settings.analyticalStoreEnabled).onChange(async (value) => {
      this.context.settings.analyticalStoreEnabled = value;
      await this.context.saveSettings();
    }));
    new Setting(this.containerEl).setName("Map style URL").setDesc("MapLibre style URL used when an online basemap is available.").addText((input) => input.setValue(this.context.settings.mapStyleUrl).onChange(async (value) => {
      this.context.settings.mapStyleUrl = value.trim();
      await this.context.saveSettings();
    }));
    new Setting(this.containerEl).setName("Stale record threshold").setDesc("Days without an update before the Data Quality Center flags a record.").addText((input) => input.setValue(String(this.context.settings.staleRecordDays)).onChange(async (value) => {
      this.context.settings.staleRecordDays = Math.max(1, Number(value) || 180);
      await this.context.saveSettings();
    }));
  }
}
