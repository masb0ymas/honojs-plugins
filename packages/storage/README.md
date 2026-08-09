# honojs-plugin-storage

Storage plugin for HonoJS. Supports four drivers:

- **`local`** — local filesystem
- **`s3`** — AWS S3 (`@aws-sdk/client-s3`)
- **`minio`** — MinIO (`minio`)
- **`gcs`** — Google Cloud Storage (`@google-cloud/storage`)

## Install

```bash
pnpm add honojs-plugin-storage
```

## Folder structure

```
src/
├── index.ts              # Storage.create() factory + exports
├── local/
│   └── index.ts           # LocalStorage driver
├── aws-s3/
│   └── index.ts           # S3Storage driver
├── minio/
│   └── index.ts           # MinIOStorage driver
├── google-cloud/
│   └── index.ts           # GoogleCloudStorage driver
├── lib/
│   └── date.ts             # ms() helper for parsing time strings
├── schema/
│   └── storage.ts          # StorageSchema (Zod validation + provider-conditional refinement)
└── types/
    ├── storage.ts           # StorageType, *Params, StorageConfig, StorageInstance, FileParams, UploadFileParams
    └── time.ts
```

## Usage

`Storage.create()` accepts a flat configuration object with camelCase keys. The `provider` field determines which driver is instantiated. The schema validates required fields per provider.

Every driver exposes:

- `initialize()` — ensures the bucket/base directory exists (creates it if missing)
- `uploadFile({ directory, file })` — uploads a file, returns `{ data, signedUrl }`
- `presignedUrl(keyfile)` — generates a (signed) URL to access the file
- `expiresObject()` — (S3/MinIO/GCS) returns `{ expiresIn, expiryDate }` derived from `signExpired`

### 1. Local disk

```ts
import Storage, { LocalStorage } from 'honojs-plugin-storage'

const storage = Storage.create({
  provider: 'local',
  basePath: 'uploads',
  baseUrl: '/uploads', // optional, defaults to '/uploads'
}) as LocalStorage

await storage.initialize()

const { data, signedUrl } = await storage.uploadFile({
  directory: 'avatars',
  file: {
    fieldname: 'file',
    originalname: 'avatar.png',
    encoding: '7bit',
    mimetype: 'image/png',
    destination: '/tmp',
    filename: 'avatar.png',
    path: '/tmp/avatar.png',
    size: 1024,
  },
})
```

### 2. AWS S3

```ts
import Storage, { S3Storage } from 'honojs-plugin-storage'

const storage = Storage.create({
  provider: 's3',
  accessKey: process.env.AWS_ACCESS_KEY_ID!,
  secretKey: process.env.AWS_SECRET_ACCESS_KEY!,
  bucketName: 'my-bucket',
  region: 'us-east-1',
  signExpired: '7d', // presigned URL TTL
}) as S3Storage

await storage.initialize()

const { data, signedUrl } = await storage.uploadFile({
  directory: 'invoices',
  file: {
    fieldname: 'file',
    originalname: 'invoice.pdf',
    encoding: '7bit',
    mimetype: 'application/pdf',
    destination: '/tmp',
    filename: 'invoice.pdf',
    path: '/tmp/invoice.pdf',
    size: 2048,
  },
})

// access the underlying S3 client for advanced operations
storage.client.send(/* ... */)
```

### 3. MinIO

```ts
import Storage, { MinIOStorage } from 'honojs-plugin-storage'

const storage = Storage.create({
  provider: 'minio',
  accessKey: process.env.MINIO_ACCESS_KEY!,
  secretKey: process.env.MINIO_SECRET_KEY!,
  bucketName: 'my-bucket',
  region: 'us-east-1',
  host: '127.0.0.1',
  port: 9000,
  ssl: false,
  signExpired: '7d',
}) as MinIOStorage

await storage.initialize()
const { signedUrl } = await storage.uploadFile({ directory: 'files', file /* FileParams */ })

// access the underlying MinIO client
storage.client.bucketExists('other-bucket')
```

### 4. Google Cloud Storage

```ts
import Storage, { GoogleCloudStorage } from 'honojs-plugin-storage'

const storage = Storage.create({
  provider: 'gcs',
  accessKey: process.env.GCP_PROJECT_ID!,
  bucketName: 'my-bucket',
  filepath: 'gcp-serviceAccount.json', // relative to process.cwd()
  signExpired: '7d',
}) as GoogleCloudStorage

await storage.initialize()
const { signedUrl } = await storage.uploadFile({ directory: 'files', file /* FileParams */ })

// access the underlying GCS client
storage.client.bucket('my-bucket').file('key').getSignedUrl(/* ... */)
```

