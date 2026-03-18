# SurveySparrow → Slack Response Sender — Overview

## Product name

SurveySparrow → Slack Response Sender (Appnest App)

## Vision (elevator pitch)

A lightweight Appnest app that lets workspace users pick a SurveySparrow survey, paste a Slack Incoming Webhook URL, and push the **latest five responses** into a Slack channel—so teams see feedback without manually checking SurveySparrow.

## Scope for v1

Single full-page UI: load surveys from SurveySparrow (server-side, using a configured API token), select one survey, enter webhook URL, send formatted summary to Slack. No persistence of responses, scheduling, analytics, or response filtering.

- **In scope:**  
  List surveys (dropdown); enter Slack webhook per action; fetch latest 5 responses for selected survey; format and POST to Slack; clear error states (API failure, empty responses, invalid webhook, rate limit).

- **Out of scope (v1):**  
  Storing responses in $db or elsewhere; scheduled sends; analytics/dashboards; filtering or paging beyond latest 5; OAuth for SurveySparrow (v1 uses API token via installation params).

## Success criteria

- User can open the app and see surveys loaded from SurveySparrow (or a clear error if the API fails).
- User can select a survey, enter a webhook URL, and click **Send Latest Responses**.
- Latest up to 5 responses appear as a single formatted message in the target Slack channel.
- Slack webhook URL is never logged; masked if ever surfaced in UI diagnostics.

## AppNest context

- This app runs on the **AppNest** framework. Backend entry: `app-backend/server.js` (exported functions only). Frontend entry: `app-frontend/src/App.jsx`. All backend I/O uses the AppNest SDK ($db, $http, $file, $next, $schedule). See `appnest-tools/appnest-governance/` for full reference.
