# CLAUDE.md

Guide pour Claude Code (claude.ai/code) sur ce dépôt.

## Nature du projet

**Monorepo pnpm des plugins officiels de map3D** — publiés sous le scope **`@pasquelin`**
(paquets `@pasquelin/map3d-plugin-*`).
**1 plugin = 1 package** (`packages/<nom>/`) + son exemple (`packages/<nom>/example/`).
Le code (commentaires, JSDoc, docs) est **en français** : s'y conformer.

Les plugins étendent la lib **`@pasquelin/map3d`** (dépôt sibling `../map3D`, publié sur
npm). Ils l'importent et la déclarent en **peerDependency `@pasquelin/map3d` `^0.2.0`** —
jamais bundlée. Idem `react`/`react-dom` 19 et `three` ≥ 0.169. Le contrat de plugin
(`definePlugin`, voies `enrich`/`markers`/`layer`) vient de la lib.

Gestionnaire de paquets : **pnpm** (`pnpm-workspace.yaml` → `packages/*`, `packages/*/example`).

## Paquets — publiables vs privés

| Package | Publié ? | Rôle |
|---|---|---|
| `@pasquelin/map3d-plugin-geopf` | **oui** | bâtiments BDTOPO/IGN au pick (voie `enrich`) |
| `@pasquelin/map3d-plugin-windy` | **oui** | webcams Windy autour de la vue (voie `markers`) |
| `@pasquelin/map3d-plugin-plan-3d` | **non** (`private`) | **placeholder** de la voie `layer` — pas de métier réel |
| `@pasquelin/map3d-plugin-template` | **non** (`private`) | gabarit pour créer un plugin |

Les deux paquets publiables partagent **une version unifiée** (cf. release).

## Commandes

```bash
pnpm install
pnpm build            # pnpm -r : build lib de chaque package (dist/ ESM+CJS+.d.ts)
pnpm typecheck        # pnpm -r typecheck (tsc --noEmit par package)
pnpm test             # vitest run (tests colocalisés *.test.ts)
pnpm lint             # eslint packages
pnpm format           # prettier --write "packages/**/*.{ts,tsx}"
pnpm format:check
pnpm validater        # typecheck + lint + format:check + test — le garde-fou complet
pnpm version:plugins X.Y.Z   # bump UNIFIÉ (racine + geopf + windy)
```

Exemple d'un plugin : `pnpm --filter @pasquelin/map3d-plugin-<nom>-example dev`. Les exemples
résolvent `@pasquelin/map3d` via node_modules (la version npm) — **plus besoin** du
sibling `../map3D` buildé pour développer/typechecker les plugins.

## Build d'un plugin (lib)

Chaque package publiable est buildé en **library mode** via la config partagée
`build/viteLib.mjs` (importée par `packages/<nom>/vite.config.ts`) : entrée
`src/index.ts`, formats **ESM (`index.js`) + CJS (`index.cjs`)**, types **par fichier**
(`vite-plugin-dts`, `dist/index.d.ts` = point d'entrée). Sont **externalisés** (jamais
bundlés) : `react`, `react-dom`, `react/jsx-runtime`, `three` (+ `three/*`),
`three-mesh-bvh`, `@pasquelin/map3d`. `sourcemap: false`, `minify: false`.

