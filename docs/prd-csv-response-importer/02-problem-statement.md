# CSV Response Importer — Problem Statement

## Problem

Users collect survey responses offline or from external tools (Excel, CRM, events, legacy systems). Manually importing these into SurveySparrow is time-consuming and error-prone.

## Users affected

Survey creators and admins who need to bulk-import responses from spreadsheets or external systems into SurveySparrow surveys.

## Current gap / pain

- No simple, supported path to bulk-import CSV responses into a survey.
- Manual entry is slow and prone to mistakes.
- No built-in traceability (which rows succeeded/failed, error logs, retry of failed rows).
- Timestamp and duplicate behaviour for imported submissions are not configurable in a single flow.

## Why now

Demand for migrating or consolidating response data from CRMs, events, and legacy tools into SurveySparrow makes a dedicated CSV importer with history and retry essential for adoption and trust.

## Desired outcome

A single app that: connects to SurveySparrow via API; lets users select a survey and upload a CSV; validates and maps columns to questions; configures timestamp and duplicate rules; runs the import (with chunking and rate-limit handling); and maintains import history with status, error logs, download of error rows, and retry of failed imports.
