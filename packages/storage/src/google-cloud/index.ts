import * as GCS from '@google-cloud/storage'
import { addDays } from 'date-fns'
import fs from 'fs'
import path from 'path'
import { ms } from '../lib/date'
import { GoogleCloudStorageConfig, UploadFileParams } from '../types/storage'

export default class GoogleCloudStorage {
  public client: GCS.Storage

  private _access_key: string
  private _filepath: string
  private _bucket: string
  private _expires: string

  constructor(params: GoogleCloudStorageConfig) {
    this._access_key = params.access_key
    this._bucket = params.bucket
    this._expires = params.expires
    this._filepath = path.resolve(`${process.cwd()}/${params.filepath}`)

    if (!this._access_key && !fs.existsSync(this._filepath)) {
      const message = `google cloud serviceAccount is missing on root directory`
      console.error(message)

      throw new Error(
        'Missing GCP Service Account!!!\nCopy gcp-serviceAccount from your console google to root directory "gcp-serviceAccount.json"'
      )
    }

    if (this._access_key) {
      const message = `google cloud - ${this._filepath}`
      console.info(message)
    }

    this.client = new GCS.Storage({
      projectId: this._access_key,
      keyFilename: this._filepath,
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

    try {
      const data = this.client.bucket(bucketName)
      const getBucket = await data.exists()
      const getMetadata = await data.getMetadata()

      if (getBucket[0]) {
        const message = `google cloud - ${bucketName} bucket found`
        console.info(message)
        console.log(getMetadata[0])
      }
    } catch (error) {
      const message = `google cloud - ${bucketName} bucket not found`
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
      const data = await this.client.createBucket(bucketName)
      const getMetadata = await data[0].getMetadata()

      const message = `google cloud - ${bucketName} bucket created`
      console.info(message)
      console.log(getMetadata[0])
    } catch (error: any) {
      const message = `google cloud error: ${error.message ?? error}`
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
      expires: Date.now() + expiresIn,
    }

    const data = await this.client.bucket(bucketName).file(keyfile).getSignedUrl(options)
    const signedUrl = data[0]

    const message = `google cloud - ${keyfile} presigned URL generated`
    console.info(message)

    return signedUrl
  }
}
