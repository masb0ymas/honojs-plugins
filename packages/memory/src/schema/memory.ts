import z from 'zod'

export const MemorySchema: z.ZodObject<{
  max: z.ZodDefault<z.ZodNumber>
  ttl: z.ZodOptional<z.ZodNumber>
}> = z.object({
  max: z.number().int().positive().default(500),
  ttl: z.number().int().positive().optional(),
})

export type MemoryConfig = z.infer<typeof MemorySchema>
