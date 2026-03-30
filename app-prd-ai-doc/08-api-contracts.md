# SurveySparrow Contact CSV Export — API Contracts

## AppNest contract rules

- Every invokable backend function must be **exported** from `app-backend/server.js`.
- Every such function must be declared in `manifest.json`: **API** → `backend_api_functions`.
- Handlers receive **`{ payload }`**. Return a plain object or `ResultData({ body, statusCode })`.
- Frontend calls backend via **`window.appnestClientFunctions.appBackend.invoke({ apiFunctionName, payload })`**.

---

## Backend API functions (backend_api_functions)

| Function name | Purpose | Payload (input) | Return / response | Timeout (s) |
|---------------|---------|------------------|-------------------|-------------|
| `listSurveySparrowContacts` | Proxy `GET /v1/contacts` with auth | `{ page?: number, maxResults?: number (1-100), search?: string, type?: 'active' \| 'unsubscribed' \| 'bounced' }` | `{ contacts: array, hasNextPage?: boolean, … }` — pass through normalized API body; on error `ResultData` with 4xx/5xx and message | 20 |

**manifest.json snippet (backend_api_functions):**

```json
"backend_api_functions": {
  "listSurveySparrowContacts": { "timeout": 20 }
}
```

---

## Event listeners (event_listener_functions)

_Not used in v1._

**manifest.json snippet (event_listener_functions):**

```json
"event_listener_functions": {}
```
*(Or omit the key per manifest schema if empty objects are disallowed—follow platform convention.)*

| Event name | Handler (export name) | Payload shape | Notes |
|------------|------------------------|---------------|-------|
| — | — | — | — |

---

## Installation params (installation_params)

| Param key | display_name | type | required | secure | Description |
|-----------|--------------|------|----------|--------|-------------|
| `surveysparrow_api_key` | SurveySparrow API key | `api_key` (with `data-bind`: `product.api_key`) | true | true | Token for `Authorization: Bearer <token>` on `api.surveysparrow.com` |

---

## OAuth config (if applicable)

_Not used in v1._ Remove unrelated `oauth_config` entries from the shipping manifest unless another product requirement mandates them.

| Provider key | Purpose | scope / options |
|--------------|---------|------------------|
| — | — | — |

---

## Whitelisted domains

- `https://api\\.surveysparrow\\.com(/.*)?`

(List regex patterns for every external host the app calls.)

---

## Scheduled jobs ($schedule)

_Not used._

---

## Function chaining ($next)

_Not used._
