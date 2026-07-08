# Nantong Huichenjin Website

Next.js App Router website for Nantong Huichenjin International Trade Co., Ltd, focused on hydraulic piston rods, hard chrome plated rods, honed tubes, quality pages, and RFQ conversion.

## Local Development

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Useful Commands

```bash
pnpm lint
pnpm build
pnpm admin:migrate
pnpm admin:create-user
```

## Main Routes

- `/`
- `/products`
- `/products/chrome-plated-rod`
- `/products/honed-tube`
- `/process`
- `/quality`
- `/industries`
- `/company`
- `/contact`
- `/rfq`
- `/admin/login`
- `/admin`
- `/sitemap.xml`
- `/robots.txt`

## Chinese Admin Backend

The Chinese admin backend foundation is available under `/admin/login`.

Implemented foundation:

- Chinese login page with password show/hide, loading state, error state, and remember-login option.
- HttpOnly cookie session design backed by PostgreSQL sessions.
- Password hashing with Node.js `scrypt`.
- Role and permission schema for super admin, admin, editor, marketing, sales, analyst, and readonly users.
- Admin modules for dashboard, products, categories, news, leads, analytics, SEO, media, users, audit logs, settings, and sync.
- Unified admin API error shape and server-side pagination endpoint.
- PostgreSQL migration, initial admin creation script, Docker files, and backup/restore scripts.

Production data requirements:

- Configure `DATABASE_URL` before enabling real backend data.
- Configure `ADMIN_SESSION_SECRET` with a long random value.
- Configure S3-compatible object storage before enabling media upload APIs.
- Configure external SEO/analytics credentials before syncing external data. The system does not show fake external metrics when credentials are missing.

Database initialization:

```bash
cp .env.example .env.local
pnpm admin:migrate
ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD='replace-with-strong-password' ADMIN_NAME='超级管理员' pnpm admin:create-user
```

Docker development:

```bash
docker compose up --build
```

Backup and restore:

```bash
pnpm db:backup
pnpm db:restore backups/file.dump
```

API documentation:

- `docs/admin-api.md`

## Deployment

This project is ready for GitHub and Vercel. After pushing to GitHub, import the repository in Vercel and keep the default Next.js build settings.

## RFQ Email

The `/api/rfq` route sends form submissions through SMTP. Configure these environment variables in Vercel:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM_EMAIL`
- `SMTP_FROM_NAME`
- `RFQ_TO_EMAIL`
