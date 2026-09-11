import * as S3Client from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import fs from 'fs'
import { errorMessage, isNotFoundError } from '../lib/errors'
import { resolveExpires, type ExpiresObject } from '../lib/expires'
import { buildKeyfile } from '../lib/keys'
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

    try {
      const command = new S3Client.GetBucketAclCommand({ Bucket: bucketName })
      const data = await this.client.send(command)

      const message = `aws s3 - ${bucketName} bucket found`
      console.log(message)
      console.log(data.Grants)
    } catch (error: unknown) {
      if (!isNotFoundError(error)) {
        console.error(`aws s3 - ${bucketName} initialize failed: ${errorMessage(error)}`)
        throw error
      }

      console.error(`aws s3 - ${bucketName} bucket not found`)
      // create bucket if not exists
      await this._createBucket()
    }
  }

  /**
   * Create bucket
   */
  private async _createBucket(): Promise<void> {
    const bucketName = this._bucket

    try {
      const command = new S3Client.CreateBucketCommand({ Bucket: bucketName })
      const data = await this.client.send(command)

      const message = `aws s3 - ${bucketName} bucket created`
      console.log(message)
      console.log(data)
    } catch (error: unknown) {
      const message = `aws s3 error: ${errorMessage(error)}`
      console.error(message)
      throw new Error(message, { cause: error })
    }
  }

  /**
   * Upload file
   */
  async uploadFile({ directory, file }: UploadFileParams): Promise<{
    data: S3Client.PutObjectCommandOutput
    signedUrl: string
  }> {
    const keyfile = buildKeyfile([directory, file.filename])

    const command = new S3Client.PutObjectCommand({
      Bucket: this._bucket,
      Key: keyfile,
      Body: fs.createReadStream(file.path),
      ContentType: file.mimetype,
      ContentDisposition: `inline; filename=${file.filename}`,
      ACL: 'public-read',
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

    const command = new S3Client.GetObjectCommand({
      Bucket: bucketName,
      Key: keyfile,
    })

    const signedUrl = await getSignedUrl(this.client, command, {
      expiresIn,
    })

    const message = `aws s3 - ${keyfile} presigned URL generated`
    console.log(message)

    return signedUrl
  }
}
