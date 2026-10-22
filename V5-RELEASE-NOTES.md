# REYLEX HQ v5.0 — Development release

## Implemented
- JELIX visible branding renamed to REYLEX. Existing Cloudflare Worker name `jelix` and D1 binding preserved intentionally to avoid breaking deployment.
- Streamlined Owner HQ navigation. The old Business Operations and classic Quote Builder are removed from the navigation, while legacy pages remain for compatibility.
- PULSE appears in the product portfolio. Connection settings support validated HTTPS links to independently deployed JWorks, PULSE and TRACE sites. **Links are not live API integrations.**
- Quotes & Estimating supports JWorks, PULSE, TRACE, any combination, and Operations/Connected/Intelligence/Enterprise tiers.
- Changing PLCs, tags, sites, complexity, documentation or access now immediately recalculates estimated engineering hours unless hours have been manually overridden.
- Editable per-quote labour, margin, contingency, subscription rates, setup and monthly overrides. Price Book defaults can be saved locally and restored.
- Quote print preview and browser-local drafts retained.

## Not yet connected
- No shared identity, D1-backed price book, live product telemetry, provisioning, or cross-product customer synchronization. The supplied product ZIPs were inspected but are **not bundled into this Worker**; each remains a separate deployment.
- Development Mode remains potentially public. Do not use real customer data.

## Deployment
Replace the contents of your existing HQ GitHub repository with the files in this package. Keep the `src`, `public`, `migrations` folders and `wrangler.jsonc` at the repository root. Commit and deploy with `npx wrangler deploy`. The Worker name and database ID remain unchanged. No new migration required.
