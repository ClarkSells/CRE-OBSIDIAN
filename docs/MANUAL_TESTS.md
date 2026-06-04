# Manual Tests

## Test 1: Install And Load

1. Run `npm.cmd install`, `npm.cmd run build`, and `npm.cmd run install:sample`.
2. Open `sample-vault/` in Obsidian.
3. Enable community plugins and STRIVE Navigator.
4. Expected: plugin enables without a fatal error and shows an index-ready notice.

## Test 2: Initialize Vault

1. Run `STRIVE Navigator: Initialize Vault Structure`.
2. Expected: required folders, starter dashboard, and templates exist; existing files remain unchanged.

## Test 3: Generate Sample Dataset

1. Run `STRIVE Navigator: Generate Sample Dataset`.
2. Expected: fake demo notes are created or reused in the proper folders, all marked `source_status: demo` and `human_review: true`.

## Test 4: Command Center

1. Run `STRIVE Navigator: Open Command Center`.
2. Expected: premium dashboard shows counts, top signals, recent records, review queue, and quick actions.

## Test 5: Property War Room

1. Open a demo property note.
2. Run `STRIVE Navigator: Open Property War Room`.
3. Expected: linked owner, parcel, tenants, leases, loans, comps, activities, and signals appear.

## Test 6: Owner Dossier And Graph

1. Open a demo entity note and run `STRIVE Navigator: Open Owner Dossier`.
2. Open the Relationship Graph.
3. Expected: entity facts and controlled property appear; graph renders clickable nodes and labeled edge tooltips.

## Test 7: Signal, Comps, And Investors

1. Open Deal Signal Radar and filter a signal type.
2. Open Comps Board and filter comp type.
3. Open a property, then Investor Match.
4. Expected: descending signal scores, comparable records, and ranked buyers with visible scoring reasons.

## Test 8: Validation And Preservation

1. Create a property, add text under `## Broker Notes`, and remove `owner_entity`.
2. Run `STRIVE Navigator: Validate Current Note`.
3. Expected: missing owner warning appears.
4. Run `STRIVE Navigator: V2: Edit Current Record` and update a frontmatter field.
5. Expected: broker body text remains intact.

## Test 9: RealNex Export

1. Run `STRIVE Navigator: Open RealNex Sync Queue`.
2. Export all records.
3. Expected: a timestamped CSV appears in `Exports/` and a notice shows its path.

## Automated Acceptance

Run `npm.cmd run acceptance`, then inspect `docs/ACCEPTANCE_REPORT.md`.

## Test 10: V2 Store, Migration, And Backup

1. Run `STRIVE Navigator: V2: Check Analytical Store Health`.
2. Expected: notice reports schema v2 plus record, edge, event, and assertion counts.
3. Run `STRIVE Navigator: V2: Back Up Analytical Store`.
4. Expected: a timestamped database appears in `System/Backups/`.
5. Confirm an existing V1 Markdown note body is unchanged.

## Test 11: Rich Editing And History

1. Open a property or entity note.
2. Run `STRIVE Navigator: V2: Edit Current Record`.
3. Change a structured field and save.
4. Expected: frontmatter changes, Markdown body remains intact, and History Timeline shows a `record_edited` event.

## Test 12: Relationship Explorer

1. Open a demo property and run `Open Relationship Graph`.
2. Change traversal depth, relationship type, and as-of date.
3. Explain a path between a property and person ID.
4. Expected: Cytoscape graph redraws and the evidence path is listed.

## Test 13: Map Intelligence

1. Run `Open Map Intelligence`.
2. Filter by asset class, owner, submarket, confidence, and signal score.
3. Apply a radius, polygon coordinate list, and corridor coordinate list.
4. Expected: clustered map points update; clicking a point opens its record.
5. Place valid GeoJSON in `Imports/` and reopen the map.
6. Expected: local polygon/line overlay appears.

## Test 14: CSV Import And Reconciliation

1. Place a CSV in `Imports/`.
2. Open CSV Import Center, select the file, preview it, and save its mapping profile.
3. Import the batch.
4. Expected: batch ledger, imported analytical records, immutable event, and duplicate issues appear.
5. Open Data Quality Center and review a duplicate; test analytical merge/split.
6. Roll back the batch.
7. Expected: unpromoted imported records are removed and promoted Markdown remains.

## Test 15: Core Brokerage Operations

1. Open Task Center and complete an open or recurring task.
2. Open Requirements Board and inspect buyer needs.
3. Open Pursuit Pipeline and move a pursuit to the next stage.
4. Open Transaction Manager and inspect milestone/fee fields.
5. Expected: changes persist in the analytical store and appear in History Timeline.

## Test 16: Contact, Company, And Search

1. Open Contact 360 and Company 360.
2. Expected: linked relationship, task, pursuit, transaction, and history records appear.
3. Open Unified Search and search by name, address, entity, phone, or parcel ID.
4. Save the search and bulk-promote analytical results.
