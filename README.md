# web-app-starter

Ryo's Cloudflare-first SvelteKit starter for OSS-friendly products and small SaaS experiments.

## Stack

- SvelteKit + Svelte 5 + TypeScript
- Cloudflare Pages/Workers via `@sveltejs/adapter-cloudflare`
- Turso/libSQL + Drizzle ORM
- Better Auth: email/password, email verification, password reset, sessions
- Cloudflare KV-backed auth throttling + optional Turnstile bot checks
- Workspace onboarding, switcher, team invites, invite resend/revoke, role helpers
- Stripe Checkout, Customer Portal, webhook-backed subscription state, plan limit enforcement
- Tailwind CSS v4 + forms + typography
- Vitest, Playwright, Storybook
- ESLint, Prettier, GitHub Actions

## Quick start

```bash
pnpm setup
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
pnpm dev          # start Vite dev server
pnpm check        # Svelte + TypeScript checks
pnpm lint         # Prettier check + ESLint
pnpm test:unit    # Vitest server/unit tests
pnpm test:e2e     # Playwright
pnpm build        # production Cloudflare build
pnpm validate     # check + lint + unit tests + build
pnpm smoke:prod   # smoke-test a deployed URL via SMOKE_TEST_URL
pnpm cf:dev       # Wrangler Pages local runtime
pnpm cf:deploy    # Cloudflare Pages deploy
pnpm db:push      # interactive Drizzle push
pnpm db:push:local # non-interactive disposable local DB push
pnpm db:generate  # generate migration SQL
pnpm db:migrate   # apply migrations
pnpm auth:schema  # regenerate Better Auth Drizzle schema
```

## App routes

- `/` landing page
- `/login` email/password sign-in/sign-up + password reset request
- `/reset-password` password reset callback page
- `/onboarding` first-run workspace setup
- `/invite/[token]` team invite acceptance
- `/dashboard` protected app shell with workspace stats
- `/dashboard/projects` project and task CRUD with plan limits
- `/dashboard/team` workspace settings, members, invites, role-based actions
- `/dashboard/settings` profile, password, session, danger-zone account controls
- `/dashboard/billing` Stripe Checkout, Customer Portal, webhooks, plan catalog
- `/pricing` public pricing placeholder
- `/docs` product docs and Cloudflare deployment checklist

## Core app features

- First dashboard visit creates a personal workspace for the signed-in user.
- Onboarding names the workspace and can create the first project.
- Team workspaces support member list, invites, and owner/admin/member roles.
- Permission helpers centralize `requireUser`, workspace membership, role checks, and billing/invite capabilities.
- Projects support create, edit, status update, and delete.
- Tasks can be added to projects, toggled complete, and deleted.
- Settings can update profile, change password, revoke sessions, and delete account.
- Billing includes Stripe Checkout, Customer Portal, webhook sync, `free`/`pro`/`team` plans, and plan limits.
- Docs include Cloudflare Pages/Workers and migration workflows.

## Cloudflare deployment

This template is configured for Cloudflare by default.

Cloudflare Pages build settings:

```text
Framework preset: SvelteKit
Build command: pnpm build
Build output directory: .svelte-kit/cloudflare
Compatibility flag: nodejs_als
```

Local Cloudflare runtime check:

```bash
pnpm build
pnpm cf:dev
```

Deploy:

```bash
pnpm cf:deploy
```

## Environment variables

