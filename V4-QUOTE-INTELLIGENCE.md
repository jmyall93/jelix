# JELIX Owner HQ v4.0 — Quote Intelligence (pilot)

Open `/quote-intelligence.html` or click **Quote Intelligence** in Owner HQ. This is a functional client-side pilot estimating tool; it does not yet save quotes to D1 or auto-create CRM records. It is not an AI model or a validated pricing recommendation.

Default configuration: TRACE, one site, standard complexity, one PLC/SCADA system, 100 tags, partial documentation, remote access. TRACE core CAD 699/month/site, connector CAD 249/month/site. Internal loaded labour CAD 85/hr, direct costs CAD 750, contingency 15%, gross margin 40%. Estimates round up to CAD 250. Subscription terms 12/24/36 months.

## Formula
One-time implementation price = ceil(((estimated hours * loaded hourly cost + direct costs) * (1 + contingency)) / (1 - gross margin) / 250) * 250.

All assumptions are editable; phase hours can be overridden. Recalculate recommended hours resets overrides. Quotes are browser-local via localStorage, not shared or backed up. Print generates a draft proposal, not a signed offer.

## Deployment
Upload the contents of this ZIP, preserving the public/ folder and wrangler.jsonc. Existing D1 binding and Worker backend are unchanged. Run Worker build and visit /quote-intelligence.html. No new migration required.

## Before commercial use
Validate rates with actual project cost records and competitor/customer research; implement D1 quote persistence, customer lookup, quote versioning, approvals, audit trails, permissions, tax/FX handling, e-signature, renewal terms, and controlled pricing catalogs. Development Mode currently bypasses Owner HQ authorization; do not use real customer data or production secrets.
