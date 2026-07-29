# @map3d/plugin-geopf

Bâtiments France (BDTOPO) — enrichissement au pick. Au clic sur un bâtiment 3D, interroge le
service WFS de la Géoplateforme IGN (`BDTOPO_V3:batiment`) et remonte ses attributs officiels
(nature, usage, hauteur, étages, date de création, matériaux des murs…) via `useBuildingEnrichment()`.
Le pick reste **instantané** : `enrichBuilding` s'exécute après `buildingclick`, en tâche de fond.

Voie « enrichir » du contrat plugin — zéro marker, zéro couche 3D : uniquement `enrichBuilding`.

## Usage

```tsx
import { Map } from 'map3d'
import { geopfBatiments } from '@map3d/plugin-geopf'

<Map plugins={[geopfBatiments()]} />
```

Le plugin est **désactivé par défaut** (`enabledByDefault: false`) : l'utilisateur l'active depuis
le hub des plugins (menu Réglages). Une fois actif, il s'active sur l'outil « sélectionner un
bâtiment » (pick de bâtiment 3D) déjà fourni par map3D.

Pour lire l'enrichissement dans l'hôte, monter un composant enfant de `<Map>` (le hook exige le
contexte carte) :

```tsx
import { useBuildingEnrichment } from 'map3d'

function BuildingInfo() {
  const e = useBuildingEnrichment()
  if (e.loading) return <div>Chargement…</div>
  if (e.error) return <div>Indisponible : {e.error.message}</div>
  if (!e.data) return null
  return <div>{Object.entries(e.data).map(([k, v]) => <div key={k}>{k} : {String(v)}</div>)}</div>
}
```

## Configuration (`geopfConfig`)

| Clé | Type | Défaut | Refetch | Description |
|---|---|---|---|---|
| `searchRadius` | `number` (5–100) | `25` | oui | Rayon de recherche autour du point cliqué, en mètres — détermine la BBOX WFS envoyée. |
| `count` | `number` (1–100) | `20` | oui | Nombre maximal de features demandées au service (`COUNT`). |
| `matchContaining` | `boolean` | `true` | oui | Si vrai, retient le polygone qui **contient** le point cliqué ; sinon le plus proche par centroïde. |
| `showEmpty` | `boolean` | `false` | non | Affiche aussi les attributs BDTOPO vides (sinon élagués). |
| `apiUrl` | `string` | `https://data.geopf.fr/wfs/ows` | oui | Endpoint WFS (à changer pour un miroir/proxy éventuel). |

## Détail technique

- `src/config.ts` : schéma de config (`PluginField[]`) — seule source des défauts.
- `src/wfs.ts` : `buildGetFeatureUrl` (BBOX carrée EPSG:4326 centrée sur le point) + `pickBuilding`
  (point-dans-polygone par ray casting, zéro dépendance).
- `src/attributes.ts` : `mapAttributes` — projette les clés BDTOPO brutes sur des étiquettes FR
  stables (table `FIELDS`), élague les valeurs vides sauf `showEmpty`.
- `src/index.ts` : `geopfBatiments()` — assemble le tout dans `enrichBuilding`.

## Exemple

```bash
pnpm --filter @map3d/plugin-geopf-example dev
```

Nécessite `VITE_CESIUM_ION_TOKEN` (fichier `.env` du package `example/`) pour de vrais bâtiments 3D ;
sans token l'exemple retombe sur le globe ellipsoïde de repli (le pick de bâtiment ne peut alors
rien enrichir).
