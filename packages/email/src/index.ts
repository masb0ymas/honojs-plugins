import SMTPTransport from 'nodemailer/lib/smtp-transport'
import Nodemailer from './nodemailer'
import ResendMailer from './resend'
import { EmailSchema } from './schema'
import { NodemailerSchema } from './schema/nodemailer'
import { ResendSchema } from './schema/resend'
import { EmailConfig } from './types/email'

/**
 * Email service
 */
export default class Email {
  /**
   * Create an email service instance
   * @param config - Email configuration
   * @returns Email service instance
   */
  static create(config: EmailConfig): Nodemailer | ResendMailer {
    const parsedDriver = EmailSchema.safeParse({ driver: config.driver })
    if (!parsedDriver.success) {
      throw new Error('Invalid email parameters', {
        cause: parsedDriver.error,
      })
    }

    // SMTP using Nodemailer
    if (config.driver === 'smtp') {
      const parsed = NodemailerSchema.safeParse(config.config)
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

    // Resend
    const parsed = ResendSchema.safeParse(config.config)
    if (!parsed.success) {
      throw new Error('Invalid resend configuration', {
        cause: parsed.error,
      })
    }

    const resendConfig = parsed.data

    return new ResendMailer({
      apiKey: resendConfig.apiKey,
      ...(resendConfig.from !== undefined && { from: resendConfig.from }),
      ...(resendConfig.baseUrl !== undefined && { baseUrl: resendConfig.baseUrl }),
      ...(resendConfig.userAgent !== undefined && { userAgent: resendConfig.userAgent }),
    })
  }
}

export { Resend } from 'resend'
export { default as Nodemailer } from './nodemailer'
export { default as ResendMailer } from './resend'
export type { ResendMailerParams, ResendSendOptions } from './resend'
export type { EmailConfig, EmailType } from './types/email'
