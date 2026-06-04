# STRIVE Navigator

STRIVE Navigator turns an Obsidian vault into a source-aware DFW commercial real estate investment-sales intelligence platform. Properties, owners, principals, tenants, leases, debt, comps, deal signals, and relationship edges remain portable Markdown while the plugin supplies broker-ready dashboards, graph intelligence, validation, and RealNex-ready CSV staging.

All records shipped in `sample-vault/` are fake demo data. They must not be treated as verified market, ownership, contact, or transaction information.

## Install In Obsidian

### Prebuilt sample vault

1. Open `sample-vault/` as an Obsidian vault.
2. Open **Settings → Community plugins**, disable Restricted mode if prompted, and enable **STRIVE Navigator**.
3. Run `STRIVE Navigator: Open Command Center`.

### Install into another vault

1. Run `npm.cmd install`.
2. Run `npm.cmd run build`.
3. Create `<your-vault>/.obsidian/plugins/strive-navigator/`.
4. Copy `manifest.json`, `main.js`, and `styles.css` into that directory.
5. Reload Obsidian and enable **STRIVE Navigator**.
6. Run **Initialize Vault Structure**, then **Generate Sample Dataset** or create records manually.

## Development

```powershell
npm.cmd install
npm.cmd run build
npx.cmd tsc --noEmit
npm.cmd run install:sample
npm.cmd run verify
```

`npm.cmd run acceptance` builds and verifies the complete package. The repo-local `.npmrc` avoids common Windows npm-cache permission failures.

## Core Capabilities

- Vault-safe structured Markdown records with YAML frontmatter
- Native metadata index grouped by record type and ID
- Clickable relationship-edge graph
- Command Center, Property War Room, Owner Dossier, Deal Signal Radar, Comps Board, Investor Match, and RealNex Sync Queue
- Broker Mode, Agent Mode, and normal Raw Markdown access
- Deterministic fake DFW demo dataset
- Validation for base fields, low-confidence review, property ownership, leases, and relationship edges
- Body-preserving frontmatter updates through Obsidian's `processFrontMatter`
- RealNex-ready CSV export to `Exports/`

## First Commands

1. `STRIVE Navigator: Initialize Vault Structure`
2. `STRIVE Navigator: Generate Sample Dataset`
3. `STRIVE Navigator: Open Command Center`
4. Open a property note, then run `STRIVE Navigator: Open Property War Room`
5. `STRIVE Navigator: Export RealNex CSV`

See [docs/MANUAL_TESTS.md](docs/MANUAL_TESTS.md) and [KNOWN_LIMITATIONS.md](KNOWN_LIMITATIONS.md).

