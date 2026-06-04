# Known Limitations

- Desktop Obsidian must be used for final visual/load smoke testing. On June 4, 2026, this managed session found Obsidian but OS policy denied launching it and reading its runtime log. Automated acceptance verifies the compiled V2 lifecycle, 19 views, 53 commands, tests, fixtures, and performance.
- V2 is intentionally local-first and single-user. It does not provide hosted multi-user synchronization, permissions, or conflict resolution between simultaneous vault writers.
- MapLibre uses the configured online style when available. Local GeoJSON overlays and PMTiles protocol are supported, but users must supply local assets. Polygon and corridor selection use coordinate-entry fallbacks instead of a graphical drawing toolbar.
- The focused Cytoscape relationship explorer queries and renders neighborhoods rather than attempting to display all 25,000 records simultaneously.
- CSV import supports automatic and saved mappings, RealNex aliases, exact/fuzzy duplicate review, promotion, and rollback. It does not import XLSX, PDFs, or restricted paid-platform data.
- Automated merge is limited to unpromoted analytical duplicates. Promoted Markdown dossiers require manual merge review to protect handwritten notes.
- RealNex direct automation and two-way API synchronization remain deferred. V2 supports controlled CSV import/export and preserves RealNex IDs.
- Outbound email, hosted deal rooms, mobile applications, advanced 20-year underwriting, live public-data connectors, OCR, and paid-platform scraping are outside V2.
