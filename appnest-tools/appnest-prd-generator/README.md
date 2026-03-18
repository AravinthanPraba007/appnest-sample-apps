# PRD Generator

A **reusable internal tool** to turn an app idea into a production-ready Product Requirements Document (PRD) in Markdown, with strict alignment to the **AppNest framework** (see `appnest-tools/appnest-governance/`).

---

## Purpose

- **Input:** A high-level app idea (e.g. “Sync survey responses to Microsoft Fabric”).
- **Process:** Structured follow-up questions → fill reusable PRD templates → validate against AppNest.
- **Output:** A complete PRD (set of markdown files) and a final status: **READY TO BUILD APP** or **CLARIFICATION REQUIRED**.

The generator does **not** produce a PRD for one specific idea; it defines the **system** (questions, templates, workflow, validation) used to generate PRDs for any app idea.

---

## How to use

1. **Start with an idea**  
   Provide a short description of the app (one paragraph or a few bullets).

2. **Run the question framework**  
   Use [question-framework.md](question-framework.md) to ask structured follow-up questions in order: Vision → Users → Features → Data → Permissions → Integrations → Non-functional → Monetization. Use the “when to go deeper” logic to decide if more questions are needed.

3. **Fill the PRD template**  
   Use the templates under [prd-template/](prd-template/) and replace placeholders (e.g. `{{product_name}}`, `{{core_entities}}`) with answers from the idea + follow-up answers. Reference `appnest-tools/appnest-governance/` for AppNest-specific sections (entry points, SDK, manifest, UI libraries).

4. **Execute the PRD generation workflow**  
   Follow [prd-generation-workflow.md](prd-generation-workflow.md) step by step: clarify idea → fill template → validate completeness → architecture alignment → final status.

5. **Run the validation checklist**  
   Use [validation-checklist.md](validation-checklist.md). If every item passes → output **READY TO BUILD APP**. If any item fails or is unclear → output **CLARIFICATION REQUIRED** and list what’s missing.

---

## Input format

- **Idea:** Free-form text (paragraph or bullets).
- **Optional:** Product name, target user type, and whether the app is event-driven, API-only, or both.

No strict schema; the question framework will gather the rest.

---

## Output structure

After generation, the PRD lives as a set of markdown files (can be under a product-specific folder, e.g. `docs/prd-{{product_name}}/`):

| File | Content |
|------|--------|
| `01-overview.md` | Product name, vision, scope, success criteria |
| `02-problem-statement.md` | Problem, users affected, current gaps |
| `03-user-personas.md` | Personas, goals, pain points |
| `04-user-flows.md` | Key flows (with triggers and outcomes) |
| `05-feature-requirements.md` | Features, acceptance criteria, priority |
| `06-technical-architecture.md` | AppNest alignment, entry points, backend/frontend, manifest |
| `07-data-model.md` | Entities, storage ($db usage), keys |
| `08-api-contracts.md` | Backend API functions, event listeners, payloads |
| `09-non-functional-requirements.md` | Performance, security, external API standards |
| `10-milestones.md` | MVP scope, phases, dependencies |
| `11-ui-screens.md` | UI screens (when full-page app): per-screen purpose, entry, layout, actions with functionName, data shown, empty/loading/error |

---

## When the tool outputs “READY TO BUILD APP”

The tool outputs:

**READY TO BUILD APP**

only when **all** of the following are true (see [validation-checklist.md](validation-checklist.md)):

- No open or ambiguous questions that block build.
- All backend API functions and event listeners are named and declared (manifest-ready).
- Core entities and storage keys are defined and mapped to $db usage.
- AppNest architecture is followed (entry points, SDK usage, manifest, no forbidden deps, Twigs for UI).
- MVP is clearly scoped and reflected in milestones.

If any of the above is false or unclear, the tool outputs:

**CLARIFICATION REQUIRED**

and lists which checklist items failed or need clarification.

---

## AppNest alignment

The generator and templates assume:

- **Backend:** `app-backend/server.js` is the single entry; only exported functions are invokable. All I/O uses AppNest SDK ($db, $http, $file, $next, $schedule); no axios/fetch; no adding SDK package to `package.json`.
- **Frontend:** `app-frontend/src/App.jsx` is the root; backend is called via `window.appnestClient.backend.invoke({ functionName, payload })`. React/react-dom are platform-provided; UI built with `@sparrowengg/twigs-react` and `@sparrowengg/twigs-react-icons`.
- **Manifest:** Every invokable backend function is listed in `backend_api_functions`; every event handler in `event_listener_functions`; OAuth and installation params declared as per manifest schema.
- **Governance:** Details are in `appnest-tools/appnest-governance/` (entry points, SDK reference, SDK usage rules, manifest rules, external API standards, architecture principles).

Use the PRD generator together with the governance docs so that every generated PRD is **ready to build** on AppNest.
