# SurveySparrow Contact Export — API Contracts

## AppNest contract rules

- Every invokable backend function must be **exported** from `app-backend/server.js`.
- Every such function must be declared in `manifest.json`: **API** → `backend_api_functions`.
- Handlers receive **`{ payload }`**. Return a plain object or `ResultData({ body, statusCode })`.
- Frontend calls backend via **`window.appnestClientFunctions.appBackend.invoke({ apiFunctionName, payload })`**.

---

## Backend API functions (`backend_api_functions`)

| Function name | Purpose | Payload (input) | Return / response | Timeout (s) |
|---------------|---------|-----------------|-------------------|-------------|
| `getContacts` | Proxy **SurveySparrow** `GET /v3/contacts` with auth from installation. | `{ page?: number, limit?: number, search?: string, contact_list_id?: number, type?: string, contact_type?: string, created_date_gte?: string, created_date_lte?: string }` — only forward params **allowed and documented** by SurveySparrow; validate `limit` (e.g. cap at **50**). | `{ contacts: array, has_next_page: boolean, meta?: { page, limit } }` — shape mirrors API subset needed by UI; errors as `ResultData` 4xx/5xx with `{ message }`. | **20** |
| `getContactLists` | *(Optional but recommended if filter-by-list is in UI.)* Proxy `GET` contact lists endpoint per SurveySparrow docs. | `{ page?: number, limit?: number }` if API paginates lists. | `{ contact_lists: array }` or equivalent normalized array. | **15** |

**manifest.json snippet (`backend_api_functions`):**

```json
"backend_api_functions": {
  "getContacts": { "timeout": 20 },
  "getContactLists": { "timeout": 15 }
}
```

*If `getContactLists` is deferred, remove its row from manifest until implemented.*

---

## Event listeners (`event_listener_functions`)

**Not used in v1.**

| Event name | Handler (export name) | Payload shape | Notes |
|------------|------------------------|---------------|-------|
| *N/A* | — | — | No platform events subscribed. |

**manifest.json snippet:** omit `backend_event_functions` / `event_listener_functions` keys for contact-only MVP, or leave empty per platform schema.

---

## Installation params (`installation_params`)

| Param key | display_name | type | required | secure | Description |
|-----------|--------------|------|----------|--------|-------------|
| `surveysparrow_api_key` | SurveySparrow API key | `api_key` (with `"data-bind": "product.api_key"`) | yes | yes | Private App / token used as **Bearer** for `https://api.surveysparrow.com` (or regional base URL per product docs). |

---

## OAuth config (if applicable)

**Not used in v1** — token from installation_params only.

| Provider key | Purpose | scope / options |
|--------------|---------|-----------------|
| *N/A* | — | — |

---

## Whitelisted domains

Include **all** SurveySparrow API hosts the app calls, as regex patterns (example; confirm against deployment region):

- `https://api\\.surveysparrow\\.com(/.*)?`

Add additional patterns if governance or product requires **EU** or other regional API bases.

---

## External upstream: SurveySparrow (reference)

| Method | Path | Query (examples) |
|--------|------|-------------------|
| GET | `/v3/contacts` | `page`, `limit`, `search`, `contact_list_id`, `type`, `contact_type`, `created_date.gte`, `created_date.lte` (exact names per [official docs](https://developers.surveysparrow.com/rest-apis/get-v-3-contacts)) |

**Auth:** `Authorization: Bearer <token>` using credential from installation.

---

## Scheduled jobs (`$schedule`)

**Not used.**

---

## Function chaining (`$next`)

**Not used.**
