# JELIX v3.2 — Development Mode

See `SETUP.md` for the single-variable no-login development setup and safety warnings.

# JELIX v3.0 — Business Platform (owner-only foundation)

Built directly on v2.1. Retains the public corporate site, classic Owner HQ and quote builder. Adds a D1-backed business operations console (`v3.html`) for leads, quotes, customers, onboarding, subscriptions, entitlements, invoices, tasks, milestones, campaigns, releases and support records; conversion from lead to customer; an audit log; optional read-only GitHub and Cloudflare API routes; and Cloudflare Access JWT verification.

**Deployment is not plug-and-play**: complete `SETUP.md` to provision D1 and Cloudflare Access before uploading real customer data. The new business console is protected and requires configuration. Payments, real customer SSO, automated licensing, and industrial data ingestion are NOT implemented.

Existing `owner-hq.html` remains as a legacy local-data prototype. Use the new Business Operations link for D1-backed records. Branding remains provisional.
