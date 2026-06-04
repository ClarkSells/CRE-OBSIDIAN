import type { WorkspaceLeaf } from "obsidian";
import { VIEW_TYPES } from "../constants";
import type { NavigatorContext } from "../NavigatorContext";
import type { NavigatorRecord } from "../types";
import { BaseNavigatorView } from "./BaseNavigatorView";
import { pageHeader, section } from "./ui";

const SVG_NS = "http://www.w3.org/2000/svg";

export class RelationshipGraphView extends BaseNavigatorView {
  constructor(leaf: WorkspaceLeaf, plugin: NavigatorContext) { super(leaf, plugin); }
  getViewType(): string { return VIEW_TYPES.relationshipGraph; }
  getDisplayText(): string { return "STRIVE Relationship Graph"; }
  getIcon(): string { return "network"; }

  protected render(): void {
    pageHeader(this.root, "GRAPH INTELLIGENCE", "Relationship Graph", "A visual ownership, tenancy, debt, and signal network. Click a node to open its Markdown record.");
    const edges = this.plugin.index.findByType("relationship_edge").slice(0, 40);
    const nodeMap = new Map<string, NavigatorRecord>();
    for (const edge of edges) {
      const from = this.plugin.index.findById(edge.from);
      const to = this.plugin.index.findById(edge.to);
      if (from) nodeMap.set(from.id, from);
      if (to) nodeMap.set(to.id, to);
    }
    const nodes = [...nodeMap.values()].slice(0, 34);
    const graphBlock = section(this.root, "Demo Relationship Network", `${nodes.length} nodes · ${edges.length} edges`);
    const wrap = graphBlock.createDiv({ cls: "strive-graph-wrap" });
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("viewBox", "0 0 1100 680");
    svg.setAttribute("class", "strive-graph");
    wrap.appendChild(svg);
    const positions = new Map<string, [number, number]>();
    nodes.forEach((node, index) => {
      const angle = (index / Math.max(nodes.length, 1)) * Math.PI * 2;
      const ring = index % 3;
      const radius = 150 + ring * 90;
      positions.set(node.id, [550 + Math.cos(angle) * radius, 340 + Math.sin(angle) * radius]);
    });
    for (const edge of edges) {
      const a = positions.get(String(edge.from));
      const b = positions.get(String(edge.to));
      if (!a || !b) continue;
      const line = document.createElementNS(SVG_NS, "line");
      line.setAttribute("x1", String(a[0])); line.setAttribute("y1", String(a[1]));
      line.setAttribute("x2", String(b[0])); line.setAttribute("y2", String(b[1]));
      line.setAttribute("class", "strive-graph-edge");
      const title = document.createElementNS(SVG_NS, "title");
      title.textContent = String(edge.relationship_type);
      line.appendChild(title);
      svg.appendChild(line);
      if (edges.indexOf(edge) < 16) {
        const label = document.createElementNS(SVG_NS, "text");
        label.setAttribute("x", String((a[0] + b[0]) / 2));
        label.setAttribute("y", String((a[1] + b[1]) / 2));
        label.setAttribute("class", "strive-graph-edge-label");
        label.textContent = String(edge.relationship_type).replace(/PROPERTY_|ENTITY_|DEAL_SIGNAL_/g, "").replace(/_/g, " ").slice(0, 24);
        svg.appendChild(label);
      }
    }
    for (const node of nodes) {
      const [x, y] = positions.get(node.id)!;
      const group = document.createElementNS(SVG_NS, "g");
      group.setAttribute("class", `strive-graph-node node-${node.type}`);
      group.addEventListener("click", () => this.openRecord(node));
      const circle = document.createElementNS(SVG_NS, "circle");
      circle.setAttribute("cx", String(x)); circle.setAttribute("cy", String(y)); circle.setAttribute("r", node.type === "property" ? "28" : "20");
      group.appendChild(circle);
      const label = document.createElementNS(SVG_NS, "text");
      label.setAttribute("x", String(x)); label.setAttribute("y", String(y + 39)); label.textContent = node.name.slice(0, 24);
      group.appendChild(label);
      svg.appendChild(group);
    }
    if (this.mode === "agent") {
      const edgeSection = section(this.root, "Relationship Edge Ledger", "Machine-readable edge records");
      for (const edge of edges.slice(0, 20)) edgeSection.createDiv({ cls: "strive-edge-row", text: `${edge.from} —[${edge.relationship_type}]→ ${edge.to} · ${edge.confidence}` });
    }
  }
}
