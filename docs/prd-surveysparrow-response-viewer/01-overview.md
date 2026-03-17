# SurveySparrow Response Viewer — Overview

## Product name

SurveySparrow Response Viewer

## Vision (elevator pitch)

SurveySparrow Response Viewer is a lightweight web application that provides a clean UI to explore survey responses using the SurveySparrow Public API. Users can list surveys, select one, and browse submissions in a paginated view—without manually interacting with APIs.

## Scope for v1

- **In scope:**
  - List all surveys from SurveySparrow account (GET /v3/surveys).
  - Select a survey and navigate to its responses.
  - Fetch and display survey submissions (GET /v3/surveys/{survey_id}/responses) with pagination (10 per page).
  - Paginated response viewer (Previous / Next, page indicator).
  - Simple, responsive UI; API key stored securely via installation_params; backend proxy so tokens are not exposed in frontend.

- **Out of scope (v1):**
  - Editing or creating surveys/responses.
  - Export (CSV/Excel).
  - Filtering or search within responses.
  - OAuth; v1 uses API key only.
  - Caching survey/responses in $db (all data fetched on demand from SurveySparrow).

## Success criteria

- User can open the app, see a list of surveys, click “View Responses” on a survey, and browse responses with pagination.
- API responses load within ~2 seconds where possible.
- App supports surveys with 1000+ responses via pagination.
- API key is never exposed in the frontend; all SurveySparrow calls go through the backend using $http.

## AppNest context

- This app runs on the **AppNest** framework. Backend entry: `app-backend/server.js` (exported functions only). Frontend entry: `app-frontend/src/App.jsx`. All backend I/O uses the AppNest SDK ($db, $http, $file, $next, $schedule). See `appnest-tools/appnest-governance/` for full reference.
