# auth.md

TrustSight's public web sites and the watcher API are **read-only and public**.
There is no account registration, no OAuth authorization server, and no bearer
token required to read them.

- Web: <https://trustsight.org/>
- Documentation: <https://docs.trustsight.org/>
- Watcher read API: <https://watcher.trustsight.org/api>
- OpenAPI description: <https://watcher.trustsight.org/api/openapi.json>

## For agents

You do not need to register or present a credential to use the public API.
Requests are limited per client; a `429` response includes `Retry-After`.
The API is GET-only, CORS-open, and never mutates the watcher store.

## For operators of a TrustSight deployment

TrustSight itself runs locally and has no hosted control plane. A private
deployment is operated by its owner; this site does not issue credentials for
it and cannot register agents against it. Use the project's security contact in
<https://docs.trustsight.org/security-design/vulnerability-reporting/> for
anything that is not public information.

## Machine-readable metadata

- API catalog: <https://trustsight.org/.well-known/api-catalog>
- AI catalog: <https://trustsight.org/.well-known/ai-catalog.json>
- Protected-resource metadata: <https://trustsight.org/.well-known/oauth-protected-resource>
- MCP server card: <https://trustsight.org/.well-known/mcp/server-card.json>
