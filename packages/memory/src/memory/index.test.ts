import { describe, expect, it } from 'vitest'
import MemoryCache from '../memory'

describe('MemoryCache', () => {
  it('stores and retrieves values', async () => {
    const cache = new MemoryCache({ max: 10 })
    await cache.set('user:1', { id: 1, name: 'Alice' })

    expect(await cache.get('user:1')).toEqual({ id: 1, name: 'Alice' })
    expect(await cache.has('user:1')).toBe(true)
  })

  it('returns undefined for missing keys', async () => {
    const cache = new MemoryCache({ max: 10 })
    expect(await cache.get('missing')).toBeUndefined()
    expect(await cache.has('missing')).toBe(false)
  })

  it('deletes keys and clears the cache', async () => {
    const cache = new MemoryCache({ max: 10 })
    await cache.set('a', 1)
    await cache.del('a')
    expect(await cache.get('a')).toBeUndefined()

    await cache.set('b', 2)
    await cache.clear()
    expect(await cache.get('b')).toBeUndefined()
  })

  it('honors a default ttl and a per-call override', async () => {
    const cache = new MemoryCache({ max: 10, ttl: 60 })
    await cache.set('a', 1)
    await cache.set('b', 2, 3600)
    expect(await cache.get('a')).toBe(1)
    expect(await cache.get('b')).toBe(2)
  })

  it('rejects a non-positive ttl instead of silently ignoring it', async () => {
    const cache = new MemoryCache({ max: 10 })
    await expect(cache.set('a', 1, 0)).rejects.toThrow(/positive/)
    await expect(cache.set('b', 1, -5)).rejects.toThrow(/positive/)
  })
})
