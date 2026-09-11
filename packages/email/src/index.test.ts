import { describe, expect, it } from 'vitest'
import Email, { Nodemailer, ResendMailer } from './index'

describe('Email.create', () => {
  it('creates a Nodemailer instance for the smtp driver', () => {
    const mailer = Email.create({
      driver: 'smtp',
      config: {
        host: 'smtp.example.com',
        port: 587,
        from: 'no-reply@example.com',
        username: 'user',
        password: 'secret',
        encryption: 'starttls',
        driver: undefined,
      },
    })

    expect(mailer).toBeInstanceOf(Nodemailer)
  })

  it('creates a ResendMailer instance for the resend driver', () => {
    const mailer = Email.create({
      driver: 'resend',
      config: { apiKey: 'rk_test', from: 'no-reply@example.com' },
    })

    expect(mailer).toBeInstanceOf(ResendMailer)
  })

  it('throws on an invalid resend config', () => {
    expect(() => Email.create({ driver: 'resend', config: { apiKey: '' } })).toThrow(
      /Invalid resend configuration/
    )
  })
})
