import { mdiOfficeBuildingMarkerOutline } from '@mdi/js'
import { definePlugin, fetchWithPolicy } from 'map3d'
import { geopfConfig } from './config'
import { buildGetFeatureUrl, pickBuilding } from './wfs'
import type { FeatureCollection } from './wfs'
import { mapAttributes } from './attributes'

/**
 * Bâtiments France (BDTOPO) — enrichissement au pick. Au clic sur un bâtiment 3D, va
 * chercher ses attributs officiels IGN et les remonte via `useBuildingEnrichment()`.
 * Le pick reste instantané : cette fonction s'exécute APRÈS `buildingclick`.
 */
export const geopfBatiments = () =>
  definePlugin({
    meta: {
      id: 'geopf-batiments',
      name: 'Bâtiments France (BDTOPO)',
      description: 'Attributs officiels IGN d’un bâtiment au clic',
      icon: mdiOfficeBuildingMarkerOutline,
      version: '0.1.0',
      author: 'map3d',
      homepage: 'https://geoservices.ign.fr',
    },
    config: geopfConfig,
    enabledByDefault: false,
    enrichBuilding: async (hit, ctx) => {
      const url = buildGetFeatureUrl({ lat: hit.info.lat, lng: hit.info.lng, config: ctx.config })
      const res = await fetchWithPolicy(url, {}, ctx.fetchPolicy, ctx.signal, 'geopf')
      const fc = (await res.json()) as FeatureCollection
      const props = pickBuilding(fc, { lat: hit.info.lat, lng: hit.info.lng, config: ctx.config })
      return {
        attrs: props ? mapAttributes(props, { showEmpty: ctx.config.showEmpty }) : {},
        tags: ['geopf-batiments'],
      }
    },
  })
