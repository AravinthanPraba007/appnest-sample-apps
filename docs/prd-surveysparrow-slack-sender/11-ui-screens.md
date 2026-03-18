# SurveySparrow → Slack Response Sender — UI Screens

**UI implementation rule (Twigs only, responsive, SaaS “wow”):** Every screen **MUST** use only **@sparrowengg/twigs-react** and **@sparrowengg/twigs-react-icons**. **Stack**, **Box** for layout; **Select**, **Input**, **Button**, **Alert**, **Spinner**, **Text** for controls and feedback. **No raw HTML** for buttons, inputs, or selects.

---

## Screens overview

| Screen ID | Screen name | Purpose (one line) | Entry (how user reaches it) |
|-----------|-------------|--------------------|----------------------------|
| S1 | Survey to Slack Sender | Select survey, webhook, send latest 5 responses to Slack | Default route when app opens |

---

## Screen 1: Survey to Slack Sender

| Field | Description |
|-------|-------------|
| **Purpose** | One-page tool: pick survey, paste Slack webhook, send formatted latest responses. |
| **How user reaches it** | App load (full-page root). |
| **Layout / sections** | **Stack** vertical: header **Text** (title “Survey to Slack Sender”); **Stack** for form row “Select Survey” + **Select**; **Stack** for “Slack Webhook URL” + **Input** (type suitable for URL, via Twigs **Input**); **Button** “Send Latest Responses”; **Text** or **Alert** for status. |
| **Main UI elements (Twigs only)** | **Box**, **Stack**, **Text**, **Select** (survey dropdown), **Input** (webhook), **Button**, **Alert** (errors/success), **Spinner** (loading surveys or sending). |
| **User actions** | Load on mount → **`listSurveys`**, `{}`. Click Send → **`sendLatestResponsesToSlack`**, `{ surveyId, slackWebhookUrl }`. |
| **Data shown** | Survey options from `listSurveys` response; status from send result (e.g. “✓ Sent to Slack” via **Alert** severity success). |
| **Empty / loading / error** | Loading surveys: **Spinner** + **Text**. Survey API error: **Alert** error. No responses: **Alert** info “No responses found”. Invalid webhook / Slack error: **Alert** error. Rate limit: **Alert** with retry message. |

---

## Screen 2

*Not applicable — v1 uses only Screen S1.*

---

## Additional screens

*None.*
