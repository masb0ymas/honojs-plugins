import z from 'zod'

export const ResendSchema = z
  .object({
    RESEND_API_KEY: z.string().optional(),
    RESEND_FROM: z.string().optional(),
  })
  .transform((val) => {
    return {
      apiKey: val.RESEND_API_KEY,
      from: val.RESEND_FROM,
    }
  })
  .readonly() satisfies z.ZodReadonly<
  z.ZodPipe<
    z.ZodObject<
      {
        RESEND_API_KEY: z.ZodOptional<z.ZodString>
        RESEND_FROM: z.ZodOptional<z.ZodString>
      },
      z.core.$strip
    >,
    z.ZodTransform<
      {
        apiKey: string | undefined
        from: string | undefined
      },
      {
        RESEND_API_KEY?: string | undefined
        RESEND_FROM?: string | undefined
      }
    >
  >
> as z.ZodReadonly<
  z.ZodPipe<
    z.ZodObject<
      {
        RESEND_API_KEY: z.ZodOptional<z.ZodString>
        RESEND_FROM: z.ZodOptional<z.ZodString>
      },
      z.core.$strip
    >,
    z.ZodTransform<
      {
        apiKey: string | undefined
        from: string | undefined
      },
      {
        RESEND_API_KEY?: string | undefined
        RESEND_FROM?: string | undefined
      }
    >
  >
>

export type ResendConfig = z.infer<typeof ResendSchema>
