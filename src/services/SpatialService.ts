import type { NavigatorRecord } from "../types";

export class SpatialService {
  points(records: NavigatorRecord[]): NavigatorRecord[] {
    return records.filter((record) => Number.isFinite(Number(record.lat)) && Number.isFinite(Number(record.lng)));
  }

  withinRadius(records: NavigatorRecord[], lat: number, lng: number, miles: number): NavigatorRecord[] {
    return this.points(records).filter((record) => this.distanceMiles(lat, lng, Number(record.lat), Number(record.lng)) <= miles);
  }

  withinPolygon(records: NavigatorRecord[], polygon: Array<[number, number]>): NavigatorRecord[] {
    if (polygon.length < 3) return [];
    return this.points(records).filter((record) => {
      const x = Number(record.lng); const y = Number(record.lat);
      let inside = false;
      for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const [xi, yi] = polygon[i]; const [xj, yj] = polygon[j];
        if (((yi > y) !== (yj > y)) && x < (xj - xi) * (y - yi) / ((yj - yi) || Number.EPSILON) + xi) inside = !inside;
      }
      return inside;
    });
  }

  withinCorridor(records: NavigatorRecord[], start: [number, number], end: [number, number], miles: number): NavigatorRecord[] {
    return this.points(records).filter((record) => this.pointToSegmentMiles([Number(record.lng), Number(record.lat)], start, end) <= miles);
  }

  distanceMiles(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const radians = (degrees: number) => degrees * Math.PI / 180;
    const dLat = radians(lat2 - lat1);
    const dLng = radians(lng2 - lng1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(radians(lat1)) * Math.cos(radians(lat2)) * Math.sin(dLng / 2) ** 2;
    return 3958.8 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  geoJson(records: NavigatorRecord[]): GeoJSON.FeatureCollection {
    return {
      type: "FeatureCollection",
      features: this.points(records).map((record) => ({
        type: "Feature",
        id: record.id,
        geometry: { type: "Point", coordinates: [Number(record.lng), Number(record.lat)] },
        properties: { id: record.id, name: record.name, type: record.type, asset_class: record.asset_class, submarket: record.submarket, confidence_tier: record.confidence_tier, deal_signal_score: record.deal_signal_score }
      }))
    } as GeoJSON.FeatureCollection;
  }

  bounds(records: NavigatorRecord[]): [[number, number], [number, number]] | undefined {
    const points = this.points(records);
    if (!points.length) return undefined;
    const lngs = points.map((record) => Number(record.lng));
    const lats = points.map((record) => Number(record.lat));
    return [[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]];
  }

  private pointToSegmentMiles(point: [number, number], start: [number, number], end: [number, number]): number {
    const [x, y] = point; const [x1, y1] = start; const [x2, y2] = end;
    const dx = x2 - x1; const dy = y2 - y1;
    const t = Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / ((dx * dx + dy * dy) || Number.EPSILON)));
    return this.distanceMiles(y, x, y1 + t * dy, x1 + t * dx);
  }
}
