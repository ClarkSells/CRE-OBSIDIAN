import { Notice, Plugin, TAbstractFile, TFile, WorkspaceLeaf } from "obsidian";
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
import { AnalyticalStore } from "./src/services/AnalyticalStore";
import { HistoryService } from "./src/services/HistoryService";
import { GraphService } from "./src/services/GraphService";
import { SpatialService } from "./src/services/SpatialService";
import { ImportService } from "./src/services/ImportService";
import { DataQualityService } from "./src/services/DataQualityService";
import { HistoryTimelineView } from "./src/views/HistoryTimelineView";
import { MapIntelligenceView } from "./src/views/MapIntelligenceView";
import { ImportCenterView } from "./src/views/ImportCenterView";
import { DataQualityView } from "./src/views/DataQualityView";
import { TaskCenterView } from "./src/views/TaskCenterView";
import { RequirementsBoardView } from "./src/views/RequirementsBoardView";
import { PursuitPipelineView } from "./src/views/PursuitPipelineView";
import { TransactionManagerView } from "./src/views/TransactionManagerView";
import { UnifiedSearchView } from "./src/views/UnifiedSearchView";
import { Company360View } from "./src/views/Company360View";
import { Contact360View } from "./src/views/Contact360View";
import { RecordEditorModal } from "./src/modals/RecordEditorModal";
import { WorkflowService } from "./src/services/WorkflowService";

const DEFAULT_SETTINGS: NavigatorSettings = {
  defaultMode: "broker", exportHumanReviewRecords: true, accent: "gold",
  mapStyleUrl: "https://demotiles.maplibre.org/style.json", analyticalStoreEnabled: true, staleRecordDays: 180
};

export default class StriveNavigatorPlugin extends Plugin implements NavigatorContext {
  index!: MetadataIndex;
  factory!: RecordFactory;
  validation = new ValidationService();
  exporter!: RealNexExportService;
  folders!: VaultFolders;
  sampleData!: SampleDataService;
  store!: AnalyticalStore;
  history!: HistoryService;
  graph!: GraphService;
  spatial = new SpatialService();
  importer!: ImportService;
  quality!: DataQualityService;
  workflow!: WorkflowService;
  settings: NavigatorSettings = DEFAULT_SETTINGS;

