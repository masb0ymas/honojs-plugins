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
  static create({ storageType, params }: StorageParams): StorageInstance {
    const parsed = StorageSchema.safeParse(params)
    if (!parsed.success) {
      console.log(parsed.error)
      throw new Error('Invalid environment variables')
    }

    switch (storageType) {
      case 'local':
        // @ts-expect-error
        return new LocalStorage(parsed.data)

      case 's3':
        // @ts-expect-error
        return new S3Storage(parsed.data)

      case 'minio':
        // @ts-expect-error
        return new MinIOStorage(parsed.data)

      case 'gcs':
        // @ts-expect-error
        return new GoogleCloudStorage(parsed.data)

      default:
        throw new Error('Invalid storage type')
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

