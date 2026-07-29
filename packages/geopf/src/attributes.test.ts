import { describe, expect, it } from 'vitest'
import { mapAttributes } from './attributes'
import fixture from './fixtures/batiment.json'

describe('mapAttributes', () => {
  it('mappe les champs connus vers des étiquettes stables', () => {
    const out = mapAttributes({ nature: 'Indifférencié', hauteur: 12, inconnu: 'x' }, { showEmpty: false })
    expect(out['Nature']).toBe('Indifférencié')
    expect(out['Hauteur (m)']).toBe(12)
    expect(Object.values(out)).not.toContain('x') // champ non mappé ignoré
  })
  it('showEmpty=false élague les valeurs vides', () => {
    const out = mapAttributes({ nature: '', hauteur: 12 }, { showEmpty: false })
    expect('Nature' in out).toBe(false)
    expect(out['Hauteur (m)']).toBe(12)
  })
  it('showEmpty=true conserve les vides', () => {
    expect('Nature' in mapAttributes({ nature: '' }, { showEmpty: true })).toBe(true)
  })
  it('mappe les attributs réels de la fixture BDTOPO', () => {
    const props = fixture.features[0]!.properties as Record<string, unknown>
    const out = mapAttributes(props, { showEmpty: false })
    expect(out['Nature']).toBe('Industriel, agricole ou commercial')
    expect(out['Hauteur (m)']).toBe(24.2)
    expect('Murs' in out).toBe(false) // materiaux_des_murs === '' → élidé
  })
})
