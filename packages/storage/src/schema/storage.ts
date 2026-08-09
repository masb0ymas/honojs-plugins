import z from 'zod'

type StorageSchemaType = {
  provider: 'local' | 's3' | 'minio' | 'gcs'
  host?: string | undefined
  port?: number | undefined
  accessKey?: string | undefined
  secretKey?: string | undefined
  bucketName?: string | undefined
  region?: string | undefined
  signExpired?: string | undefined
  filepath?: string | undefined
  basePath?: string | undefined
  baseUrl?: string | undefined
  ssl?: boolean | undefined
}

export const StorageSchema: z.ZodType<StorageSchemaType> = z
  .object({
    provider: z.enum(['local', 's3', 'minio', 'gcs']),
    host: z.string().optional(),
    port: z.coerce.number().int().optional(),
    accessKey: z.string().optional(),
    secretKey: z.string().optional(),
    bucketName: z.string().optional(),
    region: z.string().optional(),
    signExpired: z.string().optional(),
    filepath: z.string().optional(),
    basePath: z.string().optional(),
    baseUrl: z.string().optional(),
    ssl: z
      .preprocess((val) => {
        if (val === 'true' || val === '1') return true
        if (val === 'false' || val === '0') return false
        return val
      }, z.boolean())
      .optional(),
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
