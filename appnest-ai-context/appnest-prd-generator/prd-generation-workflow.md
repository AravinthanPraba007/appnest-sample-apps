# PRD Generator — Generation Workflow

Step-by-step execution to turn an app idea and question answers into a complete, AppNest-aligned PRD and a final build status.

---

## When you run this workflow — output is PRD only, not code

**This workflow produces PRD documents (markdown files) only.** When the user tags this file and provides an app idea or detailed PRD, your **only** task is to produce the structured PRD document set (filled templates). You are **not** being asked to implement the app.

**Do NOT do any of the following when the user tagged this workflow and gave a PRD/idea:**

- Do **not** create an implementation task list (e.g. "Backend: add getSurveys…", "Frontend: Survey list page…", "Update manifest.json and frontend styles").
- Do **not** think or plan in terms of "Implementing [App Name] per the PRD" or "starting implementation." That is the wrong task when this workflow is tagged.
- Do **not** "review existing app structure" for the purpose of writing code. If you review anything, it is only to fill or validate the PRD templates.
- Do **not** generate application code (e.g. `server.js`, `App.jsx`, components, CSS, `manifest.json` edits) or any implementation steps.

**Do this instead:**

1. Treat the user's message as **input to the PRD generator**: either a raw idea (then run Step 1 to clarify) or a detailed PRD (then use it as answers and go to Step 2).
2. Execute **Steps 1–5 only**: clarify (if needed), fill every template file from [prd-template/](prd-template/), validate, run architecture alignment, then output **READY TO BUILD APP** or **CLARIFICATION REQUIRED**.
3. Deliver the **PRD content**: the filled markdown files (01–11) in a folder like `app-prd-ai-doc/` or as markdown in your response. No code.

**When is implementation allowed?** Only when the user **explicitly** asks for it in a **separate** request (e.g. "now implement it" or "generate the app from this PRD") after the PRD is complete. Tagging this workflow + providing a PRD/idea means "produce the PRD documents," not "build the app."

---

## Step 1: Clarify the idea

**Input:** Raw app idea (paragraph or bullets).

**Actions:**

1. Parse the idea for: product name (or working title), primary user, core action (e.g. "sync responses to X"), and whether it's event-driven, API-driven, or both.
2. Run the [question-framework.md](question-framework.md) in order: Vision → Users → Features → Data → Permissions → Integrations → Non-functional → Monetization (if relevant).
3. Apply "when to ask deeper" logic for any vague or high-impact answer (sync, OAuth, high volume, multiple roles).
4. Capture all answers in a single working document (e.g. "PRD answers" section or structured notes).

**Exit condition:** No critical ambiguity remains for scope, primary user, core features, and where data lives (AppNest $db vs external). If critical ambiguity remains → stop and output **CLARIFICATION REQUIRED** with the open questions; do not proceed to Step 2 until resolved.

---

## Step 2: Fill the template

**Input:** Completed answers from Step 1; [appnest-governance/](../appnest-governance/) references.

**Actions:**

1. Copy each file under [prd-template/](prd-template/) into the target PRD folder (e.g. `app-prd-ai-doc/`).
2. Replace every placeholder with the corresponding answer:
   - `{{product_name}}`, `{{elevator_pitch}}`, `{{scope_v1}}`, `{{success_criteria}}`
   - `{{primary_persona}}`, `{{user_goal}}`, `{{pain_points}}`
   - `{{core_features}}`, `{{configuration_items}}`, `{{platform_events}}`
   - `{{core_entities}}`, `{{storage_keys}}`, `{{db_types}}`
   - `{{backend_api_functions}}`, `{{event_listener_functions}}`, `{{installation_params}}`, `{{oauth_config}}`, `{{whitelisted_domains}}`
   - If the app uses **$file**: fill file storage section in 07-data-model (paths, visibility, operations, handlers).
   - If the app uses **$schedule**: fill scheduled jobs table in 08-api-contracts (name, type, target function, schedule).
   - If the app uses **$next**: fill function chaining table in 08-api-contracts (caller, target function, payload, delay).
   - If the app has a **full-page UI**: fill **11-ui-screens.md** (screens overview, and for each screen: purpose, entry, layout using Stack/Box, **exact Twigs component names** for every control and block—Button, Select, Input, Alert, Table, Spinner, Text, etc.—and actions with functionName, data shown, empty/loading/error using Twigs). State that implementation **MUST** use only Twigs for that screen (no raw HTML). Optionally set **Screen(s)** in 04-user-flows. Before marking READY TO BUILD, ensure 11-ui-screens and the checklist require Twigs-only UI and layout.
   - `{{mvp_scope}}`, `{{milestones}}`
3. In `06-technical-architecture.md`, ensure:
   - Backend entry is **`app-backend/server.js`** and only exported functions are invokable.
   - Frontend entry is **`app-frontend/src/App.jsx`**; backend is called via **`window.appnestClientFunctions.appBackend.invoke({ apiFunctionName, payload })`**.
   - All I/O uses AppNest SDK ($db, $http, $file, $next, $schedule); no axios/fetch; no adding SDK to backend package.json; no react/react-dom in frontend package.json.
   - UI components use **`@sparrowengg/twigs-react`** and **`@sparrowengg/twigs-react-icons`**; in package.json use version **`"*"`** (latest), not a fixed version that may not exist (e.g. ^2.0.0). See appnest-governance/04-frontend/07-Twigs-UI-Reference.md.
