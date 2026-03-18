# PRD Generator — Validation Checklist

Use this checklist after filling the PRD template and before marking the app **READY TO BUILD**. Every **Required** item must be **Pass**. If any Required item is **Fail** or **Unclear**, output **CLARIFICATION REQUIRED** and list the failed/unclear items. If all Required items pass, output **READY TO BUILD APP**.

---

## 1. Open questions

| # | Check | Required | Pass / Fail / N/A | Notes |
|---|--------|----------|-------------------|--------|
| 1.1 | There are no open or ambiguous questions that block implementation. | Yes | ☐ Pass ☐ Fail ☐ Unclear | Resolve or document every “TBD” or “?” before build. |
| 1.2 | Scope for v1 is clearly stated (in scope / out of scope). | Yes | ☐ Pass ☐ Fail ☐ Unclear | 01-overview. |
| 1.3 | Primary user and main goal are defined. | Yes | ☐ Pass ☐ Fail ☐ Unclear | 03-user-personas. |

---

## 2. APIs and manifest

| # | Check | Required | Pass / Fail / N/A | Notes |
|---|--------|----------|-------------------|--------|
| 2.1 | Every backend API function used by the frontend is **named** and **documented** (purpose, payload, return). | Yes | ☐ Pass ☐ Fail ☐ Unclear | 08-api-contracts. |
| 2.2 | Every backend API function is declared in **manifest.json** → **backend_api_functions** with correct function name and timeout. | Yes | ☐ Pass ☐ Fail ☐ Unclear | Must match exports from server.js. |
| 2.3 | Every platform event the app uses is **named** and has a **handler** function name. | Yes | ☐ Pass ☐ Unclear ☐ N/A | 08-api-contracts. |
| 2.4 | Every event handler is declared in **manifest.json** → **event_listener_functions** and exported from **app-backend/server.js**. | Yes | ☐ Pass ☐ Fail ☐ Unclear ☐ N/A | No mismatch. |
| 2.5 | **installation_params** (if any) are listed with keys, types, required, secure. | Yes | ☐ Pass ☐ Fail ☐ Unclear ☐ N/A | 08-api-contracts + manifest schema. |
| 2.6 | **oauth_config** (if OAuth is used) is defined with provider, client_id, client_secret, authorize_url, token_url, options. | Yes | ☐ Pass ☐ Fail ☐ Unclear ☐ N/A | 08-api-contracts + manifest. |
| 2.7 | **whitelisted_domains** include all external API and OAuth domains the app calls. | Yes | ☐ Pass ☐ Fail ☐ Unclear | 08-api-contracts. |

---

## 3. Entities and data

| # | Check | Required | Pass / Fail / N/A | Notes |
|---|--------|----------|-------------------|--------|
| 3.1 | Core **entities** are listed with purpose and key pattern. | Yes | ☐ Pass ☐ Fail ☐ Unclear | 07-data-model. |
| 3.2 | Every persistent entity has a **storage strategy** (e.g. $db key pattern and type: string, number, list, map, boolean). | Yes | ☐ Pass ☐ Fail ☐ Unclear | 07-data-model; no in-memory cross-invocation state. |
| 3.3 | **Sensitive data** and **secrets** are handled only via installation_params or oauth_config; no hardcoding. | Yes | ☐ Pass ☐ Fail ☐ Unclear | 07-data-model + 09-non-functional. |
| 3.4 | If the app uses **$file**: file storage section in 07-data-model is filled (paths, visibility, operations, handlers). | If uses $file | ☐ Pass ☐ Fail ☐ Unclear ☐ N/A | 07-data-model. |
| 3.5 | If the app uses **$schedule**: scheduled jobs are listed in 08-api-contracts with name, type, target function, schedule. | If uses $schedule | ☐ Pass ☐ Fail ☐ Unclear ☐ N/A | 08-api-contracts. |
| 3.6 | If the app uses **$next**: function chaining is documented in 08-api-contracts (caller, target function, payload, delay). | If uses $next | ☐ Pass ☐ Fail ☐ Unclear ☐ N/A | 08-api-contracts. |

---

## 4. AppNest architecture

