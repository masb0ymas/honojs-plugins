import z from 'zod'

type StorageSchemaType = {
  provider: 'local' | 's3' | 'minio' | 'gcs'
  host?: string | undefined
  port?: number | undefined
  access_key?: string | undefined
  secret_key?: string | undefined
  bucket?: string | undefined
  region?: string | undefined
  expires?: string | undefined
  filepath?: string | undefined
  local_path?: string | undefined
  local_url?: string | undefined
  ssl?: boolean | undefined
}

export const StorageSchema: z.ZodType<StorageSchemaType> = z
  .object({
    provider: z.enum(['local', 's3', 'minio', 'gcs']),
    host: z.string().optional(),
    port: z.coerce.number().int().optional(),
    access_key: z.string().optional(),
    secret_key: z.string().optional(),
    bucket: z.string().optional(),
    region: z.string().optional(),
    expires: z.string().optional(),
    filepath: z.string().optional(),
    local_path: z.string().optional(),
    local_url: z.string().optional(),
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
        required('local_path', val.local_path)
        break
      case 's3':
        required('access_key', val.access_key)
        required('secret_key', val.secret_key)
        required('bucket', val.bucket)
        required('expires', val.expires)
        required('region', val.region)
        break
      case 'minio':
        required('access_key', val.access_key)
        required('secret_key', val.secret_key)
        required('bucket', val.bucket)
        required('expires', val.expires)
        required('region', val.region)
        required('host', val.host)
        required('port', val.port)
        required('ssl', val.ssl)
        break
      case 'gcs':
        required('access_key', val.access_key)
        required('bucket', val.bucket)
        required('expires', val.expires)
        required('filepath', val.filepath)
        break
    }
  })
