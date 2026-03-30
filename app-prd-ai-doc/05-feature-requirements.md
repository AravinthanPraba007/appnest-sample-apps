# SurveySparrow Contact CSV Export — Feature Requirements

## Core features (v1)

| ID | Feature | Description | Priority | Acceptance criteria |
|----|---------|-------------|----------|---------------------|
| F1 | List contacts | Paginated list from SurveySparrow `GET /v1/contacts` | Must have | Table shows `contacts` from API; supports `page`, `maxResults` (1–100), optional `search` and `type`; shows loading and error states |
| F2 | Multi-select | User selects individual rows; selection kept when changing pages | Must have | Checking/unchecking updates selection; navigating pages does not drop prior selections; count of selected rows visible |
| F3 | Export CSV | Download selected contacts as CSV | Must have | File downloads with RFC-friendly CSV quoting; columns include at least: `id`, `name`, `email`, `phone`, `mobile`, `jobTitle`, `active`, `unsubscribed` (or fields present in API payload); UTF-8 |
| F4 | Secure auth | API token from platform / install config only | Must have | Backend reads token from installation binding; no hardcoded secrets; `$fetch` to `api.surveysparrow.com` only |

## Configuration / settings

| Item | Where | Notes |
|------|--------|------|
| SurveySparrow API token | `manifest.json` → `installation_params` | Use `data-bind: "product.api_key"` (or equivalent product API key field) with `type: "api_key"`, `secure: true`, `required: true`; display name/description guiding users to Apps & Integrations |

(Maps to `installation_params` in `manifest.json`; no separate settings screen required for v1.)

## Platform events (if any)

_None for v1. No `event_listener_functions` required._

(If later versions subscribe to contact webhooks, add handlers and manifest entries then.)

## UI surface

- **Full-page app:** Yes (UI in `app-frontend/src/App.jsx` and child components; Twigs + twigs-react-icons only.)
- **Custom installation frontend:** No (`custom_installation_frontend`: false).

## Out of scope (v1)

- Mutating contacts or contact lists via API  
- Export formats other than CSV  
- Storing export history in `$db`  
- OAuth to third-party calendars or other providers  
