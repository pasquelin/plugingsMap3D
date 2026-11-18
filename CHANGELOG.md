# Journal des modifications

Format inspiré de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/).
Les plugins publiables (`@pasquelin/map3d-plugin-geopf`, `@pasquelin/map3d-plugin-windy`) partagent **une
version unifiée** : un tag `vX.Y.Z` les publie ensemble. `@pasquelin/map3d-plugin-plan-3d`
(placeholder) et `@pasquelin/map3d-plugin-template` (gabarit) restent **privés, non publiés**.

## [Non publié]

### ci : la plage `@pasquelin/map3d` est vérifiée à ses deux bornes et tenue à une seule source

Suite de la 0.1.2, sans effet sur les paquets publiés : aucun changement dans leur code ni dans
leur `package.json`.

- **La CI rejoue les paquets contre la plus ancienne map3d qu'ils annoncent.** Elle ne voyait
  que la dépendance de développement (0.7.0), alors que les `peerDependencies` partent de
  0.2.0. Un second job, `map3d-min`, installe le dépôt, remplace map3d par la borne basse de
  la plage, puis lance le typecheck des quatre paquets et les tests — pas les exemples, qui
  demandent map3d ≥ 0.7.0.
- **`pnpm check:range`** (`scripts/map3d-range.mjs`), rejoué par `pnpm validater`, donc par la
  CI et la release. La plage était recopiée à la main dans les quatre `package.json` et dans
  la documentation. Le script la lit à une seule source — les `peerDependencies` de `geopf` —
  et sort en erreur, fichier et ligne à l'appui, si un `package.json` de `packages/` ou une
  citation d'un fichier `.md` s'en écarte, sous ses deux écritures (`>=0.2.0 <0.8.0`, « de 0.2
  à 0.7 »). Ce journal, lui, garde les plages de son époque : il n'est pas contrôlé. Le job
  `map3d-min` lit sa version au même endroit (`--min`). Le script tient aussi la dépendance
  de développement de la racine sur la mineure la plus récente de la plage (`^0.7.0`) : la CI
  ne vérifie la borne haute que par elle.
- **`engines.node` `>=22.13` au `package.json` racine** (privé), le plancher que la
  documentation annonçait sans que rien ne le porte. Sous cette version, pnpm avertit
  (`WARN Unsupported engine`) sans refuser : le mode strict (`engine-strict`) n'est pas
  activé. Les paquets publiés ne déclarent pas d'`engines` — un plugin n'impose pas de version
  de Node à l'application qui l'installe.
- **Copier le gabarit** : la documentation dit désormais que l'exemple copié nomme encore
  `plugin-template`, à renommer ensemble — `example/package.json` (`name` et la dépendance),
  l'import de `example/src/App.tsx`, la clé `paths` de `example/tsconfig.json`, l'alias de
  `example/vite.config.ts` et, pour la forme, le `<title>` de `example/index.html`. Un
  renommage partiel peut passer sans aucune erreur : alias renommé, import et dépendance
  laissés sur `plugin-template`, l'exemple charge le gabarit à la place du nouveau plugin.

## [0.1.2] — 2026-11-18

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
    `z-index`, il restait sous le canvas, invisible. Il dit aussi quand l'IGN n'a aucun
    bâtiment autour du point cliqué. Le README du paquet donne ce même composant à recopier.
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
