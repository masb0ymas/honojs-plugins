# honojs-plugin-email

Email plugin for HonoJS. Supports two drivers:

- **`smtp`** — powered by [Nodemailer](https://nodemailer.com)
- **`resend`** — powered by [Resend](https://resend.com)

## Install

```bash
pnpm add honojs-plugin-email
```

## Folder structure

```
src/
├── index.ts              # Smtp.create() factory + exports
├── nodemailer/
│   ├── index.ts           # Nodemailer wrapper class (initialize, send)
│   └── types.ts           # NodemailerParams type
├── schema/
│   ├── index.ts           # EmailSchema (driver: 'smtp' | 'resend')
│   ├── nodemailer.ts       # NodemailerSchema / NodemailerRawSchema (MAIL_* env-shaped config)
│   └── resend.ts           # ResendSchema / ResendRawSchema (RESEND_* env-shaped config)
└── types/
    └── email.ts            # EmailConfig, EmailType
```

## Usage

### 1. SMTP (Nodemailer)

```ts
import Smtp, { Nodemailer } from 'honojs-plugin-email'

const mailer = Smtp.create({
  driver: 'smtp',
  config: {
    host: 'smtp.example.com',
    port: 587,
    from: 'no-reply@example.com',
    username: 'user@example.com',
    password: 'secret',
    encryption: 'tls',
  },
}) as Nodemailer

// verify connection (optional)
await mailer.initialize()

// send an email
await mailer.send({
  to: 'user@example.com',
  subject: 'Welcome!',
  html: '<p>Hello world</p>',
})
```

> **Encryption values:** `ssl` or `tls` → sets `secure: true`. `starttls` → sets `requireTLS: true`. All fields in `config` are optional.

### 2. Resend

```ts
import Smtp, { Resend } from 'honojs-plugin-email'

const resend = Smtp.create({
  driver: 'resend',
  config: {
    apiKey: process.env.RESEND_API_KEY!,
    from: 'no-reply@example.com',
    baseUrl: 'https://api.resend.com', // optional
    userAgent: 'my-app', // optional
  },
}) as Resend

await resend.emails.send({
  from: 'no-reply@example.com',
  to: 'user@example.com',
  subject: 'Welcome!',
  html: '<p>Hello world</p>',
})
```

### 3. Using Nodemailer directly

```ts
import { Nodemailer } from 'honojs-plugin-email'

const mailer = new Nodemailer({
  transporter: {
    host: 'smtp.example.com',
    port: 587,
    secure: false,
    auth: { user: 'user@example.com', pass: 'secret' },
  },
  defaults: { from: 'no-reply@example.com' },
})

await mailer.send({ to: 'user@example.com', subject: 'Hi', text: 'Hello' })
```

## Example: Hono route

```ts
import { Hono } from 'hono'
import Smtp, { Nodemailer } from 'honojs-plugin-email'

const app = new Hono()

const mailer = Smtp.create({
  driver: 'smtp',
  config: {
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT),
    from: process.env.MAIL_FROM,
    username: process.env.MAIL_USERNAME,
    password: process.env.MAIL_PASSWORD,
  },
}) as Nodemailer

app.post('/contact', async (c) => {
  const body = await c.req.json()

  await mailer.send({
    to: body.email,
    subject: 'We received your message',
    text: 'Thank you for contacting us!',
  })

  return c.json({ success: true })
})

export default app
```

## API

### `Smtp.create(config)`

| Param           | Type                               | Description                   |
| --------------- | ---------------------------------- | ----------------------------- |
| `config.driver` | `'smtp' \| 'resend'`               | Which email driver to use     |
| `config.config` | `NodemailerConfig \| ResendConfig` | Driver-specific configuration |

Returns a `Nodemailer` instance or the `Resend` client, depending on `driver`. Returns `undefined` if the driver is unrecognized.

#### `NodemailerConfig`

| Field        | Type                  | Default | Description                                           |
| ------------ | --------------------- | ------- | ----------------------------------------------------- |
| `host`       | `string \| undefined` | —       | SMTP host                                             |
| `port`       | `number \| undefined` | —       | SMTP port                                             |
| `from`       | `string \| undefined` | —       | Default sender address                                |
| `username`   | `string \| undefined` | —       | SMTP auth username                                    |
| `password`   | `string \| undefined` | —       | SMTP auth password                                    |
| `encryption` | `string \| undefined` | —       | `'ssl'` / `'tls'` → secure, `'starttls'` → requireTLS |
| `driver`     | `string \| undefined` | —       | Driver hint (informational)                           |

#### `ResendConfig`

| Field       | Type                  | Default | Description               |
| ----------- | --------------------- | ------- | ------------------------- |
| `apiKey`    | `string`              | —       | Resend API key (required) |
| `from`      | `string \| undefined` | —       | Default sender address    |
| `baseUrl`   | `string \| undefined` | —       | Custom API base URL       |
| `userAgent` | `string \| undefined` | —       | Custom user agent         |

### `Nodemailer`

| Method          | Description                                     |
| --------------- | ----------------------------------------------- |
| `initialize()`  | Verifies the SMTP transporter connection        |
| `send(options)` | Sends an email via `nodemailer.SendMailOptions` |
