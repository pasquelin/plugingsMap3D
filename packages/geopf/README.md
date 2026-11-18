# @pasquelin/map3d-plugin-geopf

Bâtiments France (BDTOPO) — enrichissement au pick. Au clic sur un bâtiment 3D, interroge le
service WFS de la Géoplateforme IGN (`BDTOPO_V3:batiment`) et remonte ses attributs officiels
(nature, usage, hauteur, étages, date de création, matériaux des murs…) via `useBuildingEnrichment()`.
Le pick reste **instantané** : `enrichBuilding` s'exécute après `buildingclick`, en tâche de fond.

Voie « enrichir » du contrat plugin — zéro marker, zéro couche 3D : uniquement `enrichBuilding`.

## Usage

```tsx
import { Map } from '@pasquelin/map3d'
import { geopfBatiments } from '@pasquelin/map3d-plugin-geopf'

<Map plugins={[geopfBatiments()]} />
```

**Compatibilité** : `@pasquelin/map3d` `>=0.2.0 <0.8.0` (peerDependency — de 0.2 à 0.7),
`react` / `react-dom` 19, `three` ≥ 0.169.

Le plugin est **désactivé par défaut** (`enabledByDefault: false`) : l'utilisateur l'active depuis
le hub des plugins (menu Réglages). Une fois actif, il s'active sur l'outil « sélectionner un
bâtiment » (pick de bâtiment 3D) déjà fourni par map3D.

Cet outil n'existe que lorsque la carte montre le **volume interne** de map3D : mode `'3d'` et
`providers.tiles3d.provider: 'internal'` (le défaut), bâtiments extrudés servis par l'origine
interne. Sur une carte plate ou sur des tuiles 3D photoréalistes — un maillage fusionné, sans
bâtiment distinct — il n'y a rien à désigner, donc rien à enrichir.

Pour lire l'enrichissement dans l'hôte, monter un composant enfant de `<Map>` (le hook exige le
contexte carte) :

```tsx
import type { CSSProperties } from 'react'
import { useBuildingEnrichment } from '@pasquelin/map3d'

const panel: CSSProperties = {
  position: 'absolute',
  top: 16,
  left: 16,
  right: 16,
  width: 'fit-content',
  margin: '0 auto',
  zIndex: 'var(--m3d-z-floating-hud)',
  padding: '10px 14px',
  border: '1px solid var(--m3d-border)',
  borderRadius: 'var(--m3d-radius-lg)',
  background: 'var(--m3d-panel)',
  fontSize: 'var(--m3d-size-sm)',
  lineHeight: 1.5,
}

function BuildingInfo() {
  const e = useBuildingEnrichment()
  if (e.loading) return <div style={panel}>Chargement…</div>
  if (e.error) return <div style={panel}>Indisponible : {e.error.message}</div>
  if (!e.data) return null
  const attrs = Object.entries(e.data)
  if (attrs.length === 0) return <div style={panel}>Aucun attribut IGN pour ce bâtiment</div>
  return (
    <div style={panel}>
      {attrs.map(([k, v]) => (
        <div key={k}>
          <b>{k}</b> : {String(v)}
        </div>
      ))}
    </div>
  )
}
```

L'exemple du dépôt
([`example/src/App.tsx`](https://github.com/pasquelin/plugingsMap3D/blob/main/packages/geopf/example/src/App.tsx))
monte ce même composant. Le canvas de la carte est en position absolue : un enfant de `<Map>`
laissé dans le flux reste dessous, invisible. D'où la position et le niveau « HUD flottant » de la
carte (`--m3d-z-floating-hud`, qui suit `style.zIndex.floatingHud`) : au-dessus d'elle, sous ses
barres. Fond, bordure et arrondi viennent du thème de la carte ; la couleur du texte et la police
en sont héritées. Le panneau est ici centré en haut : placez-le où votre interface laisse de la
place (avec `<Map search>`, le champ de recherche occupe le coin haut-gauche sur 320 px et passe
au-dessus). `e.data` vaut `{}` quand le plugin n'a aucun attribut à remonter : le plus souvent,
aucun bâtiment BDTOPO dans la zone de recherche (`searchRadius`) autour du point cliqué.

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
pnpm --filter @pasquelin/map3d-plugin-geopf-example dev
```

Aucune clé n'est nécessaire. L'exemple tourne sur les sources par défaut de map3D : le fond de
carte et les bâtiments extrudés viennent de son origine interne (`providers.internal.origin`). Il
démarre en 3D (`mapMode="3d"`), là où l'outil de sélection de bâtiment existe.
