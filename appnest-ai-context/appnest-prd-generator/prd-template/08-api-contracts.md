# {{product_name}} — API Contracts

## AppNest contract rules

- Every invokable backend function must be **exported** from `app-backend/server.js`.
- Every such function must be declared in `manifest.json`: **API** → `backend_api_functions`, **Event** → `event_listener_functions` with `handler` set to the function name.
- Handlers receive **`{ payload }`**. Return a plain object or `ResultData({ body, statusCode })`.
- Frontend calls backend via **`window.appnestClientFunctions.appBackend.invoke({ apiFunctionName, payload })`**.

---

## Backend API functions (backend_api_functions)

List every function that the frontend (or other callers) will invoke by name. Each must exist as an export in `server.js` and as a key in `manifest.json` → `backend_api_functions`.

| Function name | Purpose | Payload (input) | Return / response | Timeout (s) |
|---------------|---------|------------------|-------------------|-------------|
| {{api_fn_1_name}} | {{api_fn_1_purpose}} | {{api_fn_1_payload}} | {{api_fn_1_return}} | {{api_fn_1_timeout}} |
| {{api_fn_2_name}} | {{api_fn_2_purpose}} | {{api_fn_2_payload}} | {{api_fn_2_return}} | {{api_fn_2_timeout}} |
| {{api_fn_3_name}} | … | … | … | … |

**manifest.json snippet (backend_api_functions):**

```json
"backend_api_functions": {
  "{{api_fn_1_name}}": { "timeout": {{api_fn_1_timeout}} },
  "{{api_fn_2_name}}": { "timeout": {{api_fn_2_timeout}} }
}
```

---

## Event listeners (event_listener_functions)

List every platform event the app subscribes to. Each `handler` must be a function name exported from `server.js`.

| Event name | Handler (export name) | Payload shape | Notes |
|------------|------------------------|---------------|--------|
| {{event_1_name}} | {{event_1_handler}} | {{event_1_payload}} | {{event_1_notes}} |
| {{event_2_name}} | {{event_2_handler}} | {{event_2_payload}} | {{event_2_notes}} |

**manifest.json snippet (event_listener_functions):**

```json
"event_listener_functions": {
  "{{event_1_name}}": { "handler": "{{event_1_handler}}" }
}
```

---

## Installation params (installation_params)

| Param key | display_name | type | required | secure | Description |
|-----------|--------------|------|----------|--------|-------------|
| {{iparam_1_key}} | {{iparam_1_display_name}} | {{iparam_1_type}} | {{iparam_1_required}} | {{iparam_1_secure}} | {{iparam_1_description}} |

---

## OAuth config (if applicable)

| Provider key | Purpose | scope / options |
|--------------|---------|------------------|
| {{oauth_provider_key}} | {{oauth_provider_purpose}} | {{oauth_provider_options}} |

---

## Whitelisted domains

{{whitelisted_domains}}

(List regex patterns for every external host the app calls: APIs, OAuth authorize/token URLs, etc.)

---

## Scheduled jobs ($schedule)

If the app uses the AppNest **$schedule** API (create, get, update, pause, resume, delete), list each job. The **target function** must be exported from `app-backend/server.js`. See `appnest-tools/appnest-governance/appnest-functions/Backend-Appnest-Functions.md`.

| Job name | Type | Target function | Schedule (runAt / cronExpression / repeat) | Notes |
|----------|------|------------------|--------------------------------------------|--------|
| {{schedule_job_1_name}} | {{schedule_job_1_type}} | {{schedule_job_1_target_fn}} | {{schedule_job_1_schedule}} | {{schedule_job_1_notes}} |

- **Type:** ONE_TIME (use runAt), CRON (use cronExpression), or RECURRING (use repeat: frequency + timeUnit).
- If the app does **not** use $schedule, write *Not used* and remove the table.

---

## Function chaining ($next)

If any handler invokes another function via **$next.run({ functionName, payload, delay })**, document each call. The target must be a function exported from `app-backend/server.js`.

| Caller function | Target function | Payload shape | Delay (s) | Notes |
|-----------------|-----------------|---------------|-----------|--------|
| {{next_caller_1}} | {{next_target_1}} | {{next_payload_1}} | {{next_delay_1}} | {{next_notes_1}} |

- If the app does **not** use $next, write *Not used* and remove the table.
