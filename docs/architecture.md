# Architecture

```txt
Browser
  │
  ▼
Cloudflare Pages / Workers Runtime
  ├─ SvelteKit SSR (@sveltejs/adapter-cloudflare)
  ├─ Better Auth email/password
  ├─ Cloudflare Email Service binding: EMAIL
  ├─ Cloudflare KV binding: RATE_LIMIT
  ├─ Cloudflare Turnstile verification
  └─ Stripe webhook + checkout routes
      │
      ▼
Turso/libSQL + Drizzle
  ├─ users / sessions / accounts
  ├─ workspaces / members / invites
  ├─ projects / tasks
  └─ billing customers / subscriptions
```

## Runtime boundaries

- Client code only renders forms, pages, and Turnstile widgets.
- Secrets stay in `$lib/server/**`, server routes, or Cloudflare bindings.
- Transactional email is Cloudflare Email Service only in production.
- Stripe webhooks are the billing source of truth.
- Local rate limiting uses memory; production uses the `RATE_LIMIT` KV binding.
