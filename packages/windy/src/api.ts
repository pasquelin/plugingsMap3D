import type { Bounds, MarkerData } from '@pasquelin/map3d'
import type { WindyConfig } from './config'
import type { WindyMarkerData } from './marker'

export type WindyImage = { icon: string; thumbnail: string; preview: string }

export type WindyWebcam = {
  webcamId: number
  title: string
  status: string
  images?: { current?: WindyImage; daylight?: WindyImage }
  location?: { latitude: number; longitude: number; city?: string; region?: string; country?: string }
  urls?: { detail?: string; provider?: string }
}

export type WindyResponse = { total: number; webcams: WindyWebcam[] }

/** URL Windy Webcams API v3 : bbox `north,east,south,west` (ordre vérifié), clé en query absente (header). */
export function buildWebcamsUrl(input: { bounds: Bounds; config: WindyConfig }): string {
  const { bounds, config } = input
  const p = new URLSearchParams({
    bbox: [bounds.north, bounds.east, bounds.south, bounds.west].join(','),
    limit: String(config.maxWebcams),
    include: 'images,location,urls',
  })
  if (config.category && config.category !== 'all') p.set('categories', config.category)
  return `https://api.windy.com/webcams/api/v3/webcams?${p.toString()}`
}

/** Vignette selon la taille choisie ; `daylight` retombe sur `current` si absente (webcam sans variante jour). */
export function thumbUrl(w: WindyWebcam, size: WindyConfig['thumbnailSize']): string | undefined {
  if (size === 'daylight') return w.images?.daylight?.preview ?? w.images?.current?.preview
  if (size === 'thumbnail') return w.images?.current?.thumbnail
  return w.images?.current?.preview
}

/** Projette la réponse Windy en markers — élague les webcams sans coordonnées exploitables. */
export function mapWebcams(res: WindyResponse, config: WindyConfig): MarkerData<WindyMarkerData>[] {
  const out: MarkerData<WindyMarkerData>[] = []
  for (const w of res.webcams) {
    const loc = w.location
    if (!loc || typeof loc.latitude !== 'number' || typeof loc.longitude !== 'number') continue
    const thumb = thumbUrl(w, config.thumbnailSize)
    out.push({
      id: `windy-${w.webcamId}`,
      position: { lat: loc.latitude, lng: loc.longitude },
      type: 'webcam',
      title: w.title,
      avatar: thumb,
      tags: ['windy-webcams'],
      data: {
        place: [loc.city, loc.region, loc.country].filter(Boolean).join(', '),
        detail: w.urls?.detail,
        thumb,
      },
    })
  }
  return out
}
