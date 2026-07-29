import { mdiCctv } from '@mdi/js'
import { definePlugin } from 'map3d'
import type { MarkerData } from 'map3d'

/**
 * Caméras / vidéos du quartier — markers voie A. Métier fin (vraie source) à préciser :
 * repli procédural déterministe dans les bounds ; `apiUrl` réservé pour brancher une
 * source réelle plus tard (vide = procédural).
 */
export const cameras = () =>
  definePlugin({
    meta: {
      id: 'cameras',
      name: 'Caméras du quartier',
      description: 'Points vidéo dans la vue (démo procédurale)',
      icon: mdiCctv,
      version: '0.1.0',
      author: 'map3d',
    },
    config: [
      { key: 'count', type: 'number', default: 10, min: 1, max: 80, refetch: true, label: 'Nombre de caméras' },
      {
        key: 'apiUrl',
        type: 'string',
        default: '',
        placeholder: 'https://… (vide = démo)',
        refetch: true,
        label: 'Source (API)',
      },
    ] as const,
    enabledByDefault: false,
    data: {
      refresh: 'viewport',
      fetch: (ctx) => {
        const { bounds } = ctx.viewport
        const out: MarkerData[] = []
        for (let i = 0; i < ctx.config.count; i++) {
          const fx = (i % 5) / 5 + 0.1
          const fy = Math.floor(i / 5) / Math.max(1, Math.ceil(ctx.config.count / 5)) + 0.05
          out.push({
            id: `cam-${i}`,
            position: {
              lat: bounds.south + (bounds.north - bounds.south) * fy,
              lng: bounds.west + (bounds.east - bounds.west) * fx,
            },
            type: 'camera',
            title: `Caméra ${i + 1}`,
            tags: ['cameras'],
            data: {},
          })
        }
        return out
      },
    },
    markerLayer: { cluster: { enabled: true } },
  })
