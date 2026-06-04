# V2 25,000-Record Benchmark

Generated: 2026-06-04T14:00:51.339Z

| Benchmark | Result | Target | Status |
|---|---:|---:|---|
| SQL engine cold initialization | 11.4 ms | 15000 ms | PASS |
| 25,000-row CSV generation and analytical import | 1175.0 ms | 120000 ms | PASS |
| Warm database reload | 5.3 ms | 3000 ms | PASS |
| Search results | 59.6 ms | 250 ms | PASS |
| Focused graph query | 109.6 ms | 500 ms | PASS |
| Map filter refresh | 101.8 ms | 750 ms | PASS |
| 25,000-row CSV parse fallback | 28.2 ms | 120000 ms | PASS |

The benchmark uses a deterministic 25,000-record and 25,000-edge analytical fixture. Desktop Obsidian rendering remains covered by the manual checklist.
