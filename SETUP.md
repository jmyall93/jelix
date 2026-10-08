# JELIX v3.0 — deployment and security checklist

**Do not deploy as an open public Owner HQ.** The public site can remain accessible, but Owner HQ and its JavaScript/CSS must be protected.

1. In Cloudflare, create a D1 database called `jelix-platform`. Copy its database ID into `wrangler.jsonc`, replacing `REPLACE_WITH_D1_DATABASE_ID`.
2. Run `npx wrangler d1 migrations apply jelix-platform --remote` from the project root (install Wrangler locally if needed). Keep a backup before future migrations.
3. Configure Cloudflare Zero Trust Access with an **application protecting** `/owner-hq.html`, `/v3.html`, `/v3.js`, `/owner-hq.js`, `/quotes.js`, `/owner-hq.css`, and `/api/*` (or use a dedicated private subdomain covering all Owner HQ assets). Require MFA and allow only the owner's email. Do not rely on the UI alone.
4. Obtain the Access application AUD tag and your Access team domain, such as `example.cloudflareaccess.com`. Configure Worker environment variables `ACCESS_AUD`, `ACCESS_TEAM_DOMAIN`, and `OWNER_EMAIL` (case-insensitive email matching). The Worker validates RS256 JWT signatures using the Access JWKS, plus issuer, audience, expiry and email. Do not use public API routes for sensitive data.
5. Deploy with `npx wrangler deploy`. Check `/api/health` then sign in through Access and open `/v3.html`. Check unauthenticated API access is rejected, and verify D1 create/update/delete operations.
6. Optional: add `GITHUB_TOKEN` (read-only fine-grained repository token) and `GITHUB_REPO` (`owner/repo`), or `CF_API_TOKEN` (read-only Workers permission), `CF_ACCOUNT_ID`, `CF_WORKER_NAME`. These are Worker secrets/variables, never frontend code. GitHub and Cloudflare endpoints are available for inspection, not automatic sync.
7. Do not enable customer logins, payments, email sending or production industrial telemetry until the appropriate identity, payment and ingestion services have been implemented and independently tested.

## Security and limitations

- v3 is an **owner-only foundation**, not yet a full customer SSO, invoicing, Stripe or telemetry platform. The classic Owner HQ still uses browser-local prototype records; the new v3 Business Operations screen uses D1.
- Quote Builder drafts still use browser localStorage. Save a PDF and track its lifecycle as a v3 quote record. Quote totals are calculated client-side; they must be independently validated before invoicing.
- Only the owner is allowed by the current API. Customers do not have access to the owner APIs. Organization memberships and entitlements are record models, not an implemented enforcement layer.
- GitHub/Cloudflare API access requires secrets and the proper read-only scopes; no integration is preconnected.
- This is an engineering preview: review security, backups, data privacy, tax, contracts, billing and production testing before commercial use.
