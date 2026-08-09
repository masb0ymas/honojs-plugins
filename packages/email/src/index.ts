import SMTPTransport from 'nodemailer/lib/smtp-transport'
import { Resend } from 'resend'
import Nodemailer from './nodemailer'
import { EmailSchema } from './schema'
import { NodemailerSchema } from './schema/nodemailer'
import { ResendSchema } from './schema/resend'
import { EmailConfig } from './types/email'

/**
 * SMTP email service
 */
export default class Smtp {
  /**
   * Create an email service instance
   * @param config - Email configuration
   * @returns Email service instance
   */
  static create({ driver, config }: EmailConfig): Nodemailer | Resend | undefined {
    const parsed = EmailSchema.safeParse({ driver })
    if (!parsed.success) {
      throw new Error('Invalid email parameters', {
        cause: parsed.error,
      })
    }

    // SMTP using Nodemailer
    if (parsed.data.driver === 'smtp') {
      const parsed = NodemailerSchema.safeParse(config)
      if (!parsed.success) {
        throw new Error('Invalid nodemailer configuration', {
          cause: parsed.error,
        })
      }

      const nodemailerConfig = parsed.data

      const transporter: SMTPTransport.Options = {
        host: nodemailerConfig.host,
        port: nodemailerConfig.port,
        secure: nodemailerConfig.encryption === 'ssl' || nodemailerConfig.encryption === 'tls',
        requireTLS: nodemailerConfig.encryption === 'starttls',
        auth:
          nodemailerConfig.username && nodemailerConfig.password
            ? {
                user: nodemailerConfig.username,
                pass: nodemailerConfig.password,
              }
            : undefined,
      }

      return new Nodemailer({ transporter, defaults: { from: nodemailerConfig.from } })
    }

    // SMTP using Resend
    if (parsed.data.driver === 'resend') {
      const parsed = ResendSchema.safeParse(config)
      if (!parsed.success) {
        throw new Error('Invalid resend configuration', {
          cause: parsed.error,
        })
      }

      const resendConfig = parsed.data

      const resendOptions: { baseUrl?: string; userAgent?: string } = {}
      if (resendConfig.baseUrl) resendOptions.baseUrl = resendConfig.baseUrl
      if (resendConfig.userAgent) resendOptions.userAgent = resendConfig.userAgent

      return new Resend(resendConfig.apiKey, resendOptions)
    }

    return undefined
  }
}

export { Resend } from 'resend'
export { default as Nodemailer } from './nodemailer'

