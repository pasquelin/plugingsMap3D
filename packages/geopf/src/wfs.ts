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
