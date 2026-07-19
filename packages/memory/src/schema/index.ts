import z from 'zod'

export const CacheSchema: z.ZodObject<{
  driver: z.ZodEnum<{
    memory: 'memory'
    redis: 'redis'
  }>
}> = z.object({
  driver: z.enum(['memory', 'redis']),
})

export type CacheDriverType = z.infer<typeof CacheSchema>['driver']
