# SurveySparrow Contact CSV Export — Milestones

## MVP (v1) scope

Ship a full-page Twigs UI that lists SurveySparrow contacts via `listSurveySparrowContacts`, supports pagination/search, multi-select with cross-page memory, and client-side CSV download. Manifest contains one backend API, correct `whitelisted_domains`, and minimal `installation_params` for the API key. No events, no `$db`, no `$file`.

**Deliverables:**

- Backend: `app-backend/server.js` exporting `listSurveySparrowContacts`; implemented with **`$fetch.request`** only; do not add `@sparrowengg/appnest-app-sdk-utils` to `app-backend/package.json`.
- Manifest: `backend_api_functions`, `installation_params`, `whitelisted_domains`, `frontend_locations.full_page_app`, `parent_product: surveysparrow`; remove template placeholders (`function1`, unrelated OAuth, Snowflake-style params) from the shipping artifact.
- Frontend: `app-frontend/src/App.jsx` and components using Twigs; `invoke` for listing only; CSV utility client-side.
- Data: No `$db` keys required; document as N/A.
- Validation: Items in `appnest-ai-context/appnest-prd-generator/validation-checklist.md` passed → **READY TO BUILD APP**.

---

## Phase 1 (MVP)

| # | Milestone | Dependencies | Done when |
|---|-----------|--------------|-----------|
| M1 | Backend proxy + manifest | Appnest project scaffold | `listSurveySparrowContacts` returns live data with valid install token; domain allowlist correct |
| M2 | Contacts UI | M1 | Table, search, pagination, loading/error **Alert**, Twigs-only controls |
| M3 | Select + CSV export | M2 | Multi-select persists across pages; CSV downloads with correct columns and escaping |

---

## Phase 2 (post-MVP)

- “Select all results matching current search” with explicit confirmation (may require extra API design or capped max export).  
- Optional **$file** archival of exports or audit trail in `$db`.  
- Contact **list** scoping (e.g. per contact list ID) if product adds `GET /v1/contactlist/...` flows.

---

## Dependencies and risks

- **SurveySparrow API changes** — Contract tests or manual verification against documentation when API versions change.  
- **Large selections** — Very large CSV strings in-browser could stress memory; mitigated by pagination and documenting practical limits (post-MVP: server stream or chunking).  
- **Token scope** — Install must use a token with permission to read contacts.
