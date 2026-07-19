import z from 'zod'

export const EmailSchema = z.object({
  driver: z.enum(['smtp', 'resend']).optional(),
}) satisfies z.ZodObject<{
  driver: z.ZodOptional<
    z.ZodEnum<{
      smtp: 'smtp'
      resend: 'resend'
    }>
  >
}> as z.ZodObject<{
  driver: z.ZodOptional<
    z.ZodEnum<{
      smtp: 'smtp'
      resend: 'resend'
    }>
  >
}>
