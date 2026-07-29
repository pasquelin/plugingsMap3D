import { describe, expect, it } from 'vitest'
import { buildGetFeatureUrl, pickBuilding, type FeatureCollection } from './wfs'

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

  it('reflète count et apiUrl de la config (passthrough, pas de valeur en dur)', () => {
    const url = new URL(
      buildGetFeatureUrl({
        lat: 48.8566,
        lng: 2.3522,
        config: { ...cfg, count: 7, apiUrl: 'https://example.test/wfs' },
      }),
    )
    expect(url.origin + url.pathname).toBe('https://example.test/wfs')
    expect(url.searchParams.get('COUNT')).toBe('7')
  })
})

const fc: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { nature: 'Indifférencié', hauteur: 12 },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [2.352, 48.8564],
            [2.3524, 48.8564],
            [2.3524, 48.8568],
            [2.352, 48.8568],
            [2.352, 48.8564],
          ],
        ],
      },
    },
  ],
}

// Géométrie MultiPolygon : forme réellement renvoyée par le WFS BDTOPO (Task 5),
// avec une 3e coordonnée (altitude) par sommet que pointInRing doit ignorer.
const mfc: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { hauteur: 9 },
      geometry: {
        type: 'MultiPolygon',
        coordinates: [
          [
            [
              [2.352, 48.8564, 0],
              [2.3524, 48.8564, 0],
              [2.3524, 48.8568, 0],
              [2.352, 48.8568, 0],
              [2.352, 48.8564, 0],
            ],
          ],
        ],
      },
    },
  ],
}

// Deux bâtiments distincts pour exercer réellement la comparaison de distance au centroïde.
const twoFc: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    fc.features[0]!,
    {
      type: 'Feature',
      properties: { hauteur: 30 },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [10, 40],
            [10.001, 40],
            [10.001, 40.001],
            [10, 40.001],
            [10, 40],
          ],
        ],
      },
    },
  ],
}

describe('pickBuilding', () => {
  it('retourne les properties du polygone contenant le point', () => {
    const r = pickBuilding(fc, { lat: 48.8566, lng: 2.3522, config: { ...cfg, matchContaining: true } })
    expect(r?.hauteur).toBe(12)
  })
  it('retourne null sur une FeatureCollection vide', () => {
    expect(pickBuilding({ type: 'FeatureCollection', features: [] }, { lat: 0, lng: 0, config: cfg })).toBeNull()
  })
  it('matchContaining=false → le plus proche du centroïde même si le point est hors polygone', () => {
    // deux bâtiments : le point (proche de Paris) doit choisir celui-ci (hauteur 12), pas le lointain (hauteur 30)
    const r = pickBuilding(twoFc, { lat: 49, lng: 3, config: { ...cfg, matchContaining: false } })
    expect(r?.hauteur).toBe(12)
  })
  it('gère une géométrie MultiPolygon (cas réel BDTOPO)', () => {
    const r = pickBuilding(mfc, { lat: 48.8566, lng: 2.3522, config: { ...cfg, matchContaining: true } })
    expect(r?.hauteur).toBe(9)
  })
  it('matchContaining=true sans polygone contenant → repli sur le plus proche (pas null)', () => {
    // point hors des deux polygones ; le plus proche a hauteur 12
    expect(pickBuilding(twoFc, { lat: 48.857, lng: 2.353, config: { ...cfg, matchContaining: true } })?.hauteur).toBe(
      12,
    )
  })
})
