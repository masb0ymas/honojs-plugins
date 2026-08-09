import z from 'zod'

type CacheConfig = z.ZodObject<{
  driver: z.ZodEnum<{
    memory: 'memory'
    redis: 'redis'
  }>
}>

export const CacheSchema: CacheConfig = z.object({
  driver: z.enum(['memory', 'redis']),
})

export type CacheDriverType = z.infer<typeof CacheSchema>['driver']
