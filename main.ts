import { debounce, Notice, Plugin, TFile, WorkspaceLeaf } from "obsidian";
import { PLUGIN_NAME, TYPE_LABELS, VIEW_TYPES } from "./src/constants";
import type { NavigatorContext } from "./src/NavigatorContext";
import type { NavigatorRecord, NavigatorSettings, RecordType } from "./src/types";
import { MetadataIndex } from "./src/services/MetadataIndex";
import { RecordFactory } from "./src/services/RecordFactory";
import { ValidationService } from "./src/services/Validation";
import { RealNexExportService } from "./src/services/RealNexExport";
import { VaultFolders } from "./src/services/VaultFolders";
import { SampleDataService } from "./src/services/SampleData";
import { CreateRecordModal } from "./src/modals/CreateRecordModal";
import { CreateRelationshipModal } from "./src/modals/CreateRelationshipModal";
import { ValidationModal } from "./src/modals/ValidationModal";
import { NavigatorSettingsTab } from "./src/settings/SettingsTab";
import { CommandCenterView } from "./src/views/CommandCenterView";
import { PropertyWarRoomView } from "./src/views/PropertyWarRoomView";
import { OwnerDossierView } from "./src/views/OwnerDossierView";
import { RelationshipGraphView } from "./src/views/RelationshipGraphView";
import { DealSignalRadarView } from "./src/views/DealSignalRadarView";
import { CompsBoardView } from "./src/views/CompsBoardView";
import { InvestorMatchView } from "./src/views/InvestorMatchView";
import { RealNexSyncQueueView } from "./src/views/RealNexSyncQueueView";

const DEFAULT_SETTINGS: NavigatorSettings = { defaultMode: "broker", exportHumanReviewRecords: true, accent: "gold" };

export default class StriveNavigatorPlugin extends Plugin implements NavigatorContext {
  index!: MetadataIndex;
  factory!: RecordFactory;
  validation = new ValidationService();
  exporter!: RealNexExportService;
  folders!: VaultFolders;
  sampleData!: SampleDataService;
  settings: NavigatorSettings = DEFAULT_SETTINGS;

  async onload(): Promise<void> {
    await this.loadSettings();
    this.index = new MetadataIndex(this.app.vault, this.app.metadataCache);
    this.factory = new RecordFactory(this.app.vault, this.app.fileManager);
    this.exporter = new RealNexExportService(this.app.vault);
    this.folders = new VaultFolders(this.app.vault);
    this.sampleData = new SampleDataService(this.factory, this.index);
    this.registerViews();
    this.registerCommands();
    this.addSettingTab(new NavigatorSettingsTab(this));
    this.addRibbonIcon("radar", PLUGIN_NAME, () => void this.openView(VIEW_TYPES.commandCenter));
    document.body.toggleClass("strive-accent-blue", this.settings.accent === "blue");
    const rebuild = debounce(() => void this.rebuildIndex(false), 750, true);
    this.registerEvent(this.app.metadataCache.on("changed", rebuild));
    this.app.workspace.onLayoutReady(async () => {
      await this.rebuildIndex(false);
      new Notice("STRIVE Navigator intelligence index ready.");
    });
  }

  onunload(): void {
    document.body.removeClass("strive-accent-blue");
  }

