import type { App, WorkspaceLeaf } from "obsidian";
import type { NavigatorSettings, RecordType } from "./types";
import type { MetadataIndex } from "./services/MetadataIndex";
import type { RecordFactory } from "./services/RecordFactory";
import type { ValidationService } from "./services/Validation";
import type { RealNexExportService } from "./services/RealNexExport";

export interface NavigatorContext {
  app: App;
  index: MetadataIndex;
  factory: RecordFactory;
  validation: ValidationService;
  exporter: RealNexExportService;
  settings: NavigatorSettings;
  openView(type: string): Promise<WorkspaceLeaf>;
  rebuildIndex(showNotice?: boolean): Promise<void>;
  createRecord(type: RecordType): Promise<void>;
}

