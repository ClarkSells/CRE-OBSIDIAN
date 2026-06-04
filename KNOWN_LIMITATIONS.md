# Known Limitations

- Desktop Obsidian must be used for the final visual/load smoke test. On June 4, 2026, this managed Codex session found Obsidian at `C:\Users\Clark\AppData\Local\Programs\Obsidian\Obsidian.exe`, but OS policy returned `Access is denied` when launching it and when reading its runtime log. Automated acceptance verifies the compiled bundle, JavaScript syntax, an Obsidian-like `onload` lifecycle (8 views and 27 commands registered), and installed sample-vault artifacts, but cannot prove desktop rendering by itself.
- The relationship graph is a lightweight SVG network. It intentionally avoids a heavy graph dependency and does not yet support drag, zoom, clustering, or large-vault virtualization.
- Record creation forms capture a broker-readable name first; detailed fields are completed in Markdown/frontmatter. Rich per-record edit forms are Phase 2.
- Property/owner selection falls back to the active compatible note or first indexed demo record. A richer selector is scaffolded but not yet integrated into every view.
- RealNex integration is one-way CSV staging only. Direct browser automation and two-way sync are explicitly deferred.
- The sample-vault generator is a deterministic acceptance fixture. The in-plugin generator creates the same required record counts but uses Obsidian APIs at runtime.
- No live public-data ingestion, paid-platform scraping, contact enrichment, beneficial-owner guessing, Postgres/PostGIS, mapping, OCR, or LLM calls are included.
