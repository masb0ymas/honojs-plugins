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
    const parsedDriver = CacheSchema.safeParse({ driver })
    if (!parsedDriver.success) {
      throw new Error('Invalid cache parameters', { cause: parsedDriver.error })
    }

    switch (parsedDriver.data.driver) {
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
        throw new Error(`Unsupported cache driver: ${String(driver)}`)
    }
  }
}

export { default as MemoryCache } from './memory'
export { default as RedisCache } from './redis'
export type { CacheDriver, CacheInstance, CacheParams, CacheType } from './types/cache'
