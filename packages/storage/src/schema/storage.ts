import z from 'zod'

export type StorageConfig = {
  provider: 'local' | 's3' | 'minio' | 'gcs' | 'aws'
  host: string | undefined
  port: number | undefined
  accessKey: string | undefined
  secretKey: string | undefined
  bucketName: string | undefined
  region: string | undefined
  signExpired: string | undefined
  filepath: string | undefined
  basePath: string | undefined
  baseUrl: string | undefined
  ssl: boolean | undefined
}

export const StorageSchema: z.ZodSchema<StorageConfig> = z
  .object({
    STORAGE_PROVIDER: z.enum(['local', 's3', 'minio', 'gcs', 'aws']),
    STORAGE_HOST: z.string().optional(),
    STORAGE_PORT: z.coerce.number().int().optional(),
    STORAGE_ACCESS_KEY: z.string().optional(),
    STORAGE_SECRET_KEY: z.string().optional(),
    STORAGE_BUCKET_NAME: z.string().optional(),
    STORAGE_REGION: z.string().optional(),
    STORAGE_SIGN_EXPIRED: z.string().optional(),
    STORAGE_FILEPATH: z.string().optional(),
    STORAGE_BASE_PATH: z.string().optional(),
    STORAGE_BASE_URL: z.string().optional(),
    STORAGE_SSL: z.coerce.boolean().optional(),
  })
  .transform((val): StorageConfig => {
    return {
      provider: val.STORAGE_PROVIDER,
      host: val.STORAGE_HOST,
      port: val.STORAGE_PORT,
      accessKey: val.STORAGE_ACCESS_KEY,
      secretKey: val.STORAGE_SECRET_KEY,
      bucketName: val.STORAGE_BUCKET_NAME,
      region: val.STORAGE_REGION,
      signExpired: val.STORAGE_SIGN_EXPIRED,
      filepath: val.STORAGE_FILEPATH,
      basePath: val.STORAGE_BASE_PATH,
      baseUrl: val.STORAGE_BASE_URL,
      ssl: val.STORAGE_SSL,
    }
  })
