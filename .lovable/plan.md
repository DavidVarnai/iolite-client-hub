

## Problem Diagnosis

The data loss is caused by **two bugs in the seed merge logic** in `clientsRepo.ts`:

### Bug 1: Merge direction is backwards — seed overwrites user data

When the seed version is stale (which happens on every code redeploy since `SEED_VERSION` is hardcoded), the merge spreads user data first, then seed data on top:

```typescript
// clientsRepo.ts line 55 — BUG
return ex ? { ...ex, ...s } : s;  // seed (s) overwrites user edits (ex)

// clientsRepo.ts line 87 — BUG  
merged[id] = existing[id] ? { ...existing[id], ...seedData } : seedData;  // seed overwrites user edits
```

This means every field present in seed data will **overwrite** the user's saved value. If you edited HIBA Academy's industry or name, the next code deploy wipes it back to seed values.

### Bug 2: `markSeedCurrent()` only called in onboarding repo, not client repo

`createClientRepo()` checks `isSeedStale()` but never calls `markSeedCurrent()`. Only `createOnboardingRepo()` does (line 90). Since these repos are created together in `localStorageRepo.ts`, the onboarding repo's `markSeedCurrent()` eventually runs — but the ordering is fragile and the client repo independently re-merges destructively on every stale check.

### Why data "disappears then reappears"

- Code edit → hot reload → repos re-created → `isSeedStale()` may return true → seed overwrites user data
- Next reload after `markSeedCurrent()` ran → `isSeedStale()` returns false → user's older localStorage data (from before the overwrite) is left alone
- The timing depends on which repos initialize first and whether `markSeedCurrent` has run

## Fix Plan

### 1. Fix merge direction in both repos (clientsRepo.ts)

Swap the spread order so user data takes precedence over seed data:

**Clients (line 55):**
```typescript
// BEFORE: { ...ex, ...s }  — seed wins
// AFTER:  { ...s, ...ex }  — user wins, seed fills gaps
return ex ? { ...s, ...ex } : s;
```

**Onboarding (line 87):**
```typescript
// BEFORE: { ...existing[id], ...seedData }  — seed wins
// AFTER:  { ...seedData, ...existing[id] }  — user wins, seed fills gaps
merged[id] = existing[id] ? { ...seedData, ...existing[id] } : seedData;
```

### 2. Centralize `markSeedCurrent()` (localStorageRepo.ts)

Move `markSeedCurrent()` call to `createLocalStorageRepository()` after all repos are created, so it runs exactly once and all repos see a consistent stale state.

### 3. Bump `SEED_VERSION` (helpers.ts)

Bump to `v5` so the corrected merge runs once on next load, properly preserving user data going forward.

### Files changed

| File | Change |
|------|--------|
| `src/lib/repository/clientsRepo.ts` | Fix merge spread order in both client and onboarding repos; remove `markSeedCurrent()` from onboarding repo |
| `src/lib/repository/localStorageRepo.ts` | Call `markSeedCurrent()` once after all repos created |
| `src/lib/repository/helpers.ts` | Bump `SEED_VERSION` to `v5` |

This is a 3-file, ~6-line fix. No UI changes, no new features.

