import { mdiWebcam } from '@mdi/js'
import { definePlugin, fetchWithPolicy } from '@pasquelin/map3d'
import { buildWebcamsUrl, mapWebcams } from './api'
import type { WindyConfig } from './config'
import type { WindyResponse } from './api'
import { webcamMenu, webcamTooltip } from './marker'

/**
 * Windy Webcams — voie A du contrat plugin (`data.fetch`) : webcams publiques réelles
 * autour de la vue (API v3, https://api.windy.com/webcams/api/v3/webcams). `init.apiKey`
 * seede le défaut du champ `apiKey` (typiquement `import.meta.env.VITE_WINDY_API_KEY`),
 * modifiable ensuite depuis le hub des plugins.
 *
 * NOTE : le spec métier prévoyait un `refreshMinutes` (polling). `data.refresh` est un
 * champ STATIQUE qui ne peut pas lire la config au runtime — dropé en v1, voir README.
 */
export const windyWebcams = (init: { apiKey?: string } = {}) =>
  definePlugin({
    meta: {
      id: 'windy-webcams',
      name: 'Windy Webcams',
      description: 'Webcams publiques autour de la vue (Windy Webcams API)',
      icon: mdiWebcam,
      version: '0.1.0',
      author: 'map3d',
      homepage: 'https://windy.com/webcams',
    },
    enabledByDefault: false,
    config: [
      {
        key: 'apiKey',
        type: 'string',
        default: init.apiKey ?? '',
        secret: true,
        refetch: true,
        label: 'Clé API Windy',
      },
      { key: 'category', type: 'string', default: '', placeholder: 'all', refetch: true, label: 'Catégorie' },
      {
        key: 'maxWebcams',
        type: 'number',
        default: 50,
        min: 1,
        max: 100,
        refetch: true,
        label: 'Nombre max de webcams',
      },
      {
        key: 'thumbnailSize',
        type: 'select',
        default: 'preview',
        options: { thumbnail: 'Vignette', preview: 'Aperçu', daylight: 'Jour' },
        label: 'Taille vignette',
      },
    ] as const,
    data: {
      minZoom: 6,
      refresh: 'viewport',
      fetch: async (ctx) => {
        if (!ctx.config.apiKey) return []
        // `thumbnailSize` est un champ `select` : `PluginConfigOf` l'élargit à `string`
        // (cf. `map3d/src/plugins/types.ts`) là où `WindyConfig` porte l'union littérale
        // réellement produite par le schéma (`options` ci-dessus) — narrowing assumé.
        const config = ctx.config as WindyConfig
        const url = buildWebcamsUrl({ bounds: ctx.viewport.bounds, config })
        const res = await fetchWithPolicy(
          url,
          { headers: { 'x-windy-api-key': config.apiKey } },
          ctx.fetchPolicy,
          ctx.signal,
          'windy',
        )
        const body = (await res.json()) as WindyResponse
        return mapWebcams(body, config)
      },
    },
    markerLayer: {
      cluster: { enabled: true },
      icon: () => mdiWebcam,
      tooltip: webcamTooltip,
      menu: webcamMenu,
    },
  })
