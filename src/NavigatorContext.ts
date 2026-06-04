import type { App, WorkspaceLeaf } from "obsidian";
import type { NavigatorSettings, RecordType } from "./types";
import type { MetadataIndex } from "./services/MetadataIndex";
import type { RecordFactory } from "./services/RecordFactory";
import type { ValidationService } from "./services/Validation";
import type { RealNexExportService } from "./services/RealNexExport";
import type { AnalyticalStore } from "./services/AnalyticalStore";
import type { HistoryService } from "./services/HistoryService";
import type { GraphService } from "./services/GraphService";
import type { SpatialService } from "./services/SpatialService";
import type { ImportService } from "./services/ImportService";
import type { DataQualityService } from "./services/DataQualityService";
import type { WorkflowService } from "./services/WorkflowService";

export interface NavigatorContext {
  app: App;
  index: MetadataIndex;
  factory: RecordFactory;
  validation: ValidationService;
  exporter: RealNexExportService;
  store: AnalyticalStore;
  history: HistoryService;
  graph: GraphService;
  spatial: SpatialService;
  importer: ImportService;
  quality: DataQualityService;
  workflow: WorkflowService;
  settings: NavigatorSettings;
  openView(type: string): Promise<WorkspaceLeaf>;
  rebuildIndex(showNotice?: boolean): Promise<void>;
  createRecord(type: RecordType): Promise<void>;
  openRecord(recordId: string): Promise<void>;
}
