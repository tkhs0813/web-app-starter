# Contributing

Thanks for helping improve `web-app-starter`.

## Local setup

```bash
pnpm install
cp .env.example .env
pnpm auth:schema
pnpm db:push
pnpm dev
```

## Quality gate

Run before opening a PR:

```bash
pnpm validate
```

## Commit style

Prefer small commits with conventional prefixes:

- `feat:` user-facing feature
- `fix:` bug fix
- `docs:` docs only
- `test:` tests only
- `chore:` tooling/config
