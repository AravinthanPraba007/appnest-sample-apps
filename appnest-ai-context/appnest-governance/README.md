# Sample Appnest App — Documentation

Frontend and backend app on the **Appnest** framework. All documentation is managed here.

**Start here:** [Appnest-App-Development-Guide.md](Appnest-App-Development-Guide.md) — app structure, entries, **`manifest.json`** wiring, backend/frontend how-to, engine workflow, and links to full docs.

**Recommended reading order:** [Documentation-Order.md](Documentation-Order.md) — numbered sequence (folders and files are not prefixed with numbers).

---

## Appnest Governance

Standards and reference for Appnest apps: **execution flows**, **appnest-functions**, manifest (**app-configuration**), frontend rules, and **review checklist** (includes external API standards). Use for code review, AI-assisted generation, and compliance.

## Document index

| Section | Document | Purpose |
|--------|----------|---------|
| **Orientation** | [Appnest-App-Development-Guide.md](Appnest-App-Development-Guide.md) | Structure, `server.js` / `App.jsx`, manifest wiring, `invoke`, Twigs overview, validate/pack, example tree |
| **Development engine** | [Appnest-Development-Engine.md](appnest-development-engine/Appnest-Development-Engine.md) | NPM CLI package overview and local dev model |
| | [Appnest-Development-Engine-Commands.md](appnest-development-engine/Appnest-Development-Engine-Commands.md) | `app init`, `start`, `validate`, `pack`, and related commands |
| **Execution and flows** | [Appnest-Execution-Flows.md](Appnest-Execution-Flows.md) | Trigger → handler → SDK → `ResultData`, principles, operation types, long-running flows |
| **appnest-functions** | [Appnest-Functions.md](appnest-functions/Appnest-Functions.md) | Overview: backend/frontend AppnestFunctions; links to detailed references |
| | [Backend-Appnest-Functions.md](appnest-functions/Backend-Appnest-Functions.md) | Full SDK reference (import, $db, $fetch, $file, $next, $schedule, getTraceId) |
| | [Frontend-Appnest-Functions.md](appnest-functions/Frontend-Appnest-Functions.md) | Client bridge: `client.js`, `window.AppnestFunctions` ($check, $appBackend, $productParent) |
| **app-configuration** | [Manifest-Rules.md](app-configuration/Manifest-Rules.md) | Manifest rules + full schema (code-generation) |
| **Frontend (read before generating UI)** | [App-Frontend-Rules.md](App-Frontend-Rules.md) | **Enforced** frontend rules: entry, backend invoke, Twigs only, responsive, SaaS “wow”, structure, checklist. Pair with Twigs reference below. |
| **Twigs (lookup)** | [Twigs-UI-Reference.md](Twigs-UI-Reference.md) | `package.json` Twigs versions and HTML → Twigs mapping table (read after App-Frontend-Rules). |
| **Integration & pre-ship checklist** | [Code-Review-and-AI-Generation-Checklist.md](Code-Review-and-AI-Generation-Checklist.md) | External API standards + pre-ship / AI review checklist (runtime, SDK, manifest, Twigs) |
