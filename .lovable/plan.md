

# Growth Model — Revised Implementation Plan

## Architecture Overview

The module separates into two operating modes with a normalized, scenario-aware data model. V1 ships with one default scenario and manual actuals entry, but the schema supports versioning, multiple scenarios, and future integrations.

## Operating Modes

**Planning Mode** — Build proposals and forecasts. Editable inputs for agency fees, media budgets, funnel assumptions, revenue model. Used pre-engagement and during quarterly replanning. Supports client-facing presentation (hides internal notes, margin logic, cost breakdowns marked internal-only).

**Operating Mode** — Track actuals against the approved plan. Monthly actual entry for spend and results. Variance calculations, performance comparison, executive review. Used in monthly meetings.

The mode toggle lives in the Growth Model header bar. Both modes share the same underlying model but surface different UI and controls.

## Data Model (Normalized)

```text
GrowthModel
├── id, clientId, name, status (draft|proposal|approved|active|archived)
├── startMonth (YYYY-MM), monthCount, funnelType, visibility (internal|client)
├── createdAt, updatedAt
│
├── GrowthModelScenario (1:many, V1 creates one "base" scenario)
│   ├── id, modelId, name (base|conservative|aggressive|custom)
│   ├── isDefault, createdAt
│   │
│   ├── BudgetLineItem (agency services)
│   │   ├── id, scenarioId, category (agency|other)
│   │   ├── name, billingType (monthly|one_time|phased)
│   │   ├── isInternal (visibility flag), notes
│   │   └── MonthlyBudgetRecord (1:many)
│   │       ├── id, lineItemId, month (YYYY-MM)
│   │       └── plannedAmount (user input)
│   │
│   ├── MediaChannelPlan (media spend)
│   │   ├── id, scenarioId, channel, objective, notes
│   │   └── MonthlyMediaRecord (1:many)
│   │       ├── id, channelPlanId, month (YYYY-MM)
│   │       └── plannedBudget (user input)
│   │
│   ├── ChannelAssumption (funnel inputs per channel)
│   │   ├── id, scenarioId, channel
│   │   ├── cpm, ctr, cpc (user inputs)
│   │   ├── lpConvRate, leadConvRate, callConvRate (user inputs)
│   │   ├── qualRate, closeRate (user inputs)
│   │   ├── targetCpl, targetCpa, aov (user inputs)
│   │   └── (all calculated outputs derived at render time)
│   │
│   └── RevenueAssumption (one per scenario)
│       ├── id, scenarioId
│       ├── avgDealSize, closeRate, salesCycleLag (user inputs)
│       ├── repeatMultiplier, grossMarginPct (user inputs)
│       └── attributionWindow, leadToSaleDelay (user inputs)
│
├── MonthlyActual (entered in Operating Mode)
│   ├── id, modelId, month (YYYY-MM), channel
│   ├── actualSpend, actualLeads, actualCalls, actualOrders (user inputs)
│   ├── actualRevenue, actualCpa, actualCpl (user inputs)
│   └── notes
│
├── ModelNarrative (executive summary text blocks)
│   ├── id, modelId, section (plan_summary|performance_summary|variances|recommendations)
│   ├── content, isInternal, updatedAt
│
└── ModelSnapshot (versioning)
    ├── id, modelId, name (e.g. "Proposal v1", "Q2 Revision")
    ├── snapshotData (serialized JSON of full model state)
    ├── createdBy, createdAt
```

## Value Classification

| Category | Fields | Source |
|----------|--------|--------|
| **User inputs** | All `planned*` amounts, funnel rates (cpm, ctr, cpc, conv rates), revenue assumptions, actual values, narrative text | Editable in UI |
| **Calculated** | Impressions, clicks, leads, orders, revenue forecast, CPL, CPA, ROM, variance %, cumulative totals, break-even | Derived at render via formulas |
| **Rollups** | Total agency fees, total media, total investment, forecast revenue, actual totals | Aggregated from records |

## Visibility Rules

Each entity has an `isInternal` flag or the model has a `visibility` field:
- **Client-facing**: Budget totals, media spend, funnel outputs, revenue projections, executive summary (non-internal narratives), forecast vs actual results
- **Internal-only**: Agency cost breakdowns, margin logic, internal notes on line items, internal narratives, cost-basis details on services, scenario comparisons (V2)

When `proposalMode` is active in ClientHub, Growth Model automatically filters to client-visible data only.

## Sub-tabs

