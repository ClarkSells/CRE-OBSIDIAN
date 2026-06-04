# V2 Architecture

## Two-Tier Record Model

Curated Markdown dossiers remain the durable broker-readable layer. The local analytical store contains imported/unpromoted records, normalized search text, relationship edges, immutable events, field assertions, workflow records, and import history. Promoting a record creates a Markdown dossier without deleting analytical history.

## Store And Migration

The store uses `sql.js`, serialized into `System/strive-navigator-v2.sqlite`. Schema migrations are versioned and idempotent. Before migration or bulk import, the current database is copied into `System/Backups/`. If `sql.js` cannot initialize, V2 continues with the Markdown index and reports degraded capabilities rather than preventing plugin load.

## Query Services

- `AnalyticalStore`: persistence, migrations, records, events, assertions, imports, and health.
- `MetadataIndex`: incremental Markdown index and compatibility layer.
- `GraphService`: adjacency indexes, traversals, shortest paths, ownership chains, and as-of filtering.
- `SpatialService`: point filtering, distance, bounds, and GeoJSON generation.
- `ImportService`: CSV parsing, mapping, dedupe, reconciliation, promotion, and rollback.
- `DataQualityService`: duplicate, orphan, reference, confidence, and freshness issues.

## Safety

No analytical operation silently rewrites a Markdown body. Promotions and edits use `processFrontMatter`, events are append-only, imports are batch-scoped, and rollback removes only records created by that batch.

