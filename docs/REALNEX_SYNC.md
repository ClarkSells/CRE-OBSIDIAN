# RealNex Sync Strategy

## V2 Boundary

V2 supports a controlled CSV bridge only. It does not directly automate RealNex and does not provide two-way API synchronization. RealNex is an external CRM/export destination, not the STRIVE master database.

This is an intentional V2 boundary, not a demo blocker.

## Controlled Export

STRIVE Navigator writes reviewed CSV staging files to `Exports/`. Exportable records are properties, entities, people, and investor profiles. Mappings preserve `RealNexID` where present and always include confidence, source status, human-review status, and update date.

Records that do not map cleanly leave fields blank instead of failing or inventing data. The generated queue is intended for review before import into RealNex.

## Controlled Import

The CSV Import Center recognizes common RealNex-oriented columns and aliases, previews data, infers record type, saves mapping profiles, detects exact/fuzzy duplicates, records an import batch, preserves source rows, and allows unpromoted records to be rolled back safely. Duplicate decisions flow through the Data Quality Center rather than silently overwriting records.

Promoted Markdown dossiers require manual merge review to protect broker-authored notes.

## Mapping

The CSV includes record type, RealNex ID, name, address facts, property facts, owner/beneficial-owner IDs, contact fields, sale/valuation data, signal score, confidence, human review, source status, update date, and notes.

## Deferred

Direct RealNex automation and two-way sync are deferred. V2 must not use fragile browser automation as a substitute for a supported integration.

A future supported API integration should:

- Use RealNex IDs as stable external keys.
- Keep an explicit, reviewable sync log.
- Preserve source, confidence, and human-review context.
- Resolve conflicts without overwriting broker notes.
- Require review for inferred fields.
- Keep STRIVE's source-aware intelligence model independent from the CRM destination.
