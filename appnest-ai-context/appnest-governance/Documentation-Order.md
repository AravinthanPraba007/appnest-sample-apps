# Recommended documentation order

Folders and files under `appnest-governance/` are **not** numbered. Use this list as the **canonical reading order** for onboarding, implementation, and AI-assisted work.

## 1. Orientation

1. [Appnest-App-Development-Guide.md](Appnest-App-Development-Guide.md) — app structure, fixed entries (`server.js`, `App.jsx`), **`manifest.json`** wiring, **`invoke`**, Twigs overview, validate/pack, example tree, try/catch.

## 2. Execution and flows

2. [Appnest-Execution-Flows.md](Appnest-Execution-Flows.md) — trigger → handler → SDK → `ResultData`, principles (statelessness, determinism, safety), operation types, long-running definition.

## 3. appnest-functions (SDK)

3. [appnest-functions/Appnest-Functions.md](appnest-functions/Appnest-Functions.md) — backend vs frontend overview.  
4. [appnest-functions/Backend-Appnest-Functions.md](appnest-functions/Backend-Appnest-Functions.md) — `$db`, `$fetch`, `$file`, `$next`, `$schedule`, `getTraceId`, `ResultData`.  
5. [appnest-functions/Frontend-Appnest-Functions.md](appnest-functions/Frontend-Appnest-Functions.md) — `client.js`, `window.AppnestFunctions`.

## 4. app-configuration

6. [app-configuration/Manifest-Rules.md](app-configuration/Manifest-Rules.md) — `manifest.json` schema and rules (use for code generation).

## 5. Frontend (read before generating UI)

7. [App-Frontend-Rules.md](App-Frontend-Rules.md) — **read first** for any UI work (enforced for AI).  
8. [Twigs-UI-Reference.md](Twigs-UI-Reference.md) — Twigs `package.json` versions and HTML → Twigs mapping (use with App-Frontend-Rules).

## 6. Integration & pre-ship checklist

9. [Code-Review-and-AI-Generation-Checklist.md](Code-Review-and-AI-Generation-Checklist.md) — **external API standards** (idempotency, errors, rate limits, retries, secrets) and **full review checklist** (runtime, SDK, manifest, entries, Twigs, AI). Read the External API section before outbound **`$fetch`** work; run the whole checklist before merge.

---

**Full document index (same order):** [README.md](README.md).
