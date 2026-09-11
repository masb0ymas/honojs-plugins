import { Resend } from 'resend'
import type { CreateEmailOptions, CreateEmailResponse, CreateEmailResponseSuccess } from 'resend'

/** Resend send options with an optional `from` (the configured default fills it in). */
export type ResendSendOptions = Omit<CreateEmailOptions, 'from'> & { from?: string }

/** Configuration accepted by {@link ResendMailer}. */
export type ResendMailerParams = {
  apiKey: string
  from?: string
  baseUrl?: string
  userAgent?: string
}

/**
 * Thin wrapper around the Resend client that applies a default sender.
 *
 * The Resend SDK has no client-level default `from`; every `emails.send` call
 * must supply one. This wrapper fills it from the configured default so callers
 * can omit `from`.
 */
export default class ResendMailer {
  public client: Resend
  private _from: string | undefined

  constructor({ apiKey, from, baseUrl, userAgent }: ResendMailerParams) {
    this._from = from
    this.client = new Resend(apiKey, {
      ...(baseUrl !== undefined && { baseUrl }),
      ...(userAgent !== undefined && { userAgent }),
    })
  }

  /**
   * Send an email, falling back to the configured default sender.
   * @throws Error when neither the options nor the config provide a `from`.
   */
  async send(options: ResendSendOptions): Promise<CreateEmailResponseSuccess> {
    const from = options.from ?? this._from
    if (!from) {
      throw new Error('Missing "from": set it in the config or per send() call')
    }

    const response: CreateEmailResponse = await this.client.emails.send({
      ...options,
      from,
    } as CreateEmailOptions)

    if (response.error) {
      throw new Error(`failed to send mail: ${response.error.message}`, {
        cause: response.error,
      })
    }

    return response.data
  }
}
