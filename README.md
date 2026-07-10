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
pnpm test:sitemap
pnpm sitemap:generate -- --dry-run --verbose
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
- `/sitemap-products.xml`
- `/sitemap-posts.xml`
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
- `docs/sitemap.md`

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

## News and Blog Automation

The News/Blog frontend reads published PostgreSQL articles when `DATABASE_URL` is configured and safely falls back to the repository articles when the database is unavailable. The protected Vercel cron collects recent RSS or configured News API candidates, enforces source age, relevance, language, and duplicate checks, generates original attributed editorial content through a configured AI provider, and stores either drafts or published articles according to `NEWS_AUTO_PUBLISH`.

Required production activation variables:

- `DATABASE_URL`
- `NEWS_FEED_URLS` or `NEWS_API_KEY` plus `NEWS_API_ENDPOINT`
- `AI_PROVIDER_API_KEY`, `OPENAI_API_KEY`, or Vercel's automatically provided `VERCEL_OIDC_TOKEN`
- `AI_PROVIDER_MODEL`
- `NEWS_AUTO_PUBLISH` (`false` for editorial review, `true` for automatic publication)
- `CRON_SECRET`

Run `pnpm admin:migrate` before activation. Every generated article retains its attributed source URL and uses a XIJIU-owned factory image. The published-record-only image proxy remains available for explicitly approved external media and enforces URL, DNS, MIME type, timeout, and size checks.

Repository content can be synchronized idempotently into PostgreSQL with `pnpm content:sync`. Generated articles use XIJIU-owned factory photography for their published cover image; third-party RSS images are not republished.
