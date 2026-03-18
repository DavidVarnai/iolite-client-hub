

## Plan: Wire Up Master Brief → Discovery Field Suggestions

The `mapBriefToDiscoverySuggestions` helper already exists but is never consumed in the UI. The revenue streams editor already has this pattern working (suggestion chips from brief). We need to replicate that pattern for the other Discovery fields.

### What to Build

**1. Suggestion chips for Discovery fields** (`ClientOnboardingWizard.tsx`)

Add a small "From Brief" suggestion panel near these fields when an approved brief has relevant data:

| Discovery Field | Brief Source | Behavior |
|---|---|---|
| Primary Products / Services | `valueProps` (first 3, joined) | Show as clickable chip → fills field |
| Core Customer Segments | `audiences` | Show as clickable chips → append to field |
| Competitors (Section F) | `inferredCompetitors` | Show as addable competitor entries (like AI suggestions) |
| Positioning Notes | `positioning` | Show as clickable chip → fills field |
| Differentiators | `differentiators` | Show as clickable chip → fills field |

**2. Implementation approach**

- At the top of the Discovery step, call `mapBriefToDiscoverySuggestions(approvedSignals)` (already imported via `getApprovedBriefSignals`)
- For text fields (`primaryProducts`, `coreCustomerSegments`, `positioningNotes`, `differentiators`): render a small suggestion bar below the field with brief-sourced chips. Clicking a chip populates or appends to the field value.
- For competitors: render `inferredCompetitors` as addable entries in Section F, similar to the existing AI suggestions panel but simpler.
- Chips disappear once the field already contains the suggested value (case-insensitive match).

**3. Create a reusable `BriefSuggestionChips` component** (inline in the wizard file)

Props: `suggestions: string[]`, `currentValue: string`, `onApply: (value: string) => void`, `mode: 'replace' | 'append'`

Renders a small row with a FileText icon + clickable chips. Hidden when no suggestions or all already applied.

### Files to Edit

| File | Change |
|---|---|
| `src/components/client/ClientOnboardingWizard.tsx` | Add `BriefSuggestionChips` component; wire it to 5 Discovery fields; consume `mapBriefToDiscoverySuggestions` |

Single file change. No new files needed.

