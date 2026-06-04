# V1 To V2 Migration

1. Load V1 Markdown without modification.
2. Create `System/Backups/` and back up an existing V2 analytical store.
3. Initialize the V2 schema and record schema version.
4. Upsert every indexed V1 record into the analytical store using its existing ID and `realnex_id`.
5. Import V1 relationship-edge notes into temporal edges without changing the notes.
6. Create one migration event per promoted record.
7. Run reference and duplicate checks.

Migration is idempotent. Re-running it updates the analytical projection but does not duplicate events carrying the same deterministic migration key. Handwritten Markdown bodies are never replaced.

