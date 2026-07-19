import z from 'zod'

export const RedisSchema: z.ZodObject<{
  host: z.ZodDefault<z.ZodString>
  port: z.ZodDefault<z.ZodNumber>
  password: z.ZodOptional<z.ZodString>
  db: z.ZodOptional<z.ZodNumber>
  keyPrefix: z.ZodOptional<z.ZodString>
  ttl: z.ZodOptional<z.ZodNumber>
}> = z.object({
  host: z.string().default('127.0.0.1'),
  port: z.number().int().positive().default(6379),
  password: z.string().optional(),
  db: z.number().int().nonnegative().optional(),
  keyPrefix: z.string().optional(),
  ttl: z.number().int().positive().optional(),
})

export type RedisConfig = z.infer<typeof RedisSchema>