| Variable                       | Required   | Notes                                             |
| ------------------------------ | ---------- | ------------------------------------------------- |
| `ORIGIN`                       | yes        | Public app origin, e.g. `https://app.example.com` |
| `DATABASE_URL`                 | yes        | `file:local.db` locally, `libsql://...` for Turso |
| `DATABASE_AUTH_TOKEN`          | production | Empty is OK for local `file:` DB                  |
| `BETTER_AUTH_SECRET`           | yes        | Generate with `openssl rand -base64 32`           |
| `EMAIL_PROVIDER`               | no         | `console` locally, `cloudflare` in production     |
| `EMAIL_FROM`                   | production | Verified sender for Cloudflare Email Service      |
| `PUBLIC_TURNSTILE_SITE_KEY`    | production | Optional Cloudflare Turnstile widget site key     |
| `TURNSTILE_SECRET_KEY`         | production | Optional Cloudflare Turnstile server secret       |
| `STRIPE_SECRET_KEY`            | billing    | Required for checkout/portal                      |
| `STRIPE_WEBHOOK_SECRET`        | billing    | Required for webhook verification                 |
| `STRIPE_PRO_PRICE_LOOKUP_KEY`  | billing    | Defaults to `starter_pro_monthly`                 |
| `STRIPE_TEAM_PRICE_LOOKUP_KEY` | billing    | Defaults to `starter_team_monthly`                |

## Transactional email

`src/lib/server/app/email.ts` intentionally logs email to console by default so the template runs immediately. Production uses **Cloudflare Email Service** through the Workers `EMAIL` binding — no Resend/Postmark/SendGrid fallback is included.

Local development:

```bash
EMAIL_PROVIDER="console"
EMAIL_FROM="Web App Starter <noreply@example.com>"
```

Production:

```bash
EMAIL_PROVIDER="cloudflare"
EMAIL_FROM="Web App Starter <noreply@yourdomain.com>"
```

Configure the sender in `wrangler.jsonc` and replace the placeholder with a verified Cloudflare Email Service sender:

```jsonc
"send_email": [
  {
    "name": "EMAIL",
    "allowed_sender_addresses": ["noreply@yourdomain.com"]
  }
]
```

## Production hardening

- Auth actions are throttled with `RATE_LIMIT` in production and in-memory buckets locally.
- Login, signup, and password reset forms render Cloudflare Turnstile when `PUBLIC_TURNSTILE_SITE_KEY` is set.
- Password signup requires practical strength before calling Better Auth.
- Dashboard layout shows email verification and billing status banners.
- See `docs/production-checklist.md` for Cloudflare bindings, secrets, and smoke-test steps.
- See `docs/architecture.md` for the runtime boundary diagram.

Create and wire the KV namespace before production deploy:

```bash
wrangler kv namespace create RATE_LIMIT
wrangler kv namespace create RATE_LIMIT --preview
```

Then replace the placeholder IDs in `wrangler.jsonc`.

## Stripe billing setup

Create recurring Stripe Prices with these lookup keys, or change the env vars to match your own keys:

```bash
STRIPE_PRO_PRICE_LOOKUP_KEY="starter_pro_monthly"
STRIPE_TEAM_PRICE_LOOKUP_KEY="starter_team_monthly"
```

Required Stripe env vars:

```bash
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

Local webhook forwarding example:

```bash
stripe listen --forward-to localhost:5173/stripe/webhook
```

The app treats webhooks as the source of truth. Checkout success pages do not directly grant paid access; subscription state is synced from Stripe events into the local database.

## Database workflow

- Local disposable DB: `pnpm db:push:local`
- Production schema changes: `pnpm db:generate`, review SQL, then `pnpm db:migrate`
- Create a fresh Turso DB for public demos.
- Do not use `db:push --force` against production.

## Template philosophy

Keep the core strong but replaceable:

1. Auth, DB, dashboard, teams, billing routes are present from day one.
2. Product-specific logic should live under `src/lib/server/app` and `src/lib`.
3. Server secrets stay in `$lib/server` or server routes.
4. Cloudflare is the default deployment target, but adapters remain replaceable.
5. Every new feature should add focused tests before it grows.

## Before publishing as OSS

- Replace placeholder copy and branding.
- Add real screenshots.
- Run `pnpm validate` and `pnpm test:e2e`.
- Create a fresh Turso DB for any public demo.
