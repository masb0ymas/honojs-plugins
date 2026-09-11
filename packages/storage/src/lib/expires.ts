import type { Milliseconds } from '../types/time'
import { ms } from './date'

/**
 * Maximum TTL accepted by S3 and GCS V4 signed URLs: 7 days, in seconds.
 * @see https://docs.aws.amazon.com/AmazonS3/latest/API/sigv4-query-string-auth.html
 */
export const MAX_PRESIGN_TTL_SECONDS: number = 7 * 24 * 60 * 60

export type ExpiresObject = {
  /** TTL in whole seconds, capped to the provider maximum, for use as `expiresIn`. */
  expiresIn: number
  /** Absolute expiry instant derived from the full configured duration. */
  expiryDate: Date
}

/**
 * Resolve a duration string (e.g. "7d", "30min") into presign parameters.
 *
 * `expiresIn` is capped at the provider maximum so callers never hand an
 * out-of-range value to the cloud SDK. `expiryDate` reflects the full
 * configured duration and is informational only.
 *
 * @throws Error when the duration cannot be parsed.
 */
export function resolveExpires(expires: string): ExpiresObject {
  const duration: Milliseconds = ms(expires)
  return {
    expiresIn: Math.min(Math.floor(duration / 1000), MAX_PRESIGN_TTL_SECONDS),
    expiryDate: new Date(Date.now() + duration),
  }
}
