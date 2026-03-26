# PRD Generator — Question Framework

Structured follow-up questions to go from an app idea to a complete, buildable PRD. Ask in order; use the **When to ask deeper** logic to decide if you need more detail.

---

## 1. Vision

| # | Question | Notes |
|---|----------|--------|
| V1 | What is the **product name** (or working title)? | Use for `{{product_name}}`. |
| V2 | In one sentence, what does this app **do** for the user? | Elevator pitch. |
| V3 | What is the **scope** for v1? (e.g. single integration, one workflow, one persona) | In / out of scope. |
| V4 | How will we know it’s **successful**? (e.g. “X syncs per day”, “User can do Y without leaving the product”) | Success criteria. |

**When to ask deeper:** If the idea is vague (e.g. “make things better”), ask for one concrete user outcome and one measurable success criterion before moving on.

---

## 2. Users

| # | Question | Notes |
|---|----------|--------|
| U1 | Who is the **primary user**? (role, context: e.g. survey admin, support agent) | Primary persona. |
| U2 | What is their **main goal** when using this app? | Single primary goal. |
| U3 | What **pain** does this app solve for them today? | Problem statement. |
| U4 | Are there **secondary users** or roles that need different flows? | Yes/no + brief. |

**When to ask deeper:** If multiple roles are mentioned, ask: “For v1, which single role are we building for first?” and document others as “future.”

---

## 3. Features

| # | Question | Notes |
|---|----------|--------|
| F1 | What are the **3–5 core features** for v1? (one line each) | MVP feature list. |
| F2 | For each core feature: what does the user **do** (action) and what do they **see** (outcome)? | Actions + outcomes. |
| F3 | Does the app need a **UI** (full-page app), or only **backend** (events/API)? Or both? | Drives frontend_locations + backend_api_functions. |
| F4 | Are there **configurable settings** (e.g. mappings, filters, toggles) the user must set? List them. | Configuration / installation_params. |
| F5 | Does the app react to **platform events** (e.g. submission complete, contact created)? Which ones? | event_listener_functions. |
| F6 | If the app has a **full-page UI**: how many **main screens/views** are there? List each screen **name** and **one-line purpose**. | 11-ui-screens overview; screens should align with user flows. |
| F7 | For each screen: **how does the user reach it**? **Layout/sections** (use Stack, Box)? **Exact Twigs components** per element (Button, Select, Input, Alert, Table, Spinner, Text—no raw HTML). **User actions** and which **backend functionName** each calls? **Data shown** (source)? **Empty/loading/error** using Twigs (Text, Spinner, Alert)? Implementation must use **only** Twigs for that screen. | 11-ui-screens per-screen spec; tie actions to 08-api-contracts; see `appnest-governance/App-Frontend-Rules.md` and `appnest-governance/Twigs-UI-Reference.md`. |

**When to ask deeper:** If “sync” or “integration” is mentioned, ask: real-time (event-driven) vs batch vs both, and what “success” looks like (e.g. row in external system, no duplicates).

---

## 4. Data

| # | Question | Notes |
|---|----------|--------|
| D1 | What **entities** does the app manage? (e.g. mapping, sync job, config) | Core entities for 07-data-model. |
| D2 | For each entity: what **fields** are required? What is the **natural key** (e.g. surveyId + mappingId)? | Fields + keys. |
| D3 | Where is data **stored**? (Only AppNest $db, or also external system?) | $db usage + external systems. |
| D4 | What **$db types** will you use per key pattern? (e.g. string for JSON blob, map for key-value, list for arrays) | Align with SDK: string, number, list, map, boolean. |
| D5 | Is there any **sensitive data**? How is it handled? (installation_params, oauth, no hardcoding) | Secrets in manifest only. |
| D6 | Does the app **upload, download, list, or delete files**? If yes: what **paths** or path patterns? **Visibility** (PUBLIC vs PRIVATE)? Which handlers use $file (getUploadUrl, getDownloadUrl, delete, list, exists)? | File storage ($file); 07-data-model file section. |
| D7 | Does the app need **scheduled jobs** (cron, one-time, recurring)? For each: **name**, **type** (ONE_TIME / CRON / RECURRING), **target function** (export name from server.js), **schedule** (e.g. cron expression, runAt, or repeat)? | Scheduled jobs ($schedule); 08 or 06. |
| D8 | Does any handler **invoke another function** via $next? If yes: **caller function**, **target function name**, **payload shape**, **delay** (seconds)? | Function chaining ($next); 08-api-contracts. |

