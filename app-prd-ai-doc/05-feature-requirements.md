# SurveySparrow Contact Export — Feature Requirements

## Core features (v1)

| ID | Feature | Description | Priority | Acceptance criteria |
|----|---------|-------------|----------|---------------------|
| F1 | **Contacts list with pagination** | Display contacts from SurveySparrow in a readable table/list with server-backed pagination (`page`, `limit`, `has_next_page`). | Must have | Changing page fetches the correct slice; no full-account client fetch; loading state shown during fetch. |
| F2 | **Search and filter** | Real-time (debounced) **search** plus filters mapped to **documented** `GET /v3/contacts` query params (minimum: `search`; add `contact_list_id`, `type`, `contact_type`, `created_date` bounds per API docs as implemented). | Must have | Updating search/filter resets to page 1; results match API; empty state when no rows. |
| F3 | **Multi-select** | User can select individual rows; optional **select all on current page** with clear labeling that other pages are not selected. | Must have | Selection state is visible; counts reflect selected rows on current view. |
| F4 | **Export selected as CSV** | Generate and download CSV from **selected** contacts using a stable column header set derived from list payload fields. | Must have | CSV opens in common spreadsheet tools; UTF-8; commas/escaping handled; only selected rows exported. |
| F5 | **Error and empty states** | Handle loading, empty results, permission/limit errors via Twigs **Spinner**, **Text**, **Alert**. | Must have | No raw stack traces; no token leakage; retry path where appropriate. |

## Configuration / settings

| Item | Purpose | Manifest / storage |
|------|---------|-------------------|
| SurveySparrow **API access** | Authenticate `GET /v3/contacts` (and optional list endpoints). | `installation_params` e.g. `surveysparrow_api_key` with `"data-bind": "product.api_key"`, `type`: `api_key`, `required`: true, `secure`: true. |
| **API base** (if multi-region) | Some accounts use region-specific hosts; document exact host used in **whitelisted_domains** and in code constants. | Regex in `whitelisted_domains` covering `https://api\.surveysparrow\.com` (and any regional variant if product requires). |

(Installation-time config only; no OAuth in v1 unless product standard mandates—**Private App / API token** is the default assumption.)

## Platform events (if any)

**None for v1.** The app is **on-demand**, driven by the full-page UI calling `backend_api_functions`. Future: optional `onContactCreate` to invalidate cache if $db caching is introduced—not in scope now.

## UI surface

- **Full-page app:** **Yes** — root UI in `app-frontend/src/App.jsx` and child components; **Twigs** only for controls and layout (`@sparrowengg/twigs-react`, `@sparrowengg/twigs-react-icons`).
- **Custom installation frontend:** **No** — use default installation; credentials via manifest `installation_params`.

## Out of scope (v1)

- Mutations on SurveySparrow contacts (create/update/delete).
- Background sync, webhooks, or storing a full contact mirror in **$db**.
- Server-side CSV via **$file** (client-side export suffices for v1).
- Cross-product OAuth flows beyond documented SurveySparrow token usage.
