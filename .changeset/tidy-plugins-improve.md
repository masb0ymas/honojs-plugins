---
'honojs-plugin-email': major
'honojs-plugin-storage': major
'honojs-plugin-memory': minor
---

Fix library code that crashed the host process and returned incorrect results.

### Breaking changes

- **email**: the default export is now `Email` (was `Smtp`). The Resend driver returns a
  `ResendMailer` wrapper (was the raw `Resend` client); its `send()` applies the configured
  default `from` and exposes the raw client as `.client`.
- **storage**: config types are now discriminated unions — `provider` is required on each
  `*StorageConfig`, and `Storage.create()` returns a narrowed `StorageInstance`. Invalid
  configs now throw with detailed issues instead of being cast with `!`.
- **email**: `NodemailerRawSchema` / `ResendRawSchema` (unreferenced) were removed.

### Fixes

- **all**: removed `process.exit(1)` from library code; drivers/transport now throw
  `Error`s with `cause` so the host process decides how to handle failures.
- **storage**: presigned-URL TTL is converted correctly and capped at the S3/GCS 7-day
  maximum (previously `expires: '30d'` threw); `expiryDate` now reflects the full duration
  (previously `'30min'` became 30 days).
- **storage**: local `presignedUrl()` no longer corrupts absolute base URLs
  (`https://cdn` was becoming `https:/cdn`).
- **storage**: `initialize()` only creates a bucket when it is genuinely missing, instead
  of swallowing auth/permission/network errors.
- **memory**: `RedisCache.clear()` deletes only keys under the configured `keyPrefix`
  rather than flushing the whole database; `set()` rejects a non-positive `ttl`.
- **email**: the Nodemailer transporter is created once and reused instead of per call.
