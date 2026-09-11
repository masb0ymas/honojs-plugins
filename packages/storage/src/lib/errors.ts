/**
 * Extract a human-readable message from an unknown thrown value.
 */
export function errorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  return String(error)
}

type MaybeAwsError = {
  name?: string
  $metadata?: { httpStatusCode?: number }
}

/**
 * Detect an "object/bucket does not exist" response from cloud SDK errors.
 * Used so `initialize()` only creates a bucket when it is genuinely missing,
 * instead of swallowing auth/permission/network errors.
 */
export function isNotFoundError(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) {
    return false
  }

  const { name, $metadata } = error as MaybeAwsError
  return name === 'NotFound' || name === 'NoSuchBucket' || $metadata?.httpStatusCode === 404
}
