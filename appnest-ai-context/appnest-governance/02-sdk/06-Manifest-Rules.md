# Manifest Rules and Schema

All apps must declare execution capabilities correctly in `manifest.json`. The manifest must reflect the actual handlers exported from `app-backend/server.js`. Mismatch between code and manifest is prohibited.

**Structure:** Top-level keys are `platform_version`, `parent_product`, and **`product_config`**. All app-specific config (frontend, backend API, events, installation params, OAuth, whitelisted domains) lives under **`product_config.<product>`** where `<product>` is the parent product identifier (e.g. `surveysparrow`).

**Cross-check (platform manifest ~2.0):** The following JSON shape is valid and matches this document—only the **values** (domain patterns, function names, param keys, OAuth placeholders) differ per app:

- Top-level: `platform_version`, `parent_product`, `product_config` only.
- Under `product_config.<product>` (key must match `parent_product`): `frontend_locations`, `whitelisted_domains`, `event_listener_functions`, `backend_api_functions`, `installation_parameters`, `oauth_config` — **no other top-level copies** of these keys.

---

## For AI / code generation

Use this file as the **single source of truth** when generating or editing `manifest.json`:

- **MUST** use exactly three top-level keys: `platform_version`, `parent_product`, `product_config`. All app config **MUST** be nested under `product_config.<product>` (e.g. `product_config.surveysparrow`); the product key **MUST** match `parent_product`.
- **MUST** use the key **`installation_parameters`** (iparams; not `installation_params`) for installation-time params. Each param object has `display_name`, `description`, `type` (e.g. `api_key`, `text`), `required`; optional: `data-bind`, `secure`, `default_value`.
- **MUST** ensure every key in `backend_api_functions` and every `handler` in `event_listener_functions` is the **exact name** of a function **exported** from `app-backend/server.js`. Do not add manifest entries for functions that are not exported.
- **MUST NOT** put `frontend_locations`, `backend_api_functions`, `event_listener_functions`, `installation_parameters`, `oauth_config`, or `whitelisted_domains` at the top level; they belong only under `product_config.<product>`.
- When in doubt, follow the **Full example (structure)** and **Quick reference** below; then validate against the **Rules** section.

---

## Rules

### 1. Event Listeners

Event handlers must be declared in **`product_config.<product>.event_listener_functions`**. Each entry’s `handler` value must match a function exported from **`app-backend/server.js`**.

### 2. Scheduled Functions

Scheduled handlers must be declared explicitly (per platform docs).

### 3. Backend API Functions

API-invokable functions must be declared in **`product_config.<product>.backend_api_functions`**. Each key must match a function exported from **`app-backend/server.js`**. Use `timeout` (seconds) where needed.

### 4. OAuth

Apps using OAuth must declare **`product_config.<product>.oauth_config`** with provider name(s) and required fields (`client_id`, `client_secret`, `authorize_url`, `token_url`, `options` as needed).

### 5. Consistency

The manifest must reflect the actual handlers exported from `app-backend/server.js`. Mismatch between code and manifest is prohibited.

---

## Manifest schema (for code generation)

### Top-level keys

| Key | Type | Description |
|-----|------|-------------|
| `platform_version` | string | Platform version (e.g. `"2.0"`). |
| `parent_product` | string | Parent product identifier (e.g. `"surveysparrow"`). |
| `product_config` | object | Product-specific config. Key(s) = product identifier(s) (e.g. `surveysparrow`). Value = object with `frontend_locations`, `whitelisted_domains`, `event_listener_functions`, `backend_api_functions`, `installation_parameters`, `oauth_config`. See below. |

### product_config.<product> (e.g. product_config.surveysparrow)

All app-specific manifest content lives under one product key (matching `parent_product`). Use **snake_case** for keys in the manifest.

| Key | Type | Description |
|-----|------|-------------|
| `frontend_locations` | object | Where the app is rendered. See below. |
| `whitelisted_domains` | string[] | Allowed domain patterns (regex strings). |
| `event_listener_functions` | object | Platform events → handler function names. See below. |
| `backend_api_functions` | object | Backend API function names → options (e.g. `timeout`). See below. |
| `installation_parameters` (iparams) | object | Params collected at install (API keys, text, etc.). See below. |
| `oauth_config` | object | OAuth provider configs. See below. |

### Full example (structure)

```json
{
  "platform_version": "2.0",
  "parent_product": "surveysparrow",
  "product_config": {
    "surveysparrow": {
      "frontend_locations": {
        "full_page_app": {
          "url": "index.html"
        }
      },
      "whitelisted_domains": [
        "https://(.*).signsparrow.com(.*)",
        "https://(.*).surveysparrow.com(.*)",
        "http://(.*).surveysparrow.test(.*)",
        "https://hooks\\.slack\\.com(/.*)?",
        "https://api\\.surveysparrow\\.com(/.*)?",
        "https://api\\.signsparrow\\.com(/.*)?"
      ],
      "event_listener_functions": {
        "onSubmissionComplete": {
          "handler": "onSubmissionComplete"
        },
        "onContactCreate": {
          "handler": "onSubmissionComplete"
        }
      },
      "backend_api_functions": {
        "function1": { "timeout": 30 },
        "function2": { "timeout": 30 }
      },
      "installation_parameters": {
        "surveysparrow_api_key": {
          "data-bind": "product.api_key",
          "display_name": "surveysparrow API Key",
          "description": "Please enter your surveysparrow API key.",
          "required": true,
          "secure": true,
          "type": "api_key"
        },
        "survey_api_base_url": {
          "display_name": "SurveySparrow API Base URL",
          "description": "Optional. e.g. https://api.surveysparrow.com",
          "type": "text",
          "required": false,
          "default_value": "https://api.surveysparrow.com"
        }
      },
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
  }
}
```

