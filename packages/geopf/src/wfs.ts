import type { GeopfConfig } from './config'

const EARTH_R = 6_378_137 // m ; conversion mètres → degrés (approx locale)
const RAD = Math.PI / 180

/** Demi-côté du BBOX en degrés (lat constant ; lng corrigé par cos(lat)). */
function metersToDeg(radiusM: number, lat: number): { dLat: number; dLng: number } {
  const dLat = radiusM / EARTH_R / RAD
  const dLng = dLat / Math.max(0.01, Math.cos(lat * RAD))
  return { dLat, dLng }
}

/** URL GetFeature WFS 2.0.0 pour BDTOPO_V3:batiment, BBOX carré 2×searchRadius. */
export function buildGetFeatureUrl(input: { lat: number; lng: number; config: GeopfConfig }): string {
  const { lat, lng, config } = input
  const { dLat, dLng } = metersToDeg(config.searchRadius, lat)
  const bbox = [lng - dLng, lat - dLat, lng + dLng, lat + dLat, 'EPSG:4326'].join(',')
  const p = new URLSearchParams({
    SERVICE: 'WFS',
    VERSION: '2.0.0',
    REQUEST: 'GetFeature',
    TYPENAMES: 'BDTOPO_V3:batiment',
    SRSNAME: 'EPSG:4326',
    BBOX: bbox,
    OUTPUTFORMAT: 'application/json',
    COUNT: String(config.count),
  })
  return `${config.apiUrl}?${p.toString()}`
}

type Ring = [number, number, number?][] // [lng, lat, altitude?] — le WFS BDTOPO renvoie une altitude, ignorée en aval
type Geometry = { type: 'Polygon'; coordinates: Ring[] } | { type: 'MultiPolygon'; coordinates: Ring[][] }
type Feature = { type: 'Feature'; properties: Record<string, unknown> | null; geometry: Geometry | null }
export type FeatureCollection = { type: 'FeatureCollection'; features: Feature[] }

/** Ray casting sur l'anneau extérieur (lng=x, lat=y). Zéro dépendance. */
function pointInRing(lng: number, lat: number, ring: Ring): boolean {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i]!
    const [xj, yj] = ring[j]!
    if (yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}

function outerRings(g: Geometry | null): Ring[] {
  if (!g) return []
  return g.type === 'Polygon' ? [g.coordinates[0]!] : g.coordinates.map((poly) => poly[0]!).filter(Boolean)
}

function centroid(ring: Ring): { lng: number; lat: number } {
  let sx = 0,
    sy = 0
  for (const [x, y] of ring) {
    sx += x
    sy += y
  }
  return { lng: sx / ring.length, lat: sy / ring.length }
}

/** Bâtiment retenu : contenant le point (matchContaining) sinon centroïde le plus proche. */
export function pickBuilding(
  fc: FeatureCollection,
  input: { lat: number; lng: number; config: GeopfConfig },
): Record<string, unknown> | null {
  const { lat, lng, config } = input
  if (!fc.features.length) return null
  if (config.matchContaining) {
    const hit = fc.features.find((f) => outerRings(f.geometry).some((r) => pointInRing(lng, lat, r)))
    return hit?.properties ?? null
  }
  let best: Feature | null = null
  let bestD = Infinity
  for (const f of fc.features) {
    for (const r of outerRings(f.geometry)) {
      const c = centroid(r)
      const d = (c.lng - lng) ** 2 + (c.lat - lat) ** 2
      if (d < bestD) {
        bestD = d
        best = f
      }
    }
  }
  return best?.properties ?? null
}
