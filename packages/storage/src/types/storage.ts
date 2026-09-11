import S3Storage from '../aws-s3'
import GoogleCloudStorage from '../google-cloud'
import LocalStorage from '../local'
import MinIOStorage from '../minio'

export type UploadFileParams = {
  directory: string
  file: FileParams
}

export type FileParams = {
  fieldname: string
  originalname: string
  encoding: string
  mimetype: string
  destination: string
  filename: string
  path: string
  size: number
}

/** Result returned by MinIO's `fPutObject`. */
export type MinIOUploadResult = {
  etag: string
  versionId: string | null
}

/** Result returned by GCS's `Bucket.upload` (the uploaded `File`). */
export type GoogleCloudUploadResult = unknown

export type GoogleCloudStorageConfig = {
  provider: 'gcs'
  access_key: string
  bucket: string
  expires: string
  filepath: string
}

export type S3StorageConfig = {
  provider: 's3'
  access_key: string
  secret_key: string
  bucket: string
  expires: string
  region: string
}

export type MinIOStorageConfig = {
  provider: 'minio'
  access_key: string
  secret_key: string
  bucket: string
  expires: string
  region: string
  host: string
  port: number
  ssl: boolean
}

export type LocalStorageConfig = {
  provider: 'local'
  local_path: string
  local_url?: string | undefined
}

export type StorageType = 'local' | 's3' | 'minio' | 'gcs'

export type StorageConfig =
  S3StorageConfig | MinIOStorageConfig | GoogleCloudStorageConfig | LocalStorageConfig

export type StorageInstance = S3Storage | MinIOStorage | GoogleCloudStorage | LocalStorage
