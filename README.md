# Nuxt UI Theme Builder

Nuxt UI Theme Builder is a Nuxt 4 app for creating, previewing, saving, exporting, and sharing Nuxt UI color palettes.

## Features

- Live palette editing for light and dark modes
- Component preview workbench for Nuxt UI surfaces, forms, feedback, and actions
- Palette import/export helpers
- Account-backed palette storage with public sharing
- Server-side palette APIs backed by MongoDB and Better Auth

## Stack

- Nuxt 4
- Vue 3
- `@nuxt/ui`
- Better Auth
- MongoDB
- Vitest
- Playwright

## Setup

Install dependencies:

```bash
pnpm install
```

Create a local `.env` with the runtime variables used by the app:

```bash
NUXT_BETTER_AUTH_SECRET=change-me
NUXT_BETTER_AUTH_URL=http://localhost:3000
NUXT_BETTER_AUTH_ALLOWED_HOSTS=localhost:3000
NUXT_BETTER_AUTH_TRUSTED_ORIGINS=http://localhost:3000
NUXT_MONGODB_URI=mongodb://127.0.0.1:27017
NUXT_MONGODB_DB_NAME=nuxt-ui-theme-builder
NUXT_GEMINI_API_KEY=your-gemini-key
NUXT_STRIPE_PUBLIC_KEY=pk_test_...
NUXT_STRIPE_SECRET_KEY=sk_test_...
NUXT_STRIPE_WEBHOOK_SECRET=whsec_...
NUXT_PUBLIC_SITE_NAME=Nuxt UI Theme Builder
NUXT_PUBLIC_SITE_DESCRIPTION=Build, preview, save, and share Nuxt UI color palettes with a live component workbench.
NUXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Scripts

```bash
pnpm dev
pnpm build
pnpm preview
pnpm test
pnpm test:unit
pnpm test:nuxt
pnpm test:e2e
```

## App Areas

- `/` renders the theme builder
- `/login` and `/register` handle account access
- `/palette/[slug]` renders a shareable palette preview page
- `/api/palettes/*` provides palette CRUD and sharing endpoints
- `/api/stripe/checkout` creates Stripe Checkout sessions for paid plans
- `/api/stripe/webhook` receives Stripe subscription lifecycle events
- `/api/auth/*` is served by Better Auth

## Notes

- MongoDB is required for saved palettes and auth-backed flows.
- Stripe checkout requires `NUXT_STRIPE_SECRET_KEY`, `NUXT_STRIPE_WEBHOOK_SECRET`, and a configured webhook endpoint pointed at `/api/stripe/webhook`.
- Public palette sharing is available through palette slugs.
- Rate limiting is applied to API routes in Nitro middleware.
