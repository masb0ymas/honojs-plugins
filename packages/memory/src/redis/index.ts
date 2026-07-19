import { Redis } from 'ioredis'
import { RedisConfig } from '../schema/redis'
import { CacheDriver } from '../types/cache'

/**
 * Distributed cache backed by Redis
 */
export default class RedisCache implements CacheDriver {
  public client: Redis
  private _defaultTtl: number | undefined

  constructor(params: RedisConfig) {
    this._defaultTtl = params.ttl

    this.client = new Redis({
      host: params.host,
      port: params.port,
      password: params.password,
      db: params.db,
      keyPrefix: params.keyPrefix,
    })
  }

  /**
   * Get a value from the cache
   */
  async get<T = unknown>(key: string): Promise<T | undefined> {
    const value = await this.client.get(key)
    if (value === null) {
      return undefined
    }

    return JSON.parse(value) as T
  }

  /**
   * Set a value in the cache
   */
  async set<T = unknown>(key: string, value: T, ttl?: number): Promise<void> {
    const serialized = JSON.stringify(value)
    const expires = ttl ?? this._defaultTtl

    if (expires) {
      await this.client.set(key, serialized, 'EX', expires)
      return
    }

    await this.client.set(key, serialized)
  }

  /**
   * Check if a key exists in the cache
   */
  async has(key: string): Promise<boolean> {
    const exists = await this.client.exists(key)
    return exists === 1
  }

  /**
   * Delete a value from the cache
   */
  async del(key: string): Promise<void> {
    await this.client.del(key)
  }

  /**
   * Clear the cache
   */
  async clear(): Promise<void> {
    await this.client.flushdb()
  }
}
