import { describe, expect, it } from 'vitest'
import { checkText, parseRange, skipped, tracksUpperMinor } from './map3d-range.mjs'

const expected = parseRange('>=0.2.0 <0.8.0')

describe('parseRange', () => {
  it('tire de la plage sa borne basse et ses deux écritures', () => {
    expect(expected.min).toBe('0.2.0')
    expect(expected.semver).toEqual(['0.2.0', '0.8.0'])
    expect(expected.minors).toEqual(['0.2', '0.7'])
  })
  it('refuse une forme dont la seconde écriture ne se déduit pas', () => {
    expect(() => parseRange('^0.2.0')).toThrow(/non gérée/)
    expect(() => parseRange('>=0.2.0 <0.8.1')).toThrow(/non gérée/)
    expect(() => parseRange('>=0.2.0 <1.0.0')).toThrow(/non gérée/)
    expect(() => parseRange('')).toThrow(/non gérée/)
  })
})

describe('checkText', () => {
  it('accepte la plage sous ses deux écritures, coupée ou non par un retour à la ligne', () => {
    const text = [
      '`@pasquelin/map3d` (`>=0.2.0 <0.8.0`: 0.2',
      'through 0.7) are peerDependencies.',
      'De 0.2 à 0.7, ou 0.2 to 0.7.',
    ].join('\n')
    expect(checkText(text, expected)).toEqual({ count: 4, errors: [] })
  })
  it("donne la ligne et le texte de chaque citation qui s'écarte", () => {
    const text = ['# Titre', '`>=0.2.0 <0.9.0` (de 0.2', 'à 0.8), puis 0.3 to 0.7.'].join('\n')
    expect(checkText(text, expected)).toEqual({
      count: 3,
      errors: [
        { line: 2, found: '>=0.2.0 <0.9.0' },
        { line: 2, found: '0.2 à 0.8' },
        { line: 3, found: '0.3 to 0.7' },
      ],
    })
  })
  it('ignore les versions complètes et les nombres isolés', () => {
    const text = 'De map3d 0.2.0 à 0.7.0 ; `three` ≥ 0.169 ; Node ≥ 22.13 ; map3D ≥ 0.7.0.'
    expect(checkText(text, expected)).toEqual({ count: 0, errors: [] })
  })
})

describe('tracksUpperMinor', () => {
  it('accepte la dépendance de développement posée sur la mineure la plus récente de la plage', () => {
    expect(tracksUpperMinor('^0.7.0', expected)).toBe(true)
    expect(tracksUpperMinor('~0.7.0', expected)).toBe(true)
    expect(tracksUpperMinor('0.7.3', expected)).toBe(true)
  })
  it('refuse une autre mineure, une plage ou une dépendance absente', () => {
    expect(tracksUpperMinor('^0.6.0', expected)).toBe(false)
    expect(tracksUpperMinor('^0.8.0', expected)).toBe(false)
    expect(tracksUpperMinor('>=0.2.0 <0.8.0', expected)).toBe(false)
    expect(tracksUpperMinor(undefined, expected)).toBe(false)
  })
})

describe('skipped', () => {
  it('parcourt la documentation, `.github` compris', () => {
    expect(['.github', 'docs', 'packages', 'geopf'].filter(skipped)).toEqual([])
  })
  it('écarte les dépendances, les builds et les dossiers cachés des outils', () => {
    expect(['node_modules', 'dist', '.git', '.idea', '.claude'].every(skipped)).toBe(true)
  })
})