| # | Check | Required | Pass / Fail / N/A | Notes |
|---|--------|----------|-------------------|--------|
| 4.1 | **Backend entry** is only **app-backend/server.js**; all invokable logic is exported from it (no custom routes/controllers). | Yes | ☐ Pass ☐ Fail ☐ Unclear | 06-technical-architecture; ref. appnest-tools/appnest-governance entry points. |
| 4.2 | **Frontend entry** is **app-frontend/src/App.jsx**; backend is called only via **window.appnestClient.backend.invoke({ functionName, payload })**. | Yes | ☐ Pass ☐ Fail ☐ Unclear ☐ N/A | 06-technical-architecture. |
| 4.3 | All external HTTP uses **$http** (no axios/fetch). All persistent state uses **$db**. Long-running/chained work uses **$schedule** or **$next**. | Yes | ☐ Pass ☐ Fail ☐ Unclear | 06 + 09; ref. SDK usage rules. |
| 4.4 | **app-backend/package.json** does NOT list `@aravinthan_p/appnest-app-sdk-utils` (or appnest-app-sdk-utils). | Yes | ☐ Pass ☐ Fail ☐ Unclear | Platform-provided. |
| 4.5 | **app-frontend/package.json** does NOT list `react` or `react-dom`. UI uses **@sparrowengg/twigs-react** and **@sparrowengg/twigs-react-icons** where applicable; use version **`"*"`** (latest), not a fixed version that may not exist (e.g. ^2.0.0). | Yes | ☐ Pass ☐ Fail ☐ Unclear ☐ N/A | 06-technical-architecture, 07-Twigs-UI-Reference. |
| 4.6 | Handlers return **ResultData** or plain object; no throwing raw errors without structured return. | Yes | ☐ Pass ☐ Fail ☐ Unclear | 09-non-functional; ref. SDK usage rules. |
| 4.7 | **Manifest** matches code: every key in backend_api_functions and event_listener_functions exists as an export in server.js. | Yes | ☐ Pass ☐ Fail ☐ Unclear | 08-api-contracts + manifest rules. |
| 4.8 | If the app has a **full-page UI**: **11-ui-screens.md** is filled with screens overview and, for each screen, purpose, how user reaches it, layout/elements, user actions with **functionName** (from backend_api_functions), data shown, and empty/loading/error states. | If full-page UI | ☐ Pass ☐ Fail ☐ Unclear ☐ N/A | 11-ui-screens. |

---

## 5. MVP and milestones

| # | Check | Required | Pass / Fail / N/A | Notes |
|---|--------|----------|-------------------|--------|
| 5.1 | **MVP scope** is clearly defined (features and deliverables). | Yes | ☐ Pass ☐ Fail ☐ Unclear | 10-milestones. |
| 5.2 | **Phase 1 (MVP) milestones** are listed with dependencies and “done when” criteria. | Yes | ☐ Pass ☐ Fail ☐ Unclear | 10-milestones. |
| 5.3 | Out-of-scope for v1 is stated so build is not blocked by future scope. | Yes | ☐ Pass ☐ Fail ☐ Unclear | 01-overview + 05-feature-requirements. |

---

## 6. External APIs and safety (if app calls external APIs)

| # | Check | Required | Pass / Fail / N/A | Notes |
|---|--------|----------|-------------------|--------|
| 6.1 | **Idempotency** for push operations is specified (no duplicate resource creation). | If pushes | ☐ Pass ☐ Fail ☐ Unclear ☐ N/A | 09-non-functional; ref. External API Standards. |
| 6.2 | **Retries** and **429 handling** (e.g. backoff) are specified. | If external API | ☐ Pass ☐ Fail ☐ Unclear ☐ N/A | 09-non-functional. |
| 6.3 | **Error handling** for non-200 responses is specified. | If external API | ☐ Pass ☐ Fail ☐ Unclear ☐ N/A | 09-non-functional. |

---

## Final status

- **If every Required check above is Pass (or justified N/A):**  
  **READY TO BUILD APP**

- **If any Required check is Fail or Unclear:**  
  **CLARIFICATION REQUIRED**  
  List the checklist item(s) that failed or are unclear (e.g. “2.2 Backend API functions not all in manifest”, “4.3 $http/$db usage not documented”). Resolve these and re-run the checklist before building.
