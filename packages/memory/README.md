# @honojs-plugins/memory

Cache plugin for HonoJS. Supports two drivers:

- **`memory`** — in-process LRU cache (`lru-cache`)
- **`redis`** — distributed cache (`ioredis`)

Both drivers implement the same `CacheDriver` interface, so they are interchangeable.

## Install

```bash
pnpm add @honojs-plugins/memory
```

## Folder structure

```
src/
├── index.ts              # Cache.create() factory + exports
├── memory/                # MemoryCache driver (lru-cache backed)
├── redis/                 # RedisCache driver (ioredis backed)
├── schema/
│   ├── index.ts            # CacheSchema (driver: 'memory' | 'redis')
│   ├── memory.ts            # MemorySchema ({ max, ttl })
│   └── redis.ts             # RedisSchema ({ host, port, password, db, keyPrefix, ttl })
└── types/
    └── cache.ts             # CacheDriver interface, CacheType, CacheParams, CacheInstance
```

## Usage

### 1. In-memory (LRU) cache

```ts
import Cache, { MemoryCache } from '@honojs-plugins/memory'

const cache = Cache.create({
  cacheType: 'memory',
  params: {
    max: 500,   // max entries
    ttl: 60,    // default TTL in seconds (optional)
  },
}) as MemoryCache

await cache.set('user:1', { id: 1, name: 'Alice' })
const user = await cache.get('user:1')
const exists = await cache.has('user:1')
await cache.del('user:1')
await cache.clear()
```

### 2. Redis cache

```ts
import Cache, { RedisCache } from '@honojs-plugins/memory'

const cache = Cache.create({
  cacheType: 'redis',
  params: {
    host: '127.0.0.1',
    port: 6379,
    password: process.env.REDIS_PASSWORD,
    db: 0,
    keyPrefix: 'myapp:',
    ttl: 60, // default TTL in seconds (optional)
  },
}) as RedisCache

await cache.set('session:abc', { userId: 1 }, 300) // TTL override, seconds
const session = await cache.get('session:abc')
await cache.del('session:abc')

// access underlying ioredis client for advanced usage
cache.client.ping()
```

## Example: Hono route with caching

```ts
import { Hono } from 'hono'
import Cache, { RedisCache } from '@honojs-plugins/memory'

const app = new Hono()

const cache = Cache.create({
  cacheType: 'redis',
  params: { host: '127.0.0.1', port: 6379, ttl: 60 },
}) as RedisCache

app.get('/users/:id', async (c) => {
  const id = c.req.param('id')
  const cacheKey = `user:${id}`

  const cached = await cache.get(cacheKey)
  if (cached) return c.json(cached)

  const user = await fetchUserFromDb(id) // your own data source
  await cache.set(cacheKey, user)

  return c.json(user)
})

export default app

async function fetchUserFromDb(id: string) {
  return { id, name: 'Alice' }
}
```

## API

### `Cache.create({ cacheType, params })`

| `cacheType` | `params` shape |
|---|---|
| `'memory'` | `MemoryConfig` — `{ max?: number (default 500), ttl?: number }` |
| `'redis'` | `RedisConfig` — `{ host?: string (default '127.0.0.1'), port?: number (default 6379), password?, db?, keyPrefix?, ttl? }` |

### `CacheDriver` interface (implemented by both drivers)

| Method | Description |
|---|---|
| `get<T>(key)` | Returns the cached value, or `undefined` if missing/expired |
| `set<T>(key, value, ttl?)` | Stores `value`, optionally overriding the default TTL (seconds) |
| `has(key)` | Returns `true` if `key` exists |
| `del(key)` | Removes `key` from the cache |
| `clear()` | Clears the entire cache (or Redis DB via `flushdb` for `RedisCache`) |
