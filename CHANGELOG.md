# Journal des modifications

Format inspiré de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/).
Les plugins publiables (`@pasquelin/map3d-plugin-geopf`, `@pasquelin/map3d-plugin-windy`) partagent **une
version unifiée** : un tag `vX.Y.Z` les publie ensemble. `@pasquelin/map3d-plugin-plan-3d`
(placeholder) et `@pasquelin/map3d-plugin-template` (gabarit) restent **privés, non publiés**.

## [Non publié]

## [0.1.1] — 2026-08-02

### ci : release en OIDC pur

Le trusted publisher npm est configuré pour `@pasquelin/map3d-plugin-geopf` et `-windy` :
`release.yml` publie désormais **sans `NPM_TOKEN`** (le token n'avait servi qu'au bootstrap
du tout premier publish 0.1.0, l'OIDC ne pouvant pas créer un paquet neuf). Provenance
toujours signée via OIDC.

## [0.1.0] — 2026-08-02

### feat : chaîne de publication npm (comme map3D)

Première version publiée de `@pasquelin/map3d-plugin-geopf` et `@pasquelin/map3d-plugin-windy`. Packaging :

- Correction de la dépendance à la lib : import et peerDependency `@pasquelin/map3d ^0.2.0`
  (au lieu du nom `map3d` en `file:`, qui excluait même la 0.2.0 publiée).
- `@pasquelin/map3d-plugin-geopf` et `@pasquelin/map3d-plugin-windy` deviennent publiables : build lib
  (ESM + CJS + types via `vite` + `vite-plugin-dts`, react/three/`@pasquelin/map3d`
  externalisés), `exports`, `files` slim (`dist` + `LICENSE` + `README`),
  `publishConfig.provenance`, licence **MIT**.
- CI (`ci.yml`) et release OIDC (`release.yml`, publication par tag `vX.Y.Z` sans token) —
  miroir de map3D. Branche `develop` comme base d'intégration.
- Script de bump unifié `pnpm version:plugins X.Y.Z`.
