import type { WorkspaceLeaf } from "obsidian";
import maplibregl, { type GeoJSONSource, type Map as MapLibreMap } from "maplibre-gl";
import { Protocol } from "pmtiles";
import { VIEW_TYPES } from "../constants";
import type { NavigatorContext } from "../NavigatorContext";
import type { NavigatorRecord } from "../types";
import { BaseNavigatorView } from "./BaseNavigatorView";
import { empty, pageHeader, section } from "./ui";

let pmtilesRegistered = false;

export class MapIntelligenceView extends BaseNavigatorView {
  private map?: MapLibreMap;
  private records: NavigatorRecord[] = [];
  constructor(leaf: WorkspaceLeaf, plugin: NavigatorContext) { super(leaf, plugin); }
  getViewType(): string { return VIEW_TYPES.mapIntelligence; }
  getDisplayText(): string { return "STRIVE Map Intelligence"; }
  getIcon(): string { return "map"; }
  async onClose(): Promise<void> { this.map?.remove(); }

  protected render(): void {
    pageHeader(this.root, "SPATIAL INTELLIGENCE", "Map Intelligence", "Explore properties, comps, ownership portfolios, signals, loans, and requirements with local record coordinates.");
    const all = [...this.plugin.store.allRecords(), ...this.plugin.index.all()];
    this.records = [...new Map(all.map((record) => [record.id, record])).values()].filter((record) => ["property", "sale_comp", "lease_comp"].includes(record.type));
    const points = this.plugin.spatial.points(this.records);
    const controls = this.root.createDiv({ cls: "strive-filter-bar" });
    const asset = controls.createEl("select", { cls: "strive-select" });
    asset.createEl("option", { value: "all", text: "All asset classes" });
    [...new Set(points.map((record) => String(record.asset_class || "")).filter(Boolean))].forEach((value) => asset.createEl("option", { value, text: value }));
    const submarket = controls.createEl("select", { cls: "strive-select" });
    submarket.createEl("option", { value: "all", text: "All submarkets" });
    [...new Set(points.map((record) => String(record.submarket || "")).filter(Boolean))].forEach((value) => submarket.createEl("option", { value, text: this.plugin.store.findById(value)?.name ?? this.plugin.index.findById(value)?.name ?? value }));
    const owner = controls.createEl("select", { cls: "strive-select" });
    owner.createEl("option", { value: "all", text: "All owners" });
    [...new Set(points.map((record) => String(record.owner_entity || "")).filter(Boolean))].forEach((value) => owner.createEl("option", { value, text: this.plugin.store.findById(value)?.name ?? this.plugin.index.findById(value)?.name ?? value }));
    const confidence = controls.createEl("select", { cls: "strive-select" });
    confidence.createEl("option", { value: "all", text: "All confidence tiers" });
    ["A", "B", "C", "D", "F"].forEach((value) => confidence.createEl("option", { value, text: `Confidence ${value}` }));
    const signal = controls.createEl("input", { cls: "strive-select", type: "number", placeholder: "Minimum signal score" });
    const radius = controls.createEl("input", { cls: "strive-select", type: "number", placeholder: "Radius miles" });
    radius.setAttr("min", "1"); radius.setAttr("value", "5");
    const polygon = controls.createEl("input", { cls: "strive-select", placeholder: "Polygon: lng,lat; lng,lat; …" });
    const corridor = controls.createEl("input", { cls: "strive-select", placeholder: "Corridor: lng,lat; lng,lat; miles" });
    const applyPolygon = controls.createEl("button", { text: "Apply polygon" });
    const applyCorridor = controls.createEl("button", { text: "Apply corridor" });
    const reset = controls.createEl("button", { text: "Reset map filter" });
    const block = section(this.root, "DFW Intelligence Map", `${points.length} mapped records`);
    if (!points.length) return empty(block, "No records contain valid latitude and longitude. Import coordinates or generate the V2 demo dataset.");
    const container = block.createDiv({ cls: "strive-map" });
    this.initializeMap(container, points);
    const applyFilters = () => this.updateMap(points.filter((record) =>
      (asset.value === "all" || record.asset_class === asset.value)
      && (submarket.value === "all" || record.submarket === submarket.value)
      && (owner.value === "all" || record.owner_entity === owner.value)
      && (confidence.value === "all" || record.confidence_tier === confidence.value)
      && (!signal.value || Number(record.deal_signal_score || 0) >= Number(signal.value))
    ));
    asset.addEventListener("change", applyFilters); submarket.addEventListener("change", applyFilters); owner.addEventListener("change", applyFilters); confidence.addEventListener("change", applyFilters); signal.addEventListener("change", applyFilters);
    radius.addEventListener("change", () => {
      const center = this.map?.getCenter();
      if (!center) return;
      this.updateMap(this.plugin.spatial.withinRadius(points, center.lat, center.lng, Number(radius.value || 5)));
    });
    applyPolygon.addEventListener("click", () => this.updateMap(this.plugin.spatial.withinPolygon(points, this.parsePoints(polygon.value))));
    applyCorridor.addEventListener("click", () => {
      const parts = corridor.value.split(";").map((part) => part.trim()).filter(Boolean);
      const coords = parts.slice(0, 2).map((part) => part.split(",").map(Number) as [number, number]);
      if (coords.length === 2) this.updateMap(this.plugin.spatial.withinCorridor(points, coords[0], coords[1], Number(parts[2] || 2)));
    });
    reset.addEventListener("click", () => this.updateMap(points));
  }

