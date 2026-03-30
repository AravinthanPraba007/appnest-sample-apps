# SurveySparrow Contact Export — Milestones

## MVP (v1) scope

Ship a **full-page Appnest app** that lists SurveySparrow contacts with **server pagination**, **search/filters**, **multi-select**, and **client-side CSV export**, using **Twigs** UI and **$fetch** backend proxy with **installation_params** API key.

**Deliverables:**

- Backend: `app-backend/server.js` exporting **`getContacts`** (required) and **`getContactLists`** (optional for list filter); only **Appnest Functions**; no `@sparrowengg/appnest-app-sdk-utils` in `app-backend/package.json`.
- Manifest: `backend_api_functions`, **`installation_params`** (API key), **`whitelisted_domains`** for SurveySparrow API; **no** event listeners for v1.
- Frontend: `app-frontend/src/App.jsx` + components; Twigs + twigs-react-icons; invoke `getContacts` / `getContactLists` via `window.appnestClientFunctions.appBackend.invoke`.
- Data: **No required $db** in v1 (documented in 07-data-model).
- Validation: PRD passes `appnest-ai-context/appnest-prd-generator/validation-checklist.md` → **READY TO BUILD APP**.

---

## Phase 1 (MVP)

| # | Milestone | Dependencies | Done when |
|---|-----------|--------------|-----------|
| M1 | **Manifest + backend proxy** | SurveySparrow test token; allowlisted domain | `getContacts` returns real rows + `has_next_page`; errors mapped safely. |
| M2 | **Contacts UI** | M1 | Paginated table, loading/error/empty states, debounced search, filters wired to supported query params. |
| M3 | **Select + CSV** | M2 | Multi-select works; CSV downloads with correct columns for selected rows. |
| M4 | **Polish + compliance review** | M1–M3 | Matches **App-Frontend-Rules**; checklist passes; no secret leakage in logs. |

---

## Phase 2 (post-MVP)

- Optional **`getContactLists`** and richer filter UX if not in MVP.
- **Saved views** (filter presets) via **`$db`**.
- **Select all matching filter** flow (server-assisted export) if product requires export beyond current page—would add backend CSV or paged aggregation (scope carefully for rate limits).

---

## Dependencies and risks

- **SurveySparrow API** availability, rate limits, and **token scopes** for contacts read—verify Private App permissions during QA.
- **Regional API base URL** — wrong host → 404/401; align `whitelisted_domains` and constants.
- **Large custom properties** on contacts may widen table/CSV; mitigate with column picker in a later phase.
