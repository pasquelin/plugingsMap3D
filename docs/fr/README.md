<div align="center">

### map3d-plugins — les plugins officiels de [map3D](https://github.com/pasquelin/map3D)

*Official plugins for map3D — real data poured into a React 3D map: French BDTOPO buildings on pick, live public webcams around the view.*

[![CI](https://github.com/pasquelin/map3d-plugins/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/pasquelin/map3d-plugins/actions/workflows/ci.yml)
[![npm geopf](https://img.shields.io/npm/v/@pasquelin/map3d-plugin-geopf?label=geopf&logo=npm&color=cb3837)](https://www.npmjs.com/package/@pasquelin/map3d-plugin-geopf)
[![npm windy](https://img.shields.io/npm/v/@pasquelin/map3d-plugin-windy?label=windy&logo=npm&color=cb3837)](https://www.npmjs.com/package/@pasquelin/map3d-plugin-windy)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Three.js ≥0.169](https://img.shields.io/badge/Three.js-%E2%89%A50.169-000000?logo=three.js&logoColor=white)](https://threejs.org)
[![TypeScript strict](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/license-MIT-1e6fbf)](../../LICENSE)

**[English ↗](../../README.md)** · **[Démo live map3D ↗](https://pasquelin.github.io/map3D/)** · **[Lib map3D ↗](https://github.com/pasquelin/map3D)** · **[Contrat plugin 🇫🇷](https://github.com/pasquelin/map3D/blob/main/docs/fr/PLUGINS.md)** · **[Plugin API 🇬🇧](https://github.com/pasquelin/map3D/blob/main/docs/en/PLUGINS.md)** · **[Changelog](../../CHANGELOG.md)**

</div>

---

## Pourquoi ce dépôt

[map3D](https://github.com/pasquelin/map3D) est une lib de cartographie 3D temps réel pour React.
Elle ne connaît **aucune** source de données métier : c'est le rôle des plugins. Ce monorepo
héberge les plugins **officiels**, publiés sous le scope `@pasquelin` — **1 plugin = 1 package**
(`packages/<nom>/`) **+ son exemple exécutable** (`packages/<nom>/example/`).

Un plugin se branche sur l'une des trois **voies** du contrat `definePlugin` :

| Voie | Ce qu'elle fait | Exemple ici |
|---|---|---|
| `enrich` | complète un objet de la carte après une interaction (pick de bâtiment) | `geopf` |
| `markers` | fournit des markers DOM à partir d'une source distante, rafraîchis sur la vue | `windy` |
| `layer` | accède directement à `engine.scene` / `engine.projection` pour poser sa 3D | `plan-3d` |

## Les plugins

| Package | Voie | Rôle | npm |
|---|---|---|---|
| [`@pasquelin/map3d-plugin-geopf`](../../packages/geopf) | `enrich` | Bâtiments France : au clic sur un bâtiment 3D, remonte les attributs officiels **BDTOPO** de la **Géoplateforme IGN** (nature, usage, hauteur, étages, matériaux…) via `useBuildingEnrichment()`. Le pick reste instantané, l'enrichissement se fait en tâche de fond. | [![npm](https://img.shields.io/npm/v/@pasquelin/map3d-plugin-geopf?color=cb3837&label=)](https://www.npmjs.com/package/@pasquelin/map3d-plugin-geopf) |
| [`@pasquelin/map3d-plugin-windy`](../../packages/windy) | `markers` | Webcams publiques réelles autour de la vue courante ([Windy Webcams API v3](https://api.windy.com/webcams)) : un marker par webcam, vignette en avatar, infobulle d'aperçu et menu (ouvrir / copier le lien). | [![npm](https://img.shields.io/npm/v/@pasquelin/map3d-plugin-windy?color=cb3837&label=)](https://www.npmjs.com/package/@pasquelin/map3d-plugin-windy) |
| [`@pasquelin/map3d-plugin-plan-3d`](../../packages/plan-3d) | `layer` | **Placeholder** de la voie `layer` : dépose un volume repère reprojeté chaque frame. Démontre le contrat, pas un produit. | privé |
| [`@pasquelin/map3d-plugin-template`](../../packages/plugin-template) | — | **Gabarit** à copier pour créer son propre plugin. | privé |

Les deux paquets publiables partagent une **version unifiée** : un tag `vX.Y.Z` les publie ensemble.

## Installation

```bash
npm i @pasquelin/map3d @pasquelin/map3d-plugin-geopf
# ou : pnpm add … / yarn add …
```

`react`, `react-dom` (19), `three` (≥ 0.169) et `@pasquelin/map3d` (^0.2.0) sont des
**peerDependencies** — jamais bundlées par les plugins.

## Démarrage rapide

Un plugin se passe à `<Map>` ; il est **désactivé par défaut** et s'active depuis le hub des
plugins (menu Réglages) de map3D.

```tsx
import { Map } from '@pasquelin/map3d'
import { geopfBatiments } from '@pasquelin/map3d-plugin-geopf'
import { windyWebcams } from '@pasquelin/map3d-plugin-windy'

<Map plugins={[geopfBatiments(), windyWebcams({ apiKey: import.meta.env.VITE_WINDY_API_KEY })]} />
```

Lire l'enrichissement `geopf` depuis un enfant de `<Map>` :

```tsx
import { useBuildingEnrichment } from '@pasquelin/map3d'

function BuildingInfo() {
  const enrichment = useBuildingEnrichment()
  return <pre>{JSON.stringify(enrichment, null, 2)}</pre>
}
```

Chaque package a son README détaillé (options, sécurité de la clé API, limites) et son exemple :

```bash
pnpm --filter @pasquelin/map3d-plugin-geopf-example dev
pnpm --filter @pasquelin/map3d-plugin-windy-example dev
```

## Créer son plugin

```bash
cp -r packages/plugin-template packages/mon-plugin
# renommer `name` et `meta.id`, ajuster `config` et la voie utilisée
pnpm install && pnpm validater
```

Le [contrat de plugin](https://github.com/pasquelin/map3D/blob/main/docs/fr/PLUGINS.md) (`definePlugin`,
voies `enrich` / `markers` / `layer`) est documenté côté map3D. Pour proposer un plugin officiel
ici, voir [CONTRIBUTING.md](../../.github/CONTRIBUTING.md).

## Développement

Monorepo **pnpm** (Node 22). Prérequis : `pnpm install`.

| Commande | Effet |
|---|---|
| `pnpm build` | build lib de chaque package (`dist/` : ESM + CJS + `.d.ts`) |
| `pnpm typecheck` | `tsc --noEmit` par package |
| `pnpm test` | Vitest (tests colocalisés `*.test.ts`) |
| `pnpm lint` / `pnpm format` | ESLint / Prettier |
| **`pnpm validater`** | typecheck + lint + format:check + test — **le garde-fou complet**, rejoué en CI |
| `pnpm version:plugins X.Y.Z` | bump unifié (racine + `geopf` + `windy`) |

Le code, les commentaires et la documentation sont **en français**. `any` est interdit
(`strict` + `noUncheckedIndexedAccess`), `type` plutôt que `interface`.

## Publication

Publication **automatique** par GitHub Actions : pousser un tag `vX.Y.Z` publie les paquets
publiables sur npm, avec **provenance signée** via OIDC (npm Trusted Publishing — aucun token).
Détail du flux dans [CLAUDE.md](../../CLAUDE.md#mise-en-production-release-npm).

## Contribuer

Les features partent de **`develop`** et y retournent par PR (`main` est la branche de release).
Une feature = une branche = un **worktree** isolé. Lire
[CONTRIBUTING.md](../../.github/CONTRIBUTING.md), le [code de conduite](../../.github/CODE_OF_CONDUCT.md) et
la [politique de sécurité](../../.github/SECURITY.md).

## Licence

**MIT** © [Alban Pasquelin](https://github.com/pasquelin) — voir [LICENSE](../../LICENSE).
À noter : la lib map3D elle-même est sous licence **PolyForm Noncommercial**.
