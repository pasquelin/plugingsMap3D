import { mdiShapePlus } from '@mdi/js'
import { definePlugin } from 'map3d'
import type { MarkerData } from 'map3d'

/**
 * Modèle minimal à copier pour démarrer un plugin. Voie A (markers procéduraux, zéro
 * réseau). Renomme `id`/`name`, ajuste le schéma de config, remplis `fetch`.
 */
export const template = () =>
  definePlugin({
    meta: {
      id: 'template',
      name: 'Plugin modèle',
      description: 'Squelette à copier — markers procéduraux',
      icon: mdiShapePlus,
      version: '0.0.0',
      author: 'map3d',
    },
    config: [
      { key: 'count', type: 'number', default: 5, min: 1, max: 50, refetch: true, label: 'Nombre de points' },
    ] as const,
    data: {
      refresh: 'viewport',
      fetch: (ctx) => {
        const { bounds } = ctx.viewport
        const out: MarkerData[] = []
        for (let i = 0; i < ctx.config.count; i++) {
          const f = (i + 0.5) / ctx.config.count
          out.push({
            id: `tpl-${i}`,
            position: { lat: bounds.south + (bounds.north - bounds.south) * f, lng: (bounds.west + bounds.east) / 2 },
            type: 'template',
            tags: ['template'],
            data: {},
          })
        }
        return out
      },
    },
  })
