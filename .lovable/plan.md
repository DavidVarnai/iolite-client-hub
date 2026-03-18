

## Plan: Multi-Stream Revenue Model with Master Brief Suggestions

### Scope

Replace the single `revenueModel` + free-text `revenueStreams` in Discovery with a structured array of revenue stream objects. Add a helper to infer stream suggestions from approved Master Brief insights. Preserve backward compatibility via migration.

### 1. Data Model Changes (`src/types/onboarding.ts`)

**New type:**
```ts
export type RevenueStreamType = 'one_time' | 'recurring' | 'hybrid';

export interface RevenueStream {
  id: string;
  name: string;
  type: RevenueStreamType;
  averageDealSize?: number;    // one_time / hybrid
  monthlyValue?: number;       // recurring / hybrid
  contractLengthMonths?: number; // recurring / hybrid
  notes?: string;
}
```

**Add to `ClientDiscovery`:**
- `revenueStreamsList: RevenueStream[]` (new structured array)
- Keep existing `revenueStreams: string` and `revenueModel: RevenueModelConfig` as deprecated fields for backward compat

**Update `EMPTY_DISCOVERY`:** add `revenueStreamsList: []`

### 2. Migration (`src/lib/repository/clientsRepo.ts`)

In `migrateDiscovery()`:
- If `revenueStreamsList` is missing/empty but `revenueModel` has data (`revenuePerConversion > 0`), auto-create one stream from the legacy model:
  - name: from `revenueStreams` text or "Primary Revenue"
  - type: map `one_time` → `one_time`, `monthly_recurring`/`annual_contract` → `recurring`
  - Copy relevant numeric fields

### 3. Master Brief Suggestion Helper (`src/lib/ai/masterBriefRevenueHelper.ts`)

```ts
function mapBriefToRevenueStreamSuggestions(
  approvedInsights: MasterBriefExtractedInsights
): { name: string; type: RevenueStreamType }[]
```

Scans `valueProps`, `positioning`, and `summary` for keywords:
- "retainer", "managed service", "subscription", "monthly" → recurring
- "project", "implementation", "consulting", "one-time" → one_time
- Mixed signals → hybrid

Returns deduplicated suggestions.

### 4. UI Changes (`src/components/client/ClientOnboardingWizard.tsx`)

Replace the current revenue section (lines ~293-346) with:

**A. Suggestions panel** (conditional, shown when approved brief has suggestions):
- Header: "Suggested from Master Brief"
- List of suggested streams with name + type badge
- "Add All" button + per-item "Add" button
- Deduplicates against existing streams by name

**B. Revenue Streams list:**
- Each stream rendered as a compact card with:
  - Name input
  - Type selector (One-time / Recurring / Hybrid)
  - Conditional fields based on type
  - Optional notes (collapsible)
  - Remove button (trash icon)
- "+ Add Revenue Stream" button at bottom

### 5. RevenueModelDisplay Updates

Update `RevenueModelDisplay` to optionally accept `RevenueStream[]` and display a summary across all streams. Update `getEffectiveRevenuePerConversion` to remain functional with legacy data while also supporting a new `getAggregateRevenue(streams)` helper for future Growth Model use.

### 6. Readiness Checks

Update `computeStageReadiness` and `getProposalChecklist` in `onboarding.ts`:
- Replace `revenueModelSet` check with `revenueStreamsList.length > 0`

### 7. Seed Data (`src/data/onboardingSeed.ts`)

Add `revenueStreamsList` to each seed client, converted from their existing `revenueModel` data.

### Files to Create/Edit

| File | Action |
|------|--------|
| `src/types/onboarding.ts` | Add `RevenueStream` type, update `ClientDiscovery`, update readiness checks |
| `src/lib/repository/clientsRepo.ts` | Add migration logic |
| `src/lib/ai/masterBriefRevenueHelper.ts` | **Create** — suggestion mapper |
| `src/components/client/ClientOnboardingWizard.tsx` | Replace revenue section UI |
| `src/components/client/RevenueModelDisplay.tsx` | Add multi-stream support |
| `src/data/onboardingSeed.ts` | Add `revenueStreamsList` to seeds |
| `src/domains/clients/index.ts` | Export new types |

