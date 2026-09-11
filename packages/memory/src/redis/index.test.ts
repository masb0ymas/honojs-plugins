import { beforeEach, describe, expect, it, vi } from 'vitest'

const scanStream = vi.fn()
const del = vi.fn()
const set = vi.fn()
const get = vi.fn()
const exists = vi.fn()
const flushdb = vi.fn()

let keyPrefix: string | undefined

vi.mock('ioredis', () => {
  class Redis {
    options: { keyPrefix?: string }
    scanStream = scanStream
    del = del
    set = set
    get = get
    exists = exists
    flushdb = flushdb

    constructor(options: { keyPrefix?: string } = {}) {
      this.options = options
    }
  }

  return { Redis, default: Redis }
})

const { default: RedisCache } = await import('./index')

const redis = () => new RedisCache({ host: '127.0.0.1', port: 6379, keyPrefix })

describe('RedisCache', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    keyPrefix = undefined
  })

  it('serializes values as JSON on set', async () => {
    const cache = redis()
    await cache.set('user:1', { id: 1 })
    expect(set).toHaveBeenCalledWith('user:1', JSON.stringify({ id: 1 }))
  })

  it('passes a positive ttl as EX seconds', async () => {
    const cache = redis()
    await cache.set('user:1', { id: 1 }, 300)
    expect(set).toHaveBeenCalledWith('user:1', JSON.stringify({ id: 1 }), 'EX', 300)
  })

  it('rejects a non-positive ttl', async () => {
    const cache = redis()
    await expect(cache.set('user:1', { id: 1 }, 0)).rejects.toThrow(/positive/)
  })

  it('parses JSON on get and maps null to undefined', async () => {
    const cache = redis()
    get.mockResolvedValueOnce(JSON.stringify({ id: 1 }))
    expect(await cache.get('user:1')).toEqual({ id: 1 })

    get.mockResolvedValueOnce(null)
    expect(await cache.get('missing')).toBeUndefined()
  })

  it('flushdb when no keyPrefix is configured', async () => {
    const cache = redis()
    await cache.clear()
    expect(flushdb).toHaveBeenCalledOnce()
  })

  it('deletes only prefixed keys without double-prefixing', async () => {
    keyPrefix = 'app:'
    const cache = redis()
    scanStream.mockReturnValue(
      (async function* () {
        yield ['app:a', 'app:b']
        yield ['app:c']
      })()
    )
    del.mockResolvedValue(1)

    await cache.clear()

    expect(flushdb).not.toHaveBeenCalled()
    expect(scanStream).toHaveBeenCalledWith({ match: 'app:*' })
    // ioredis re-applies keyPrefix on DEL, so the prefix must be stripped first.
    expect(del).toHaveBeenNthCalledWith(1, 'a', 'b')
    expect(del).toHaveBeenNthCalledWith(2, 'c')
  })
})
