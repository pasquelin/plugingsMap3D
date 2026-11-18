# Journal des modifications

Format inspiré de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/).
Les plugins publiables (`@pasquelin/map3d-plugin-geopf`, `@pasquelin/map3d-plugin-windy`) partagent **une
version unifiée** : un tag `vX.Y.Z` les publie ensemble. `@pasquelin/map3d-plugin-plan-3d`
(placeholder) et `@pasquelin/map3d-plugin-template` (gabarit) restent **privés, non publiés**.

## [Non publié]

### fix : les plugins acceptent `@pasquelin/map3d` de 0.2 à 0.7

Le dépôt était resté sur map3d 0.2.0. Sa peerDependency `^0.2.0` n'acceptait que les 0.2.x —
en `0.x`, le caret ne franchit pas la mineure — et écartait donc les versions 0.3 à 0.7 de la
lib, alors que rien dans le code des plugins ne s'y opposait.

- **peerDependency `@pasquelin/map3d` : `^0.2.0` → `>=0.2.0 <0.8.0`** sur les quatre paquets
  (`geopf`, `windy`, `plan-3d`, `plugin-template`). La plage s'élargit : aucune application
  n'est écartée, ce n'est pas une rupture.
- **La borne haute se relève à chaque nouvelle mineure de map3d, après vérification** des
  plugins contre elle : en `0.x`, une mineure de la lib peut casser le contrat de plugin.
- **Aucun changement dans le code des plugins.** Ce qu'ils consomment de la lib
  (`definePlugin`, `fetchWithPolicy`, les types `PluginField`, `MarkerData`, `MenuItem`,
  `Bounds`, `Layer`, `PluginLayerContext`) n'a pas bougé de map3d 0.2.0 à 0.7.0 ; la forme de
  `Plugin.markerLayer` a seulement reçu un nom (`MarkerLayerDecl`, map3d 0.4.0), à
  l'identique. Contre chaque mineure de 0.2.0 à 0.7.0, les paquets passent le typecheck et
  les tests, et le `dist/` de `geopf` et de `windy` sort identique, à l'octet, à celui publié
  en 0.1.1.
- **Les exemples, eux, demandent map3d ≥ 0.7.0** (dépendance de développement `^0.7.0`, donc
  Node ≥ 22.13). La lib a retiré la prop `cesiumIonToken` de `<Map>`, et son volume par défaut
  est celui de son serveur de tuiles (`providers.tiles3d.provider: 'internal'`), qui laisse
  gelée toute source photoréaliste :
  - `geopf` n'a plus de jeton Cesium. Son exemple tourne sur les sources par défaut et démarre
    en 3D : un bâtiment ne se désigne que sur ce volume interne. Son panneau d'attributs
    passe au-dessus de la carte, au niveau et aux couleurs de son thème : sans position ni
    `z-index`, il restait sous le canvas, invisible (le composant à recopier du README du
    paquet porte désormais sa position). Il dit aussi quand l'IGN n'a aucun bâtiment sous le
    point cliqué.
  - `windy`, `plan-3d` et `plugin-template` gardent `VITE_CESIUM_ION_TOKEN`, facultatif.
    Renseigné, l'exemple passe la source `tileset3d={cesiumIon({ token })}` (entrée à part
    `@pasquelin/map3d/cesium-ion`) **et** le réglage `providers.tiles3d.provider: 'external'` ;
    sans lui, la carte garde ses sources par défaut.

### ci : `pnpm typecheck` couvre aussi les exemples

Chaque exemple a son `tsconfig.json` et son script `typecheck` : `pnpm validater`, donc la CI,
les lit désormais. Aucun contrôle ne le faisait — une prop de `<Map>` retirée par la lib
(`cesiumIonToken`, map3d 0.7.0) y restait sans rien casser.

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
