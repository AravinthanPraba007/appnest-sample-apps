# CSV Response Importer — User Personas

## Primary persona

| Attribute | Description |
|-----------|-------------|
| **Role** | Survey creator / admin (SurveySparrow account holder) |
| **Goal** | Bulk-import survey responses from CSV (Excel, CRM, events, legacy systems) into a selected survey with minimal manual work and full traceability. |
| **Pain points** | Manual entry is slow and error-prone; no single place to see import history, failures, or retry failed rows; timestamp and duplicate behaviour not configurable. |
| **Context** | Uses SurveySparrow for surveys; has response data in CSV form and needs to bring it into SurveySparrow for reporting and analysis. |

## Secondary personas (if any)

- **Data steward:** Needs to audit import runs and download error rows for correction in source systems.
- **Support / ops:** May need to troubleshoot failed imports and verify API/rate-limit behaviour (documented in NFRs and run history).

## v1 focus

For v1 we are designing for: **Survey creator / admin** as the primary user. Data stewards and support are supported via Import History and Import Details (error log, download error rows, retry failed).