> `filepath` must point to a valid GCP service account JSON in your project root. If the file is missing and `accessKey` is not provided, `GoogleCloudStorage` throws on construction.

## Example: Hono file upload route

```ts
import { Hono } from 'hono'
import Storage, { S3Storage } from 'honojs-plugin-storage'

const app = new Hono()

const storage = Storage.create({
  provider: 's3',
  accessKey: process.env.AWS_ACCESS_KEY_ID!,
  secretKey: process.env.AWS_SECRET_ACCESS_KEY!,
  bucketName: process.env.STORAGE_BUCKET_NAME!,
  region: process.env.STORAGE_REGION!,
  signExpired: '7d',
}) as S3Storage

app.post('/upload', async (c) => {
  const body = await c.req.parseBody()
  const file = body['file'] as File

  // persist the incoming file to a temp path first, then map it to FileParams
  // (omitted here for brevity — depends on your upload middleware)

  const { signedUrl } = await storage.uploadFile({
    directory: 'uploads',
    file: {
      fieldname: 'file',
      originalname: file.name,
      encoding: '7bit',
      mimetype: file.type,
      destination: '/tmp',
      filename: file.name,
      path: `/tmp/${file.name}`,
      size: file.size,
    },
  })

  return c.json({ url: signedUrl })
})

export default app
```

## API

### `Storage.create(config)`

Accepts a flat object with camelCase keys. The `provider` field determines which driver is used. Fields are validated conditionally — only the fields required by the chosen provider are enforced.

| Key           | Type                                  | Required for         | Description                                               |
| ------------- | ------------------------------------- | -------------------- | --------------------------------------------------------- |
| `provider`    | `'local' \| 's3' \| 'minio' \| 'gcs'` | all                  | Storage provider                                          |
| `basePath`    | `string`                              | `local`              | Base directory path for local storage                     |
| `baseUrl`     | `string`                              | —                    | Base URL for local presigned URLs (default: `/uploads`)   |
| `accessKey`   | `string`                              | `s3`, `minio`, `gcs` | Access key / project ID                                   |
| `secretKey`   | `string`                              | `s3`, `minio`        | Secret key                                                |
| `bucketName`  | `string`                              | `s3`, `minio`, `gcs` | Bucket name                                               |
| `region`      | `string`                              | `s3`, `minio`        | Region                                                    |
| `signExpired` | `string`                              | `s3`, `minio`, `gcs` | Presigned URL TTL (e.g. `'7d'`, `'24h'`, `'30min'`)       |
| `host`        | `string`                              | `minio`              | MinIO host                                                |
| `port`        | `number`                              | `minio`              | MinIO port                                                |
| `ssl`         | `boolean`                             | `minio`              | Use SSL for MinIO (accepts `true`/`false`/`'true'`/`'1'`) |
| `filepath`    | `string`                              | `gcs`                | Path to GCP service account JSON file                     |

### Common driver methods

| Method                            | Description                                                                                 |
| --------------------------------- | ------------------------------------------------------------------------------------------- |
| `initialize()`                    | Creates the bucket/base directory if it doesn't exist                                       |
| `uploadFile({ directory, file })` | Uploads `file` under `directory`, returns `{ data, signedUrl }`                             |
| `presignedUrl(keyfile)`           | Returns a signed/accessible URL for `keyfile`                                               |
| `expiresObject()`                 | (S3/MinIO/GCS) returns `{ expiresIn: number, expiryDate: Date }` derived from `signExpired` |

### Driver-specific properties

| Driver               | Property | Type           | Description                                 |
| -------------------- | -------- | -------------- | ------------------------------------------- |
| `S3Storage`          | `client` | `S3Client`     | Underlying `@aws-sdk/client-s3` instance    |
| `MinIOStorage`       | `client` | `Minio.Client` | Underlying `minio` client                   |
| `GoogleCloudStorage` | `client` | `GCS.Storage`  | Underlying `@google-cloud/storage` instance |

### `FileParams`

| Field          | Type     | Description             |
| -------------- | -------- | ----------------------- |
| `fieldname`    | `string` | Form field name         |
| `originalname` | `string` | Original file name      |
| `encoding`     | `string` | File encoding           |
| `mimetype`     | `string` | MIME type               |
| `destination`  | `string` | Upload destination path |
| `filename`     | `string` | File name on disk       |
| `path`         | `string` | Full path to temp file  |
| `size`         | `number` | File size in bytes      |

### `UploadFileParams`

| Field       | Type         | Description                        |
| ----------- | ------------ | ---------------------------------- |
| `directory` | `string`     | Target directory inside the bucket |
| `file`      | `FileParams` | File metadata and temp path        |
