import SMTPTransport from 'nodemailer/lib/smtp-transport'
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
      throw new Error('Invalid email parameters', {
        cause: parsed.error,
      })
    }

    // SMTP using Nodemailer
    if (parsed.data.driver === 'smtp') {
      if (!nodemailer) {
        throw new Error('Nodemailer configuration is required when driver is smtp')
      }

      const config = NodemailerSchema.safeParse(nodemailer)
      if (!config.success) {
        throw new Error('Invalid nodemailer configuration', {
          cause: config.error,
        })
      }

      const transporter: SMTPTransport.Options = {
        host: config.data.host,
        port: config.data.port,
        secure: config.data.encryption === 'ssl' || config.data.encryption === 'tls',
        requireTLS: config.data.encryption === 'starttls',
        auth:
          config.data.username || config.data.password
            ? {
                user: config.data.username,
                pass: config.data.password,
              }
            : undefined,
      }

      return new Nodemailer({ transporter, defaults: { from: config.data.from } })
    }

    // SMTP using Resend
    if (parsed.data.driver === 'resend') {
      if (!resend) {
        throw new Error('Resend configuration is required when driver is resend')
      }

      const config = ResendSchema.safeParse(resend)
      if (!config.success) {
        throw new Error('Invalid resend configuration', {
          cause: config.error,
        })
      }

      const resendOptions: { baseUrl?: string; userAgent?: string } = {}
      if (config.data.baseUrl) resendOptions.baseUrl = config.data.baseUrl
      if (config.data.userAgent) resendOptions.userAgent = config.data.userAgent

      return new Resend(config.data.apiKey, resendOptions)
    }

    return undefined
  }
}

export { Resend } from 'resend'
export { default as Nodemailer } from './nodemailer'

