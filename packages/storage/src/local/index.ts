import fs from 'fs'
import path from 'path'
import { errorMessage } from '../lib/errors'
import { buildKeyfile } from '../lib/keys'
import { LocalStorageConfig, UploadFileParams } from '../types/storage'

export default class LocalStorage {
  private _basePath: string
  private _baseUrl: string

  constructor(params: LocalStorageConfig) {
    this._basePath = path.resolve(process.cwd(), params.local_path)
    this._baseUrl = params.local_url ?? '/uploads'
  }

  /**
   * Initialize storage
   */
  async initialize(): Promise<void> {
    if (!fs.existsSync(this._basePath)) {
      await this._createBucket()
    } else {
      const message = `local - ${this._basePath} directory found`
      console.info(message)
    }
  }

  /**
   * Create bucket (base directory)
   */
  private async _createBucket(): Promise<void> {
    try {
      await fs.promises.mkdir(this._basePath, { recursive: true })

      const message = `local - ${this._basePath} directory created`
      console.info(message)
    } catch (error: unknown) {
      const message = `local error: ${errorMessage(error)}`
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
  }: UploadFileParams): Promise<{ data: { path: string }; signedUrl: string }> {
    const keyfile = buildKeyfile([directory, file.filename])
    const destination = path.join(this._basePath, keyfile)

    await fs.promises.mkdir(path.dirname(destination), { recursive: true })
    await fs.promises.copyFile(file.path, destination)

    const signedUrl = await this.presignedUrl(keyfile)

    const message = `local - ${keyfile} file uploaded`
    console.info(message)

    return { data: { path: destination }, signedUrl }
  }

  /**
   * Generate presigned URL (local file URL)
   */
  async presignedUrl(keyfile: string): Promise<string> {
    // Only trim trailing slashes so absolute base URLs (https://host) stay intact.
    const baseUrl = this._baseUrl.replace(/\/+$/, '')
    const signedUrl = `${baseUrl}/${keyfile}`

    const message = `local - ${keyfile} presigned URL generated`
    console.info(message)

    return signedUrl
  }
}
