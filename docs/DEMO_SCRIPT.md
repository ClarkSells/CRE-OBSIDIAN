# STRIVE Navigator V2 Demo Script

## Demo Goal

Show STRIVE Navigator as a polished local-first Obsidian cockpit for DFW investment sales: a broker-readable intelligence database, relationship and spatial exploration layer, action workflow, data-quality control point, and future agent review surface.

Do not present V2 as a finished SaaS platform, autonomous scraping engine, or direct RealNex integration.

## Before The Demo

1. Complete [DESKTOP_TEST_CHECKLIST.md](DESKTOP_TEST_CHECKLIST.md).
2. Open `sample-vault/` in desktop Obsidian and enable STRIVE Navigator.
3. Confirm `STRIVE Navigator: Open Command Center` works.
4. Keep a demo property, entity, and the RealNex Sync Queue ready.
5. Remember that all sample-vault records are synthetic demo data.

## 10-Minute Walkthrough

### 1. Frame The Product

Say: "STRIVE Navigator V2 is the local broker-facing cockpit. Markdown preserves curated dossiers and broker notes; the local analytical store supports the broader imported universe, provenance, graph traversal, search, and workflows."

Clarify that future local research agents are external to the plugin and will submit source-backed packets for human review.

### 2. Command Center

Open **STRIVE Navigator: Open Command Center**.

Show the operating picture, signals, recent records, review queue, and quick actions. Explain that V2 is intentionally local-first and single-user.

### 3. Property And Owner Intelligence

Open a demo property and launch **Property War Room**, then open a related entity in **Owner Dossier**.

Show linked ownership, tenancy, debt, comps, activity, signals, confidence, and source status. Emphasize that inferred or demo facts require review.

### 4. Focused Relationship Graph

Open **Relationship Graph** from a selected record. Change traversal depth or a relationship filter and explain a path.

Say: "This is a focused neighborhood view, intentionally scoped for useful exploration rather than rendering the entire 25,000-record universe at once."

### 5. Map Intelligence

Open **Map Intelligence** and apply a record filter or radius. If the online style is unavailable, explain that V2 supports user-supplied local GeoJSON overlays and PMTiles-referenced styles; graphical polygon/corridor drawing remains a future enhancement.

### 6. CSV Import And Data Quality

Open **CSV Import Center** and describe preview, saved mappings, RealNex aliases, duplicate review, promotion, and rollback. Then open **Data Quality Center**.

Say: "CSV is the controlled V2 ingestion format. Analytical duplicates can be merged automatically, but promoted Markdown dossiers require manual review so broker notes are never silently overwritten."

### 7. Broker Workflow

Open one or two of **Task Center**, **Requirements Board**, **Pursuit Pipeline**, or **Transaction Manager**. Show how intelligence becomes a broker action while keeping provenance visible.

### 8. RealNex Bridge

Open **RealNex Sync Queue** and show a staged CSV export.

Say: "V2 uses a reviewed CSV bridge, preserves RealNex IDs, and treats RealNex as an external CRM destination. Direct automation and two-way API sync are deferred."

### 9. Close On The Future Architecture

Say: "The future system runs permitted research on a high-end local workstation, creates structured source-backed packets, writes them through a controlled vault bridge, and leaves STRIVE Navigator as the broker review and action layer."

## Questions To Answer Directly

- **Is this multi-user SaaS?** No. V2 is intentionally local-first and single-user.
- **Does it scrape CoStar or bypass CAPTCHAs?** No. Restricted paid-platform scraping, CAPTCHA bypassing, and rate-limit evasion are out of scope.
- **Does it sync directly with RealNex?** No. V2 supports reviewed CSV import/export only.
- **Can agents overwrite broker notes?** No. Promoted Markdown dossiers require manual merge review.
- **Why not show every graph record?** Focused neighborhoods are more legible and performant.
- **Is desktop acceptance complete?** Automated acceptance is complete where documented; final rendering and interaction checks require manual desktop Obsidian testing.
