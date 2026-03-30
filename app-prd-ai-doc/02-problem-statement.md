# SurveySparrow Contact CSV Export — Problem Statement

## Problem

Teams keep respondent and customer contacts in SurveySparrow but often need a portable copy (CSV) for spreadsheets, CRM staging, or offline review. Today, exporting a **chosen subset** is cumbersome without a dedicated, in-product flow.

## Users affected

SurveySparrow workspace **admins** and **operators** who manage contacts and periodically share or analyze subsets outside the product.

## Current gap / pain

Generic export options may not match “only these people,” or require exporting everything and filtering manually. Users want a simple **pick rows → download CSV** path inside the ecosystem they already use.

## Why now

Appnest provides a standard way to ship a full-page app with secure `$fetch` access to SurveySparrow APIs and Twigs-based UI, making this a small, high-value integration.

## Desired outcome

Users open the app, find contacts quickly (search + pagination), tick the rows they need, and download a clean CSV in one action—backed by official `GET /v1/contacts` behavior documented by SurveySparrow.
