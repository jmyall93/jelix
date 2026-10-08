# JELIX v3.2 — Development Mode (authentication optional)

## Quick setup (testing only)
1. Upload this package to your GitHub `jmyall93/jelix` repository, preserving the `public/`, `src/`, and `migrations/` folders. Commit to `main`.
2. In Cloudflare Workers & Pages → `jelix` → Settings → Variables and Secrets, add a **Text** variable named `DEVELOPMENT_MODE` with value **`true`** (lowercase). Save and deploy the latest version if prompted.
3. Open `/owner-hq.html` directly. No username, password, salt, hash or session secret is needed.
4. For D1-backed features, apply `migrations/0001_init.sql` in the `jelix-production` D1 Console if not already applied.

## IMPORTANT: PUBLIC ACCESS
With `DEVELOPMENT_MODE=true`, **anyone who knows the site address can access Owner HQ and its database APIs and can read, create, change or delete records**. Do not enter real customer data, financial information, tokens or sensitive information. Use only fabricated test records. Do not advertise or distribute the URL.

## Before going live
Set `DEVELOPMENT_MODE=false` (or remove the variable) and redeploy. The existing built-in Owner HQ login then becomes mandatory again, requiring `OWNER_EMAIL`, `OWNER_PASSWORD_SALT`, `OWNER_PASSWORD_HASH`, and `SESSION_SECRET` configured per the v3.1 setup. Confirm unauthenticated `/api/records/customer` returns HTTP 401 and `/owner-hq.html` redirects to `/owner-login.html`. Complete a security review before using real data.

This package keeps `assets.directory` set to `./public` so `.git`, Worker source, migrations and Wrangler configuration are not uploaded as public static assets.
