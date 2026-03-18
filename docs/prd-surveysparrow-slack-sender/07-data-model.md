# SurveySparrow → Slack Response Sender — Data Model

## AppNest storage

v1 is **stateless**: no survey lists, responses, or webhooks are persisted in **$db**. Each invocation fetches fresh data from SurveySparrow. This matches product non-goals (no long-term storage).

---

## Core entities

*No persistent AppNest entities in v1.*

| Entity | Purpose | Key pattern (e.g. for $db) | $db type | Notes |
|--------|---------|-----------------------------|----------|-------|
| — | — | — | — | **N/A** — no $db usage in v1 |

## Storage keys

*Not applicable.* No `$db` keys. If a future phase adds “remember last survey”, document keys then.

- **Key format:** N/A
- **Value shape:** N/A

## Sensitive data

- **Secrets:** SurveySparrow API token via **installation_params** only. Slack webhook is ephemeral (payload per request); do not persist in $db.
- **PII:** Response content may include respondent names/comments; flows through memory only to Slack; not stored in Appnest storage.

## File storage ($file)

*Not used.* No file upload/download in v1.

| Path or pattern | Visibility | Operations used | Handler(s) | Notes |
|-----------------|------------|-------------------|------------|-------|
| *Not used* | — | — | — | — |

---

## External system data (if any)

Survey and response payloads are transient: returned from SurveySparrow via `$http`, formatted, sent to Slack. No caching of external IDs in $db for v1.
