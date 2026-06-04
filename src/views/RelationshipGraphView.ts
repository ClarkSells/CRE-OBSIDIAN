import type { WorkspaceLeaf } from "obsidian";
import cytoscape, { type Core } from "cytoscape";
import { VIEW_TYPES } from "../constants";
import type { NavigatorContext } from "../NavigatorContext";
import { BaseNavigatorView } from "./BaseNavigatorView";
import { empty, pageHeader, section } from "./ui";

export class RelationshipGraphView extends BaseNavigatorView {
  private cy?: Core;
  private focusId?: string;
  private relationshipTypes: string[] = [];
  constructor(leaf: WorkspaceLeaf, plugin: NavigatorContext) { super(leaf, plugin); }
  getViewType(): string { return VIEW_TYPES.relationshipGraph; }
  getDisplayText(): string { return "STRIVE Relationship Explorer"; }
  getIcon(): string { return "network"; }
  async onClose(): Promise<void> { this.cy?.destroy(); }

  protected render(): void {
    const active = this.plugin.app.workspace.getActiveFile();
    const activeRecord = active ? this.plugin.index.findByPath(active.path) : undefined;
    this.focusId ??= activeRecord?.id ?? this.plugin.index.findByType("property")[0]?.id ?? this.plugin.store.allRecords("property")[0]?.id;
    pageHeader(this.root, "TEMPORAL GRAPH INTELLIGENCE", "Relationship Explorer", "Traverse ownership, control, tenancy, debt, comps, signals, and shared attributes with evidence-aware path explanations.");
    if (!this.focusId) return empty(this.root, "Create or import records and relationship edges to explore the graph.");
    const controls = this.root.createDiv({ cls: "strive-filter-bar" });
    const search = controls.createEl("input", { cls: "strive-select", type: "search", placeholder: "Focus record ID or name" });
    const depth = controls.createEl("select", { cls: "strive-select" });
    [1, 2, 3, 4, 5].forEach((value) => depth.createEl("option", { value: String(value), text: `${value} hop${value === 1 ? "" : "s"}` }));
    depth.value = "2";
    const asOf = controls.createEl("input", { cls: "strive-select", type: "date" });
    const relationship = controls.createEl("select", { cls: "strive-select" });
    relationship.createEl("option", { value: "all", text: "All relationship types" });
    [...new Set(this.plugin.graph.edges().map((edge) => edge.relationship_type))].forEach((value) => relationship.createEl("option", { value, text: value.replace(/_/g, " ") }));
    const save = controls.createEl("button", { text: "Save graph view" });
    const redraw = () => this.drawGraph(Number(depth.value), asOf.value || undefined);
    depth.addEventListener("change", redraw); asOf.addEventListener("change", redraw);
    relationship.addEventListener("change", () => { this.relationshipTypes = relationship.value === "all" ? [] : [relationship.value]; redraw(); });
    save.addEventListener("click", async () => {
      const file = await this.plugin.factory.create("saved_view", `Relationship View · ${this.focusId}`, { view_type: "relationship_graph", filters: { focus_id: this.focusId, depth: Number(depth.value), as_of: asOf.value, relationship_types: this.relationshipTypes }, columns: [], sort: "", owner: "STRIVE", shared: true });
      await this.plugin.rebuildIndex(false);
      const saved = this.plugin.index.findByPath(file.path);
      if (saved) await this.plugin.history.record(saved.id, "saved_graph_view_created", `${saved.name} created`, { focus_id: this.focusId, depth: Number(depth.value), as_of: asOf.value, relationship_types: this.relationshipTypes });
    });
    search.addEventListener("change", () => {
      const match = this.plugin.store.search(search.value, 1)[0] ?? this.plugin.index.search(search.value)[0];
      if (match) { this.focusId = match.id; redraw(); }
    });
    const graphBlock = section(this.root, "Focused Relationship Neighborhood", "Click a node to open its dossier; use date for an as-of snapshot");
    graphBlock.createDiv({ cls: "strive-cytoscape", attr: { id: "strive-cytoscape" } });
    const pathBlock = section(this.root, "How Are These Related?", "Explain the shortest evidence path between two records");
    const from = pathBlock.createEl("input", { cls: "strive-select", placeholder: "From record ID" });
    const to = pathBlock.createEl("input", { cls: "strive-select", placeholder: "To record ID" });
    const button = pathBlock.createEl("button", { text: "Explain path" });
    const explanation = pathBlock.createDiv({ cls: "strive-path-explanation" });
    button.addEventListener("click", () => {
      explanation.empty();
      const path = this.plugin.graph.shortestPath(from.value, to.value, asOf.value || undefined);
      if (!path) return empty(explanation, "No relationship path found.");
      path.explanation.forEach((line) => explanation.createDiv({ cls: "strive-edge-row", text: line }));
    });
    const clusters = section(this.root, "Relationship Clusters", "Shared registered agents, addresses, lenders, and tenants");
    for (const cluster of this.plugin.graph.clusters().slice(0, 25)) clusters.createDiv({ cls: "strive-edge-row", text: `${cluster.key.replace(/_/g, " ")} · ${cluster.label} · ${cluster.recordIds.length} linked records` });
    window.setTimeout(redraw, 0);
  }

  private drawGraph(depth: number, asOf?: string): void {
    const container = this.root.querySelector("#strive-cytoscape") as HTMLElement | null;
    if (!container || !this.focusId) return;
    this.cy?.destroy();
    const graph = this.plugin.graph.neighborhood(this.focusId, depth, asOf, this.relationshipTypes);
    this.cy = cytoscape({
      container,
      elements: [
        ...graph.nodes.map((node) => ({ data: { id: node.id, label: node.name, type: node.type, confidence: node.confidence_tier } })),
        ...graph.edges.map((edge) => ({ data: { id: edge.id, source: edge.from, target: edge.to, label: edge.relationship_type.replace(/_/g, " "), status: edge.status, confidence: edge.confidence } }))
      ],
      layout: { name: "cose", animate: false, nodeRepulsion: () => 6500, idealEdgeLength: () => 120 },
      style: [
        { selector: "node", style: { "background-color": "#172638", "border-color": "#4fa7ff", "border-width": 2, label: "data(label)", color: "#c7d2de", "font-size": 9, "text-wrap": "wrap", "text-max-width": 100, "text-valign": "bottom", "text-margin-y": 8, width: 32, height: 32 } },
        { selector: "node[type = 'property']", style: { "background-color": "#382c19", "border-color": "#d6aa55", width: 44, height: 44 } },
        { selector: "node[type = 'entity']", style: { "background-color": "#182d27", "border-color": "#47c995" } },
        { selector: "node[type = 'deal_signal']", style: { "background-color": "#361b1c", "border-color": "#f06b55" } },
        { selector: "edge", style: { width: 1.5, "line-color": "#526b82", "target-arrow-color": "#526b82", "target-arrow-shape": "triangle", "curve-style": "bezier", label: "data(label)", color: "#91a1b3", "font-size": 6, "text-background-color": "#070b11", "text-background-opacity": 0.85, "text-background-padding": 2 } },
        { selector: "edge[status = 'inferred']", style: { "line-style": "dashed", "line-color": "#e4b957" } },
        { selector: ":selected", style: { "border-color": "#ffffff", "line-color": "#ffffff", "target-arrow-color": "#ffffff" } }
      ] as never
    });
    this.cy.on("tap", "node", (event) => void this.plugin.openRecord(String(event.target.id())));
  }
}
