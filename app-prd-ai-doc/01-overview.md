# Survey Response CSV Import — Overview

## Product name

Survey Response CSV Import (working title: **Survey CSV Importer**)

## Vision (elevator pitch)

An AppNest full-page application that lets SurveySparrow customers **import historical or external survey responses from a CSV file** into a chosen SurveySparrow survey. Users upload and preview data, pick a survey, map CSV columns to survey questions with validation, then run a **reliable, observable import** that creates responses via SurveySparrow’s public API—with clear errors, retries where appropriate, and progress feedback.

## Scope for v1

Deliver a single cohesive import workflow inside the AppNest host (SurveySparrow): CSV in → mapping → validated API submission → status and outcomes. No generic ETL product; focus on one survey per import session and batch row processing with auditing of failures.

- **In scope:**
  - CSV upload, server-side parse, and tabular preview (headers + sample rows)
  - List surveys and select target survey (SurveySparrow public API)
  - Load survey structure (questions / answer fields) for the selected survey
  - Column-to-field mapping UI with required-field validation and type/coercion hints where the API allows
  - Backend orchestration to transform each row into API payloads and create submissions/responses
  - Per-row and aggregate error reporting; import job progress (queued, running, completed, failed)
  - Credentials via AppNest installation (e.g. SurveySparrow API key); outbound calls only to whitelisted domains

- **Out of scope (v1):**
  - Scheduling/recurring imports (unless implemented later with `$schedule`)
  - Multi-survey mapping templates shared across workspaces (can be Phase 2)
  - Direct editing of SurveySparrow survey definition from this app
  - Non-CSV sources (Excel native, Google Sheets API)
  - Advanced deduplication beyond documented idempotency strategy (see 09-non-functional-requirements)

## Success criteria

- A typical admin can complete **upload → map → import** without leaving the app, for a CSV of at least hundreds of rows, with **visible progress** and a **downloadable or on-screen error report** for failed rows.
- **No silent data loss:** every row ends as success, skipped (with reason), or failed (with reason); totals reconcile.
- **API errors** are surfaced in human-readable form; rate limits do not corrupt batch state when retried.
- App passes AppNest governance: Twigs-only UI, Appnest Functions on backend, manifest consistency.

## AppNest context

- This app runs on the **AppNest** framework. Backend entry: `app-backend/server.js` (exported functions only). Frontend entry: `app-frontend/src/App.jsx`. All backend I/O uses **Appnest Functions** (`$db`, `$fetch`, `$file`, `$next`, `$schedule`; `getTraceId` for logging). See `appnest-ai-context/appnest-governance/appnest-functions/` for reference.
- Parent product: **SurveySparrow**; outbound HTTP to **`https://api.surveysparrow.com`** must appear in `manifest.json` → `whitelisted_domains`.