  async loadSettings(): Promise<void> {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData() as Partial<NavigatorSettings>);
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }

  async rebuildIndex(showNotice = true): Promise<void> {
    await this.index.rebuild();
    if (showNotice) new Notice(`STRIVE Navigator: indexed ${this.index.all().length} structured records.`);
  }

  async openView(type: string): Promise<WorkspaceLeaf> {
    let leaf = this.app.workspace.getLeavesOfType(type)[0];
    if (!leaf) {
      leaf = this.app.workspace.getLeaf("tab");
      await leaf.setViewState({ type, active: true });
    }
    await this.app.workspace.revealLeaf(leaf);
    return leaf;
  }

  async createRecord(type: RecordType): Promise<void> {
    new CreateRecordModal(this.app, type, (name) => void this.factory.createInteractive(type, name).then(async (file) => {
      await this.app.workspace.getLeaf(false).openFile(file);
      await this.rebuildIndex(false);
    })).open();
  }

  private registerViews(): void {
    this.registerView(VIEW_TYPES.commandCenter, (leaf) => new CommandCenterView(leaf, this));
    this.registerView(VIEW_TYPES.propertyWarRoom, (leaf) => new PropertyWarRoomView(leaf, this));
    this.registerView(VIEW_TYPES.ownerDossier, (leaf) => new OwnerDossierView(leaf, this));
    this.registerView(VIEW_TYPES.relationshipGraph, (leaf) => new RelationshipGraphView(leaf, this));
    this.registerView(VIEW_TYPES.signalRadar, (leaf) => new DealSignalRadarView(leaf, this));
    this.registerView(VIEW_TYPES.compsBoard, (leaf) => new CompsBoardView(leaf, this));
    this.registerView(VIEW_TYPES.investorMatch, (leaf) => new InvestorMatchView(leaf, this));
    this.registerView(VIEW_TYPES.realnexQueue, (leaf) => new RealNexSyncQueueView(leaf, this));
  }

  private registerCommands(): void {
    this.addCommand({ id: "initialize-vault", name: "Initialize Vault Structure", callback: async () => { await this.folders.initialize(); await this.rebuildIndex(false); } });
    const views: Array<[string, string, string]> = [
      ["open-command-center", "Open Command Center", VIEW_TYPES.commandCenter],
      ["open-property-war-room", "Open Property War Room", VIEW_TYPES.propertyWarRoom],
      ["open-owner-dossier", "Open Owner Dossier", VIEW_TYPES.ownerDossier],
      ["open-relationship-graph", "Open Relationship Graph", VIEW_TYPES.relationshipGraph],
      ["open-deal-signal-radar", "Open Deal Signal Radar", VIEW_TYPES.signalRadar],
      ["open-comps-board", "Open Comps Board", VIEW_TYPES.compsBoard],
      ["open-investor-match", "Open Investor Match View", VIEW_TYPES.investorMatch],
      ["open-realnex-queue", "Open RealNex Sync Queue", VIEW_TYPES.realnexQueue]
    ];
    views.forEach(([id, name, type]) => this.addCommand({ id, name, callback: () => void this.openView(type) }));
    const creationTypes: RecordType[] = ["property", "parcel", "entity", "person", "investor_profile", "tenant", "lease", "loan", "sale_comp", "lease_comp", "submarket", "deal_signal", "broker_activity"];
    creationTypes.forEach((type) => this.addCommand({ id: `create-${type.replace(/_/g, "-")}`, name: `Create ${TYPE_LABELS[type]}`, callback: () => void this.createRecord(type) }));
    this.addCommand({ id: "create-relationship-edge", name: "Create Relationship Edge", callback: () => this.createRelationship() });
    this.addCommand({ id: "rebuild-index", name: "Rebuild STRIVE Index", callback: () => void this.rebuildIndex() });
    this.addCommand({ id: "validate-current-note", name: "Validate Current Note", checkCallback: (checking) => {
      const record = this.activeRecord();
      if (!record) return false;
      if (!checking) new ValidationModal(this.app, record, this.validation.validate(record)).open();
      return true;
    } });
    this.addCommand({ id: "export-realnex-csv", name: "Export RealNex CSV", callback: async () => { await this.rebuildIndex(false); await this.exporter.export(this.index.all().filter((r) => ["property", "entity", "person", "investor_profile"].includes(r.type))); } });
    this.addCommand({ id: "generate-sample-dataset", name: "Generate Sample Dataset", callback: async () => { await this.folders.initialize(false); await this.sampleData.generate(); } });
  }

  private createRelationship(): void {
    new CreateRelationshipModal(this.app, async (value) => {
      await this.factory.create("relationship_edge", `${value.relationship_type} ${value.from} to ${value.to}`, { ...value, confidence: "C", human_review: true, source_status: "inferred" }, true);
      await this.rebuildIndex(false);
      new Notice("STRIVE Navigator: relationship edge created.");
    }).open();
  }

  private activeRecord(): NavigatorRecord | undefined {
    const file = this.app.workspace.getActiveFile();
    if (!(file instanceof TFile)) return undefined;
    const indexed = this.index.all().find((record) => record.path === file.path);
    if (indexed) return indexed;
    const frontmatter = this.app.metadataCache.getFileCache(file)?.frontmatter;
    if (!frontmatter) return undefined;
    return { ...frontmatter, type: frontmatter.type, id: String(frontmatter.id ?? ""), name: String(frontmatter.name ?? file.basename), path: file.path, file } as NavigatorRecord;
  }
}
