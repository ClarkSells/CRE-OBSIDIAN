# RealNex Sync Strategy

## MVP

STRIVE Navigator writes one-way CSV staging files to `Exports/`. Exportable records are properties, entities, people, and investor profiles. Mappings preserve `RealNexID` where present and always include confidence, source status, human-review status, and update date.

Records that do not map cleanly leave fields blank instead of failing or inventing data. The generated queue is intended for review before import into RealNex.

## V2 Controlled Import

The CSV Import Center recognizes common RealNex-oriented columns, previews data, infers record type, saves mapping profiles, detects exact/fuzzy duplicates, records an import batch, preserves source rows, and allows unpromoted records to be rolled back safely. Duplicate decisions flow through the Data Quality Center rather than silently overwriting records.

## Mapping

The CSV includes record type, RealNex ID, name, address facts, property facts, owner/beneficial-owner IDs, contact fields, sale/valuation data, signal score, confidence, human review, source status, update date, and notes.

## Deferred

Direct RealNex automation and two-way sync are deferred because they require authenticated product-specific APIs or fragile browser automation. A future supported API integration should use RealNex IDs as stable external keys, keep an explicit sync log, resolve conflicts without overwriting broker notes, and require review for inferred fields.
