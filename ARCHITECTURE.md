# Parent Platform v2 Architecture

Public corporate site -> Identity gateway -> Customer Portal -> JWorks / TRACE / future products.
Owner HQ is a separate internal control plane.

## v2 data domains
- Organizations, people, roles, entitlements
- Products, environments, releases, issues
- Prospects, design partners, customers
- Milestones, tasks, campaigns, ideas
- Platform connections and health

## Security boundary
The current static build persists Owner HQ working data in browser localStorage for prototyping only. This is not authentication or authorization. Production Owner HQ requires server-side sessions, RBAC, audit logging and secret storage.

## Integration contracts
GitHub: repositories, releases, commits, actions/deploy status.
Cloudflare: deployments, Worker health, domains and analytics.
Products: authenticated telemetry endpoint for version, health, organization/user counts and incidents.
Billing: subscription/customer events through server-side webhooks.
