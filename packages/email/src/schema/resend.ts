import z from 'zod'

export type ResendConfig = {
  apiKey: string
  from: string | undefined
  baseUrl: string | undefined
  userAgent: string | undefined
}

/** Schema for raw RESEND_* environment-variable input, transforms to normalized ResendConfig */
export const ResendRawSchema: z.Schema<ResendConfig> = z
  .object({
    RESEND_API_KEY: z.string().min(1, 'RESEND_API_KEY is required'),
    RESEND_FROM: z.string().optional(),
    RESEND_BASE_URL: z.string().optional(),
    RESEND_USER_AGENT: z.string().optional(),
  })
  .transform((val) => {
    return {
      apiKey: val.RESEND_API_KEY,
      from: val.RESEND_FROM,
      baseUrl: val.RESEND_BASE_URL,
      userAgent: val.RESEND_USER_AGENT,
    }
  })

/** Schema for validating a normalized ResendConfig object directly */
export const ResendSchema = z.object({
  apiKey: z.string().min(1, 'apiKey is required'),
  from: z.string().optional(),
  baseUrl: z.string().optional(),
  userAgent: z.string().optional(),
}) as z.ZodType<ResendConfig>
