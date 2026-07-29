import { mdiCubeOutline } from '@mdi/js'
import { definePlugin } from 'map3d'
import { createPlanLayer } from './layer'

/**
 * Plan 3D (PLACEHOLDER) — voie C. Métier réel à spécifier ; démontre l'ajout d'un objet
 * 3D custom piloté par config. Seule voie C du monorepo (couverture complète du contrat).
 */
export const plan3d = () =>
  definePlugin({
    meta: {
      id: 'plan-3d',
      name: 'Plan 3D (démo)',
      description: 'Objet 3D custom piloté par config — placeholder',
      icon: mdiCubeOutline,
      version: '0.0.1',
      author: 'map3d',
    },
    config: [
      { key: 'lat', type: 'number', default: 48.8566, min: -90, max: 90, label: 'Latitude' },
      { key: 'lng', type: 'number', default: 2.3522, min: -180, max: 180, label: 'Longitude' },
      { key: 'size', type: 'number', default: 40, min: 5, max: 500, label: 'Taille (m)' },
      { key: 'color', type: 'string', default: '#e11d48', label: 'Couleur' },
    ] as const,
    layer: (ctx) => createPlanLayer(ctx),
  })
