

## Plan: Service Area, AI Research, Analytics Strategy, Global AOV, Media Budget, and Proposal Pre-selection

This plan addresses 6 interconnected improvements across onboarding, strategy, growth model, and proposal configuration.

---

### 1. Add Service Area / Location fields to Client Setup

**Files:** `src/types/onboarding.ts`, `src/components/client/ClientOnboardingWizard.tsx`, `src/data/onboardingSeed.ts`

- Add `serviceArea` field to `OnboardingData` (e.g., "Phoenix Metro Area, AZ") alongside the existing `geography` field
- Add `businessAddress` optional field for brick-and-mortar businesses
- Add these fields to Client Setup step in the onboarding wizard, with hints like "Where does this business serve customers?" and "City, state, or radius"
- Update seed data: Pinnacle Academy gets "Metro Area, Phoenix AZ" service area
- Pass `serviceArea` into competitive research and strategy draft requests

---

### 2. Refine Competitive Research AI inputs

**Files:** `src/types/ai.ts`, `src/lib/ai/aiAdapters.ts`, `src/components/client/ClientOnboardingWizard.tsx`

- Expand `MarketResearchRequest` with: `serviceArea`, `primaryProducts`, `keywords` (optional)
- Update `handleResearchCompetitors` to pass `serviceArea`, `primaryProducts`, and `coreCustomerSegments` from discovery data
- Update mock `fetchMarketResearch` to use these inputs in generated competitor names and notes (e.g., reference the service area, product/service type)
- The AI should simulate searching for businesses offering similar products/services in the same service area, not just generic industry competitors

---

### 3. Add "Analytics & Tracking" as a strategy channel

**Files:** `src/types/index.ts`, `src/components/client/Strategy.tsx`, `src/lib/ai/aiAdapters.ts`

- Add `'analytics_tracking'` to the `ServiceChannel` union type
- Add label: `'Analytics & Tracking Implementation'` to `SERVICE_CHANNEL_LABELS`
- Add the channel to `STRATEGY_CHANNELS` in `Strategy.tsx`
- Add a channel-specific AI draft in `aiAdapters.ts` covering: GA4 setup, conversion tracking, tag management, attribution modeling, reporting dashboards

---

### 4. Global AOV instead of per-channel

**Files:** `src/types/onboarding.ts`, `src/components/client/growth/ChannelAssumptions.tsx`, `src/components/client/ClientOnboardingWizard.tsx`

Currently, AOV is set per channel in `ChannelAssumption.aov`. The user wants one global AOV at the client profile level.

- The `avgOrderValue` field already exists in `ClientDiscovery` as a string. Use this as the source of truth.
- In `ChannelAssumptions.tsx`, display the AOV as a read-only global value at the top of the page (pulled from discovery data via context), with a note "Set in Client Discovery"
- Remove the per-channel AOV input field from the channel cards
- When calculating funnel outputs, use the global AOV parsed from `discovery.avgOrderValue` instead of `ca.aov`
- Pass the global AOV through props or context to `ChannelAssumptions`

---

### 5. Overall media budget entry with channel distribution

**Files:** `src/components/client/growth/InvestmentPlan.tsx`, `src/components/client/GrowthModel.tsx`

- Add a "Total Media Budget" input section at the top of the Investment Plan, with period selector (3 months, 6 months, 12 months)
- Below it, show a channel distribution panel where users allocate percentages across channels (e.g., Google 60%, Meta 30%, Other 10%)
- Auto-calculate monthly budgets per channel from the total and distribution
- Provide a suggested default distribution: Google 50-60%, Meta 25-30%, Other 10-20%
- This populates the media channel monthly records automatically
- Keep the ability to manually override individual month values

---

### 6. Pre-select services from strategy sections in Proposal Config

**Files:** `src/components/client/ProposalView.tsx`

- In `ProposalConfigPanel`, on mount, check the client's `strategySections` channels
- Map strategy channels to service line IDs (e.g., `paid_media` → the Paid Media service line)
- Pre-select those service lines in `selectedSlIds` state
- For Fractional CMO (`strategic_consulting`), add an "Hours per month" input field on the service line row (store as a note or custom field on the pricing line)
- For Web Development (`website_development`), add a toggle between "Hourly (T&M)" and "Package" selection

---

### Technical Notes

- `ServiceChannel` type change (`analytics_tracking`) requires updating the union and label map — no other types reference an exhaustive list
- Global AOV change is display-layer only in V1; the `ChannelAssumption.aov` field remains in the type but is populated from the global value
- Media budget distribution is a UI convenience layer on top of the existing `MediaChannelPlan` monthly records
- Strategy-to-service-line mapping will use a simple lookup object (channel → serviceLineId)

