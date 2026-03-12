# Flow Classification Model

Appnest apps are classified by execution capabilities.

This classification helps standardize runtime behavior.

## 1. Trigger Capabilities

- Event Trigger
- Scheduled Trigger
- Manual API Trigger
- File Upload Trigger
- Webhook Trigger

Apps may use multiple triggers.

## 2. Operation Capabilities

- External API Communication
- File Processing
- Artifact Generation (PDF/Excel/etc.)
- Data Migration
- Long Running Execution
- Database Usage

## 3. Long Running Flow Definition

An app is considered Long Running if it:
- Processes more than 500 records
- Performs bulk migration
- Requires execution chaining
- Uses scheduled orchestration

Long Running flows must follow Runtime Safety Rules.