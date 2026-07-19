import { Resend } from 'resend'
import Nodemailer from './nodemailer'
import { EmailSchema } from './schema'
import { NodemailerConfig, NodemailerSchema } from './schema/nodemailer'
import { ResendConfig, ResendSchema } from './schema/resend'

interface EmailConfig {
  driver: 'smtp' | 'resend'
  nodemailer?: NodemailerConfig
  resend?: ResendConfig
}

/**
 * SMTP email service
 */
export default class Smtp {
  /**
   * Create an email service instance
   * @param config - Email configuration
   * @returns Email service instance
   */
  static create({ driver, nodemailer, resend }: EmailConfig): Nodemailer | Resend | undefined {
    const parsed = EmailSchema.safeParse({ driver })
    if (!parsed.success) {
      console.log(parsed.error)
      throw new Error('Invalid environment variables')
    }

    // SMTP using Nodemailer
    if (parsed.data.driver === 'smtp') {
      const config = NodemailerSchema.safeParse(nodemailer)
      if (!config.success) {
        console.log(config.error)
        throw new Error('Invalid nodemailer configuration')
      }

      return new Nodemailer({ transporter: config.data, defaults: { from: config.data.from } })
    }

    // SMTP using Resend
    if (parsed.data.driver === 'resend') {
      const config = ResendSchema.safeParse(resend)
      if (!config.success) {
        console.log(config.error)
        throw new Error('Invalid resend configuration')
      }

      return new Resend(config.data.apiKey)
    }

    return undefined
  }
}

export { Resend } from 'resend'
export { default as Nodemailer } from './nodemailer'
