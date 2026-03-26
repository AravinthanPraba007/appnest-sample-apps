# Core Capability Lab — Overview

## Product name

**Core Capability Lab** (working title)

## Vision (elevator pitch)

A lightweight full-page AppNest application that lets internal users **trigger, observe, and verify** core platform capabilities—file I/O, persistent storage, outbound HTTP, scheduled jobs, and dependent function execution—in one place, with **tabbed modules**, **persisted run history**, and a **single reset** to a clean state.

## Scope for v1

Deliver a **single full-page app** used to validate that AppNest primitives behave as expected in a real installation. Each capability area is **independently testable** from the UI. No production customer-facing workflows.

- **In scope:**

  - Five functional modules: **File operations**, **Data storage & retrieval**, **Network requests**, **Scheduled execution**, **Sequential / chained functions** (`$next`).
  - **Tab-based UI** (Twigs only); each tab exposes triggers and shows the latest result for that module.
  - **Execution log** persisted in `$db` (append-only run records with module id, timestamp, status, summary payload).
  - **Clear all lab data**: remove log entries, demo keys, and lab-scoped `$file` objects where applicable.
  - Backend implemented only via **`app-backend/server.js`** exports using **`$db`**, **`$fetch`**, **`$file`**, **`$schedule`**, **`$next`** (no axios/fetch).

- **Out of scope (v1):**

  - Automated test suites, CI integration, or load testing.
  - Platform event subscriptions (e.g. `onSubmissionComplete`)—not required to validate these primitives.
  - OAuth flows or third-party integrations beyond a **single whitelisted** HTTP GET for the network demo.
  - Custom installation UI (`app-install-frontend`).
  - Multi-tenant or role-based access beyond standard app install permissions.

## Success criteria

1. Each functional module can be **triggered from the UI** and completes with a **visible result** (success or structured error).
2. Users can **switch between tabs** without losing context; latest module result and **global execution log** remain coherent.
3. Run outcomes are **stored in `$db`** and visible after refresh / re-open (until cleared).
4. **Clear all** reliably removes documented `$db` keys and lab `$file` paths so the next cycle starts clean.
5. **Manifest** lists every invokable function; **whitelisted_domains** covers the network demo host.

## AppNest context

- This app runs on the **AppNest** framework. Backend entry: `app-backend/server.js` (exported functions only). Frontend entry: `app-frontend/src/App.jsx`. All backend I/O uses the AppNest SDK (`$db`, `$fetch`, `$file`, `$next`, `$schedule`). See `appnest-ai-context/appnest-governance/` for full reference.
