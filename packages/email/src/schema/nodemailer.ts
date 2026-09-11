import z from 'zod'

export type NodemailerEncryption = 'ssl' | 'tls' | 'starttls'

export type NodemailerConfig = {
  driver?: string | undefined
  host?: string | undefined
  port?: number | undefined
  from?: string | undefined
  username?: string | undefined
  password?: string | undefined
  encryption?: NodemailerEncryption | undefined
}

/** Schema for validating a normalized NodemailerConfig object */
export const NodemailerSchema = z.object({
  driver: z.string().optional(),
  host: z.string().optional(),
  port: z.number().int().positive().optional(),
  from: z.string().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
  encryption: z.enum(['ssl', 'tls', 'starttls']).optional(),
}) as z.ZodType<NodemailerConfig>
