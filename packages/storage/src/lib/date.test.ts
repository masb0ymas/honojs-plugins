import { describe, expect, it } from 'vitest'
import { ms } from './date'

describe('ms', () => {
  it('returns numeric input unchanged', () => {
    expect(ms(0)).toBe(0)
    expect(ms(1500)).toBe(1500)
  })

  it('converts time units to milliseconds', () => {
    expect(ms('1ms')).toBe(1)
    expect(ms('2s')).toBe(2000)
    expect(ms('30min')).toBe(1_800_000)
    expect(ms('1.5h')).toBe(5_400_000)
    expect(ms('1d')).toBe(86_400_000)
    expect(ms('1w')).toBe(604_800_000)
    expect(ms('1y')).toBe(31_557_600_000)
  })

  it('is case-insensitive and trims surrounding whitespace', () => {
    expect(ms(' 2H ')).toBe(7_200_000)
    expect(ms('30MIN')).toBe(1_800_000)
  })

  it('supports long unit names', () => {
    expect(ms('2 seconds')).toBe(2000)
    expect(ms('2 minutes')).toBe(120_000)
  })

  it('rejects invalid or negative durations', () => {
    expect(() => ms('abc')).toThrow(/Invalid time format/)
    expect(() => ms('')).toThrow(/expected non-empty string/)
    expect(() => ms('-1d')).toThrow(/Invalid time format/)
    expect(() => ms(-1)).toThrow(/negative/)
    expect(() => ms(Number.NaN)).toThrow(/Invalid number/)
    expect(() => ms('1 fortnight')).toThrow()
  })
})
