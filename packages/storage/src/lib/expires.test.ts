import { describe, expect, it } from 'vitest'
import { MAX_PRESIGN_TTL_SECONDS, resolveExpires } from './expires'

describe('resolveExpires', () => {
  it('converts a duration to whole seconds', () => {
    expect(resolveExpires('30min').expiresIn).toBe(1800)
    expect(resolveExpires('24h').expiresIn).toBe(86_400)
    expect(resolveExpires('7d').expiresIn).toBe(604_800)
  })

  it('caps expiresIn at the provider maximum', () => {
    expect(resolveExpires('30d').expiresIn).toBe(MAX_PRESIGN_TTL_SECONDS)
  })

  it('derives expiryDate from the full duration, not the day count', () => {
    const before = Date.now()
    const { expiryDate } = resolveExpires('30min')
    const delta = expiryDate.getTime() - before

    // Should be ~30 minutes, not 30 days.
    expect(delta).toBeGreaterThanOrEqual(1_800_000)
    expect(delta).toBeLessThan(1_900_000)
  })

  it('throws on an unparseable duration', () => {
    expect(() => resolveExpires('nope')).toThrow(/Invalid time format/)
  })
})
