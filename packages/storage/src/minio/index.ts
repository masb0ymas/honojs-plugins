import { addDays } from 'date-fns'
import * as Minio from 'minio'
import { ms } from '../lib/date'
import { MinIOStorageConfig, UploadFileParams } from '../types/storage'

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
      endPoint: this._host || '127.0.0.1',
      port: this._port || 9000,
      useSSL: this._ssl || false,
      accessKey: this._access_key,
      secretKey: this._secret_key,
    })
  }

  /**
   * Generate keyfile
   */
  private _generateKeyfile(values: string[]) {
    return values.join('/')
  }

  /**
   * Get expires object
   */
  public expiresObject(): { expiresIn: number; expiryDate: Date } {
    const getExpired = this._expires.replace(/[^0-9]/g, '')

    const expiresIn = ms(this._expires)
    const expiryDate = addDays(new Date(), Number(getExpired))

    return { expiresIn, expiryDate }
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
  private async _createBucket() {
    const bucketName = this._bucket

    try {
      const data = await this.client.makeBucket(bucketName, this._region)

      const message = `minio - ${bucketName} bucket created`
      console.info(message)
      console.log(data)
    } catch (error: any) {
      const message = `minio error: ${error.message ?? error}`
      console.error(message)
      process.exit(1)
    }
  }

  /**
   * Upload file
   */
  async uploadFile({
    directory,
    file,
  }: UploadFileParams): Promise<{ data: any; signedUrl: string }> {
    const keyfile = this._generateKeyfile([directory, file.filename])

    const options = {
      ContentType: file.mimetype, // <-- this is what you need!
      ContentDisposition: `inline; filename=${file.filename}`, // <-- and this !
      ACL: 'public-read', // <-- this makes it public so people can see it
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

    const signedUrl = await this.client.presignedGetObject(bucketName, keyfile)

    const message = `minio - ${keyfile} presigned URL generated`
    console.info(message)

    return signedUrl
  }
}