  async onload(): Promise<void> {
    await this.loadSettings();
    this.index = new MetadataIndex(this.app.vault, this.app.metadataCache);
    this.factory = new RecordFactory(this.app.vault, this.app.fileManager);
    this.store = new AnalyticalStore(this.app.vault);
    if (this.settings.analyticalStoreEnabled) await this.store.initialize();
    this.history = new HistoryService(this.store);
    this.graph = new GraphService(this.index, this.store);
    this.importer = new ImportService(this.app.vault, this.store, this.history, this.factory);
    this.quality = new DataQualityService(this.index, this.store, this.validation);
    this.workflow = new WorkflowService(this.store, this.factory, this.history);
    this.exporter = new RealNexExportService(this.app.vault);
    this.folders = new VaultFolders(this.app.vault);
    this.sampleData = new SampleDataService(this.factory, this.index, this.store, this.history);
    this.registerViews();
    this.registerCommands();
    this.addSettingTab(new NavigatorSettingsTab(this));
    this.addRibbonIcon("radar", PLUGIN_NAME, () => void this.openView(VIEW_TYPES.commandCenter));
    document.body.toggleClass("strive-accent-blue", this.settings.accent === "blue");
    this.registerEvent(this.app.vault.on("create", (file) => void this.handleVaultChange(file)));
    this.registerEvent(this.app.vault.on("modify", (file) => void this.handleVaultChange(file)));
    this.registerEvent(this.app.vault.on("delete", (file) => void this.handleVaultDelete(file)));
    this.registerEvent(this.app.vault.on("rename", (file, oldPath) => void this.handleVaultRename(file, oldPath)));
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
    if (this.store.health().ready) await this.store.syncMarkdownRecords(this.index.all());
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
      const record = this.index.findByPath(file.path);
      if (record) await this.history.record(record.id, "record_created", `${record.name} created`, { type: record.type, path: record.path });
    })).open();
  }

  async openRecord(recordId: string): Promise<void> {
    const record = this.index.findById(recordId) ?? this.store.findById(recordId);
    if (record?.file) await this.app.workspace.getLeaf(false).openFile(record.file);
    else if (record && !record.promoted) {
      const file = await this.importer.promote(record.id);
      if (file) await this.app.workspace.getLeaf(false).openFile(file);
    }
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
    this.registerView(VIEW_TYPES.historyTimeline, (leaf) => new HistoryTimelineView(leaf, this));
    this.registerView(VIEW_TYPES.mapIntelligence, (leaf) => new MapIntelligenceView(leaf, this));
    this.registerView(VIEW_TYPES.importCenter, (leaf) => new ImportCenterView(leaf, this));
    this.registerView(VIEW_TYPES.dataQuality, (leaf) => new DataQualityView(leaf, this));
    this.registerView(VIEW_TYPES.taskCenter, (leaf) => new TaskCenterView(leaf, this));
    this.registerView(VIEW_TYPES.requirementsBoard, (leaf) => new RequirementsBoardView(leaf, this));
    this.registerView(VIEW_TYPES.pursuitPipeline, (leaf) => new PursuitPipelineView(leaf, this));
    this.registerView(VIEW_TYPES.transactionManager, (leaf) => new TransactionManagerView(leaf, this));
    this.registerView(VIEW_TYPES.unifiedSearch, (leaf) => new UnifiedSearchView(leaf, this));
    this.registerView(VIEW_TYPES.company360, (leaf) => new Company360View(leaf, this));
    this.registerView(VIEW_TYPES.contact360, (leaf) => new Contact360View(leaf, this));
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
      ,["open-history-timeline", "Open History Timeline", VIEW_TYPES.historyTimeline]
      ,["open-map-intelligence", "Open Map Intelligence", VIEW_TYPES.mapIntelligence]
      ,["open-import-center", "Open CSV Import Center", VIEW_TYPES.importCenter]
      ,["open-data-quality", "Open Data Quality Center", VIEW_TYPES.dataQuality]
      ,["open-task-center", "Open Task Center", VIEW_TYPES.taskCenter]
      ,["open-requirements-board", "Open Requirements Board", VIEW_TYPES.requirementsBoard]
      ,["open-pursuit-pipeline", "Open Pursuit Pipeline", VIEW_TYPES.pursuitPipeline]
      ,["open-transaction-manager", "Open Transaction Manager", VIEW_TYPES.transactionManager]
      ,["open-unified-search", "Open Unified Search", VIEW_TYPES.unifiedSearch]
      ,["open-company-360", "Open Company 360", VIEW_TYPES.company360]
      ,["open-contact-360", "Open Contact 360", VIEW_TYPES.contact360]
    ];
    views.forEach(([id, name, type]) => this.addCommand({ id, name, callback: () => void this.openView(type) }));
    const creationTypes: RecordType[] = ["property", "parcel", "entity", "person", "investor_profile", "tenant", "lease", "loan", "sale_comp", "lease_comp", "submarket", "deal_signal", "broker_activity", "company", "task", "requirement", "pursuit", "transaction", "document", "timeline_template", "saved_view"];
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
    this.addCommand({ id: "v2-store-health", name: "V2: Check Analytical Store Health", callback: () => this.store.notifyHealth() });
    this.addCommand({ id: "v2-backup-store", name: "V2: Back Up Analytical Store", callback: async () => { const path = await this.store.backup("manual"); new Notice(path ? `STRIVE V2 backup created: ${path}` : "STRIVE V2: no analytical store to back up."); } });
    this.addCommand({ id: "v2-sync-markdown", name: "V2: Sync Markdown To Analytical Store", callback: async () => { await this.rebuildIndex(false); new Notice(`STRIVE V2 synced ${this.index.all().length} Markdown records.`); } });
    this.addCommand({ id: "edit-current-record", name: "V2: Edit Current Record", checkCallback: (checking) => {
      const record = this.activeRecord();
      if (!record) return false;
      if (!checking) new RecordEditorModal(this.app, record, this.factory, this.history, async () => this.rebuildIndex(false)).open();
      return true;
    } });
    this.addCommand({ id: "v2-apply-workflow", name: "V2: Apply Default Workflow To Current Record", checkCallback: (checking) => {
      const record = this.activeRecord();
      const template = this.store.allRecords("timeline_template")[0] ?? this.index.findByType("timeline_template")[0];
      if (!record || !template) return false;
      if (!checking) void this.workflow.applyTemplate(template, record, String(record.assigned_broker ?? record.relationship_owner_at_strive ?? "Unassigned")).then((tasks) => new Notice(`STRIVE V2 created ${tasks.length} workflow tasks.`));
      return true;
    } });
    this.addCommand({ id: "v2-create-task-current", name: "V2: Create Task For Current Record", checkCallback: (checking) => {
      const record = this.activeRecord();
      if (!record) return false;
      if (!checking) void this.factory.create("task", `Follow up · ${record.name}`, { status: "open", priority: "normal", assigned_to: record.assigned_broker ?? record.relationship_owner_at_strive ?? "", due_date: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10), related_records: [record.id], next_action: `Advance ${record.name}` }, true).then(async (file) => {
        await this.app.workspace.getLeaf(false).openFile(file);
        await this.rebuildIndex(false);
        await this.history.record(record.id, "task_created", `Follow-up task created for ${record.name}`, { task_path: file.path });
      });
      return true;
    } });
    this.addCommand({ id: "v2-start-pursuit-current", name: "V2: Start Pursuit For Current Property", checkCallback: (checking) => {
      const record = this.activeRecord();
      if (!record || record.type !== "property") return false;
      if (!checking) void this.factory.create("pursuit", `${record.name} Investment Sales Pursuit`, { property: record.id, owner: record.owner_entity ?? "", contacts: record.beneficial_owner ? [record.beneficial_owner] : [], stage: "research", probability: 15, expected_fee: "", assigned_broker: "", next_action: "Confirm ownership and decision maker.", next_action_date: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10) }, true).then(async (file) => {
        await this.app.workspace.getLeaf(false).openFile(file);
        await this.rebuildIndex(false);
        await this.history.record(record.id, "pursuit_started", `Investment-sales pursuit started for ${record.name}`, { pursuit_path: file.path });
      });
      return true;
    } });
  }

  private createRelationship(): void {
    new CreateRelationshipModal(this.app, async (value) => {
      const file = await this.factory.create("relationship_edge", `${value.relationship_type} ${value.from} to ${value.to}`, { ...value, confidence: "C", status: "inferred", weight: 0.65, human_review: true, source_status: "inferred" }, true);
      await this.rebuildIndex(false);
      const edge = this.index.findByPath(file.path);
      if (edge) await this.history.record(edge.id, "relationship_created", `${value.relationship_type} relationship created`, { ...value });
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

  private async handleVaultChange(file: TAbstractFile): Promise<void> {
    if (!(file instanceof TFile) || file.extension !== "md") return;
    const record = await this.index.indexFile(file);
    if (record && this.store.health().ready) await this.store.upsertRecord(record, true);
  }

  private async handleVaultDelete(file: TAbstractFile): Promise<void> {
    if (!(file instanceof TFile) || file.extension !== "md") return;
    this.index.removePath(file.path);
    if (this.store.health().ready) await this.store.removeByPath(file.path);
  }

  private async handleVaultRename(file: TAbstractFile, oldPath: string): Promise<void> {
    this.index.removePath(oldPath);
    if (this.store.health().ready) await this.store.removeByPath(oldPath);
    await this.handleVaultChange(file);
  }
}
