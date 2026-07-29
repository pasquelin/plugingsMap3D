import { describe, expect, it } from 'vitest'
import { buildWebcamsUrl, mapWebcams, type WindyResponse } from './api'
import fixture from './fixtures/webcams.json'

const cfg = { apiKey: 'x', category: '', maxWebcams: 50, thumbnailSize: 'preview' } as const
const bounds = { north: 48.87, south: 48.84, east: 2.36, west: 2.28 }

describe('buildWebcamsUrl', () => {
  it("construit l'endpoint v3 avec la bbox north,east,south,west et les params requis", () => {
    const url = new URL(buildWebcamsUrl({ bounds, config: cfg }))
    expect(url.origin + url.pathname).toBe('https://api.windy.com/webcams/api/v3/webcams')
    expect(url.searchParams.get('bbox')).toBe('48.87,2.36,48.84,2.28')
    expect(url.searchParams.get('limit')).toBe('50')
    expect(url.searchParams.get('include')).toBe('images,location,urls')
  })

  it("omet 'categories' quand la config n'en fixe aucune (chaîne vide)", () => {
    const url = new URL(buildWebcamsUrl({ bounds, config: { ...cfg, category: '' } }))
    expect(url.searchParams.has('categories')).toBe(false)
  })

  it("omet 'categories' quand la config vaut 'all'", () => {
    const url = new URL(buildWebcamsUrl({ bounds, config: { ...cfg, category: 'all' } }))
    expect(url.searchParams.has('categories')).toBe(false)
  })

  it("ajoute 'categories' quand un filtre explicite est choisi", () => {
    const url = new URL(buildWebcamsUrl({ bounds, config: { ...cfg, category: 'traffic' } }))
    expect(url.searchParams.get('categories')).toBe('traffic')
  })
})

describe('mapWebcams (fixture réelle — 4 webcams Paris)', () => {
  const res = fixture as WindyResponse
  const markers = mapWebcams(res, cfg)

  it('produit un marker par webcam de la fixture', () => {
    expect(markers).toHaveLength(4)
  })

  it('type, position et tags sont corrects (première webcam de la fixture)', () => {
    const m = markers[0]!
    expect(m.type).toBe('webcam')
    expect(m.position).toEqual({ lat: 48.85171, lng: 2.33651 })
    expect(m.tags).toEqual(['windy-webcams'])
    expect(m.title).toBe(fixture.webcams[0]!.title)
  })

  it("l'avatar est une URL imgproxy Windy (preview, taille par défaut)", () => {
    const m = markers[0]!
    expect(m.avatar).toMatch(/^https:\/\/imgproxy\.windy\.com\/.*preview/)
  })

  it('data.detail correspond au vrai lien de détail de la fixture', () => {
    const m = markers[0]!
    expect(m.data.detail).toBe('https://windy.com/webcams/1515017464')
  })

  it('data.place assemble ville/région/pays quand présents', () => {
    const m = markers[0]!
    expect(m.data.place).toBe('Paris, Ile-de-France, France')
  })
})
