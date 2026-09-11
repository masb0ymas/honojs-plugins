import * as GCS from '@google-cloud/storage'
import fs from 'fs'
import path from 'path'
import { errorMessage, isNotFoundError } from '../lib/errors'
import { resolveExpires, type ExpiresObject } from '../lib/expires'
import { buildKeyfile } from '../lib/keys'
import {
  GoogleCloudStorageConfig,
  GoogleCloudUploadResult,
  UploadFileParams,
} from '../types/storage'

export default class GoogleCloudStorage {
  public client: GCS.Storage

  private _projectId: string
  private _filepath: string
  private _bucket: string
  private _expires: string

  constructor(params: GoogleCloudStorageConfig) {
    this._projectId = params.access_key
    this._bucket = params.bucket
    this._expires = params.expires
    this._filepath = path.resolve(process.cwd(), params.filepath)

    if (!fs.existsSync(this._filepath)) {
      const message = `google cloud service account is missing on root directory`
      console.error(message)

      throw new Error(
        'Missing GCP Service Account!!!\nCopy gcp-serviceAccount from your console google to root directory "gcp-serviceAccount.json"'
      )
    }

    this.client = new GCS.Storage({
      projectId: this._projectId,
      keyFilename: this._filepath,
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

    const bucket = this.client.bucket(bucketName)

    try {
      const [exists] = await bucket.exists()

      if (!exists) {
        await this._createBucket()
        return
      }

      const [metadata] = await bucket.getMetadata()

      const message = `google cloud - ${bucketName} bucket found`
      console.info(message)
      console.log(metadata)
    } catch (error: unknown) {
      if (!isNotFoundError(error)) {
        console.error(`google cloud - ${bucketName} initialize failed: ${errorMessage(error)}`)
        throw error
      }

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
      const [bucket] = await this.client.createBucket(bucketName)
      const [metadata] = await bucket.getMetadata()

      const message = `google cloud - ${bucketName} bucket created`
      console.info(message)
      console.log(metadata)
    } catch (error: unknown) {
      const message = `google cloud error: ${errorMessage(error)}`
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
  }: UploadFileParams): Promise<{ data: GoogleCloudUploadResult; signedUrl: string }> {
    const keyfile = buildKeyfile([directory, file.filename])

    // For a destination object that does not yet exist,
    // set the ifGenerationMatch precondition to 0
    // If the destination object already exists in your bucket, set instead a
    // generation-match precondition using its generation number.
    const generationMatchPrecondition = 0

    const options: GCS.UploadOptions = {
      destination: keyfile,
      preconditionOpts: { ifGenerationMatch: generationMatchPrecondition },
    }

    const data = await this.client.bucket(this._bucket).upload(file.path, options)
    const signedUrl = await this.presignedUrl(keyfile)

    return { data: data[1], signedUrl }
  }

  /**
   * Generate presigned URL
   */
  async presignedUrl(keyfile: string): Promise<string> {
    const bucketName = this._bucket

    const { expiresIn } = this.expiresObject()
    const options: GCS.GetSignedUrlConfig = {
      version: 'v4',
      action: 'read',
      virtualHostedStyle: true,
      expires: Date.now() + expiresIn * 1000,
    }

    const [signedUrl] = await this.client.bucket(bucketName).file(keyfile).getSignedUrl(options)

    const message = `google cloud - ${keyfile} presigned URL generated`
    console.info(message)

    return signedUrl
  }
}
