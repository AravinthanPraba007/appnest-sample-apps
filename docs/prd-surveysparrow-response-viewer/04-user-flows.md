# SurveySparrow Response Viewer — User Flows

## Flow 1: View survey list and open responses

**Trigger:** User opens the application.  
**Actor:** Product manager / CX / developer / analyst.  
**Screen(s):** S1 — Survey List; then S2 — Response Viewer.  
**Steps:**

1. App loads; frontend calls backend `getSurveys` (no payload). Backend uses $http to call SurveySparrow GET /v3/surveys with API key from installation_params.
2. User sees list of surveys (name, ID, created date). User clicks “View Responses” for one survey.
3. App stores selected survey ID, navigates to Response Viewer, and calls `getSurveyResponses` with `{ surveyId, page: 1, perPage: 10 }`. Backend calls GET /v3/surveys/{survey_id}/responses?page=1&per_page=10.

**Outcome:** User sees first page of responses for the chosen survey.

**AppNest note:** Frontend calls `window.appnestClient.backend.invoke({ functionName: 'getSurveys' })` and `window.appnestClient.backend.invoke({ functionName: 'getSurveyResponses', payload: { surveyId, page, perPage } })`. These functionNames are in `manifest.json` → `backend_api_functions`.

---

## Flow 2: Paginate responses

**Trigger:** User clicks “Next” or “Previous” (or a page number) on the Response Viewer.  
**Actor:** Same as above.  
**Screen(s):** S2 — Response Viewer.  
**Steps:**

1. Frontend calls `getSurveyResponses` with `{ surveyId, page: N, perPage: 10 }`.
2. Backend fetches the requested page from SurveySparrow and returns data.

**Outcome:** User sees the requested page of responses (10 per page).

---

## Additional flows

- **Error handling:** On API timeout, show retry option (frontend retries same functionName). On unauthorized, show authentication error (Alert). When a survey has no responses, display “No responses found” (Text + empty state).  
- No platform events; all flows are UI-triggered via backend_api_functions.
