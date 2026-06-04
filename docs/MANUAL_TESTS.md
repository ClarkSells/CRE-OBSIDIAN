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
4. Update frontmatter through a future plugin action or create a relationship edge.
5. Expected: broker body text remains intact.

## Test 9: RealNex Export

1. Run `STRIVE Navigator: Open RealNex Sync Queue`.
2. Export all records.
3. Expected: a timestamped CSV appears in `Exports/` and a notice shows its path.

## Automated Acceptance

Run `npm.cmd run acceptance`, then inspect `docs/ACCEPTANCE_REPORT.md`.

