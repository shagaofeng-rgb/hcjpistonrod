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
pnpm exec eslint
pnpm exec next build
```

## Main Routes

- `/`
- `/products`
- `/products/categories/chrome-plated-rods`
- `/products/categories/hardened-piston-rods`
- `/products/categories/hollow-rods-and-tubes`
- `/products/categories/custom-cylinder-components`
- `/products/hard-chrome-plated-rod`
- `/products/induction-hardened-chrome-plated-rod`
- `/products/hollow-piston-rod`
- `/products/honed-tube`
- `/process`
- `/quality`
- `/industries`
- `/company`
- `/contact`
- `/rfq`
- `/sitemap.xml`
- `/robots.txt`

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
