# PRD Generator — Assessment for Appnest App Coverage

This document summarizes how well the PRD generator covers Appnest apps and what was added to close gaps (backend functions, data storage, $file, $schedule, $next, manifest).

---

## What the generator already covers well

| Area | Coverage |
|------|----------|
| **Backend API functions** | 08-api-contracts lists each function (name, purpose, payload, return, timeout); manifest snippet for `backend_api_functions`. |
| **Event listeners** | 08-api-contracts lists each event and handler; manifest snippet for `event_listener_functions`. |
| **Data / $db** | Question framework D1–D4 (entities, fields, where stored, $db types); 07-data-model has entities table with key pattern and $db type. |
| **Entry points** | 06-technical-architecture and validation checklist enforce server.js + App.jsx, invoke({ apiFunctionName, payload }). |
| **SDK in principle** | Workflow and 06 state that all I/O uses $db, $http, $file, $next, $schedule; no axios/fetch; no SDK in package.json. |
| **Manifest** | installation_params, oauth_config, whitelisted_domains covered in questions and 08-api-contracts. |
| **External APIs** | Integrations (I1–I4), idempotency/retries (6.1–6.3 in validation), 09-non-functional. |

---

## Gaps that were addressed

### 1. **$file (file storage)** — was under-covered

- **Gap:** No explicit questions like “Does the app upload/download/list/delete files? Paths? Visibility (PUBLIC/PRIVATE)?” and no PRD section for file operations.
- **Risk:** File-heavy apps (exports, attachments, assets) had no place to document paths or which handlers use getUploadUrl/getDownloadUrl/delete/list.
- **Change:** Added questions in **Data** (file usage, paths, visibility) and a **File storage ($file)** section in 07-data-model; validation item for $file when used.

### 2. **$schedule (scheduled jobs)** — was implicit only

- **Gap:** $schedule was mentioned in 06 and 09 but there was no structured place to list jobs (name, type ONE_TIME/CRON/RECURRING, target function, schedule).
- **Risk:** Apps with cron or delayed jobs didn’t have PRD space to specify which function runs when.
- **Change:** Added questions in **Features/Data** (scheduled jobs, type, target function) and a **Scheduled jobs ($schedule)** section in 06 or 08; validation item for $schedule when used.

### 3. **$next (function chaining)** — was implicit only

- **Gap:** No place to document “Function A calls $next.run({ functionName: 'B', payload, delay })” — i.e. which handlers invoke which other functions and with what payload/delay.
- **Risk:** Chained or orchestrated flows were not explicitly specified in the PRD.
- **Change:** Added a question (chained/orchestrated flows, which function calls which) and a **Function chaining ($next)** section (caller, target function, payload/delay) in 08-api-contracts or 06; validation item when $next is used.

### 4. **Per-handler SDK usage** — was high-level only

- **Gap:** Templates don’t require “Handler X uses $db.map.get; Handler Y uses $http.request and $next.run.”
- **Risk:** Implementers might miss that a given handler must use $file or $schedule; no single place to verify SDK usage per function.
- **Change:** Optional “SDK usage” column or a short **Backend SDK usage** subsection in 06 or 08 listing per function: $db / $http / $file / $next / $schedule (and which keys/operations where relevant). Validation can require “If app uses $file/$schedule/$next, corresponding section is filled.”

### 5. **Workflow placeholders**

- **Gap:** Step 2 listed {{backend_api_functions}}, {{storage_keys}}, {{db_types}} but not {{file_paths}}, {{scheduled_jobs}}, {{next_invocations}}.
- **Change:** PRD generation workflow Step 2 updated so filling the template includes file storage, scheduled jobs, and $next usage when applicable.

### 6. **Validation checklist**

- **Gap:** 4.3 only said “long-running/chained uses $schedule or $next” without “and they are documented.”
- **Change:** Added explicit checks: if app uses $file → file storage section filled; if app uses $schedule → scheduled jobs listed with name, type, target function; if app uses $next → chained calls documented.

---

## Summary: will this create a proper PRD for an Appnest app?

- **Before changes:** For “standard” apps (API + events + $db + $http), the generator already produced a solid PRD. For apps using **$file**, **$schedule**, or **$next**, the PRD did not systematically capture how those SDK functions are used, so implementation could be incomplete or inconsistent.
- **After changes:** The generator is intended to cover:
  - **Backend functionalities:** All invokable functions (API + events), their payloads/returns, and optionally per-handler SDK usage.
  - **Data and storage:** What data is stored, where ($db key patterns, types), plus a dedicated **File storage ($file)** section when the app uses files.
  - **$db:** Entities, key patterns, $db types (already in place).
  - **$file:** When used: paths, visibility, operations (upload/download/list/delete), and which handlers use them.
  - **$schedule:** When used: each job’s name, type (ONE_TIME/CRON/RECURRING), target function, and schedule.
  - **$next:** When used: which function calls which, payload shape, and delay.
  - **Manifest:** backend_api_functions, event_listener_functions, installation_params, oauth_config, whitelisted_domains (already in place).

Running the question framework in order, filling all template sections (including the new ones), and passing the validation checklist (including the new items) should produce a PRD that is **ready to build** an Appnest app with full coverage of backend behaviour, data storage, and SDK usage ($db, $http, $file, $schedule, $next).