  private initializeMap(container: HTMLElement, points: NavigatorRecord[]): void {
    if (!pmtilesRegistered) {
      const protocol = new Protocol();
      maplibregl.addProtocol("pmtiles", protocol.tile);
      pmtilesRegistered = true;
    }
    try {
      this.map = new maplibregl.Map({ container, style: this.plugin.settings.mapStyleUrl, center: [-96.9, 32.9], zoom: 8 });
      this.map.on("load", () => {
        this.map?.addSource("strive-records", { type: "geojson", data: this.plugin.spatial.geoJson(points), cluster: true, clusterRadius: 45 });
        this.map?.addLayer({ id: "strive-clusters", type: "circle", source: "strive-records", filter: ["has", "point_count"], paint: { "circle-color": "#d6aa55", "circle-radius": ["step", ["get", "point_count"], 16, 25, 22, 100, 30], "circle-opacity": 0.86 } });
        this.map?.addLayer({ id: "strive-points", type: "circle", source: "strive-records", filter: ["!", ["has", "point_count"]], paint: { "circle-color": ["match", ["get", "type"], "sale_comp", "#4fa7ff", "lease_comp", "#47c995", "#d6aa55"], "circle-radius": 7, "circle-stroke-color": "#07101a", "circle-stroke-width": 2 } });
        this.map?.on("click", "strive-points", (event) => {
          const id = String(event.features?.[0]?.properties?.id ?? "");
          if (id) void this.plugin.openRecord(id);
        });
        const bounds = this.plugin.spatial.bounds(points);
        if (bounds) this.map?.fitBounds(bounds, { padding: 60, maxZoom: 13 });
        void this.loadLocalGeoJson();
      });
      this.map.on("error", (event) => console.warn("STRIVE MapLibre warning", event.error));
    } catch (error) {
      container.createDiv({ cls: "strive-warning-panel", text: `MapLibre could not initialize. Local spatial filters remain available. ${error instanceof Error ? error.message : String(error)}` });
    }
  }

  private updateMap(records: NavigatorRecord[]): void {
    const source = this.map?.getSource("strive-records") as GeoJSONSource | undefined;
    source?.setData(this.plugin.spatial.geoJson(records));
  }

  private parsePoints(value: string): Array<[number, number]> {
    return value.split(";").map((part) => part.trim().split(",").map(Number) as [number, number]).filter(([lng, lat]) => Number.isFinite(lng) && Number.isFinite(lat));
  }

  private async loadLocalGeoJson(): Promise<void> {
    if (!this.map) return;
    const files = this.plugin.app.vault.getFiles().filter((file) => file.path.startsWith("Imports/") && file.extension.toLowerCase() === "geojson");
    for (const [index, file] of files.entries()) {
      try {
        const data = JSON.parse(await this.plugin.app.vault.cachedRead(file));
        const sourceId = `local-overlay-${index}`;
        this.map.addSource(sourceId, { type: "geojson", data });
        this.map.addLayer({ id: `${sourceId}-fill`, type: "fill", source: sourceId, filter: ["==", ["geometry-type"], "Polygon"], paint: { "fill-color": "#4fa7ff", "fill-opacity": 0.12, "fill-outline-color": "#4fa7ff" } });
        this.map.addLayer({ id: `${sourceId}-line`, type: "line", source: sourceId, filter: ["==", ["geometry-type"], "LineString"], paint: { "line-color": "#d6aa55", "line-width": 2 } });
      } catch (error) {
        console.warn(`STRIVE Map could not load ${file.path}`, error);
      }
    }
  }
}
