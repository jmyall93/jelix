# JELIX Parent Platform v1.1

Multi-page corporate website + JELIX ID portal concept + Owner HQ.

## Public pages
- index.html
- products.html
- platform.html
- about.html
- contact.html
- portal.html

## Owner HQ
Includes Command Center, Products, Customers, Releases, Platform Health, JELIX ID, Marketing, Business Plan, Milestones and Company Settings.

## Cloudflare
Workers static assets config is included in `wrangler.jsonc`. Deploy command: `npx wrangler deploy`.

Authentication, forms, health, customer and commercial data remain prototype/local UI until backend services are connected.


v2.1 adds an Owner HQ quote builder (editable CAD rates, tiered PLC/BMS integration, printable quote) and read-only integration manuals. Quote drafts use localStorage and are not shared between devices. Authentication and server-side persistence remain future work.
