import nodemailer from 'nodemailer'
import SMTPTransport from 'nodemailer/lib/smtp-transport'
import { NodemailerParams } from './types'

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

export default class Nodemailer {
  private _transporter: SMTPTransport | SMTPTransport.Options
  private _default: SMTPTransport.Options | undefined
  private _client: nodemailer.Transporter | undefined

  constructor({ transporter, defaults }: NodemailerParams) {
    this._transporter = transporter
    this._default = defaults
  }

  /**
   * Get (and lazily create) the shared nodemailer client
   * @returns nodemailer client
   */
  private _getClient(): nodemailer.Transporter {
    this._client ??= nodemailer.createTransport(this._transporter, this._default)
    return this._client
  }

  /**
   * Initializes the nodemailer client
   * @returns nodemailer client
   */
  async initialize(): Promise<nodemailer.Transporter> {
    const transporter = this._getClient()

    try {
      // verify() resolves true or throws; there is no falsy success path.
      await transporter.verify()

      console.log('initialized successfully')
      return transporter
    } catch (error: unknown) {
      const message = `failed to initialize: ${errorMessage(error)}`
      console.error(message)
      throw new Error(message, { cause: error })
    }
  }

  /**
   * Sends an email
   * @param options - options for sending an email
   * @returns email info
   */
  async send(options: nodemailer.SendMailOptions): Promise<nodemailer.SentMessageInfo> {
    const transporter = this._getClient()

    try {
      const info = await transporter.sendMail(options)
      console.log(`mail sent successfully: ${info.messageId}`)
      return info
    } catch (error: unknown) {
      const message = `failed to send mail: ${errorMessage(error)}`
      console.error(message)
      throw new Error(message, { cause: error })
    }
  }
}
