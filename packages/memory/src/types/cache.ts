import MemoryCache from '../memory'
import RedisCache from '../redis'
import { MemoryConfig } from '../schema/memory'
import { RedisConfig } from '../schema/redis'

export type CacheType = 'memory' | 'redis'

export type CacheParams = {
  cacheType: CacheType
  params: MemoryConfig | RedisConfig
}

export type CacheInstance = MemoryCache | RedisCache

export interface CacheDriver {
  get<T = unknown>(key: string): Promise<T | undefined>
  set<T = unknown>(key: string, value: T, ttl?: number): Promise<void>
  has(key: string): Promise<boolean>
  del(key: string): Promise<void>
  clear(): Promise<void>
}
