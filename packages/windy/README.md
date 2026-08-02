# @map3d/plugin-windy

Webcams publiques **réelles** autour de la vue — voie « markers » du contrat plugin
(`data.fetch`), zéro enrichissement, zéro couche 3D custom. Interroge la
[Windy Webcams API v3](https://api.windy.com/webcams/api/v3/webcams) (bbox de la vue courante,
clé API en header `x-windy-api-key`) et pose un marker `webcam` par résultat, avec une vignette
en avatar, une infobulle (aperçu + localisation) et un menu (ouvrir / copier le lien).

## Usage

```tsx
import { Map } from '@pasquelin/map3d'
import { windyWebcams } from '@map3d/plugin-windy'

<Map plugins={[windyWebcams({ apiKey: import.meta.env.VITE_WINDY_API_KEY })]} />
```

Le plugin est **désactivé par défaut** (`enabledByDefault: false`) : l'utilisateur l'active
depuis le hub des plugins (menu Réglages). `init.apiKey` ne fait que **seeder** le défaut du champ
`apiKey` — modifiable ensuite depuis le hub (champ `secret`, jamais affiché en clair).

## Clé API — sécurité

La clé n'est **jamais** committée. Elle vit uniquement dans `example/.env` (gitignoré) :

```
VITE_WINDY_API_KEY=...
```

`example/.env.example` documente la variable sans valeur réelle.

## Configuration

| Clé | Type | Défaut | Refetch | Description |
|---|---|---|---|---|
| `apiKey` | `string` (secret) | `''` (seedé par `init.apiKey`) | oui | Clé API Windy Webcams (header `x-windy-api-key`). |
| `category` | `string` | `''` | oui | Filtre `categories` de l'API ; vide ou `'all'` = pas de filtre. |
| `maxWebcams` | `number` (1–100) | `50` | oui | Nombre max de webcams demandées (`limit`). |
| `thumbnailSize` | `select` (`thumbnail`/`preview`/`daylight`) | `'preview'` | non | Taille d'image utilisée pour l'avatar et la vignette d'infobulle. |

## Déviation assumée : `refreshMinutes`

Le spec métier prévoyait un `refreshMinutes` pour un polling périodique. `data.refresh` est un
champ **statique** du plugin (évalué une fois, il ne peut pas relire la config au runtime) — il
ne peut donc pas être piloté par un réglage utilisateur. Dropé en v1 : les webcams se
rafraîchissent au déplacement de la vue (`refresh: 'viewport'`). Un polling réglable est un
suivi possible côté map3D (champ `data.refresh` dynamique), pas une limitation de ce plugin.

## Détail technique

- `src/config.ts` : `WindyConfig` — écrit à la main (pas dérivé du schéma) car `apiKey` est
  seedé au runtime et `thumbnailSize` doit rester une union littérale.
- `src/api.ts` : pur, testable, zéro JSX — `buildWebcamsUrl` (bbox `north,east,south,west`,
  `limit`, `include`, `categories` optionnel), `thumbUrl`, `mapWebcams` (élague les webcams sans
  coordonnées numériques).
- `src/marker.tsx` : `webcamTooltip` (vignette + titre + lieu) et `webcamMenu` (ouvrir / copier
  le lien, inertes sans `detail`).
- `src/index.ts` : `windyWebcams()` — assemble `meta`, `config`, `data.fetch` (avec
  `x-windy-api-key` en header) et `markerLayer`.
- `src/fixtures/webcams.json` : capture réelle de 4 webcams parisiennes, utilisée par
  `src/api.test.ts` (aucune clé dedans).

## Exemple

```bash
pnpm --filter @map3d/plugin-windy-example dev
```

Nécessite `VITE_WINDY_API_KEY` (fichier `.env` du package `example/`, gitignoré) pour de vraies
webcams, et `VITE_CESIUM_ION_TOKEN` pour de vrais bâtiments 3D (sinon repli sur le globe
ellipsoïde). Active le plugin depuis le hub des plugins puis navigue sur la carte.
