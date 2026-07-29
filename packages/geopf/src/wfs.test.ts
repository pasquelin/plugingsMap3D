import { describe, expect, it } from 'vitest'
import { buildGetFeatureUrl } from './wfs'

const cfg = {
  searchRadius: 25,
  count: 20,
  matchContaining: true,
  showEmpty: false,
  apiUrl: 'https://data.geopf.fr/wfs/ows',
}

describe('buildGetFeatureUrl', () => {
  it('construit une BBOX carrée EPSG:4326 centrée sur le point, avec les params WFS 2.0.0', () => {
    const url = new URL(buildGetFeatureUrl({ lat: 48.8566, lng: 2.3522, config: cfg }))
    expect(url.origin + url.pathname).toBe('https://data.geopf.fr/wfs/ows')
    const p = url.searchParams
    expect(p.get('SERVICE')).toBe('WFS')
    expect(p.get('VERSION')).toBe('2.0.0')
    expect(p.get('REQUEST')).toBe('GetFeature')
    expect(p.get('TYPENAMES')).toBe('BDTOPO_V3:batiment')
    expect(p.get('SRSNAME')).toBe('EPSG:4326')
    expect(p.get('OUTPUTFORMAT')).toBe('application/json')
    expect(p.get('COUNT')).toBe('20')
    const bbox = p.get('BBOX')!.split(',')
    expect(bbox).toHaveLength(5)
    expect(bbox[4]).toBe('EPSG:4326')
    // demi-côté ≈ 25 m ≈ 0.000225° lat ; le point est au centre
    expect(Number(bbox[1])).toBeLessThan(48.8566)
    expect(Number(bbox[3])).toBeGreaterThan(48.8566)
    expect(Number(bbox[0])).toBeLessThan(2.3522)
    expect(Number(bbox[2])).toBeGreaterThan(2.3522)
  })
})