Packaging (`package.json` d'un paquet publiable) : `exports` (types/import/require),
`files: ["dist", "LICENSE", "README.md"]` (paquet **slim**, pas de `src`),
`publishConfig: { access: "public", provenance: true }`, `sideEffects: false`,
licence **MIT**.

## Mise en production (release npm)

Publication **automatique** par GitHub Actions : **pousser un tag `vX.Y.Z` déclenche la
publication** des paquets publiables. La **provenance** est signée via **OIDC**
(`id-token: write`).

Auth : **secret `NPM_TOKEN`** (bootstrap). Le premier publish d'un paquet **neuf** ne peut
pas passer par l'OIDC seul (il renvoie 404 « no permission » : le trusted publisher
s'attache à un paquet **existant**). Une fois `@pasquelin/map3d-plugin-*` publiés une première fois,
configurer le **trusted publisher** par paquet côté npm (repo `pasquelin/plugingsMap3D` →
`release.yml`) et retirer le token pour passer en OIDC pur.

### Versioning — version UNIFIÉE

`geopf` et `windy` **partagent la même version** ; un tag `vX.Y.Z` les publie **ensemble**.
SemVer en `0.x` (une mineure peut casser l'API — le documenter dans `CHANGELOG.md`).
`pnpm version:plugins X.Y.Z` aligne la racine et les deux paquets d'un coup (`plan-3d` et
`plugin-template` restent hors release).

### Le flux, étape par étape

1. **Pré-vol** : sur `main`, à jour, `pnpm validater` vert en local.
2. **CHANGELOG** : déplacer `## [Non publié]` vers `## [X.Y.Z] — AAAA-MM-JJ`, même commit.
3. **Bump + tag** :
   ```bash
   pnpm version:plugins X.Y.Z
   git commit -am "chore(release): X.Y.Z"
   git tag vX.Y.Z
   ```
4. **Publier** : `git push --follow-tags` → le workflow publie.
5. **Vérifier** : `npm view @pasquelin/map3d-plugin-geopf version` (idem windy).

### Ce que fait `.github/workflows/release.yml`

Sur tag `v*.*.*` : garde-fou **tag == version de CHAQUE paquet publié** → `pnpm validater`
→ `pnpm build` → `npm publish --provenance --access public` **par dossier de paquet**
(`packages/geopf`, `packages/windy`). Auth par `NPM_TOKEN` (bootstrap), **provenance signée
via OIDC** (`id-token: write`, `npm i -g npm@latest`).

### Règles de bonne version (à ne pas violer)

- **Une version publiée est définitive** : on **bumpe** (jamais republier `X.Y.Z`).
- **Re-tagger seulement si le publish a échoué AVANT `npm publish`** ; sinon, bumper.
- **Un tag = un commit sur `main`** (le workflow checkout le commit taggé).
- **Paquet slim** : `files` = `dist`, `LICENSE`, `README.md` ; pas de source maps.

### CI (`.github/workflows/ci.yml`)

À chaque push sur `main`/`develop` et chaque PR : rejoue `pnpm validater`. Un test cassé
(ou un `any`/format qui glisse) bloque la fusion.

## Modèle de branches — `develop` base d'intégration, `main` release

Comme map3D : les features partent de **`develop`** et y retournent (**branche → PR vers
`develop`**). `main` reste la branche de release (tag `vX.Y.Z`).

- **Owner (admin) = bypass** : Alban peut pousser en direct (release, correctif rapide).
- **Contributeur** : branche depuis `develop` → PR vers `develop` → CI verte → merge.

### Une feature = une branche = un worktree (isolation OBLIGATOIRE)

Chaque feature dans son **propre `git worktree`** (dossier + index isolés), jamais deux
sessions/agents dans le même working tree (collisions d'index — cf. map3D). `git add` par
chemin explicite, pas `git add -A` si l'index est partagé.

```bash
git worktree add ../plugingsMap3D-feat-x -b feat/x develop
# … commits sur feat/x … → PR vers develop
git worktree remove ../plugingsMap3D-feat-x
```

## Ajouter un plugin

Copier `packages/plugin-template` (structure + `vite.config.ts` + `tsconfig.json`),
renommer en `@pasquelin/map3d-plugin-<nom>`. S'il doit être publié : retirer `private`, compléter le
packaging (cf. `geopf`/`windy`), ajouter son `LICENSE`, l'inclure dans la version unifiée
et dans les étapes `publish` de `release.yml`. Sinon, le laisser `private`.

## Conventions

- **Point d'entrée public** de chaque package : `src/index.ts`.
- **Style** (Prettier) : pas de `;`, guillemets simples, `printWidth: 120`, `trailingComma: all`.
- **`any` interdit** (`@typescript-eslint/no-explicit-any: error`), **`type` jamais `interface`**,
  `strict` + `noUncheckedIndexedAccess`. Paramètre ignoré : préfixe `_`.
- Peer deps (`react`, `react-dom`, `three`, `@pasquelin/map3d`) **externalisées** — ne rien
  en embarquer.
- Tests colocalisés `*.test.ts`. Commentaires courts et utiles (le *pourquoi*).
- **Licence** : `MIT` (contrairement à la lib map3D en PolyForm-Noncommercial).
