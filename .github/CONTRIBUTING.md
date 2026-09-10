# Contribuer à map3d-plugins

Merci de l'intérêt porté aux plugins officiels de [map3D](https://github.com/pasquelin/map3D) !
Ce document décrit le strict nécessaire pour qu'une contribution soit fusionnable.

Le projet est **francophone** : code, commentaires, JSDoc, docs et messages de commit sont
rédigés **en français**. Les identifiants restent en anglais (`enrichBuilding`, `apiKey`…).

## Prérequis

- **Node 22** et **pnpm** (la version est épinglée par `packageManager` dans le `package.json` racine)
- `pnpm install` à la racine — le monorepo couvre `packages/*` et `packages/*/example`

## Le garde-fou : `pnpm validater`

```bash
pnpm validater   # typecheck + lint + format:check + test
```

C'est **exactement** ce que rejoue la CI sur chaque PR. Une PR dont `validater` échoue ne peut pas
être fusionnée — lance-le en local avant de pousser.

| Commande | Effet |
|---|---|
| `pnpm build` | build lib de chaque package (`dist/` : ESM + CJS + `.d.ts`) |
| `pnpm typecheck` | `tsc --noEmit` par package |
| `pnpm test` | Vitest (tests colocalisés `*.test.ts`) |
| `pnpm lint` / `pnpm format` | ESLint / Prettier |
| `pnpm --filter @pasquelin/map3d-plugin-<nom>-example dev` | lance l'exemple d'un plugin |

## Modèle de branches

- **`develop`** est la base d'intégration : une feature part de `develop` et y retourne **par PR**.
- **`main`** est la branche de release : elle ne reçoit que les fusions de release et les tags `vX.Y.Z`.

Une feature = une branche = un **`git worktree` isolé**. Jamais deux sessions dans le même
working tree : les index se marchent dessus.

```bash
git worktree add ../map3d-plugins-feat-x -b feat/x develop
# … commits sur feat/x … → PR vers develop
git worktree remove ../map3d-plugins-feat-x
```

Ajoute les fichiers **par chemin explicite** (`git add packages/windy/src/index.ts`), pas `git add -A`.

## Messages de commit

Convention [Conventional Commits](https://www.conventionalcommits.org/fr/), en français :

```
feat(windy): filtre les webcams hors service
fix(geopf): gère la réponse WFS vide
docs(readme): tableau des plugins
chore(release): 0.2.0
```

Portées usuelles : `geopf`, `windy`, `plan-3d`, `template`, `ci`, `docs`, `build`, `release`.

## Conventions de code

- **Point d'entrée public** de chaque package : `src/index.ts`.
- **Style Prettier** : pas de `;`, guillemets simples, `printWidth: 120`, `trailingComma: all`.
- **`any` interdit** (`@typescript-eslint/no-explicit-any: error`), **`type` jamais `interface`**,
  `strict` + `noUncheckedIndexedAccess`. Paramètre volontairement ignoré : préfixe `_`.
- Les peerDependencies (`react`, `react-dom`, `three`, `@pasquelin/map3d`) sont **externalisées** —
  ne rien en embarquer dans un `dist/`.
- Tests **colocalisés** `*.test.ts`. Commentaires courts, qui expliquent le *pourquoi*.
- **Aucun secret committé** : une clé d'API vit dans l'`example/.env` (gitignoré), documentée sans
  valeur réelle dans `example/.env.example`.

## Ajouter un plugin

1. `cp -r packages/plugin-template packages/mon-plugin`, puis renommer `name` et `meta.id`.
2. Choisir **une** voie du contrat (`enrich`, `markers` ou `layer`) — voir le
   [contrat de plugin](https://github.com/pasquelin/map3D/blob/main/docs/fr/PLUGINS.md).
3. Écrire son `README.md`, son exemple exécutable dans `example/` et ses tests.
4. Le laisser **`private: true`** par défaut. Pour le rendre publiable : retirer `private`,
   compléter le packaging (`exports`, `files` slim, `publishConfig.provenance`, `LICENSE` MIT),
   l'intégrer à la version unifiée et aux étapes `publish` de `.github/workflows/release.yml`.

> Le tout premier publish d'un paquet neuf ne peut pas passer par l'OIDC seul (le trusted publisher
> s'attache à un paquet **existant**) : il faut un `NPM_TOKEN` temporaire, puis configurer le
> trusted publisher et retirer le token.

## Ouvrir une PR

- Cible **`develop`**, titre au format Conventional Commits.
- Décris le *pourquoi*, pas seulement le *quoi* ; capture d'écran ou GIF si l'effet est visuel.
- `pnpm validater` vert, CHANGELOG mis à jour sous `## [Non publié]` si le changement est visible.
- Une PR = un sujet. Les refactos opportunistes vont dans leur propre PR.

## Signaler un bug ou proposer une idée

Passe par les [issues](https://github.com/pasquelin/map3d-plugins/issues) et leurs gabarits.
Pour une **faille de sécurité**, ne pas ouvrir d'issue publique : voir [SECURITY.md](SECURITY.md).
