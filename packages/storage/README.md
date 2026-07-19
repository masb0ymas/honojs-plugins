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
├── local/                 # LocalStorage driver
├── aws-s3/                # S3Storage driver
├── minio/                 # MinIOStorage driver
├── google-cloud/          # GoogleCloudStorage driver
├── lib/
│   └── date.ts             # ms()/expiry helpers used for presigned URLs
├── schema/
│   └── storage.ts          # StorageSchema (STORAGE_* env-shaped config)
└── types/
    ├── storage.ts           # StorageType, *Params, StorageInstance
    └── time.ts
```

## Usage

Every driver exposes:

- `initialize()` — ensures the bucket/base directory exists (creates it if missing)
- `uploadFile({ directory, file })` — uploads a file, returns `{ data, signedUrl }`
- `presignedUrl(keyfile)` — generates a (signed) URL to access the file

### 1. Local disk

```ts
import Storage, { LocalStorage } from 'honojs-plugin-storage'

const storage = Storage.create({
  storageType: 'local',
  params: {
    STORAGE_PROVIDER: 'local',
    STORAGE_FILEPATH: 'uploads', // basePath
  } as any,
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
  storageType: 's3',
  params: {
    access_key: process.env.AWS_ACCESS_KEY_ID!,
    secret_key: process.env.AWS_SECRET_ACCESS_KEY!,
    bucket: 'my-bucket',
    region: 'us-east-1',
    expires: '7d', // presigned URL TTL
  },
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
```

### 3. MinIO

```ts
import Storage, { MinIOStorage } from 'honojs-plugin-storage'

const storage = Storage.create({
  storageType: 'minio',
  params: {
    access_key: process.env.MINIO_ACCESS_KEY!,
    secret_key: process.env.MINIO_SECRET_KEY!,
    bucket: 'my-bucket',
    region: 'us-east-1',
    host: '127.0.0.1',
    port: 9000,
    ssl: false,
    expires: '7d',
  },
}) as MinIOStorage

await storage.initialize()
const { signedUrl } = await storage.uploadFile({ directory: 'files', file /* FileParams */ })
```

### 4. Google Cloud Storage

```ts
import Storage, { GoogleCloudStorage } from 'honojs-plugin-storage'

const storage = Storage.create({
  storageType: 'gcs',
  params: {
    access_key: process.env.GCP_PROJECT_ID!,
    bucket: 'my-bucket',
    filepath: 'gcp-serviceAccount.json', // relative to process.cwd()
    expires: '7d',
  },
}) as GoogleCloudStorage

await storage.initialize()
const { signedUrl } = await storage.uploadFile({ directory: 'files', file /* FileParams */ })
```

> `filepath` must point to a valid GCP service account JSON in your project root when `access_key` is not resolvable, otherwise `GoogleCloudStorage` throws on construction.

## Example: Hono file upload route

```ts
import { Hono } from 'hono'
import Storage, { S3Storage } from 'honojs-plugin-storage'

const app = new Hono()

const storage = Storage.create({
  storageType: 's3',
  params: {
    access_key: process.env.AWS_ACCESS_KEY_ID!,
    secret_key: process.env.AWS_SECRET_ACCESS_KEY!,
    bucket: process.env.STORAGE_BUCKET_NAME!,
    region: process.env.STORAGE_REGION!,
    expires: '7d',
  },
}) as S3Storage

app.post('/upload', async (c) => {
  const body = await c.req.parseBody()
  const file = body['file'] as File

  // persist the incoming file to a temp path first, then map it to FileParams
  // (omitted here for brevity - depends on your upload middleware)

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

### `Storage.create({ storageType, params })`

| `storageType` | `params` shape                                                                                |
| ------------- | --------------------------------------------------------------------------------------------- |
| `'local'`     | `LocalStorageParams` — `{ basePath, baseUrl? }`                                               |
| `'s3'`        | `S3StorageParams` — `{ access_key, secret_key, bucket, expires, region }`                     |
| `'minio'`     | `MinIOStorageParams` — `{ access_key, secret_key, bucket, expires, region, host, port, ssl }` |
| `'gcs'`       | `GoogleCloudStorageParams` — `{ access_key, bucket, expires, filepath }`                      |

### Common driver methods

| Method                            | Description                                                               |
| --------------------------------- | ------------------------------------------------------------------------- |
| `initialize()`                    | Creates the bucket/base directory if it doesn't exist                     |
| `uploadFile({ directory, file })` | Uploads `file` under `directory`, returns `{ data, signedUrl }`           |
| `presignedUrl(keyfile)`           | Returns a signed/accessible URL for `keyfile`                             |
| `expiresObject()`                 | (S3/MinIO/GCS) returns `{ expiresIn, expiryDate }` derived from `expires` |
