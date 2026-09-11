import z from 'zod'
import type { StorageConfig } from '../types/storage'

const localSchema = z.object({
  provider: z.literal('local'),
  local_path: z.string().min(1, "local_path is required for provider 'local'"),
  local_url: z.string().optional(),
})

const s3Schema = z.object({
  provider: z.literal('s3'),
  access_key: z.string().min(1, "access_key is required for provider 's3'"),
  secret_key: z.string().min(1, "secret_key is required for provider 's3'"),
  bucket: z.string().min(1, "bucket is required for provider 's3'"),
  expires: z.string().min(1, "expires is required for provider 's3'"),
  region: z.string().min(1, "region is required for provider 's3'"),
})

const booleanFromString = z.preprocess((val) => {
  if (val === 'true' || val === '1') return true
  if (val === 'false' || val === '0') return false
  return val
}, z.boolean())

const minioSchema = z.object({
  provider: z.literal('minio'),
  access_key: z.string().min(1, "access_key is required for provider 'minio'"),
  secret_key: z.string().min(1, "secret_key is required for provider 'minio'"),
  bucket: z.string().min(1, "bucket is required for provider 'minio'"),
  expires: z.string().min(1, "expires is required for provider 'minio'"),
  region: z.string().min(1, "region is required for provider 'minio'"),
  host: z.string().min(1, "host is required for provider 'minio'"),
  port: z.coerce.number().int().positive(),
  ssl: booleanFromString,
})

const gcsSchema = z.object({
  provider: z.literal('gcs'),
  access_key: z.string().min(1, "access_key is required for provider 'gcs'"),
  bucket: z.string().min(1, "bucket is required for provider 'gcs'"),
  expires: z.string().min(1, "expires is required for provider 'gcs'"),
  filepath: z.string().min(1, "filepath is required for provider 'gcs'"),
})

export const StorageSchema: z.ZodType<StorageConfig> = z.discriminatedUnion('provider', [
  localSchema,
  s3Schema,
  minioSchema,
  gcsSchema,
])
