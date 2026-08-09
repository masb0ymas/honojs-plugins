import z from 'zod'

export type ResendConfig = {
  apiKey: string
  from: string | undefined
  baseUrl: string | undefined
  userAgent: string | undefined
}

export const ResendSchema: z.Schema<ResendConfig> = z
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
