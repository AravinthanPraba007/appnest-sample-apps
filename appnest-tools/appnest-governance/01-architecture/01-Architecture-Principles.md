# Appnest Architecture Principles

This document defines the foundational architectural principles for all Appnest applications.

## 1. Execution Model

All Appnest apps follow the universal model:

Trigger → Handler → SDK Operations → ResultData

Triggers may be:
- Event-based
- Scheduled
- Manual API invocation
- File upload
- Webhook

## 2. Statelessness

All handlers MUST be stateless.

State must be persisted using:
- $db
- External storage
- Deterministic computation

Global variables MUST NOT be used to maintain execution state.

## 3. Deterministic Execution

Apps must produce consistent results for identical inputs.

External API pushes must be idempotent.

## 4. Separation of Concerns

Apps must separate:
- Trigger logic
- Processing logic
- External integration logic
- Progress tracking

## 5. Production-Grade Safety

All apps must be designed for:
- Timeout safety
- Partial failure handling
- Retry safety
- Duplicate prevention

No app should assume ideal runtime conditions.