1. **Investment Plan** — Planning Mode primary. Editable grid for agency services, media budgets, other costs. Monthly columns with row-level totals. Summary footer.
2. **Channel Assumptions** — Funnel type selector + per-channel assumption inputs. Calculated output preview (impressions → clicks → leads → revenue).
3. **Revenue Model** — Revenue assumption inputs + calculated monthly/cumulative forecast table.
4. **Forecast vs Actual** — Operating Mode primary. Side-by-side monthly comparison. Editable actual cells. Color-coded variance. Channel drill-down.
5. **Executive Summary** — Presentation layer. Summary cards, charts (recharts), narrative sections. Mode-aware: Planning Mode shows projections only; Operating Mode shows forecast vs actual.

## Files to Create

### Types & Data
- **`src/types/growthModel.ts`** — All interfaces, enums, constants listed in data model above
- **`src/data/growthModelSeed.ts`** — Seed data for clients c1 (ecommerce), c2 (lead gen), c3 (education). Each includes: one model, one base scenario, 6-10 agency line items with monthly records, 3-5 media channels with monthly records, channel assumptions, revenue assumptions, 3-4 months of actuals, narratives

### Calculation & Utility Layer
- **`src/lib/growthModelCalculations.ts`** — Pure functions:
  - `calcImpressions(budget, cpm)`, `calcClicks(impressions, ctr)`, `calcLeads(clicks, convRate)`
  - `calcFunnelOutputs(assumption, monthlyBudget, funnelType)` — returns full funnel chain
  - `calcRevenueProjection(leads, revenueAssumption)` — monthly + cumulative
  - `calcVariance(forecast, actual)` — returns { delta, pct, direction }
  - `calcRollups(lineItems, monthlyRecords)` — aggregates across categories
  - `calcBreakEven(totalInvestment, monthlyRevenue)`
  - `calcROM(revenue, investment)`
- **`src/lib/growthModelTransformers.ts`** — Data shaping:
  - `toMonthlyGrid(lineItems, monthlyRecords, months)` — pivots normalized records into grid columns for table rendering
  - `toForecastVsActualRows(forecasts, actuals, months)` — merges forecast + actual into comparison rows
  - `toChartData(model)` — transforms model into recharts-ready datasets
  - `filterClientVisible(model)` — strips internal-only data for presentation mode
- **`src/lib/growthModelSnapshots.ts`** — Snapshot utilities:
  - `createSnapshot(model, name, createdBy)` — serializes full model state to JSON
  - `restoreSnapshot(snapshot)` — deserializes back
  - `listSnapshots(modelId)` — returns snapshot metadata

### Components
- **`src/components/client/GrowthModel.tsx`** — Main container: mode toggle (Planning/Operating), sticky summary bar, sub-tab navigation. Same pattern as `Campaigns.tsx`.
- **`src/components/client/growth/InvestmentPlan.tsx`** — Three collapsible sections (Agency, Media, Other). Each renders an editable grid using the transformer output. Add/remove rows. Auto-calc totals via `calcRollups`.
- **`src/components/client/growth/ChannelAssumptions.tsx`** — Funnel type selector. Per-channel cards with input fields. Live calculated output preview using `calcFunnelOutputs`.
- **`src/components/client/growth/RevenueModel.tsx`** — Input panel for revenue assumptions. Output table showing monthly forecasted revenue, margin, CAC, ROM, break-even using `calcRevenueProjection`.
- **`src/components/client/growth/ForecastVsActual.tsx`** — Monthly comparison table from `toForecastVsActualRows`. Editable actual cells. Green/red/gray variance styling.
- **`src/components/client/growth/ExecutiveSummary.tsx`** — Summary cards, 5 charts (recharts: BarChart, LineChart, PieChart), narrative sections. Uses `toChartData` and `filterClientVisible` when in proposal mode.
- **`src/components/client/growth/SummaryBar.tsx`** — Sticky top bar: Total Agency Fees, Total Media, Total Investment, Forecast Revenue, Forecast CPA/CPL, Actual Spend, Actual Revenue, Variance. All derived from `calcRollups`.
- **`src/components/client/growth/SnapshotManager.tsx`** — Small dropdown/panel: save snapshot, view history, restore (V1: save + list only).

## Files to Modify

- **`src/pages/ClientHub.tsx`** — Add `'growth-model'` to TABS (between strategy and campaigns). Import and render `GrowthModel`. Tab label displays as "Growth Model".

## Implementation Priority

1. Types + seed data + calculation layer (foundation)
2. Main container + summary bar + Investment Plan (core planning UI)
3. Channel Assumptions + Revenue Model (funnel engine)
4. Forecast vs Actual (operating mode)
5. Executive Summary with charts (presentation layer)
6. Snapshot manager (versioning)

No new dependencies required. Uses existing recharts, radix components, and Tailwind styling.

