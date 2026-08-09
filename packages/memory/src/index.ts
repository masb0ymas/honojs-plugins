import MemoryCache from './memory'
import RedisCache from './redis'
import { CacheSchema } from './schema'
import { MemorySchema } from './schema/memory'
import { RedisSchema } from './schema/redis'
import { CacheInstance, CacheParams } from './types/cache'

/**
 * Cache service
 */
export default class Cache {
  /**
   * Create a cache service instance
   * @param config - Cache configuration
   * @returns Cache service instance
   */
  static create({ driver, config }: CacheParams): CacheInstance {
    const parsed = CacheSchema.safeParse({ driver })
    if (!parsed.success) {
      throw new Error('Invalid cache driver', { cause: parsed.error })
    }

    switch (parsed.data.driver) {
      case 'memory': {
        const parsed = MemorySchema.safeParse(config)
        if (!parsed.success) {
          throw new Error('Invalid memory cache configuration', { cause: parsed.error })
        }

        return new MemoryCache(parsed.data)
      }

      case 'redis': {
        const parsed = RedisSchema.safeParse(config)
        if (!parsed.success) {
          throw new Error('Invalid redis cache configuration', { cause: parsed.error })
        }

        return new RedisCache(parsed.data)
      }

      default:
        throw new Error('Invalid cache type')
    }
  }
}

export { default as MemoryCache } from './memory'
export { default as RedisCache } from './redis'
export type { CacheDriver, CacheInstance, CacheParams, CacheType } from './types/cache'

