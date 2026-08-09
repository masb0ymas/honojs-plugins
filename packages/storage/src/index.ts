import S3Storage from './aws-s3'
import GoogleCloudStorage from './google-cloud'
import LocalStorage from './local'
import MinIOStorage from './minio'
import { StorageSchema } from './schema/storage'
import { StorageInstance, StorageParams } from './types/storage'

/**
 * Storage service
 */
export default class Storage {
  /**
   * Create a storage service instance
   * @param params - Storage parameters
   * @returns Storage service instance
   */
  static create({ params }: StorageParams): StorageInstance {
    const parsed = StorageSchema.safeParse(params)
    if (!parsed.success) {
      throw new Error('Invalid storage parameters', {
        cause: parsed.error,
      })
    }

    const config = parsed.data

    switch (config.provider) {
      case 'local':
        return new LocalStorage({
          basePath: config.basePath!,
          ...(config.baseUrl !== undefined && { baseUrl: config.baseUrl }),
        })

      case 's3':
        return new S3Storage({
          access_key: config.accessKey!,
          secret_key: config.secretKey!,
          bucket: config.bucketName!,
          expires: config.signExpired!,
          region: config.region!,
        })

      case 'minio':
        return new MinIOStorage({
          access_key: config.accessKey!,
          secret_key: config.secretKey!,
          bucket: config.bucketName!,
          expires: config.signExpired!,
          region: config.region!,
          host: config.host!,
          port: config.port!,
          ssl: config.ssl!,
        })

      case 'gcs':
        return new GoogleCloudStorage({
          access_key: config.accessKey!,
          bucket: config.bucketName!,
          expires: config.signExpired!,
          filepath: config.filepath!,
        })

      default:
        throw new Error(`Unsupported storage provider: ${config.provider}`)
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
    StorageInstance,
    StorageParams,
    StorageType
} from './types/storage'

