import { describe, expect, it } from 'vitest'
import { StorageSchema } from './storage'

describe('StorageSchema', () => {
  it('accepts a valid local config', () => {
    const parsed = StorageSchema.safeParse({ provider: 'local', local_path: 'uploads' })
    expect(parsed.success).toBe(true)
  })

  it('accepts a valid s3 config', () => {
    const parsed = StorageSchema.safeParse({
      provider: 's3',
      access_key: 'key',
      secret_key: 'secret',
      bucket: 'bucket',
      expires: '7d',
      region: 'us-east-1',
    })
    expect(parsed.success).toBe(true)
  })

  it('coerces minio ssl strings and port', () => {
    const parsed = StorageSchema.safeParse({
      provider: 'minio',
      access_key: 'key',
      secret_key: 'secret',
      bucket: 'bucket',
      expires: '7d',
      region: 'us-east-1',
      host: '127.0.0.1',
      port: '9000',
      ssl: 'true',
    })

    expect(parsed.success).toBe(true)
    if (parsed.success && parsed.data.provider === 'minio') {
      expect(parsed.data.provider).toBe('minio')
      expect(parsed.data.port).toBe(9000)
      expect(parsed.data.ssl).toBe(true)
    }
  })

  it('rejects a provider with missing required fields', () => {
    const parsed = StorageSchema.safeParse({ provider: 's3', access_key: 'key' })
    expect(parsed.success).toBe(false)
    if (!parsed.success) {
      const paths = parsed.error.issues.map((issue) => issue.path.join('.'))
      expect(paths).toContain('secret_key')
      expect(paths).toContain('bucket')
      expect(paths).toContain('region')
      expect(paths).toContain('expires')
    }
  })

  it('rejects an unknown provider', () => {
    const parsed = StorageSchema.safeParse({ provider: 'gdrive' })
    expect(parsed.success).toBe(false)
  })

  it('rejects an empty required string', () => {
    const parsed = StorageSchema.safeParse({ provider: 'local', local_path: '' })
    expect(parsed.success).toBe(false)
  })
})
