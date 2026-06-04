# Future External Local LLM Agent Engine

## Architecture Boundary

The local LLM and parallel research-agent system is future architecture external to the STRIVE Navigator V2 plugin. V2 demonstrates the broker-facing database, review, validation, provenance, action, and RealNex export layers. It does not need to become the autonomous research engine to succeed.

```text
High-end NVIDIA desktop or workstation
-> local LLMs and parallel research agents
-> permitted CAD, GIS, county, entity, document, and market-source research
-> structured source-backed research packets
-> controlled Obsidian vault read/write bridge
-> STRIVE Navigator review and validation layer
-> broker action and RealNex CSV export
```

## Agent Handoff Contract

Every future agent write must:

1. Create or link a source-document record.
2. Append evidence and proposed field changes rather than silently replacing facts.
3. Include retrieval date, source URL or local source reference, confidence, and source status.
4. Mark inferred ownership, contact, principal, and recommendation claims for human review.
5. Preserve conflicting assertions when the evidence disagrees.
6. Never overwrite broker-authored Markdown body notes silently.
7. Enter through a controlled bridge with an audit event and reviewable batch.

## Permitted Future Work

- Source-aware local broker briefs grounded only in linked evidence
- Permitted public CAD/GIS/county/entity research with provenance
- User-provided document extraction and OCR for OMs, rent rolls, T12s, leases, and deeds
- Deal-signal monitoring for debt maturity, lease rollover, taxes, entity status, and stale relationships
- Postgres/PostGIS or DuckDB analytical services for larger datasets and spatial joins
- Controlled APIs or batch bridges that preserve the V2 evidence contract

## Guardrails

Future agents must not scrape restricted paid platforms, scrape CoStar, bypass CAPTCHAs, evade rate limits, silently guess beneficial ownership, or autonomously decide "who to call" inside the V2 plugin. Source permissions, terms of use, human review, and auditability remain mandatory.

## Future Deployment Layers

A later SaaS/cloud/Postgres product may add multi-user synchronization, permissions, roles, conflict resolution, firm-wide hosting, and supported external APIs. Those capabilities must build around the evidence and broker-note safety contract rather than displacing it.

## V2 Success Condition

V2 is complete when it convincingly demonstrates the polished local Obsidian cockpit that future agents can feed. Building the external agent runtime, scraping engine, or hosted SaaS platform is not part of V2 demo stabilization.
