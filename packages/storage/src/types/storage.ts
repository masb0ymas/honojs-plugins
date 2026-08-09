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

export type GoogleCloudStorageConfig = {
  access_key: string
  bucket: string
  expires: string
  filepath: string
}

export type S3StorageConfig = {
  access_key: string
  secret_key: string
  bucket: string
  expires: string
  region: string
}

export type MinIOStorageConfig = {
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
  local_path: string
  local_url?: string
}

export type StorageType = 'local' | 's3' | 'minio' | 'gcs'

export type StorageConfig =
  S3StorageConfig | MinIOStorageConfig | GoogleCloudStorageConfig | LocalStorageConfig

export type StorageInstance = S3Storage | MinIOStorage | GoogleCloudStorage | LocalStorage
