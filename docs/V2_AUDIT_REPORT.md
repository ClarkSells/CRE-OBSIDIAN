# STRIVE Navigator V2 Audit Report

Audit date: June 4, 2026

## Baseline

The V1 baseline passed `npm.cmd run acceptance`: production build, strict typecheck, lifecycle smoke, sample-vault installation, and 51/51 automated checks. The lifecycle harness registered 8 views and 27 commands. The managed environment still blocks launching Obsidian desktop and reading its runtime log, so desktop-only rendering checks remain manual.

## Blockers

- No persistent analytical store for the imported universe, temporal history, imports, or scalable graph queries.
- No safe migration/backup framework.
- No CSV import, reconciliation, rollback, or repeatable mapping profile.
- No map or spatial query surface.
- No tasks, requirements, pursuits, transactions, milestones, company dossiers, or operational workflow.

## High-Priority Findings

- Relationship lookup scans all edge notes and the graph view truncates to 40 edges and 34 nodes.
- V1 has no field-level provenance, immutable event log, effective dates, or as-of queries.
- Record forms capture only a name; edits generally require raw YAML.
- Validation lacks referential integrity, duplicate detection, field typing, cross-record checks, and whole-vault reporting.
- Every metadata change triggers a debounced full-vault index rebuild.
- RealNex support is export-only with no import or reconciliation ledger.
- Several UI strings contain encoding corruption.

## Medium-Priority Findings

- Property and owner views resolve shallow links rather than relationship paths.
- Tables are not paginated or virtualized.
- Search covers only indexed Markdown name/address/ID fields.
- Existing fixtures prove schemas and export shape but do not exercise workflow transitions or temporal queries.

## V2 Resolution

V2 introduces a two-tier local architecture: curated Markdown remains human-readable truth, while a serialized `sql.js` analytical store holds the imported universe, temporal graph, provenance, workflows, and search index. Every V2 subsystem must retain a reliable fallback when the analytical store is unavailable, preserve handwritten Markdown, and expose exact confidence/source state.

## Implemented Audit Resolutions

- Replaced edge scans with adjacency indexing and a typed graph service.
- Replaced static SVG graph with focused Cytoscape exploration.
- Added schema-versioned analytical persistence, backups, health checks, migration projection, and import rollback.
- Added temporal edges, immutable record events, and conflicting field assertions.
- Added MapLibre spatial intelligence with local overlays and coordinate-selection fallbacks.
- Added controlled CSV imports, saved mappings, fuzzy duplicates, reconciliation, promotion, and rollback.
- Added schema-driven editing and expanded whole-system data quality.
- Added Contact/Company 360, tasks, requirements, pursuits, transactions, timeline templates, saved views, and reporting KPIs.
- Added V2 tests and a deterministic 25,000-record performance benchmark.
