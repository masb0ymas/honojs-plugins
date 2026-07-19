import { LRUCache } from 'lru-cache'
import { MemoryConfig } from '../schema/memory'
import { CacheDriver } from '../types/cache'

/**
 * In-process memory cache backed by lru-cache
 */
type CacheEntry = { value: unknown }

export default class MemoryCache implements CacheDriver {
  private _client: LRUCache<string, CacheEntry>
  private _defaultTtl: number | undefined

  constructor(params: MemoryConfig) {
    this._defaultTtl = params.ttl

    this._client = new LRUCache<string, CacheEntry>({
      max: params.max,
      ttlAutopurge: false,
      ...(params.ttl ? { ttl: params.ttl * 1000 } : {}),
    })
  }

  /**
   * Get a value from the cache
   */
  async get<T = unknown>(key: string): Promise<T | undefined> {
    const entry = this._client.get(key)
    return entry?.value as T | undefined
  }

  /**
   * Set a value in the cache
   */
  async set<T = unknown>(key: string, value: T, ttl?: number): Promise<void> {
    const expires = ttl ?? this._defaultTtl

    if (expires) {
      this._client.set(key, { value }, { ttl: expires * 1000 })
      return
    }

    this._client.set(key, { value })
  }

  /**
   * Check if a key exists in the cache
   */
  async has(key: string): Promise<boolean> {
    return this._client.has(key)
  }

  /**
   * Delete a value from the cache
   */
  async del(key: string): Promise<void> {
    this._client.delete(key)
  }

  /**
   * Clear the cache
   */
  async clear(): Promise<void> {
    this._client.clear()
  }
}
