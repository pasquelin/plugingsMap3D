# Journal des modifications

Format inspiré de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/).
Les plugins publiables (`@map3d/plugin-geopf`, `@map3d/plugin-windy`) partagent **une
version unifiée** : un tag `vX.Y.Z` les publie ensemble. `@map3d/plugin-plan-3d`
(placeholder) et `@map3d/plugin-template` (gabarit) restent **privés, non publiés**.

## [Non publié]

## [0.1.0] — 2026-08-02

### feat : chaîne de publication npm (comme map3D)

Première version publiée de `@map3d/plugin-geopf` et `@map3d/plugin-windy`. Packaging :

- Correction de la dépendance à la lib : import et peerDependency `@pasquelin/map3d ^0.2.0`
  (au lieu du nom `map3d` en `file:`, qui excluait même la 0.2.0 publiée).
- `@map3d/plugin-geopf` et `@map3d/plugin-windy` deviennent publiables : build lib
  (ESM + CJS + types via `vite` + `vite-plugin-dts`, react/three/`@pasquelin/map3d`
  externalisés), `exports`, `files` slim (`dist` + `LICENSE` + `README`),
  `publishConfig.provenance`, licence **MIT**.
- CI (`ci.yml`) et release OIDC (`release.yml`, publication par tag `vX.Y.Z` sans token) —
  miroir de map3D. Branche `develop` comme base d'intégration.
- Script de bump unifié `pnpm version:plugins X.Y.Z`.
