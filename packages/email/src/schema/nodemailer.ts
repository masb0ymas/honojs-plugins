import z from 'zod'

export type NodemailerConfig = {
  driver: string | undefined
  host: string | undefined
  port: number | undefined
  from: string | undefined
  username: string | undefined
  password: string | undefined
  encryption: string | undefined
}

export const NodemailerSchema: z.Schema<NodemailerConfig> = z
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