**When to ask deeper:** If the app “pushes” data elsewhere, ask: idempotency (how duplicates are avoided), retries, and whether external IDs are stored in $db. If the app uses files, ask: path naming convention and who generates paths (user vs app).

---

## 5. Permissions

| # | Question | Notes |
|---|----------|--------|
| P1 | Does the app need **installation-time** config? (API keys, URLs, tenant IDs, etc.) | installation_params. |
| P2 | Does the app need **OAuth** to access a third-party service? Which provider? | oauth_config + whitelisted_domains. |
| P3 | Are there **scopes or permissions** the app needs from the parent product or external API? List them. | Scopes, API permissions. |
| P4 | Who can **see** or **change** app data? (e.g. same as parent product, per-workspace) | Access model. |

**When to ask deeper:** If OAuth is yes, ask: token refresh strategy, and whether refresh is scheduled ($schedule) or on-demand.

---

## 6. Integrations

| # | Question | Notes |
|---|----------|--------|
| I1 | Which **external systems** does the app call? (APIs, webhooks, OAuth providers) | External dependencies. |
| I2 | For each: **purpose** (read/write), **auth** (API key, OAuth, none), **rate limits**? | Contract + auth + limits. |
| I3 | Which **domains** must be whitelisted for the app to work? (API base URLs, OAuth hosts) | whitelisted_domains. |
| I4 | Are **idempotency** and **retries** required? (e.g. no duplicate rows, 429 backoff) | External API standards. |

**When to ask deeper:** If “sync” or “push” is involved, ask: max payload size, batching strategy, and how partial failures are handled.

---

## 7. Non-functional requirements

| # | Question | Notes |
|---|----------|--------|
| N1 | **Latency** expectations? (e.g. event handler &lt; 30s, API &lt; 10s) | Timeouts in manifest. |
| N2 | **Volume** expectations? (e.g. events/day, API calls/day) | Scale. |
| N3 | **Availability** / reliability needs? (e.g. retries, alerts on repeated failure) | Error handling, alerts. |
| N4 | Any **compliance** or **security** constraints? (e.g. no PII in logs, secrets only in installation_params) | Security, governance. |

**When to ask deeper:** If volume is “high,” ask: whether long-running work is split with $next or $schedule and how timeouts are set.

---

## 8. Monetization (optional)

| # | Question | Notes |
|---|----------|--------|
| M1 | Is this app **free** or **paid** in v1? | Pricing model. |
| M2 | If paid: what is the **unit** (e.g. per workspace, per sync)? | Licensing. |
| M3 | Any **usage caps** or **feature gates**? | Limits, tiers. |

**When to ask deeper:** Only if the idea explicitly mentions pricing or tiers; otherwise mark “N/A for v1.”

---

## Logic: When to ask deeper

- **Vision:** Idea is vague → ask for one concrete user outcome and one measurable success criterion.
- **Users:** Multiple roles → ask which single role is v1; document rest as future.
- **Features:** “Sync” or “integration” → clarify real-time vs batch, success definition, duplicate handling. Full-page UI → clarify main screens and, for each screen, actions and backend functionName.
- **Data:** “Pushes data out” → clarify idempotency, retries, external ID storage. Files → path convention and visibility. Scheduled/chained work → which function runs when, and which function calls which via $next.
- **Permissions:** OAuth → clarify token refresh (scheduled vs on-demand).
- **Integrations:** Sync/push → clarify payload size, batching, partial failure handling.
- **NFRs:** High volume → clarify $next/$schedule and timeout strategy.
- **Monetization:** Only if pricing/tiers are part of the idea.

Use answers to fill [prd-template/](prd-template/) and then run [validation-checklist.md](validation-checklist.md). When all checks pass → **READY TO BUILD APP**; otherwise → **CLARIFICATION REQUIRED** with the list of open items.
