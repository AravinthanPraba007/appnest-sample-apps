# SurveySparrow Response Viewer — User Flows

## Flow 1: View survey list and sync

**Trigger:** User opens the application.  
**Actor:** Product Manager / CX / Developer / Analyst.  
**Screen(s):** Survey List (S1).  
**Steps:**

1. User lands on Survey List; app calls `getSurveys` (reads from cache in $db).
2. User optionally clicks Sync; frontend calls `syncSurveys`; backend fetches from SurveySparrow API and updates cache.
3. User sees list of surveys (name, ID, created date) and can click "View Responses" on one.

**Outcome:** User has an up-to-date list and can select a survey.

**AppNest note:** Frontend calls `window.appnestClient.backend.invoke({ functionName: 'getSurveys' })` and `syncSurveys`; both are in `backend_api_functions`.

---

## Flow 2: View responses for a survey (paginated)

**Trigger:** User clicks "View Responses" on a survey.  
**Actor:** Same as above.  
**Screen(s):** Response Viewer (S2).  
**Steps:**

1. Frontend stores selected survey ID and calls `getResponses({ surveyId, page, per_page: 10 })`.
2. Backend uses $http to call SurveySparrow `GET /v3/surveys/{survey_id}/responses?page=&per_page=10` and returns data.
3. User sees responses (ID, respondent info, submission date, Q&A pairs) in cards/expandable sections; pagination controls (Previous / Next, page indicator) call `getResponses` with new page.

**Outcome:** User browses responses with 10 per page.

---

## Flow 3: List and download backup files

**Trigger:** User navigates to Backup Files.  
**Actor:** Same as above.  
**Screen(s):** Backup Files (S3).  
**Steps:**

1. Frontend calls `listBackups`; backend uses $file to list backup files and returns names/metadata.
2. User sees list (e.g. responses_2026_03_10.json, …) with Download per file.
3. User clicks Download; frontend calls `getBackupDownloadUrl({ path })` or similar; backend returns download URL via $file; user downloads file.

**Outcome:** User can download backup response files.

---

## Additional flows

- **Scheduled backup:** A $schedule job (if implemented) runs periodically and invokes a backend function that fetches responses and writes to $file (backup files). No direct user trigger; documented in 08-api-contracts.
