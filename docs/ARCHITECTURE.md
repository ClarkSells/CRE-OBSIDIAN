# Architecture

## Core Thesis

The Obsidian vault is the broker-readable intelligence layer. Every business object is a Markdown note with YAML frontmatter, so records remain portable, diffable, searchable, and editable without the plugin. STRIVE Navigator adds a fast in-vault index and purpose-built views without turning Markdown into an opaque database.

## Layers

1. **Vault records:** properties, parcels, entities, people, investors, tenants, leases, loans, comps, submarkets, activities, signals, sources, and relationship edges.
2. **Metadata index:** `MetadataIndex` scans Markdown files, reads cached or parsed frontmatter, groups records by type, resolves IDs, and provides property-linked record sets.
3. **Graph intelligence:** relationship-edge notes make source-aware connections explicit. The SVG graph reads those portable edge records.
4. **Broker views:** custom `ItemView` dashboards answer broker questions without requiring YAML fluency.
5. **Agent mode:** exposes machine-readable records and validation context while preserving confidence and human-review flags.
6. **RealNex staging:** CSV export maps portable records into a conservative CRM interchange format.

## Safety Contract

Human-written Markdown bodies are not replaced during metadata updates. `RecordFactory.updateFrontmatter` uses Obsidian's `processFrontMatter`, which edits frontmatter while preserving the body. Malformed or incomplete records are flagged rather than silently repaired. Low-confidence control/contact facts require human review.

## Views

- Command Center: operating picture and action shortcuts
- Property War Room: linked ownership, tenancy, debt, comps, activities, and signals
- Owner Dossier: entity piercing, controlled property, and source confidence
- Relationship Graph: clickable SVG relationship network
- Deal Signal Radar: ranked broker action queue
- Comps Board: filtered sale/lease comparable ledger
- Investor Match: deterministic score and visible rationale
- RealNex Sync Queue: review and export staging

V2 adds Contact 360, Company 360, History Timeline, Map Intelligence, CSV Import Center, Data Quality Center, Task Center, Requirements Board, Pursuit Pipeline, Transaction Manager, and Unified Search.

## V2 Analytical And Operating Layers

V2 implements the two-tier architecture documented in `V2_ARCHITECTURE.md`: `sql.js` analytical persistence, migrations/backups, immutable events, field assertions, temporal graph edges, CSV batches, workflow records, unified search, and spatial intelligence. Markdown remains the curated dossier and human-note layer.

## Future Layers

Postgres/PostGIS can become the heavy normalized system for geometry, 150,000-record bulk data, and spatial analytics while Markdown remains the curated intelligence layer. Future local agents remain external to the V2 plugin: they should ingest through a controlled bridge, create explicit source documents, append evidence, preserve broker notes, and mark inferred claims for review.

See [FUTURE_LOCAL_LLM_AGENT_ENGINE.md](FUTURE_LOCAL_LLM_AGENT_ENGINE.md) for the future architecture boundary and [DATA_QUALITY_AND_PROVENANCE.md](DATA_QUALITY_AND_PROVENANCE.md) for the evidence contract.
