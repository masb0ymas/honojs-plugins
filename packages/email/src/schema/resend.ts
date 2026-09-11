import z from 'zod'

export type ResendConfig = {
  apiKey: string
  from?: string | undefined
  baseUrl?: string | undefined
  userAgent?: string | undefined
}

/** Schema for validating a normalized ResendConfig object */
export const ResendSchema = z.object({
  apiKey: z.string().min(1, 'apiKey is required'),
  from: z.string().optional(),
  baseUrl: z.string().optional(),
  userAgent: z.string().optional(),
}) as z.ZodType<ResendConfig>
