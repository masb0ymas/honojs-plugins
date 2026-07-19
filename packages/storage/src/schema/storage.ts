import z from 'zod'

export const StorageSchema = z.object({
  STORAGE_PROVIDER: z.enum(['local', 's3', 'minio', 'gcs', 'aws']),
  STORAGE_HOST: z.string().optional(),
  STORAGE_PORT: z.coerce.number().int().optional(),
  STORAGE_ACCESS_KEY: z.string().optional(),
  STORAGE_SECRET_KEY: z.string().optional(),
  STORAGE_BUCKET_NAME: z.string().optional(),
  STORAGE_REGION: z.string().optional(),
  STORAGE_SIGN_EXPIRED: z.string().optional(),
  STORAGE_FILEPATH: z.string().optional(),
}) satisfies z.ZodObject<
  {
    STORAGE_PROVIDER: z.ZodEnum<{
      local: 'local'
      s3: 's3'
      minio: 'minio'
      gcs: 'gcs'
      aws: 'aws'
    }>
    STORAGE_HOST: z.ZodOptional<z.ZodString>
    STORAGE_PORT: z.ZodOptional<z.ZodCoercedNumber<unknown>>
    STORAGE_ACCESS_KEY: z.ZodOptional<z.ZodString>
    STORAGE_SECRET_KEY: z.ZodOptional<z.ZodString>
    STORAGE_BUCKET_NAME: z.ZodOptional<z.ZodString>
    STORAGE_REGION: z.ZodOptional<z.ZodString>
    STORAGE_SIGN_EXPIRED: z.ZodOptional<z.ZodString>
    STORAGE_FILEPATH: z.ZodOptional<z.ZodString>
  },
  z.core.$strip
> as z.ZodObject<
  {
    STORAGE_PROVIDER: z.ZodEnum<{
      local: 'local'
      s3: 's3'
      minio: 'minio'
      gcs: 'gcs'
      aws: 'aws'
    }>
    STORAGE_HOST: z.ZodOptional<z.ZodString>
    STORAGE_PORT: z.ZodOptional<z.ZodCoercedNumber<unknown>>
    STORAGE_ACCESS_KEY: z.ZodOptional<z.ZodString>
    STORAGE_SECRET_KEY: z.ZodOptional<z.ZodString>
    STORAGE_BUCKET_NAME: z.ZodOptional<z.ZodString>
    STORAGE_REGION: z.ZodOptional<z.ZodString>
    STORAGE_SIGN_EXPIRED: z.ZodOptional<z.ZodString>
    STORAGE_FILEPATH: z.ZodOptional<z.ZodString>
  },
  z.core.$strip
>
