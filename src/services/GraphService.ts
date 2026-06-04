import type { GraphNeighborhood, GraphPath, NavigatorRecord, TemporalEdge } from "../types";
import { AnalyticalStore } from "./AnalyticalStore";
import { MetadataIndex } from "./MetadataIndex";

export class GraphService {
  constructor(private index: MetadataIndex, private store: AnalyticalStore) {}

  edges(asOf?: string): TemporalEdge[] {
    const stored = this.store.temporalEdges(asOf);
    if (stored.length) return stored;
    return this.index.findByType("relationship_edge").map((edge) => ({
      id: edge.id, from: String(edge.from), to: String(edge.to), relationship_type: String(edge.relationship_type),
      confidence: String(edge.confidence ?? edge.confidence_tier ?? "C") as TemporalEdge["confidence"],
      status: String(edge.status ?? "active") as TemporalEdge["status"], weight: Number(edge.weight ?? 1),
      valid_from: edge.valid_from as string | undefined, valid_to: edge.valid_to as string | undefined,
      evidence_ids: Array.isArray(edge.evidence_ids) ? edge.evidence_ids.map(String) : [],
      last_verified: edge.last_verified as string | undefined, human_review: Boolean(edge.human_review), source: edge.source as string | undefined
    }));
  }

  neighborhood(startId: string, depth = 2, asOf?: string, relationshipTypes: string[] = []): GraphNeighborhood {
    const edges = this.edges(asOf).filter((edge) => relationshipTypes.length === 0 || relationshipTypes.includes(edge.relationship_type));
    const adjacency = this.adjacency(edges);
    const visited = new Set<string>([startId]);
    let frontier = [startId];
    for (let level = 0; level < Math.max(0, Math.min(depth, 6)); level++) {
      const next: string[] = [];
      for (const id of frontier) {
        for (const edge of adjacency.get(id) ?? []) {
          const other = edge.from === id ? edge.to : edge.from;
          if (!visited.has(other)) { visited.add(other); next.push(other); }
        }
      }
      frontier = next;
    }
    const nodes = [...visited].map((id) => this.resolve(id)).filter((record): record is NavigatorRecord => Boolean(record));
    const includedEdges = edges.filter((edge) => visited.has(edge.from) && visited.has(edge.to));
    return { nodes, edges: includedEdges };
  }

  shortestPath(from: string, to: string, asOf?: string): GraphPath | undefined {
    if (from === to) {
      const record = this.resolve(from);
      return record ? { nodes: [record], edges: [], explanation: [record.name] } : undefined;
    }
    const edges = this.edges(asOf);
    const adjacency = this.adjacency(edges);
    const queue = [from];
    const previous = new Map<string, { id: string; edge: TemporalEdge }>();
    const visited = new Set<string>([from]);
    while (queue.length) {
      const current = queue.shift()!;
      for (const edge of adjacency.get(current) ?? []) {
        const other = edge.from === current ? edge.to : edge.from;
        if (visited.has(other)) continue;
        visited.add(other);
        previous.set(other, { id: current, edge });
        if (other === to) return this.buildPath(from, to, previous);
        queue.push(other);
      }
    }
    return undefined;
  }

  ownershipChain(propertyId: string, asOf?: string): GraphNeighborhood {
    const ownershipTypes = ["PROPERTY_OWNED_BY_ENTITY", "ENTITY_CONTROLLED_BY_PERSON", "PERSON_CONTROLS_ENTITY", "ENTITY_PARENT_OF_ENTITY"];
    return this.neighborhood(propertyId, 5, asOf, ownershipTypes);
  }

  clusters(): Array<{ key: string; label: string; recordIds: string[] }> {
    const groups = new Map<string, Set<string>>();
    const group = (key: string, label: string, ids: string[]) => {
      const set = groups.get(`${key}|${label}`) ?? new Set<string>();
      ids.forEach((id) => set.add(id));
      groups.set(`${key}|${label}`, set);
    };
    for (const record of this.store.allRecords()) {
      if (record.registered_agent) group("registered_agent", String(record.registered_agent), [record.id]);
      if (record.principal_office_address) group("address", String(record.principal_office_address).toLowerCase(), [record.id]);
      if (record.lender) group("lender", String(record.lender), [record.id]);
      if (record.tenant) group("tenant", String(record.tenant), [record.id]);
    }
    return [...groups.entries()].filter(([, ids]) => ids.size > 1).map(([key, ids]) => {
      const [kind, label] = key.split("|");
      return { key: kind, label, recordIds: [...ids] };
    });
  }

  private resolve(id: string): NavigatorRecord | undefined {
    return this.index.findById(id) ?? this.store.findById(id);
  }

  private adjacency(edges: TemporalEdge[]): Map<string, TemporalEdge[]> {
    const adjacency = new Map<string, TemporalEdge[]>();
    for (const edge of edges) {
      adjacency.set(edge.from, [...(adjacency.get(edge.from) ?? []), edge]);
      adjacency.set(edge.to, [...(adjacency.get(edge.to) ?? []), edge]);
    }
    return adjacency;
  }

  private buildPath(from: string, to: string, previous: Map<string, { id: string; edge: TemporalEdge }>): GraphPath | undefined {
    const ids = [to];
    const edges: TemporalEdge[] = [];
    let current = to;
    while (current !== from) {
      const step = previous.get(current);
      if (!step) return undefined;
      edges.unshift(step.edge);
      current = step.id;
      ids.unshift(current);
    }
    const nodes = ids.map((id) => this.resolve(id)).filter((record): record is NavigatorRecord => Boolean(record));
    const explanation = edges.map((edge, index) => `${nodes[index]?.name ?? edge.from} --${edge.relationship_type.replace(/_/g, " ")}--> ${nodes[index + 1]?.name ?? edge.to}`);
    return { nodes, edges, explanation };
  }
}

