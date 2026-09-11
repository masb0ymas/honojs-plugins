import * as Minio from 'minio'
import { errorMessage } from '../lib/errors'
import { resolveExpires, type ExpiresObject } from '../lib/expires'
import { buildKeyfile } from '../lib/keys'
import { MinIOStorageConfig, MinIOUploadResult, UploadFileParams } from '../types/storage'

export default class MinIOStorage {
  public client: Minio.Client
  private _access_key: string
  private _secret_key: string
  private _bucket: string
  private _expires: string
  private _region: string
  private _host: string
  private _port: number
  private _ssl: boolean

  constructor(params: MinIOStorageConfig) {
    this._access_key = params.access_key
    this._secret_key = params.secret_key
    this._bucket = params.bucket
    this._expires = params.expires
    this._region = params.region
    this._host = params.host
    this._port = params.port
    this._ssl = params.ssl

    this.client = new Minio.Client({
      endPoint: this._host,
      port: this._port,
      useSSL: this._ssl,
      accessKey: this._access_key,
      secretKey: this._secret_key,
    })
  }

  /**
   * Get expires object
   */
  public expiresObject(): ExpiresObject {
    return resolveExpires(this._expires)
  }

  /**
   * Initialize storage
   */
  async initialize(): Promise<void> {
    const bucketName = this._bucket

    const exists = await this.client.bucketExists(bucketName)

    if (!exists) {
      await this._createBucket()
    } else {
      const message = `minio - ${bucketName} bucket found`
      console.info(message)
    }
  }

  /**
   * Create bucket
   */
  private async _createBucket(): Promise<void> {
    const bucketName = this._bucket

    try {
      await this.client.makeBucket(bucketName, this._region)

      const message = `minio - ${bucketName} bucket created`
      console.info(message)
    } catch (error: unknown) {
      const message = `minio error: ${errorMessage(error)}`
      console.error(message)
      throw new Error(message, { cause: error })
    }
  }

  /**
   * Upload file
   */
  async uploadFile({
    directory,
    file,
  }: UploadFileParams): Promise<{ data: MinIOUploadResult; signedUrl: string }> {
    const keyfile = buildKeyfile([directory, file.filename])

    const options = {
      ContentType: file.mimetype,
      ContentDisposition: `inline; filename=${file.filename}`,
      ACL: 'public-read' as const,
    }

    const data = await this.client.fPutObject(this._bucket, keyfile, file.path, options)
    const signedUrl = await this.presignedUrl(keyfile)

    return { data, signedUrl }
  }

  /**
   * Generate presigned URL
   */
  async presignedUrl(keyfile: string): Promise<string> {
    const bucketName = this._bucket

    const { expiresIn } = this.expiresObject()

    const signedUrl = await this.client.presignedGetObject(bucketName, keyfile, expiresIn)

    const message = `minio - ${keyfile} presigned URL generated`
    console.info(message)

    return signedUrl
  }
}
