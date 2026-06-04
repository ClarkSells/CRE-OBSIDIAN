import { MetadataCache, parseYaml, TFile, Vault } from "obsidian";
import { RECORD_TYPES, type LinkedPropertyRecords, type NavigatorRecord, type RecordType } from "../types";
import { asStringArray } from "../utils/format";

export class MetadataIndex {
  private byId = new Map<string, NavigatorRecord>();
  private byType = new Map<RecordType, NavigatorRecord[]>();
  private byPath = new Map<string, NavigatorRecord>();
  private edgeAdjacency = new Map<string, NavigatorRecord[]>();

  constructor(private vault: Vault, private metadataCache: MetadataCache) {
    for (const type of RECORD_TYPES) this.byType.set(type, []);
  }

  async rebuild(): Promise<void> {
    this.byId.clear();
    this.byPath.clear();
    this.edgeAdjacency.clear();
    for (const type of RECORD_TYPES) this.byType.set(type, []);
    for (const file of this.vault.getMarkdownFiles()) {
      await this.indexFile(file, false);
    }
    for (const records of this.byType.values()) records.sort((a, b) => a.name.localeCompare(b.name));
  }

  async indexFile(file: TFile, sort = true): Promise<NavigatorRecord | undefined> {
    this.removePath(file.path, false);
    const frontmatter = await this.frontmatterFor(file);
    if (!frontmatter || !RECORD_TYPES.includes(frontmatter.type as RecordType) || !frontmatter.id) return undefined;
    const record = { ...frontmatter, type: frontmatter.type as RecordType, id: String(frontmatter.id), name: String(frontmatter.name ?? file.basename), path: file.path, file } as NavigatorRecord;
    const previous = this.byId.get(record.id);
    if (previous && previous.path !== record.path) this.removePath(previous.path, false);
    this.byId.set(record.id, record);
    this.byPath.set(record.path, record);
    this.byType.get(record.type)?.push(record);
    if (record.type === "relationship_edge") this.addEdge(record);
    if (sort) this.byType.get(record.type)?.sort((a, b) => a.name.localeCompare(b.name));
    return record;
  }

  removePath(path: string, sort = true): NavigatorRecord | undefined {
    const record = this.byPath.get(path);
    if (!record) return undefined;
    this.byPath.delete(path);
    this.byId.delete(record.id);
    this.byType.set(record.type, (this.byType.get(record.type) ?? []).filter((candidate) => candidate.path !== path));
    if (record.type === "relationship_edge") this.removeEdge(record);
    if (sort) this.byType.get(record.type)?.sort((a, b) => a.name.localeCompare(b.name));
    return record;
  }

  findByPath(path: string): NavigatorRecord | undefined {
    return this.byPath.get(path);
  }

  private async frontmatterFor(file: TFile): Promise<Record<string, unknown> | null> {
    const cached = this.metadataCache.getFileCache(file)?.frontmatter;
    if (cached) return { ...cached };
    const content = await this.vault.cachedRead(file);
    const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!match) return null;
    try {
      return parseYaml(match[1]) as Record<string, unknown>;
    } catch {
      return null;
    }
  }

  all(): NavigatorRecord[] {
    return [...this.byId.values()];
  }

  count(type: RecordType): number {
    return this.byType.get(type)?.length ?? 0;
  }

  counts(): Record<RecordType, number> {
    return Object.fromEntries(RECORD_TYPES.map((type) => [type, this.count(type)])) as Record<RecordType, number>;
  }

  findById(id: unknown): NavigatorRecord | undefined {
    return typeof id === "string" ? this.byId.get(id.replace(/^\[\[|\]\]$/g, "")) : undefined;
  }

  findByType(type: RecordType): NavigatorRecord[] {
    return [...(this.byType.get(type) ?? [])];
  }

  search(query: string): NavigatorRecord[] {
    const needle = query.toLowerCase();
    return this.all().filter((record) => `${record.name} ${record.address ?? ""} ${record.id}`.toLowerCase().includes(needle));
  }

  relationshipsFor(id: string): NavigatorRecord[] {
    return [...(this.edgeAdjacency.get(id) ?? [])];
  }

  resolveMany(values: unknown, type?: RecordType): NavigatorRecord[] {
    return asStringArray(values).map((id) => this.findById(id)).filter((record): record is NavigatorRecord => Boolean(record) && (!type || record?.type === type));
  }

  linkedProperty(property: NavigatorRecord): LinkedPropertyRecords {
    const id = property.id;
    const edges = this.relationshipsFor(id);
    const edgeTargets = edges.map((edge) => this.findById(edge.from === id ? edge.to : edge.from)).filter((record): record is NavigatorRecord => Boolean(record));
    const linked = (type: RecordType, direct: NavigatorRecord[] = []): NavigatorRecord[] => {
      const candidates = [...direct, ...edgeTargets.filter((record) => record.type === type), ...this.findByType(type).filter((record) => record.property === id || record.related_property === id)];
      return [...new Map(candidates.map((record) => [record.id, record])).values()];
    };
    return {
      property,
      parcels: linked("parcel", this.resolveMany(property.parcel_ids, "parcel")),
      entities: linked("entity", this.resolveMany(property.owner_entity, "entity")),
      people: linked("person", this.resolveMany(property.beneficial_owner, "person")),
      tenants: linked("tenant", this.resolveMany(property.tenant_ids, "tenant")),
      leases: linked("lease", this.resolveMany(property.lease_ids, "lease")),
      loans: linked("loan", this.resolveMany(property.loan_ids, "loan")),
      saleComps: linked("sale_comp", this.resolveMany(property.sale_comp_ids, "sale_comp")),
      leaseComps: linked("lease_comp", this.resolveMany(property.lease_comp_ids, "lease_comp")),
      activities: linked("broker_activity"),
      signals: linked("deal_signal"),
      edges
    };
  }

  private addEdge(edge: NavigatorRecord): void {
    for (const id of [edge.from, edge.to].map(String).filter(Boolean)) this.edgeAdjacency.set(id, [...(this.edgeAdjacency.get(id) ?? []), edge]);
  }

  private removeEdge(edge: NavigatorRecord): void {
    for (const id of [edge.from, edge.to].map(String).filter(Boolean)) this.edgeAdjacency.set(id, (this.edgeAdjacency.get(id) ?? []).filter((candidate) => candidate.id !== edge.id));
  }
}
