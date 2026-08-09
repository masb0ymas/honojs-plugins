import fs from 'fs'
import path from 'path'
import { LocalStorageConfig, UploadFileParams } from '../types/storage'

export default class LocalStorage {
  private _basePath: string
  private _baseUrl: string

  constructor(params: LocalStorageConfig) {
    this._basePath = path.resolve(`${process.cwd()}/${params.local_path}`)
    this._baseUrl = params.local_url ?? '/uploads'
  }

  /**
   * Generate keyfile
   */
  private _generateKeyfile(values: string[]): string {
    return values.join('/')
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
  private async _createBucket() {
    try {
      await fs.promises.mkdir(this._basePath, { recursive: true })

      const message = `local - ${this._basePath} directory created`
      console.info(message)
    } catch (error: any) {
      const message = `local error: ${error.message ?? error}`
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
  }: UploadFileParams): Promise<{ data: { path: string }; signedUrl: string }> {
    const keyfile = this._generateKeyfile([directory, file.filename])
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
    const signedUrl = `${this._baseUrl}/${keyfile}`.replace(/\/+/g, '/')

    const message = `local - ${keyfile} presigned URL generated`
    console.info(message)

    return signedUrl
  }
}
