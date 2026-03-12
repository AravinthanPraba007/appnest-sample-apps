# Manifest Rules and Schema

All apps must declare execution capabilities correctly in `manifest.json` (snake_case keys). The manifest must reflect the actual handlers exported from `app-backend/server.js`. Mismatch between code and manifest is prohibited.

## Rules

### 1. Event Listeners

Event handlers must be declared in **`event_listener_functions`**. Each entry’s `handler` value must match a function exported from **`app-backend/server.js`**.

### 2. Scheduled Functions

Scheduled handlers must be declared explicitly (per platform docs).

### 3. Backend API Functions

API-invokable functions must be declared in **`backend_api_functions`**. Each key must match a function exported from **`app-backend/server.js`**. Use `timeout` (seconds) where needed.

### 4. OAuth

Apps using OAuth must declare **`oauth_config`** with provider name(s) and required fields (`client_id`, `client_secret`, `authorize_url`, `token_url`, `options` as needed).

### 5. Consistency

The manifest must reflect the actual handlers exported from `app-backend/server.js`. Mismatch between code and manifest is prohibited.

---

## Manifest schema (for code generation)

The `manifest.json` at the project root uses **snake_case** keys. Use this schema when generating or validating manifest content.

### Top-level keys

| Key | Type | Description |
|-----|------|--------------|
| `platform_version` | string | Platform version (e.g. `"2.0"`). |
| `parent_product` | string | Parent product identifier (e.g. `"surveysparrow"`). |
| `custom_installation_frontend` | boolean | If `true`, use custom installation UI (e.g. from `app-installation-frontend`). |
| `frontend_locations` | object | Where the app is rendered. See below. |
| `event_listener_functions` | object | Platform events → handler function names. See below. |
| `backend_api_functions` | object | Backend API function names → options (e.g. `timeout`). See below. |
| `whitelisted_domains` | string[] | Allowed domain patterns (regex strings). |
| `installation_params` | object | Params collected at install (API keys, text, etc.). See below. |
| `oauth_config` | object | OAuth provider configs. See below. |

### frontend_locations

```json
{
  "frontend_locations": {
    "full_page_app": {
      "url": "index.html"
    }
  }
}
```

- Keys are location types (e.g. `full_page_app`).
- Each value has `url` (string) pointing to the frontend entry (e.g. `index.html`).

### event_listener_functions

```json
{
  "event_listener_functions": {
    "onSubmissionComplete": {
      "handler": "onSubmissionComplete"
    }
  }
}
```

- **Keys:** Platform event names (e.g. `onSubmissionComplete`).
- **Value:** Object with `handler` (string) = name of the function exported from **`app-backend/server.js`** that will be called when the event fires. The handler receives `{ payload }`.

### backend_api_functions

```json
{
  "backend_api_functions": {
    "getMappings": {
      "timeout": 10
    },
    "saveMapping": {
      "timeout": 15
    }
  }
}
```

- **Keys:** Function names that must be exported from **`app-backend/server.js`**; only those exports become API endpoints.
- **Value:** Object. Optional `timeout` (number, seconds). Other options may be supported by the platform.

### installation_params

```json
{
  "installation_params": {
    "surveysparrow_api_key": {
      "display_name": "surveysparrow API Key",
      "description": "Please enter your surveysparrow API key.",
      "type": "product_api_key",
      "required": true,
      "secure": true
    },
    "client_id": {
      "display_name": "Client ID",
      "description": "Please enter your Client ID here",
      "type": "text",
      "required": true,
      "secure": false
    }
  }
}
```

- **Keys:** Parameter keys used at installation.
- **Value:** Object with: `display_name` (string), `description` (string), `type` (string, e.g. `product_api_key`, `text`), `required` (boolean), `secure` (boolean, optional), `default_value` (any, optional).

### oauth_config

```json
{
  "oauth_config": {
    "googleCalendar": {
      "client_id": "...",
      "client_secret": "...",
      "authorize_url": "https://accounts.google.com/o/oauth2/auth",
      "token_url": "https://oauth2.googleapis.com/token",
      "options": {
        "response_type": "code",
        "access_type": "offline",
        "prompt": "consent",
        "scope": ["https://www.googleapis.com/auth/calendar"]
      }
    }
  }
}
```

- **Keys:** OAuth provider names.
- **Value:** Object with `client_id`, `client_secret`, `authorize_url`, `token_url`, and optional `options` (e.g. `response_type`, `access_type`, `prompt`, `scope`).

### Quick reference (code generation)

| Key | Type | Purpose |
|-----|------|---------|
| `platform_version` | string | e.g. `"2.0"` |
| `parent_product` | string | e.g. `"surveysparrow"` |
| `custom_installation_frontend` | boolean | Use custom install UI |
| `frontend_locations` | object | `{ full_page_app: { url: "index.html" } }` |
| `event_listener_functions` | object | `{ "<eventName>": { handler: "<exportedFnName>" } }` |
| `backend_api_functions` | object | `{ "<fnName>": { timeout?: number } }` |
| `whitelisted_domains` | string[] | Domain regex patterns |
| `installation_params` | object | `{ "<paramKey>": { display_name, description, type, required, secure?, default_value? } }` |
| `oauth_config` | object | `{ "<provider>": { client_id, client_secret, authorize_url, token_url, options? } }` |