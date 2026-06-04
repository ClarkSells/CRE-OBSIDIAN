# STRIVE Navigator V2

STRIVE Navigator V2 turns an Obsidian vault into a local-first DFW commercial real estate intelligence and brokerage operating system. Curated properties, owners, principals, tenants, leases, debt, comps, pursuits, transactions, and relationship records remain portable Markdown. A local `sql.js` analytical store adds the imported universe, immutable history, field assertions, temporal graph traversal, unified search, imports, and operational reporting.

All records shipped in `sample-vault/` are fake demo data. They must not be treated as verified market, ownership, contact, or transaction information.

## V2 Product Boundary

V2 is a polished, demoable, single-user Obsidian cockpit. It demonstrates the database model, relationship graph, broker workflows, data quality controls, provenance, controlled RealNex CSV bridge, and the review layer for a future AI-agent-fed research system.

V2 is not a hosted multi-user SaaS app, a full autonomous research engine, or a public-data scraping system. Those are future architecture concerns, not blockers for demonstrating the broker-facing cockpit. The future local LLM and research-agent system stays external to the plugin and hands source-backed research packets into the vault for broker review.

## Install In Obsidian

### Prebuilt sample vault

1. Open `sample-vault/` as an Obsidian vault.
2. Open **Settings > Community plugins**, disable Restricted mode if prompted, and enable **STRIVE Navigator**.
3. Run `STRIVE Navigator: Open Command Center`.

### Install into another vault

1. Run `npm.cmd install`.
2. Run `npm.cmd run build`.
3. Create `<your-vault>/.obsidian/plugins/strive-navigator/`.
4. Copy `manifest.json`, `main.js`, and `styles.css` into that directory.
5. Reload Obsidian and enable **STRIVE Navigator**.
6. Run **Initialize Vault Structure**, then **Generate Sample Dataset** or create records manually.

## Development

```powershell
npm.cmd install
npm.cmd run build
npm.cmd run typecheck
npm.cmd run test:v2
npm.cmd run benchmark
npm.cmd run install:sample
npm.cmd run verify
```

`npm.cmd run acceptance` builds and verifies the complete package. The repo-local `.npmrc` avoids common Windows npm-cache permission failures.

## Core Capabilities

- Two-tier Markdown plus local analytical-store architecture
- Versioned migrations, automatic pre-migration/import backups, health checks, and import rollback
- Incremental Markdown index grouped by record type, ID, path, and edge adjacency
- Cytoscape relationship explorer with multi-hop traversal, shortest paths, clusters, filters, saved views, and as-of dates
- MapLibre intelligence map with clustering, portfolio filters, radius/polygon/corridor filtering, GeoJSON overlays, and PMTiles protocol
- CSV Import Center with RealNex aliases, preview, mapping profiles, exact/fuzzy dedupe, batch history, promotion, reconciliation, and rollback
- Immutable record events and field-level sourced assertions
- Contact 360, Company 360, Task Center, Requirements Board, Pursuit Pipeline, Transaction Manager, Data Quality Center, History Timeline, and Unified Search
- Command Center, Property War Room, Owner Dossier, Deal Signal Radar, Comps Board, Investor Match, and RealNex Sync Queue
- Broker Mode, Agent Mode, and normal Raw Markdown access
- Deterministic fake DFW V2 operating dataset plus a 25,000-record benchmark
- Schema-driven full record editor and expanded validation
- Body-preserving frontmatter updates through Obsidian's `processFrontMatter`
- RealNex-ready CSV export to `Exports/`

## Intentional V2 Boundaries

- Local-first and single-user; no hosted sync, roles, permissions, or simultaneous-writer conflict resolution.
- CSV is the supported V2 ingestion format. XLSX, PDF, OCR, live public-data connectors, and restricted paid-platform ingestion are deferred.
- RealNex integration is controlled CSV import/export only. RealNex is an external CRM destination, not the STRIVE master database.
- The relationship explorer renders focused neighborhoods with traversal controls, not the entire analytical universe at once.
- MapLibre uses the configured online style when available. Add local `.geojson` overlays under `Imports/`; PMTiles protocol is supported when a supplied style references user-provided local assets. Polygon and corridor selection use coordinate entry in V2.
- Automated merge is limited to unpromoted analytical duplicates. Promoted Markdown dossiers require manual review so broker-written notes are never silently overwritten.
- Final visual/load acceptance must be completed manually in desktop Obsidian.

## First Commands

1. `STRIVE Navigator: Initialize Vault Structure`
2. `STRIVE Navigator: Generate Sample Dataset`
3. `STRIVE Navigator: Open Command Center`
4. Open a property note, then run `STRIVE Navigator: Open Property War Room`
5. Explore `Open Relationship Graph`, `Open Map Intelligence`, and `Open Pursuit Pipeline`
6. Place a CSV in `Imports/`, then run `Open CSV Import Center`
7. `STRIVE Navigator: Export RealNex CSV`

## Demo And Documentation

- [Demo script](docs/DEMO_SCRIPT.md)
- [Desktop Obsidian test checklist](docs/DESKTOP_TEST_CHECKLIST.md)
- [Known limitations and V2 boundaries](docs/KNOWN_LIMITATIONS.md)
- [RealNex CSV bridge](docs/REALNEX_SYNC.md)
- [Data quality and provenance](docs/DATA_QUALITY_AND_PROVENANCE.md)
- [Future external local LLM agent architecture](docs/FUTURE_LOCAL_LLM_AGENT_ENGINE.md)
- [Detailed manual feature tests](docs/MANUAL_TESTS.md)
