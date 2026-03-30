# SurveySparrow Contact CSV Export — Data Model

## AppNest storage

v1 is **stateless** on the server: listing is proxied to SurveySparrow and the UI holds selection in memory. If future phases add preferences or export audit logs, use **$db** with documented keys then.

---

## Core entities

_No persistent Appnest `$db` entities in v1._

| Entity | Purpose | Key pattern (e.g. for $db) | $db type | Notes |
|--------|---------|-----------------------------|----------|-------|
| — | — | — | — | Read-only app; no cross-invocation server state |

## Storage keys

_Not used in v1._

- **Key format:** N/A until a future version defines keys (e.g. `export_prefs_<workspaceId>`).

## Sensitive data

- **Secrets:** API token only via platform `installation_params` / product binding. Never stored in `$db` as plaintext in v1.
- **PII:** Contact fields (email, phone, name) pass through the backend in the JSON response to the UI and into the user’s downloaded CSV. Log only trace IDs and non-PII error metadata.

## File storage ($file)

_Not used._ v1 performs browser download from a generated `Blob`; CSV is not written to Appnest file storage.

| Path or pattern | Visibility | Operations used | Handler(s) | Notes |
|-----------------|------------|------------------|------------|-------|
| *Not used* | — | — | — | — |

---

## External system data (if any)

- **SurveySparrow contact object:** Fields as returned by `GET /v1/contacts` (e.g. `id`, `name`, `email`, `active`, `unsubscribed`, `phone`, `mobile`, `jobTitle`—exact set per live API response).  
- **Not stored in $db:** Responses are forwarded to the client for display and CSV; no duplicate store on platform for v1.
