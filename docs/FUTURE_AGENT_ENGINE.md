# Future Agent Engine

Future ingestion and enrichment must preserve STRIVE Navigator's evidence contract:

1. Create or link a source-document record.
2. Append extracted evidence and proposed field changes.
3. Assign confidence and source status.
4. Mark inferred ownership/contact/principal facts for human review.
5. Never overwrite broker-authored body notes silently.

## Planned Inputs

- Local REST API for controlled agent-to-vault writes
- CSV importers for existing STRIVE and RealNex exports
- Public CAD/GIS importers with retrieved dates and source URLs
- Texas SOS research workflow with explicit entity-piercing trails
- OCR/PDF extraction for OMs, rent rolls, T12s, leases, and deeds

## Planned Intelligence

- Local LLM broker-brief generator grounded only in linked sources
- Deal-signal monitor for debt maturity, lease rollover, taxes, entity status, and stale relationships
- Postgres/PostGIS or DuckDB analytical layer for large datasets and spatial joins
- Map layer, lease abstraction assistant, 1031 tracker, and debt monitor

No agent may scrape restricted paid platforms, bypass CAPTCHAs, evade rate limits, or silently guess beneficial ownership.

