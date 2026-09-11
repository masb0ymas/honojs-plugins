# honojs-plugin-email

## 2.0.0

### Major Changes

- [#19](https://github.com/masb0ymas/honojs-plugins/pull/19) [`7e45592`](https://github.com/masb0ymas/honojs-plugins/commit/7e455925357ada3ecdcae4d93ed4aee8e865eea6) Thanks [@masb0ymas](https://github.com/masb0ymas)! - Fix library code that crashed the host process and returned incorrect results.

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

## 1.0.2

### Patch Changes

- [#17](https://github.com/masb0ymas/honojs-plugins/pull/17) [`337e36e`](https://github.com/masb0ymas/honojs-plugins/commit/337e36e47442cf547dddebab596aba0c9e10ac32) Thanks [@masb0ymas](https://github.com/masb0ymas)! - fix: update dependencies and add licenses

## 1.0.1

### Patch Changes

- [#12](https://github.com/masb0ymas/honojs-plugins/pull/12) [`981062a`](https://github.com/masb0ymas/honojs-plugins/commit/981062a66bd7bd4f16f8d3f0d9ce20982f4c6da9) Thanks [@masb0ymas](https://github.com/masb0ymas)! - fixing minor configuration

## 1.0.0

### Major Changes

- [#10](https://github.com/masb0ymas/honojs-plugins/pull/10) [`d1c41c9`](https://github.com/masb0ymas/honojs-plugins/commit/d1c41c92cd856fc2fc2e0098a143859a12794896) Thanks [@masb0ymas](https://github.com/masb0ymas)! - fixing missmatch config for email and storage

## 0.0.1

### Patch Changes

- [#7](https://github.com/masb0ymas/honojs-plugins/pull/7) [`b35a91a`](https://github.com/masb0ymas/honojs-plugins/commit/b35a91a19d30ba3e805dcca44f4ba7ae0c5efac6) Thanks [@masb0ymas](https://github.com/masb0ymas)! - fix: update the package version and readme
