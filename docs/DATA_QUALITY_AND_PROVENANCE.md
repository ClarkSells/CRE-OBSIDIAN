# Data Quality And Provenance

## V2 Evidence Contract

STRIVE Navigator keeps the broker-readable dossier and the source trail together without treating every imported or inferred value as verified truth.

- Source-document records link claims to evidence.
- Field assertions can preserve conflicting sourced values.
- Confidence tier, source status, and human-review flags make uncertainty visible.
- Immutable events record plugin-created edits, imports, promotions, merges, splits, and workflow changes.
- Import batches preserve source rows and support rollback of unpromoted records.

## Why Promoted Dossiers Require Manual Merge Review

An unpromoted analytical duplicate is structured data under plugin control, so V2 can merge it through the Data Quality Center. A promoted record is a Markdown dossier that may contain broker-written narrative, judgment, relationship context, or private working notes.

V2 therefore refuses to automatically delete a promoted duplicate. The broker must review promoted dossiers manually, decide which structured values to retain, and preserve or reconcile all handwritten content. This is a data-safety feature, not an incomplete deduplication workflow.

## Import And Promotion Flow

1. Preview and map a controlled CSV.
2. Import rows into the local analytical store with batch and source context.
3. Review exact/fuzzy duplicates and other quality issues.
4. Merge or split unpromoted analytical records where appropriate.
5. Promote selected records into Markdown dossiers.
6. Require manual review for later merges involving promoted dossiers.

## Future Agent Handoff

External agents must create structured, source-backed research packets; append evidence and proposed field changes; assign confidence and source status; and mark inferred ownership, contact, or principal claims for human review. They must never silently overwrite broker-authored Markdown.

See [FUTURE_LOCAL_LLM_AGENT_ENGINE.md](FUTURE_LOCAL_LLM_AGENT_ENGINE.md) for the future architecture boundary.
