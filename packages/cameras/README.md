# @map3d/plugin-cameras

Caméras / points vidéo du quartier — voie « markers » du contrat plugin (`data.fetch`), zéro
enrichissement, zéro couche 3D custom. **Métier fin à préciser** : aucune vraie source de données
n'est câblée pour l'instant ; le plugin retombe sur un **repli procédural déterministe** qui répartit
`count` marqueurs dans les bounds de la vue courante, sans appel réseau.

`apiUrl` est réservé pour brancher une source réelle plus tard (un flux caméras d'une ville, un WFS,
une API tierce…) ; tant qu'il est vide, le repli procédural s'applique.

## Usage

```tsx
import { Map } from 'map3d'
import { cameras } from '@map3d/plugin-cameras'

<Map plugins={[cameras()]} />
```

Le plugin est **désactivé par défaut** (`enabledByDefault: false`) : l'utilisateur l'active depuis
le hub des plugins (menu Réglages).

## Configuration

| Clé | Type | Défaut | Refetch | Description |
|---|---|---|---|---|
| `count` | `number` (1–80) | `10` | oui | Nombre de caméras générées dans la vue. |
| `apiUrl` | `string` | `''` | oui | Source réelle à brancher plus tard (vide = démo procédurale). |

## Détail technique

- `src/index.ts` : `cameras()` — assemble `meta`, `config`, `data.fetch` (repli procédural) et
  `markerLayer: { cluster: { enabled: true } }` (les marqueurs se regroupent au dézoom).
- Le repli est **pur et déterministe** : à `viewport`/`config` identiques, `fetch` renvoie toujours
  le même tableau (positions calculées à partir de l'index `i` et des bounds, aucun `Math.random`).

## Exemple

```bash
pnpm --filter @map3d/plugin-cameras-example dev
```

Nécessite `VITE_CESIUM_ION_TOKEN` (fichier `.env` du package `example/`) pour de vrais bâtiments 3D ;
sans token l'exemple retombe sur le globe ellipsoïde de repli.
