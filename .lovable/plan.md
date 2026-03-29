

## Plan: Refactor Proposal Config to Use Services Config as Source

### Problem
The "Configure Proposal" screen duplicates Services Config — it asks users to select services/packages again even though they've already been configured. Since Services Config is now the single source of truth for `onboarding.proposedAgencyServices`, the Proposal tab should generate directly from that data.

### New Proposal Config Flow

**If services exist in Services Config** → Show a summary of configured services + a "Generate Proposal" button. No re-selection needed.

**If no services configured** → Show an empty state with a CTA to Services Config.

### Changes

**`src/components/client/proposal/ProposalConfigPanel.tsx`** — Full rewrite

Replace the current bundle/service/package selection UI with:

1. **Header**: "Generate Proposal" (not "Configure Proposal")
2. **Services summary card**: Read-only list from `onboarding.proposedAgencyServices` showing service name, package/flex pricing, and monthly fee — with a link to "Edit in Services Config"
3. **Growth Model status card**: Keep as-is (shows whether projections will be included)
4. **Proposal options** (lightweight):
   - Which sections to include (checkboxes for: Projections, Timeline, Pricing Breakdown) — driven by existing `proposalDefaults`
5. **Footer**: Total from services + "Generate Proposal" button
6. **Empty state**: If `proposedAgencyServices` is empty, show message + CTA to Services Config tab

**`src/components/client/proposal/proposalGeneration.ts`** — Update `GenerationConfig` and `generateProposal`

- Remove `selectedServiceLineIds`, `selectedPackageIds`, `selectedAddOnIds` from `GenerationConfig`
- Instead, read `proposedAgencyServices` from onboarding data (passed in or fetched)
- Build pricing lines from `proposedAgencyServices` using `resolveServiceFee` / `resolveSetupFee`
- Keep Growth Model projection extraction as-is

**`src/components/client/proposal/ProposalView.tsx`** — Minor updates

- Pass `onboarding` or `proposedAgencyServices` to `handleGenerate` instead of service selection config
- Remove the `CommercialSummary` section from the generated proposal view (it's now shown in the config panel and the pricing table already covers it)

### What stays the same
- ProposalView document rendering (executive summary, strategy, scope, timeline, projections)
- EditableText inline editing
- Proposal status management
- ProposalDefaults from Admin
- Growth Model projection extraction

### Files changed
| File | Change |
|------|--------|
| `src/components/client/proposal/ProposalConfigPanel.tsx` | Rewrite: services summary from proposedAgencyServices, remove selection UI |
| `src/components/client/proposal/proposalGeneration.ts` | Update GenerationConfig + generateProposal to use proposedAgencyServices |
| `src/components/client/proposal/ProposalView.tsx` | Pass proposedAgencyServices to generation; simplify |

