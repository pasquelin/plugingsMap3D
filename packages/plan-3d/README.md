# @pasquelin/map3d-plugin-plan-3d

> ⚠️ **PLACEHOLDER.** Ce plugin est un gabarit de démonstration pour la voie C (`layer`) du
> contrat plugin map3D — il n'implémente **aucune** vraie fonctionnalité « Plan 3D ». Le métier
> réel (quoi représenter, quelle donnée, quelle interaction) reste **à spécifier**. Ne pas publier
> tel quel comme plugin final : c'est un exemple de structure, pas un produit.

Dépose un volume repère (un cube three.js) à une position `(lat, lng)` donnée, reprojeté chaque
frame. C'est la **seule** voie C du monorepo (les autres plugins couvrent enrichissement,
markers, ou couches de données) — elle démontre l'accès direct à `engine.scene` et
`engine.projection` depuis un plugin, pour couvrir tout le contrat `layer`.

## Usage

```tsx
import { Map } from '@pasquelin/map3d'
import { plan3d } from '@pasquelin/map3d-plugin-plan-3d'

<Map plugins={[plan3d()]} />
```

**Compatibilité** : `@pasquelin/map3d` `>=0.2.0 <0.8.0` (peerDependency — de 0.2 à 0.7),
`react` / `react-dom` 19, `three` ≥ 0.169.

Le plugin est **désactivé par défaut** : l'utilisateur l'active depuis le hub des plugins
(menu Réglages).

## Configuration (`plan3d`)

| Clé | Type | Défaut | Description |
|---|---|---|---|
| `lat` | `number` (−90–90) | `48.8566` | Latitude du volume repère. |
| `lng` | `number` (−180–180) | `2.3522` | Longitude du volume repère. |
| `size` | `number` (5–500) | `40` | Taille du cube, en mètres (arête). |
| `color` | `string` | `#e11d48` | Couleur du volume (matériau semi-transparent). |

## Détail technique

- `src/layer.ts` : `createPlanLayer(ctx)` — ajoute un `THREE.Group` contenant un `THREE.Mesh`
  (cube) à `engine.scene`, repositionné à chaque `update()` via
  `engine.projection.latLngToWorld(...)` (le groupe globe peut bouger). Respecte la séparation
  lecture/écriture : rien dans `project()`. Appelle `ctx.invalidate()` tant que l'objet vit, pour
  ne pas geler l'animation sous `renderOnDemand`.
- `src/index.ts` : `plan3d()` — assemble le tout via `definePlugin`, voie `layer`.

## Exemple

```bash
pnpm --filter @pasquelin/map3d-plugin-plan-3d-example dev
```

Aucune clé n'est nécessaire : par défaut, le fond de carte et les bâtiments viennent de l'origine
interne de map3D (`providers.internal.origin`). `VITE_CESIUM_ION_TOKEN` (fichier `.env` du
package `example/`) est facultatif : renseigné, l'exemple branche les tuiles 3D photoréalistes,
ce qui demande les deux à la fois — la source `tileset3d={cesiumIon({ token })}` **et** le
réglage `providers.tiles3d.provider: 'external'` —, à voir en passant la carte en 3D.
