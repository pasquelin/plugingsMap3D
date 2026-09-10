<div align="center">

### plugingsMap3D — the official plugins for [map3D](https://github.com/pasquelin/map3D)

*Real data poured into a React 3D map: French BDTOPO building attributes on pick, live public webcams around the view.*

[![CI](https://github.com/pasquelin/plugingsMap3D/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/pasquelin/plugingsMap3D/actions/workflows/ci.yml)
[![npm geopf](https://img.shields.io/npm/v/@pasquelin/map3d-plugin-geopf?label=geopf&logo=npm&color=cb3837)](https://www.npmjs.com/package/@pasquelin/map3d-plugin-geopf)
[![npm windy](https://img.shields.io/npm/v/@pasquelin/map3d-plugin-windy?label=windy&logo=npm&color=cb3837)](https://www.npmjs.com/package/@pasquelin/map3d-plugin-windy)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Three.js ≥0.169](https://img.shields.io/badge/Three.js-%E2%89%A50.169-000000?logo=three.js&logoColor=white)](https://threejs.org)
[![TypeScript strict](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/license-MIT-1e6fbf)](LICENSE)

**[Live demo ↗](https://pasquelin.github.io/map3D/)** · **[map3D library ↗](https://github.com/pasquelin/map3D)** · **[Plugin API 🇬🇧](https://github.com/pasquelin/map3D/blob/main/docs/en/PLUGINS.md)** · **[Documentation 🇫🇷](docs/fr/README.md)** · **[Changelog](CHANGELOG.md)**

</div>

---

## Why this repository

[map3D](https://github.com/pasquelin/map3D) is a real-time 3D mapping library for React.
It knows about **no** business data source — that is what plugins are for. This monorepo holds the
**official** ones, published under the `@pasquelin` scope: **1 plugin = 1 package**
(`packages/<name>/`) **+ its runnable example** (`packages/<name>/example/`).

A plugin plugs into one of the three **lanes** of the `definePlugin` contract:

| Lane | What it does | Example here |
|---|---|---|
| `enrich` | completes a map object after an interaction (building pick) | `geopf` |
| `markers` | supplies DOM markers from a remote source, refreshed on view change | `windy` |
| `layer` | reaches `engine.scene` / `engine.projection` directly to draw its own 3D | `plan-3d` |

## The plugins

| Package | Lane | Role | npm |
|---|---|---|---|
| [`@pasquelin/map3d-plugin-geopf`](packages/geopf) | `enrich` | French buildings: clicking a 3D building resolves its official **BDTOPO** attributes from the **IGN Géoplateforme** (nature, use, height, floors, materials…) through `useBuildingEnrichment()`. The pick stays instant; enrichment runs in the background. | [![npm](https://img.shields.io/npm/v/@pasquelin/map3d-plugin-geopf?color=cb3837&label=)](https://www.npmjs.com/package/@pasquelin/map3d-plugin-geopf) |
| [`@pasquelin/map3d-plugin-windy`](packages/windy) | `markers` | Real public webcams around the current view ([Windy Webcams API v3](https://api.windy.com/webcams)): one marker per webcam, thumbnail as avatar, preview tooltip and a menu (open / copy link). | [![npm](https://img.shields.io/npm/v/@pasquelin/map3d-plugin-windy?color=cb3837&label=)](https://www.npmjs.com/package/@pasquelin/map3d-plugin-windy) |
| [`@pasquelin/map3d-plugin-plan-3d`](packages/plan-3d) | `layer` | **Placeholder** for the `layer` lane: drops a reference volume, reprojected every frame. It demonstrates the contract, it is not a product. | private |
| [`@pasquelin/map3d-plugin-template`](packages/plugin-template) | — | **Starter** to copy when writing your own plugin. | private |

The two publishable packages share a **single version**: one `vX.Y.Z` tag publishes them together.

## Installation

```bash
npm i @pasquelin/map3d @pasquelin/map3d-plugin-geopf
# or: pnpm add … / yarn add …
```

`react`, `react-dom` (19), `three` (≥ 0.169) and `@pasquelin/map3d` (^0.2.0) are
**peerDependencies** — never bundled by the plugins.

## Quick start

A plugin is passed to `<Map>`; it is **disabled by default** and switched on from map3D's plugin
hub (Settings menu).

```tsx
import { Map } from '@pasquelin/map3d'
import { geopfBatiments } from '@pasquelin/map3d-plugin-geopf'
import { windyWebcams } from '@pasquelin/map3d-plugin-windy'

<Map plugins={[geopfBatiments(), windyWebcams({ apiKey: import.meta.env.VITE_WINDY_API_KEY })]} />
```

Reading the `geopf` enrichment from a child of `<Map>`:

```tsx
import { useBuildingEnrichment } from '@pasquelin/map3d'

function BuildingInfo() {
  const enrichment = useBuildingEnrichment()
  return <pre>{JSON.stringify(enrichment, null, 2)}</pre>
}
```

Every package has its own detailed README (options, API key safety, limits) and its example:

```bash
pnpm --filter @pasquelin/map3d-plugin-geopf-example dev
pnpm --filter @pasquelin/map3d-plugin-windy-example dev
```

## Writing your own plugin

```bash
cp -r packages/plugin-template packages/my-plugin
# rename `name` and `meta.id`, adjust `config` and the lane it uses
pnpm install && pnpm validater
```

The [plugin contract](https://github.com/pasquelin/map3D/blob/main/docs/en/PLUGINS.md)
(`definePlugin`, the `enrich` / `markers` / `layer` lanes) is documented on the map3D side. To
propose an official plugin here, see [CONTRIBUTING.md](.github/CONTRIBUTING.md).

## Development

**pnpm** monorepo (Node 22). Prerequisite: `pnpm install`.

| Command | Effect |
|---|---|
| `pnpm build` | library build for each package (`dist/`: ESM + CJS + `.d.ts`) |
| `pnpm typecheck` | `tsc --noEmit` per package |
| `pnpm test` | Vitest (colocated `*.test.ts`) |
| `pnpm lint` / `pnpm format` | ESLint / Prettier |
| **`pnpm validater`** | typecheck + lint + format:check + test — **the full gate**, replayed in CI |
| `pnpm version:plugins X.Y.Z` | unified bump (root + `geopf` + `windy`) |

Source, comments and internal documentation are written **in French**. `any` is forbidden
(`strict` + `noUncheckedIndexedAccess`), `type` rather than `interface`.

## Publishing

**Automatic** through GitHub Actions: pushing a `vX.Y.Z` tag publishes the publishable packages to
npm with **signed provenance** over OIDC (npm Trusted Publishing — no token). The flow is detailed
in [CLAUDE.md](CLAUDE.md#mise-en-production-release-npm).

## Contributing

Features start from **`develop`** and return to it through a PR (`main` is the release branch).
One feature = one branch = one isolated **worktree**. Read
[CONTRIBUTING.md](.github/CONTRIBUTING.md), the [code of conduct](.github/CODE_OF_CONDUCT.md) and
the [security policy](.github/SECURITY.md).

## Licence

**MIT** © [Alban Pasquelin](https://github.com/pasquelin) — see [LICENSE](LICENSE).
Note: the map3D library itself is licensed under **PolyForm Noncommercial**.