4. In `08-api-contracts.md`, ensure every backend function and event handler is named and matches the manifest schema (backend_api_functions, event_listener_functions).
5. In `07-data-model.md`, ensure every persistent entity has a storage strategy and key pattern using $db types (string, number, list, map, boolean).

**Exit condition:** Every template file is filled; no placeholder remains; technical sections explicitly reference AppNest entry points and SDK usage. If a placeholder cannot be filled from answers → list it and output **CLARIFICATION REQUIRED** before Step 3.

---

## Step 3: Validate completeness

**Input:** Filled PRD (all template sections, including 11-ui-screens when the app has a full-page UI).

**Actions:**

1. Run the [validation-checklist.md](validation-checklist.md) in full.
2. For each checklist item, mark Pass / Fail / N/A with a short reason.
3. Collect all Fail and "unclear" items into a single list.

**Exit condition:** If any item is Fail or unclear → output **CLARIFICATION REQUIRED** and the list of failed/unclear items; optionally return to Step 1 for those points. If every required item is Pass (or N/A with justification) → proceed to Step 4.

---

## Step 4: Architecture alignment check

**Input:** Filled PRD; governance docs: [01-architecture/03-Entry-Points-and-Implementation.md](../appnest-governance/01-architecture/03-Entry-Points-and-Implementation.md), [02-sdk/04-AppNest-SDK-Usage-Rules.md](../appnest-governance/02-sdk/04-AppNest-SDK-Usage-Rules.md), [02-sdk/BackendAppnestFunction-Reference.md](../appnest-governance/02-sdk/BackendAppnestFunction-Reference.md), [02-sdk/06-Manifest-Rules.md](../appnest-governance/02-sdk/06-Manifest-Rules.md), [03-integration-standards/07-External-API-Standards.md](../appnest-governance/03-integration-standards/07-External-API-Standards.md), [01-architecture/01-Architecture-Principles.md](../appnest-governance/01-architecture/01-Architecture-Principles.md).

**Actions:**

1. **Entry points:** Confirm backend has only one entry (server.js exports); frontend has only one root (App.jsx); no custom routes/controllers.
2. **SDK usage:** Confirm all external HTTP use $http; all persistent state use $db; long-running/chained work use $schedule or $next; no axios/fetch; handlers return ResultData or plain object; no SDK in backend package.json. If the app uses $file, $schedule, or $next, confirm the corresponding PRD section (07 file storage, 08 scheduled jobs, 08 function chaining) is filled.
3. **Manifest:** Confirm every invokable backend function is in backend_api_functions; every event handler in event_listener_functions; OAuth and installation_params match schema; whitelisted_domains cover all external hosts.
4. **Frontend:** Confirm no react/react-dom in frontend package.json; UI uses Twigs (twigs-react, twigs-react-icons) where applicable. If the app has a full-page UI, confirm 11-ui-screens.md is filled and each screen's actions reference functionNames from backend_api_functions.
5. **External APIs:** Confirm idempotency and retries are specified where the app pushes data; secrets only via installation_params or oauth_config; 429/retry and error handling mentioned.

**Exit condition:** If any alignment item fails → document the gap and output **CLARIFICATION REQUIRED**. If all pass → proceed to Step 5.

---

## Step 5: Output final status

**Input:** Result of Step 3 (completeness) and Step 4 (architecture alignment).

**Actions:**

1. If **all** of the following are true:
   - Step 3: every validation checklist item is Pass (or justified N/A),
   - Step 4: all architecture alignment checks pass,
   - No open questions that block implementation,

   then output:

   **READY TO BUILD APP**

   Optionally append: PRD location (e.g. `app-prd-ai-doc/`), and a one-line summary (e.g. "Backend: X functions, Y events; Frontend: full-page app; Storage: Z $db keys").

2. If **any** of the above is false, output:

   **CLARIFICATION REQUIRED**

   and list:
   - Failed or unclear validation checklist items,
   - Failed architecture alignment items,
   - Open questions that must be resolved before build.

---

## Summary

| Step | Name                     | Exit condition |
|------|--------------------------|----------------|
| 1    | Clarify idea             | Answers sufficient; no critical ambiguity, or **CLARIFICATION REQUIRED** |
| 2    | Fill template            | All placeholders replaced; AppNest sections correct, or **CLARIFICATION REQUIRED** |
| 3    | Validate completeness    | All checklist items Pass/justified N/A, or **CLARIFICATION REQUIRED** |
| 4    | Architecture alignment   | All alignment checks pass, or **CLARIFICATION REQUIRED** |
| 5    | Output final status      | **READY TO BUILD APP** or **CLARIFICATION REQUIRED** with list |

The workflow is **reusable**: repeat for any new app idea using the same question framework, templates, and validation checklist.

---

## After the PRD is ready

Once you have **READY TO BUILD APP** and the filled PRD documents:

- **To build the app:** Ask explicitly for implementation (e.g. “implement from this PRD” or “generate the app”). Code generation is a separate step and uses the PRD as input; it is not part of this workflow.
- **To understand generator coverage:** Optionally read [PRD-GENERATOR-ASSESSMENT.md](PRD-GENERATOR-ASSESSMENT.md) to see what the generator covers (backend, $db, $file, $schedule, $next, manifest) and what gaps were addressed. Useful when improving the generator or onboarding; not required to run this workflow or to implement an app.
