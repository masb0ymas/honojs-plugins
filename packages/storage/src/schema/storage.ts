import z from 'zod'

export type StorageConfig = {
  provider: 'local' | 's3' | 'minio' | 'gcs'
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
    STORAGE_PROVIDER: z.enum(['local', 's3', 'minio', 'gcs']),
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
    STORAGE_SSL: z
      .preprocess((val) => {
        if (val === 'true' || val === '1') return true
        if (val === 'false' || val === '0') return false
        return val
      }, z.boolean())
      .optional(),
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
  .superRefine((val, ctx) => {
    const required = (field: string, value: unknown) => {
      if (value == null || value === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${field} is required for provider '${val.provider}'`,
          path: [field],
        })
      }
    }

    switch (val.provider) {
      case 'local':
        required('basePath', val.basePath)
        break
      case 's3':
        required('accessKey', val.accessKey)
        required('secretKey', val.secretKey)
        required('bucketName', val.bucketName)
        required('signExpired', val.signExpired)
        required('region', val.region)
        break
      case 'minio':
        required('accessKey', val.accessKey)
        required('secretKey', val.secretKey)
        required('bucketName', val.bucketName)
        required('signExpired', val.signExpired)
        required('region', val.region)
        required('host', val.host)
        required('port', val.port)
        required('ssl', val.ssl)
        break
      case 'gcs':
        required('accessKey', val.accessKey)
        required('bucketName', val.bucketName)
        required('signExpired', val.signExpired)
        required('filepath', val.filepath)
        break
    }
  })
