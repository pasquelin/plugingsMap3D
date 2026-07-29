import { describe, expect, it } from 'vitest'
import { template } from './index'

describe('template', () => {
  it('déclare une identité et un défaut de config unique', () => {
    const p = template()
    expect(p.meta.id).toBe('template')
    expect(p.config?.find((f) => f.key === 'count')?.default).toBe(5)
    expect(typeof p.data?.fetch).toBe('function')
  })
})
