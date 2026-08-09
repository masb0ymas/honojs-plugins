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
          basePath: value.basePath!,
          ...(value.baseUrl !== undefined && { baseUrl: value.baseUrl }),
        })

      case 's3':
        return new S3Storage({
          access_key: value.accessKey!,
          secret_key: value.secretKey!,
          bucket: value.bucketName!,
          expires: value.signExpired!,
          region: value.region!,
        })

      case 'minio':
        return new MinIOStorage({
          access_key: value.accessKey!,
          secret_key: value.secretKey!,
          bucket: value.bucketName!,
          expires: value.signExpired!,
          region: value.region!,
          host: value.host!,
          port: value.port!,
          ssl: value.ssl!,
        })

      case 'gcs':
        return new GoogleCloudStorage({
          access_key: value.accessKey!,
          bucket: value.bucketName!,
          expires: value.signExpired!,
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
  GoogleCloudStorageParams,
  LocalStorageParams,
  MinIOStorageParams,
  S3StorageParams,
  StorageConfig,
  StorageInstance,
  StorageType
} from './types/storage'

