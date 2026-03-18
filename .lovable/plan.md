

## Plan: Auto-populate MI "Known Competitors" from Discovery Data

**Problem**: The Market Intelligence setup screen has an empty "Known Competitors" field even though competitors were already entered/researched during Discovery. The `collectMIInputs` helper only reads from the deprecated `topCompetitors` string field, ignoring the structured `competitors[]` array where Discovery stores its data.

**Root cause**: `src/lib/ai/marketIntelligenceReadiness.ts` line 89:
```typescript
knownCompetitors: d.topCompetitors ? d.topCompetitors.split(',').map(...) : undefined,
```
This reads the old deprecated field. The new `competitors: DiscoveryCompetitor[]` array is never consulted.

### Fix

**File: `src/lib/ai/marketIntelligenceReadiness.ts`** — Update `collectMIInputs` to:
1. Read from `d.competitors[]` (the structured array with names and URLs)
2. Fall back to `d.topCompetitors` (deprecated string) if the array is empty
3. Merge both sources, deduplicate by name (case-insensitive)

Change line 89 from:
```typescript
knownCompetitors: d.topCompetitors ? d.topCompetitors.split(',').map(s => s.trim()).filter(Boolean) : undefined,
```
to logic that collects names from `d.competitors.map(c => c.name)`, then merges any from `d.topCompetitors`, deduplicates, and returns the combined list.

### Files

| File | Change |
|------|--------|
| `src/lib/ai/marketIntelligenceReadiness.ts` | Read `competitors[]` array + fallback to `topCompetitors` |

Single line-level edit. No UI changes needed — the MI setup form already displays `knownCompetitors` correctly.

