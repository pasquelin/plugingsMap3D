## Ce que fait cette PR

<!-- Le *pourquoi* avant le *quoi*. Une PR = un sujet. -->

Closes #

## Plugin(s) concerné(s)

- [ ] `@pasquelin/map3d-plugin-geopf`
- [ ] `@pasquelin/map3d-plugin-windy`
- [ ] `@pasquelin/map3d-plugin-plan-3d`
- [ ] `@pasquelin/map3d-plugin-template`
- [ ] Monorepo (build, CI, docs, outillage)

## Type

- [ ] `feat` — nouvelle fonctionnalité
- [ ] `fix` — correction de bug
- [ ] `docs` — documentation seule
- [ ] `refactor` / `perf` / `test` / `chore` / `ci`
- [ ] ⚠️ **Rupture d'API** (documentée dans le CHANGELOG)

## Vérifications

- [ ] La PR cible **`develop`** (et non `main`).
- [ ] Le titre suit les [Conventional Commits](https://www.conventionalcommits.org/fr/).
- [ ] `pnpm validater` passe en local (typecheck + lint + format:check + test).
- [ ] Des tests couvrent le changement (`*.test.ts` colocalisés).
- [ ] L'exemple du plugin tourne toujours : `pnpm --filter @pasquelin/map3d-plugin-<nom>-example dev`.
- [ ] `CHANGELOG.md` mis à jour sous `## [Non publié]` si le changement est visible pour l'utilisateur.
- [ ] Aucune clé d'API ni secret committé ; aucun `any` introduit.
- [ ] Aucune peerDependency (`react`, `react-dom`, `three`, `@pasquelin/map3d`) ajoutée aux `dependencies`.

## Comment tester

<!-- Étapes concrètes pour rejouer le changement. Capture ou GIF si l'effet est visuel. -->
