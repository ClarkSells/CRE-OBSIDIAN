# Desktop Obsidian Test Checklist

Final visual and load acceptance must be completed manually in desktop Obsidian. Automated acceptance verifies compiled behavior, but it cannot prove desktop rendering, interaction polish, or plugin load behavior under the user's installed Obsidian runtime.

## Clean Sample-Vault Setup

1. From the repository root, run `npm.cmd install`.
2. Run `npm.cmd run acceptance`.
3. Confirm `sample-vault/.obsidian/plugins/strive-navigator/` contains `manifest.json`, `main.js`, and `styles.css`.
4. In desktop Obsidian, open `sample-vault/` as a vault.
5. Open **Settings > Community plugins**, disable Restricted mode if prompted, and enable **STRIVE Navigator**.
6. Run `STRIVE Navigator: Open Command Center`.

## Clean Vault Install Check

1. Create or open a separate empty desktop Obsidian vault.
2. Create `<clean-vault>/.obsidian/plugins/strive-navigator/`.
3. Copy the repository's built `manifest.json`, `main.js`, and `styles.css` into that plugin folder.
4. Reload Obsidian, enable **STRIVE Navigator**, and run `STRIVE Navigator: Initialize Vault Structure`.
5. Confirm the required folders and starter dashboard appear without deleting or replacing any pre-existing note.
6. Run `STRIVE Navigator: Generate Sample Dataset` only when a disposable demo dataset is appropriate.

## Load And Visual Acceptance

- [ ] Plugin enables without a fatal notice or obvious console error.
- [ ] Command Center loads with intentional spacing, readable typography, visible counts, review queue, and quick actions.
- [ ] No view has clipped controls, unreadable text, broken tables, or overlapping panels at the demo window size.
- [ ] Broker Mode, Agent Mode, and Raw Markdown controls are understandable.
- [ ] Opening and closing STRIVE views does not leave blank or duplicated panes.

## Demo-Critical Views

- [ ] Property War Room shows linked owner, parcel, tenants, leases, debt, comps, activity, and signals.
- [ ] Owner Dossier shows source/confidence context and synthetic-data warning.
- [ ] Relationship Graph renders a focused neighborhood; depth, relationship filters, as-of date, and path explanation work.
- [ ] Map Intelligence loads its configured style when network access is available and remains understandable if it is unavailable.
- [ ] A valid `.geojson` file under `Imports/` appears as a local overlay.
- [ ] CSV Import Center can preview a CSV and display mapping/deduplication controls.
- [ ] Data Quality Center explains duplicate issues and does not offer silent deletion of promoted Markdown dossiers.
- [ ] Task Center, Requirements Board, Pursuit Pipeline, Transaction Manager, and Unified Search render and respond.
- [ ] RealNex Sync Queue clearly presents reviewed CSV staging rather than direct synchronization.

## Data-Safety Checks

- [ ] Edit frontmatter on a promoted record and confirm its Markdown body remains unchanged.
- [ ] Attempt duplicate review involving a promoted Markdown dossier and confirm manual review is required.
- [ ] Roll back an import batch and confirm only unpromoted records from that batch are removed.
- [ ] Confirm confidence, source status, and human-review cues remain visible where expected.

## Final Demo Readiness

- [ ] Follow [DEMO_SCRIPT.md](DEMO_SCRIPT.md) once from start to finish.
- [ ] Confirm all sample data is described as synthetic.
- [ ] Confirm limitations are framed as intentional V2 boundaries where appropriate.
- [ ] Record any visual or load failures as desktop issues; do not mark deferred V3 capabilities as V2 blockers.

For deeper feature-by-feature checks, continue with [MANUAL_TESTS.md](MANUAL_TESTS.md).
