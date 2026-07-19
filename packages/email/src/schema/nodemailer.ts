import z from 'zod'

export const NodemailerSchema = z
  .object({
    MAIL_DRIVER: z.string().optional(),
    MAIL_HOST: z.string().optional(),
    MAIL_PORT: z.coerce.number().int().optional(),
    MAIL_FROM: z.string().optional(),
    MAIL_USERNAME: z.string().optional(),
    MAIL_PASSWORD: z.string().optional(),
    MAIL_ENCRYPTION: z.string().optional(),
  })
  .transform((val) => {
    return {
      driver: val.MAIL_DRIVER,
      host: val.MAIL_HOST,
      port: val.MAIL_PORT,
      from: val.MAIL_FROM,
      username: val.MAIL_USERNAME,
      password: val.MAIL_PASSWORD,
      encryption: val.MAIL_ENCRYPTION,
    }
  })
  .readonly() satisfies z.ZodReadonly<
  z.ZodPipe<
    z.ZodObject<
      {
        MAIL_DRIVER: z.ZodOptional<z.ZodString>
        MAIL_HOST: z.ZodOptional<z.ZodString>
        MAIL_PORT: z.ZodOptional<z.ZodCoercedNumber<unknown>>
        MAIL_FROM: z.ZodOptional<z.ZodString>
        MAIL_USERNAME: z.ZodOptional<z.ZodString>
        MAIL_PASSWORD: z.ZodOptional<z.ZodString>
        MAIL_ENCRYPTION: z.ZodOptional<z.ZodString>
      },
      z.core.$strip
    >,
    z.ZodTransform<
      {
        driver: string | undefined
        host: string | undefined
        port: number | undefined
        from: string | undefined
        username: string | undefined
        password: string | undefined
        encryption: string | undefined
      },
      {
        MAIL_DRIVER?: string | undefined
        MAIL_HOST?: string | undefined
        MAIL_PORT?: number | undefined
        MAIL_FROM?: string | undefined
        MAIL_USERNAME?: string | undefined
        MAIL_PASSWORD?: string | undefined
        MAIL_ENCRYPTION?: string | undefined
      }
    >
  >
> as z.ZodReadonly<
  z.ZodPipe<
    z.ZodObject<
      {
        MAIL_DRIVER: z.ZodOptional<z.ZodString>
        MAIL_HOST: z.ZodOptional<z.ZodString>
        MAIL_PORT: z.ZodOptional<z.ZodCoercedNumber<unknown>>
        MAIL_FROM: z.ZodOptional<z.ZodString>
        MAIL_USERNAME: z.ZodOptional<z.ZodString>
        MAIL_PASSWORD: z.ZodOptional<z.ZodString>
        MAIL_ENCRYPTION: z.ZodOptional<z.ZodString>
      },
      z.core.$strip
    >,
    z.ZodTransform<
      {
        driver: string | undefined
        host: string | undefined
        port: number | undefined
        from: string | undefined
        username: string | undefined
        password: string | undefined
        encryption: string | undefined
      },
      {
        MAIL_DRIVER?: string | undefined
        MAIL_HOST?: string | undefined
        MAIL_PORT?: number | undefined
        MAIL_FROM?: string | undefined
        MAIL_USERNAME?: string | undefined
        MAIL_PASSWORD?: string | undefined
        MAIL_ENCRYPTION?: string | undefined
      }
    >
  >
>

export type NodemailerConfig = z.infer<typeof NodemailerSchema>
