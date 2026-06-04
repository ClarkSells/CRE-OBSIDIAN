# Acceptance Checklist

Status as of June 4, 2026.

| # | Criterion | Status | Evidence |
|---|---|---|---|
| 1 | `npm install` succeeds | PASS | Dependencies installed using repo-local `.npm-cache`. |
| 2 | `npm run build` succeeds | PASS | Production bundle succeeds repeatedly. |
| 3 | `manifest.json`, `main.js`, `styles.css` produced | PASS | Root artifacts and sample-vault copies verified byte-for-byte. |
| 4 | Plugin can be copied into `.obsidian/plugins/strive-navigator/` | PASS | `npm run install:sample` installs it there. |
| 5 | Plugin loads without known fatal console errors | PASS BY LIFECYCLE HARNESS / DESKTOP MANUAL PENDING | Compiled V2 plugin evaluates and `onload` registers 19 views, 53 commands, settings, and ribbon. Desktop launch/log access was denied by managed OS policy. |
| 6 | Vault structure command creates required folders | IMPLEMENTED | `VaultFolders` creates all folders without deleting existing content. Runtime step is in manual tests. |
| 7 | Sample dataset command creates demo records | IMPLEMENTED + FIXTURE VERIFIED | Runtime command creates V1 and V2 operating records; installed sample vault contains 283 checked records plus CSV/GeoJSON fixtures. |
| 8 | Command Center opens and displays counts | IMPLEMENTED / MANUAL PENDING | Custom view and explicit KPI set compile; desktop rendering requires manual smoke. |
| 9 | Property War Room shows linked data | IMPLEMENTED / MANUAL PENDING | Indexed linked-record panels and property selector compile. |
| 10 | Owner Dossier shows related properties/entities | IMPLEMENTED / MANUAL PENDING | Portfolio and graph relationship resolution compile. |
| 11 | Relationship Graph displays demo nodes/edges | IMPLEMENTED / MANUAL PENDING | Cytoscape traversal, filters, clusters, paths, temporal snapshots, and saved views compile. |
| 12 | Deal Signal Radar sorts signals | PASS BY CODE + FIXTURE | Descending numeric sort; 20 signal fixtures verified. |
| 13 | Comps Board displays sale/lease comps | IMPLEMENTED / MANUAL PENDING | Complete filters and tables compile; 25 comp fixtures verified. |
| 14 | Investor Match ranks buyers | PASS BY CODE + FIXTURE | Deterministic scoring and eight investor fixtures verified. |
| 15 | RealNex Sync Queue exports CSV | PASS BY CODE + FIXTURE | Export service and required-column sample CSV verified. |
| 16 | Validate Current Note catches required gaps | PASS BY CODE | Base, low-confidence, property, lease, and edge safeguards verified. |
| 17 | Existing Markdown body notes preserved | PASS BY DESIGN + FIXTURE | Uses Obsidian `processFrontMatter`; all fixtures retain human-readable body sections. |
| 18 | README explains installation/testing | PASS | `README.md`. |
| 19 | Architecture documentation | PASS | `docs/ARCHITECTURE.md`. |
| 20 | Schema documentation | PASS | `docs/SCHEMA.md`. |
| 21 | RealNex sync documentation | PASS | `docs/REALNEX_SYNC.md`. |
| 22 | Future agent engine documentation | PASS | `docs/FUTURE_AGENT_ENGINE.md`. |

The exact automated results are generated in `docs/ACCEPTANCE_REPORT.md`. Complete the desktop-only items using `docs/MANUAL_TESTS.md`.

V2-specific acceptance is tracked in `docs/V2_ACCEPTANCE_CHECKLIST.md` and the 25,000-record results are in `docs/V2_BENCHMARK_REPORT.md`.
