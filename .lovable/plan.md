

## Problem: Stale localStorage overrides correct seed data

The HIBA Academy profile is showing incorrect information because **localStorage persistence takes precedence over updated seed values**.

### Root cause

In `src/lib/repository/clientsRepo.ts`:

- **Client repo** (line 20): Only inserts clients with IDs not already in localStorage — never updates existing records
- **Onboarding repo** (line 37): Uses `{ ...seed, ...existing }` — existing localStorage values **override** seed values

When you previously seeded HIBA Academy with different data (or it was manually edited), that data persisted. The corrected seed data in `onboardingSeed.ts` never overwrites it.

### Proposed fix

Add a **seed version stamp** to detect when seed data has changed, and refresh stale records on load.

**File: `src/lib/repository/helpers.ts`**
- Add a `SEED_VERSION` constant (e.g. `'2026-03-15-v1'`)
- Add a `STORAGE_KEYS.seedVersion` key

**File: `src/lib/repository/clientsRepo.ts`**
- On repo creation, check if stored `seedVersion` matches current `SEED_VERSION`
- If mismatched: re-merge seed data so seed values fill in any fields the user hasn't explicitly customized
- Update `seedVersion` after merge

This ensures code-level seed corrections propagate to the browser without requiring manual localStorage clears, while still preserving intentional user edits.

### Immediate workaround

Clear localStorage in the preview to force fresh seeding — the source code already contains the correct HIBA data ("Private bilingual K-8 education").

