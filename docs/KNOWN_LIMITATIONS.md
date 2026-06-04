# Known Limitations And V2 Scope Boundaries

## How To Read This Document

Most items below are intentional V2 boundaries, not defects that block the demo. V2 is successful when it is a stable, polished, source-aware Obsidian cockpit that a broker can understand and use locally.

## Manual Acceptance Dependency

Final visual and load smoke testing must occur in desktop Obsidian. On June 4, 2026, the managed build environment found Obsidian, but OS policy denied launching it and reading runtime logs. Automated acceptance verifies the compiled lifecycle, views, commands, tests, fixtures, sample-vault installation, and performance. Complete the remaining visual checks with [DESKTOP_TEST_CHECKLIST.md](DESKTOP_TEST_CHECKLIST.md).

## Intentional V2 Product Boundaries

### Local-First And Single-User

V2 does not provide hosted multi-user sync, broker permissions, role-based access control, simultaneous-writer conflict resolution, cloud deployment, or firm-wide production hosting. A future SaaS/cloud/Postgres architecture may add those capabilities without changing V2's local-first demo purpose.

### Focused Relationship Graph

The Cytoscape explorer renders focused graph neighborhoods with depth, node-type, relationship, and as-of controls. It intentionally does not render all 25,000 analytical records at once. This keeps graph exploration legible and useful.

### Controlled CSV Ingestion

CSV is the supported V2 ingestion format. Import includes automatic and saved mappings, RealNex aliases, exact/fuzzy duplicate review, promotion, reconciliation, and rollback. XLSX, PDF, OCR, and restricted paid-platform ingestion are deferred.

### Broker-Note Protection

Automated merge is limited to unpromoted analytical duplicates. Promoted Markdown dossiers require manual merge review because they may contain broker-written notes. STRIVE Navigator must never silently overwrite or delete those notes.

### RealNex CSV Bridge

V2 supports controlled CSV import/export, RealNex ID preservation, alias mapping, and staged export files. Direct RealNex automation and two-way API synchronization are deferred. RealNex remains an external CRM/export destination, not the master database.

## Current V2 Enhancements, Not Demo Blockers

### Map And Spatial Interaction

MapLibre uses the configured online style when available. Users can add `.geojson` overlays under the vault's `Imports/` folder, and PMTiles protocol is supported when a supplied map style references user-provided local assets. Polygon and corridor selection use coordinate-entry fallbacks rather than a graphical drawing toolbar. A drawing toolbar and packaged offline basemap are future enhancements.

## Explicitly Out Of Scope For V2

- Outbound email
- Hosted deal rooms
- Mobile applications
- Advanced 20-year underwriting
- Live public-data connectors
- OCR and document extraction
- Paid-platform or CoStar scraping
- CAPTCHA bypassing or rate-limit evasion
- Direct autonomous SOS/CAD scraping inside the plugin
- Autonomous "who to call" algorithms inside the plugin
- Hosted multi-user SaaS, cloud sync, and firm-wide permissions

Permitted, source-aware research and external local agents belong to the future architecture described in [FUTURE_LOCAL_LLM_AGENT_ENGINE.md](FUTURE_LOCAL_LLM_AGENT_ENGINE.md). They are not part of the V2 demo stabilization scope.
