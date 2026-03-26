# Core Capability Lab — Problem Statement

## Problem

Teams need a **repeatable, visible way** to confirm that foundational AppNest capabilities (storage, files, HTTP, schedules, chaining) work end-to-end in an environment—without stitching together separate scripts or guessing whether failures are app logic or platform behavior.

## Users affected

- **Internal engineers** and **platform validators** who install or certify AppNest apps.
- **Solution builders** who want a reference harness before building production features.

## Current gap / pain

Capability checks are often **scattered** (one-off handlers, manual API calls, or unrelated sample apps). There is no **single, resettable surface** that exercises multiple primitives with **persisted evidence** of each run.

## Why now

As AppNest adoption grows, a **standard lab app** reduces time to confidence, shortens debugging loops, and documents expected SDK usage patterns in one place.

## Desired outcome

One installed app where a user can, within minutes, **run each module**, **read results**, **inspect stored history**, and **reset**—proving core system behavior in a controlled, user-friendly way.
