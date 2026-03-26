# Core Capability Lab — API Contracts

## AppNest contract rules

- Every invokable backend function is **exported** from `app-backend/server.js`.
- Declared in `manifest.json` → `backend_api_functions` (and **not** in `event_listener_functions` unless platform event).
- Handlers receive **`{ payload }`**. Return plain object or `ResultData({ body, statusCode })`.
- Frontend: **`window.appnestClientFunctions.appBackend.invoke({ apiFunctionName, payload })`**.

---

## Backend API functions (backend_api_functions)

| Function name | Purpose | Payload (input) | Return / response | Timeout (s) |
|---------------|---------|------------------|-------------------|-------------|
| `getCapabilityLabState` | Return recent runs + optional counters | `{}` or `{ limit?: number }` | `{ runs: [...], modules?: {...} }` | 10 |
| `runFileModuleTest` | Exercise `$file` (write/verify/delete path per action) | `{ action?: "write" \| "verify" \| "delete" }` | `{ ok, message, path? }` | 15 |
| `runStorageModuleTest` | Exercise `$db` read/write on demo key | `{ action?: "write" \| "read" }` | `{ ok, message, value? }` | 10 |
| `runNetworkModuleTest` | Exercise `$fetch` GET to whitelisted host | `{ path?: string }` (path only; host fixed) | `{ ok, statusCode, message }` | 15 |
| `scheduleModuleTest` | Create ONE_TIME `$schedule` job | `{ delaySeconds: number }` (e.g. 5–300) | `{ ok, jobId?, scheduledFor? }` | 20 |
| `runChainModuleTest` | Start chain: calls `chainCapabilityStepOne` | `{}` | `{ ok, message }` | 15 |
| `chainCapabilityStepOne` | First hop; enqueues `chainCapabilityStepTwo` via `$next` | `{ payload }` (from `$next` or internal) | `{ ok, step: 1 }` | 10 |
| `chainCapabilityStepTwo` | Second hop; writes run log | `{ fromStep?: number }` | `{ ok, step: 2 }` | 10 |
| `executeScheduledCapabilityJob` | Invoked by scheduler; appends log entry | `{ }` or scheduler-provided payload | `{ ok }` | 10 |
| `clearCapabilityLabData` | Clear `$db` lab keys + lab `$file` paths | `{}` | `{ ok, cleared: string[] }` | 20 |

**manifest.json snippet (backend_api_functions):**

```json
"backend_api_functions": {
  "getCapabilityLabState": { "timeout": 10 },
  "runFileModuleTest": { "timeout": 15 },
  "runStorageModuleTest": { "timeout": 10 },
  "runNetworkModuleTest": { "timeout": 15 },
  "scheduleModuleTest": { "timeout": 20 },
  "runChainModuleTest": { "timeout": 15 },
  "chainCapabilityStepOne": { "timeout": 10 },
  "chainCapabilityStepTwo": { "timeout": 10 },
  "executeScheduledCapabilityJob": { "timeout": 10 },
  "clearCapabilityLabData": { "timeout": 20 }
}
```

---

## Event listeners (event_listener_functions)

**Not used in v1.** No platform events subscribed.

**manifest.json snippet (event_listener_functions):**

```json
"event_listener_functions": {}
```

---

## Installation params (installation_params)

**v1:** Empty object `{}` **or** optional non-secret param later, e.g.:

| Param key | display_name | type | required | secure | Description |
|-----------|--------------|------|----------|--------|-------------|
| *(none required)* | — | — | — | — | Network demo uses fixed whitelisted host + optional path in payload |

---

## OAuth config (if applicable)

**Not used in v1.**

---

## Whitelisted domains

Include the SurveySparrow API host used by `runNetworkModuleTest`:

```text
https://api\.salesparrow\.com(/.*)?
```

(Adjust regex if implementation uses a different approved host; must match **every** `$fetch` target.)

**manifest.json example:**

```json
"whitelisted_domains": [
  "https://api\\.salesparrow\\.com(/.*)?"
]
```

---

## Scheduled jobs ($schedule)

| Job name (logical) | Type | Target function | Schedule | Notes |
|--------------------|------|-----------------|----------|-------|
| `capabilityLabDemo` | ONE_TIME | `executeScheduledCapabilityJob` | `runAt` = now + `delaySeconds` from UI | Created by `scheduleModuleTest`; name/id per SDK |

---

## Function chaining ($next)

| Caller function | Target function | Payload shape | Delay (s) | Notes |
|-----------------|-----------------|---------------|-----------|-------|
| `runChainModuleTest` | `chainCapabilityStepOne` | `{}` or `{ source: "ui" }` | 0 | Direct invoke from handler (or inline call within same process) |
| `chainCapabilityStepOne` | `chainCapabilityStepTwo` | `{ fromStep: 1 }` | 1 | Non-zero delay demonstrates async ordering |

*Note:* If `runChainModuleTest` calls `chainCapabilityStepOne` synchronously inside the same handler export, that is still a single API call from the UI; `$next` is used **from** `chainCapabilityStepOne` to `chainCapabilityStepTwo`.
