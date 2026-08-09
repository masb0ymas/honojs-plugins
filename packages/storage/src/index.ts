import S3Storage from './aws-s3'
import GoogleCloudStorage from './google-cloud'
import LocalStorage from './local'
import MinIOStorage from './minio'
import { StorageSchema } from './schema/storage'
import { StorageConfig, StorageInstance } from './types/storage'

/**
 * Storage service
 */
export default class Storage {
  /**
   * Create a storage service instance
   * @param config - Storage configuration
   * @returns Storage service instance
   */
  static create(config: StorageConfig): StorageInstance {
    const parsed = StorageSchema.safeParse(config)
    if (!parsed.success) {
      throw new Error('Invalid storage parameters', {
        cause: parsed.error,
      })
    }

    const value = parsed.data

    switch (value.provider) {
      case 'local':
        return new LocalStorage({
          local_path: value.local_path!,
          ...(value.local_url !== undefined && { local_url: value.local_url }),
        })

      case 's3':
        return new S3Storage({
          access_key: value.access_key!,
          secret_key: value.secret_key!,
          bucket: value.bucket!,
          expires: value.expires!,
          region: value.region!,
        })

      case 'minio':
        return new MinIOStorage({
          access_key: value.access_key!,
          secret_key: value.secret_key!,
          bucket: value.bucket!,
          expires: value.expires!,
          region: value.region!,
          host: value.host!,
          port: value.port!,
          ssl: value.ssl!,
        })

      case 'gcs':
        return new GoogleCloudStorage({
          access_key: value.access_key!,
          bucket: value.bucket!,
          expires: value.expires!,
          filepath: value.filepath!,
        })

      default:
        throw new Error(`Unsupported storage provider: ${value.provider}`)
    }
  }
}

export { default as S3Storage } from './aws-s3'
export { default as GoogleCloudStorage } from './google-cloud'
export { default as LocalStorage } from './local'
export { default as MinIOStorage } from './minio'

export type {
  GoogleCloudStorageConfig,
  LocalStorageConfig,
  MinIOStorageConfig,
  S3StorageConfig,
  StorageConfig,
  StorageInstance,
  StorageType
} from './types/storage'

