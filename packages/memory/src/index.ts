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
   * @param params - Cache parameters
   * @returns Cache service instance
   */
  static create({ cacheType, params }: CacheParams): CacheInstance {
    const parsed = CacheSchema.safeParse({ driver: cacheType })
    if (!parsed.success) {
      console.log(parsed.error)
      throw new Error('Invalid cache driver')
    }

    switch (parsed.data.driver) {
      case 'memory': {
        const config = MemorySchema.safeParse(params)
        if (!config.success) {
          console.log(config.error)
          throw new Error('Invalid memory cache configuration')
        }

        return new MemoryCache(config.data)
      }

      case 'redis': {
        const config = RedisSchema.safeParse(params)
        if (!config.success) {
          console.log(config.error)
          throw new Error('Invalid redis cache configuration')
        }

        return new RedisCache(config.data)
      }

      default:
        throw new Error('Invalid cache type')
    }
  }
}

export { default as MemoryCache } from './memory'
export { default as RedisCache } from './redis'
export type { CacheDriver, CacheInstance, CacheParams, CacheType } from './types/cache'
