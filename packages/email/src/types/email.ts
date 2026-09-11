import { NodemailerConfig } from '../schema/nodemailer'
import { ResendConfig } from '../schema/resend'

export type EmailType = 'smtp' | 'resend'

export type EmailConfig =
  { driver: 'smtp'; config: NodemailerConfig } | { driver: 'resend'; config: ResendConfig }