### frontend_locations

Nested under **`product_config.<product>.frontend_locations`**.

```json
"frontend_locations": {
  "full_page_app": {
    "url": "index.html"
  }
}
```

- Keys are location types (e.g. `full_page_app`).
- Each value has `url` (string) pointing to the frontend entry (e.g. `index.html`).

### whitelisted_domains

Nested under **`product_config.<product>.whitelisted_domains`**.

- **Type:** Array of **strings**, each typically a **regex pattern** for allowed outbound URLs (escape `.` in hostnames as `\\.` when needed, e.g. `https://api\\.surveysparrow\\.com(/.*)?`).
- Include patterns for your product domains, APIs, webhooks (e.g. Slack), and test hosts as required by the app.

### event_listener_functions

Nested under **`product_config.<product>.event_listener_functions`**.

```json
"event_listener_functions": {
  "onSubmissionComplete": {
    "handler": "onSubmissionComplete"
  },
  "onContactCreate": {
    "handler": "onSubmissionComplete"
  }
}
```

- **Keys:** Platform event names (e.g. `onSubmissionComplete`, `onContactCreate`).
- **Value:** Object with **`handler`** (string) = name of the function exported from **`app-backend/server.js`** that will be called when the event fires. The handler receives `{ payload }`.
- **Multiple events → one handler:** Different event keys may use the **same** `handler` string if one implementation handles several platform events (e.g. `onContactCreate` and `onSubmissionComplete` both `"onSubmissionComplete"`).

### backend_api_functions

Nested under **`product_config.<product>.backend_api_functions`**.

```json
"backend_api_functions": {
  "getMappings": { "timeout": 10 },
  "saveMapping": { "timeout": 15 }
}
```

- **Keys:** Function names that must be exported from **`app-backend/server.js`**; only those exports become API endpoints.
- **Value:** Object. Optional `timeout` (number, seconds). Other options may be supported by the platform.

### installation_parameters (iparams)

Nested under **`product_config.<product>.installation_parameters`**. In code and runtime (e.g. SDK) these are often referred to as **iparams** (e.g. `<%=iparams.<key>%>`). Manifest key is **`installation_parameters`** (not `installation_params`).

```json
"installation_parameters": {
  "surveysparrow_api_key": {
    "data-bind": "product.api_key",
    "display_name": "surveysparrow API Key",
    "description": "Please enter your surveysparrow API key. You can find it in Settings -> Apps & Integrations",
    "required": true,
    "secure": true,
    "type": "api_key"
  },
  "survey_api_base_url": {
    "display_name": "SurveySparrow API Base URL",
    "description": "Optional. e.g. https://api.surveysparrow.com or your regional endpoint.",
    "type": "text",
    "required": false,
    "default_value": "https://api.surveysparrow.com"
  }
}
```

- **Keys:** Parameter keys used at installation.
- **Value:** Object. **Required fields:** `display_name` (string), `description` (string), `type` (string: **`api_key`** for product API key, or `text`), `required` (boolean). **Optional:** `secure` (boolean), `default_value` (any), `data-bind` (string, e.g. `"product.api_key"` for API key params). Use **`installation_parameters`** (not `installation_params`).

### oauth_config

Nested under **`product_config.<product>.oauth_config`**.

```json
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
```

- **Keys:** OAuth provider names.
- **Value:** Object with `client_id`, `client_secret`, `authorize_url`, `token_url`, and optional `options` (e.g. `response_type`, `access_type`, `prompt`, **`scope`** as array of strings).

---

## Quick reference (code generation)

| Location | Key | Type | Purpose |
|----------|-----|------|---------|
| Top-level | `platform_version` | string | e.g. `"2.0"` |
| Top-level | `parent_product` | string | e.g. `"surveysparrow"` |
| Top-level | `product_config` | object | Product key(s) → app config object |
| Under product | `frontend_locations` | object | `{ full_page_app: { url: "index.html" } }` |
| Under product | `whitelisted_domains` | string[] | Domain regex patterns |
| Under product | `event_listener_functions` | object | `{ "<eventName>": { handler: "<exportedFnName>" } }` |
| Under product | `backend_api_functions` | object | `{ "<fnName>": { timeout?: number } }` |
| Under product | `installation_parameters` (iparams) | object | `{ "<paramKey>": { data-bind?, display_name, description, type, required, secure?, default_value? } }` — type e.g. `api_key`, `text` |
| Under product | `oauth_config` | object | `{ "<provider>": { client_id, client_secret, authorize_url, token_url, options? } }` |
