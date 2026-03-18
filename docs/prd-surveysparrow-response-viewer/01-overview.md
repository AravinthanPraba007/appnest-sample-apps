# SurveySparrow Response Viewer — Overview

## Product name

SurveySparrow Response Viewer

## Vision (elevator pitch)

A lightweight web application that provides a simple and intuitive interface for exploring survey responses using the SurveySparrow Public API—enabling users to list surveys, select one, fetch and browse submissions with pagination, and access backed-up response files for download, without interacting with APIs directly.

## Scope for v1

- **In scope:**
  - List all available surveys from the SurveySparrow account (with cached survey list in DB and manual Sync).
  - Select a survey and navigate to its responses.
  - Fetch and display survey submissions (paginated, 10 per page) with response ID, respondent info, submission date, and question–answer pairs.
  - Pagination controls (Next, Previous, page indicator).
  - Periodic backup of responses to files; list of backup files; download backup files.
  - Clean, responsive UI; backend proxy for all SurveySparrow API calls; API keys stored securely via installation params.

- **Out of scope (v1):**
  - Editing or deleting responses; real-time push from SurveySparrow; multi-workspace/tenant switching; advanced analytics or export beyond backup download; OAuth or custom installation frontend.

## Success criteria

- Users can open the app, see a list of surveys (from cache), sync to refresh, select a survey, and view its responses in a paginated, readable format.
- Users can download backup files of responses.
- API responses load within ~2 seconds; UI is smooth and mobile-friendly; no API keys exposed in the frontend.

## AppNest context

- This app runs on the **AppNest** framework. Backend entry: `app-backend/server.js` (exported functions only). Frontend entry: `app-frontend/src/App.jsx`. All backend I/O uses the AppNest SDK ($db, $http, $file, $next, $schedule). See `appnest-tools/appnest-governance/` for full reference.
