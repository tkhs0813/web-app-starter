# Production checklist

## Cloudflare

- [ ] Create a Cloudflare Pages project connected to this repo.
- [ ] Set build command to `pnpm build`.
- [ ] Set build output directory to `.svelte-kit/cloudflare`.
- [ ] Enable compatibility flag `nodejs_als`.
- [ ] Create a KV namespace and replace `RATE_LIMIT` IDs in `wrangler.jsonc`.
- [ ] Configure Cloudflare Email Service sender addresses and replace `noreply@example.com`.
- [ ] Create a Turnstile widget and set `PUBLIC_TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY`.

## Secrets

Use Cloudflare dashboard or Wrangler secrets for:

```bash
wrangler secret put DATABASE_URL
wrangler secret put DATABASE_AUTH_TOKEN
wrangler secret put BETTER_AUTH_SECRET
wrangler secret put EMAIL_PROVIDER # cloudflare
wrangler secret put EMAIL_FROM
wrangler secret put TURNSTILE_SECRET_KEY
wrangler secret put STRIPE_SECRET_KEY
wrangler secret put STRIPE_WEBHOOK_SECRET
```

## Verification

```bash
pnpm validate
pnpm test:e2e
SMOKE_TEST_URL=https://your-app.pages.dev pnpm smoke:prod
```

## Billing

- [ ] Create Stripe prices with the lookup keys in `.env.example`.
- [ ] Point Stripe webhooks at `/stripe/webhook`.
- [ ] Confirm checkout success does not grant access without webhook sync.
