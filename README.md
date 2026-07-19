# honojs-plugins

A collection of framework-agnostic plugins for [HonoJS](https://hono.dev), managed as a pnpm + Turborepo monorepo.

## Folder Structure

```
honojs-plugins/
├── packages/
│   ├── email/                 # @honojs-plugins/email — SMTP (Nodemailer) & Resend email driver
│   │   ├── src/
│   │   │   ├── index.ts        # Smtp.create() factory, exports Nodemailer/Resend
│   │   │   ├── nodemailer/     # Nodemailer wrapper (index.ts, types.ts)
│   │   │   └── schema/         # zod schemas: index.ts, nodemailer.ts, resend.ts
│   │   ├── package.json
│   │   └── tsdown.config.ts
│   │
│   ├── storage/                # @honojs-plugins/storage — Local, S3, MinIO, GCS storage drivers
│   │   ├── src/
│   │   │   ├── index.ts        # Storage.create() factory, exports all drivers & types
│   │   │   ├── local/          # Local filesystem driver
│   │   │   ├── aws-s3/         # AWS S3 driver
│   │   │   ├── minio/          # MinIO driver
│   │   │   ├── google-cloud/   # Google Cloud Storage driver
│   │   │   ├── lib/            # date.ts helper (ms/expiry parsing)
│   │   │   ├── schema/         # zod schema: storage.ts
│   │   │   └── types/          # storage.ts, time.ts
│   │   ├── package.json
│   │   └── tsdown.config.ts
│   │
│   └── memory/                  # @honojs-plugins/memory — In-memory (LRU) & Redis cache drivers
│       ├── src/
│       │   ├── index.ts        # Cache.create() factory, exports MemoryCache/RedisCache
│       │   ├── memory/          # LRU cache driver (lru-cache)
│       │   ├── redis/           # Redis cache driver (ioredis)
│       │   ├── schema/          # zod schemas: index.ts, memory.ts, redis.ts
│       │   └── types/           # cache.ts (CacheDriver interface)
│       ├── package.json
│       └── tsdown.config.ts
│
├── .changeset/                 # Changesets for versioning/publishing
├── .github/                    # CI workflows
├── eslint.config.mjs           # Shared ESLint config
├── tsconfig.base.json          # Shared TS config
├── tsdown.config.ts            # Shared build config (tsdown)
├── turbo.json                  # Turborepo pipeline config
├── pnpm-workspace.yaml         # pnpm workspace definition
└── package.json                # Root scripts (build, lint, format, typecheck, publish)
```

Each package under `packages/*` is published independently to npm as `@honojs-plugins/<name>` and builds via `tsdown` into `dist/` (CJS + ESM + types).

## Packages

| Package | npm name | Description | README |
|---|---|---|---|
| `email` | `@honojs-plugins/email` | Send emails via SMTP (Nodemailer) or Resend | [packages/email/README.md](./packages/email/README.md) |
| `storage` | `@honojs-plugins/storage` | Upload files to Local disk, AWS S3, MinIO, or Google Cloud Storage | [packages/storage/README.md](./packages/storage/README.md) |
| `memory` | `@honojs-plugins/memory` | Cache values in-process (LRU) or via Redis | [packages/memory/README.md](./packages/memory/README.md) |

## Development

```bash
# install dependencies
pnpm install

# build all packages
pnpm build

# typecheck
pnpm typecheck

# lint
pnpm lint

# format
pnpm format
```

## Publishing

This repo uses [Changesets](https://github.com/changesets/changesets):

```bash
pnpm changeset        # create a changeset
pnpm version          # bump versions
pnpm publish          # build & publish to npm
```
