import z from 'zod'

export type EmailDriver = {
  driver: 'smtp' | 'resend'
}

export const EmailSchema: z.Schema<EmailDriver> = z.object({
  driver: z.enum(['smtp', 'resend']),
})
