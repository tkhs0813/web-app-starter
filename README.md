# web-app-starter

Ryo's SvelteKit web app starter for OSS-friendly products and small SaaS experiments.

## Stack

- SvelteKit + Svelte 5 + TypeScript
- Turso/libSQL + Drizzle ORM
- Better Auth: email/password
- Tailwind CSS v4 + forms + typography
- Vitest, Playwright, Storybook
- ESLint, Prettier, GitHub Actions

## Quick start

```bash
pnpm install
cp .env.example .env
pnpm auth:schema
pnpm db:push
pnpm dev
```

Use `DATABASE_URL="file:local.db"` for local development, or point it at a Turso database:

```bash
turso db create web-app-starter
turso db show web-app-starter --url
turso db tokens create web-app-starter
```

## Scripts

```bash
pnpm dev          # start dev server
pnpm check        # Svelte + TypeScript checks
pnpm lint         # Prettier check + ESLint
pnpm test:unit    # Vitest
pnpm test:e2e     # Playwright
pnpm build        # production build
pnpm validate     # check + lint + unit tests + build
pnpm db:push      # push Drizzle schema
pnpm db:studio    # inspect DB
pnpm auth:schema  # regenerate Better Auth Drizzle schema
```

## App routes

- `/` landing page
- `/login` email/password sign-in/sign-up
- `/dashboard` protected app shell with workspace stats
- `/dashboard/projects` project and task CRUD
- `/dashboard/settings` profile update form
- `/dashboard/billing` typed billing plan catalog and Stripe lookup-key placeholders
- `/pricing` public pricing placeholder
- `/docs` product docs and deployment-provider checklist

## Core app features

- First dashboard visit creates a personal workspace for the signed-in user.
- Projects support create, edit, status update, and delete.
- Tasks can be added to projects, toggled complete, and deleted.
- Settings can update the signed-in user's display name.
- Billing exposes a typed plan catalog (`free`, `pro`, `team`) for future checkout wiring.
- Docs include deployment checklists for Vercel, Cloudflare Pages, and Fly.io.

## Template philosophy

Keep the core strong but replaceable:

1. Auth, DB, dashboard, billing routes are present from day one.
2. Product-specific logic should live under `src/lib/server` and `src/lib`.
3. Server secrets stay in `$lib/server` or server routes.
4. Every new feature should add focused tests before it grows.

## Before publishing as OSS

- Replace placeholder copy and branding.
- Choose and document a license.
- Add real screenshots.
- Run `pnpm validate`.
- Create a fresh Turso DB for any public demo.
