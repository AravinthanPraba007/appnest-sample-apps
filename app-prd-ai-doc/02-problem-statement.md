# SurveySparrow Contact Export — Problem Statement

## Problem

Teams that use SurveySparrow need quick access to **contact records** for reporting, CRM handoff, or offline review. The native product surfaces are optimized for campaign setup, not for **fast scanning, cross-cutting search, and ad hoc CSV export** of specific subsets of contacts.

## Users affected

- **SurveySparrow administrators** and **operators** who manage audiences and compliance.
- **Analysts** or **integrations owners** who need a flat file of selected contacts without manual copy-paste.

## Current gap / pain

- Finding contacts across **large lists** in the main UI can be slow or workflow-heavy.
- Exporting **only chosen** contacts (not the entire audience) often requires multiple steps or external tools.
- There is no **single Appnest surface** that combines API-accurate data with **pagination, live filter/search, and one-click CSV** for the current selection.

## Why now

- SurveySparrow exposes a **documented v3 Contacts API** (`GET /v3/contacts`) with **pagination** and **query** parameters suitable for server-side filtering.
- Appnest provides **secure installation params**, **$fetch** to allowlisted domains, and **Twigs** for a product-grade UI inside SurveySparrow.

## Desired outcome

Users get a **focused, fast** Appnest app: browse contacts with **pagination**, refine with **search/filters**, **multi-select**, and **export CSV**—reducing time spent in generic admin navigation and improving trust in exported data.
