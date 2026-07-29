import { describe, expect, it } from 'vitest'
import { cameras } from './index'

const viewport = {
  bounds: { south: 48.85, north: 48.86, west: 2.34, east: 2.35 },
  center: { lat: 48.855, lng: 2.345 },
  zoom: 16,
}

describe('cameras', () => {
  it('génère `count` markers déterministes dans les bounds (repli procédural, zéro réseau)', () => {
    const p = cameras()
    const ctx = { viewport, config: { count: 6, apiUrl: '' } } as never
    const a = p.data!.fetch(ctx)
    const b = p.data!.fetch(ctx)
    expect(Array.isArray(a) ? a.length : 0).toBe(6)
    expect(a).toEqual(b) // déterministe
    const first = (a as { position: { lat: number; lng: number } }[])[0]!
    expect(first.position.lat).toBeGreaterThanOrEqual(48.85)
    expect(first.position.lat).toBeLessThanOrEqual(48.86)
  })
})
