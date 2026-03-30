# SurveySparrow Contact Export — Data Model

## AppNest storage

**v1 does not require `$db` for core functionality.** Contact data is **not** persisted in the app; each list request loads from SurveySparrow. If a future iteration adds saved filter presets or column preferences, those would use **`$db`** with documented keys below (optional).

---

## Core entities

**No persistent app-owned entities required for v1 MVP.**

| Entity | Purpose | Key pattern | $db type | Notes |
|--------|---------|-------------|----------|--------|
| *(none required v1)* | — | — | — | All display data is ephemeral (API → UI). |

**Optional (post-MVP) — user preferences**

| Entity | Purpose | Key pattern (e.g. for $db) | $db type | Notes |
|--------|---------|-----------------------------|----------|--------|
| `ContactViewPreferences` | Remember last page size / visible columns | `contact_export_prefs` (single workspace scope as provided by platform context) | `map` | Only if product requires persistence across sessions. |

## Storage keys

- **v1:** *Not used — no cross-invocation persistent keys.*
- **Key format (future):** Keys are strings (max 1000 chars); prefix e.g. `contact_export_{{scopeId}}`.

## Sensitive data

- **Secrets:** Only via **`installation_params`** / platform product API key binding.
- **PII:** Contact fields from SurveySparrow are shown in UI and may appear in downloaded CSV—treat CSV as **sensitive**; avoid server logs of full payloads.

## File storage ($file)

**Not used in v1.** CSV is generated in the browser and downloaded directly (Blob). No uploads to Appnest file storage.

| Path or pattern | Visibility | Operations used | Handler(s) | Notes |
|-----------------|------------|-----------------|------------|--------|
| *Not used* | — | — | — | — |

---

## External system data (if any)

- **SurveySparrow contacts:** Fetched on demand; fields and IDs as returned by **`GET /v3/contacts`**. No local idempotency store for writes (read-only app).
- If **`getContactLists`** is implemented, list metadata is **cached in React state** only for the session unless $db prefs are added later.
