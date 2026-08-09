import * as S3Client from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { addDays } from 'date-fns'
import fs from 'fs'
import { ms } from '../lib/date'
import { S3StorageConfig, UploadFileParams } from '../types/storage'

export default class S3Storage {
  public client: S3Client.S3
  private _access_key: string
  private _secret_key: string
  private _bucket: string
  private _expires: string
  private _region: string

  constructor(params: S3StorageConfig) {
    this._access_key = params.access_key
    this._secret_key = params.secret_key
    this._bucket = params.bucket
    this._expires = params.expires
    this._region = params.region

    this.client = new S3Client.S3({
      region: this._region,
      credentials: {
        accessKeyId: this._access_key,
        secretAccessKey: this._secret_key,
      },
    })
  }

  /**
   * Generate keyfile
   */
  private _generateKeyfile(values: string[]): string {
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

    try {
      const command = new S3Client.GetBucketAclCommand({ Bucket: bucketName })
      const data = await this.client.send(command)

      const message = `aws s3 - ${bucketName} bucket found`
      console.log(message)
      console.log(data.Grants)
    } catch (error: any) {
      const message = `aws s3 - ${bucketName} bucket not found`
      console.error(message)
      // create bucket if not exists
      await this._createBucket()
    }
  }

  /**
   * Create bucket
   */
  private async _createBucket() {
    const bucketName = this._bucket

    try {
      const command = new S3Client.CreateBucketCommand({ Bucket: bucketName })
      const data = await this.client.send(command)

      const message = `aws s3 - ${bucketName} bucket created`
      console.log(message)
      console.log(data)
    } catch (error: any) {
      const message = `aws s3 error: ${error.message ?? error}`
      console.error(message)
      process.exit(1)
    }
  }

  /**
   * Upload file
   */
  async uploadFile({ directory, file }: UploadFileParams): Promise<{
    data: S3Client.PutObjectCommandOutput
    signedUrl: string
  }> {
    const keyfile = this._generateKeyfile([directory, file.filename])

    const command = new S3Client.PutObjectCommand({
      Bucket: this._bucket,
      Key: keyfile,
      Body: fs.createReadStream(file.path),
      ContentType: file.mimetype, // <-- this is what you need!
      ContentDisposition: `inline; filename=${file.filename}`, // <-- and this !
      ACL: 'public-read', // <-- this makes it public so people can see it
    })

    const data = await this.client.send(command)
    const signedUrl = await this.presignedUrl(keyfile)

    return { data, signedUrl }
  }

  /**
   * Generate presigned URL
   */
  async presignedUrl(keyfile: string): Promise<string> {
    const bucketName = this._bucket

    const { expiresIn } = this.expiresObject()
    const newExpiresIn = expiresIn / 1000

    const command = new S3Client.GetObjectCommand({
      Bucket: bucketName,
      Key: keyfile,
    })

    const signedUrl = await getSignedUrl(this.client, command, {
      expiresIn: newExpiresIn,
    })

    const message = `aws s3 - ${keyfile} presigned URL generated`
    console.log(message)

    return signedUrl
  }
}
