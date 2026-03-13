Design system and architecture decisions for the Agency OS project.

## Architecture (Stabilization Pass)
- Repository pattern: `src/lib/repository/` with interface + localStorage V1
- Swap `localStorageRepo` for `supabaseRepo` in `src/lib/repository/index.ts` to change backends
- ClientContext provider wraps ClientHub; all tabs consume `useClientContext()`
- AI outputs persisted as typed `AiArtifact` records (market_research, strategy_draft, benchmark_suggestion, performance_summary, proposal_summary)
- Performance source of truth: GrowthModel.actuals = quantitative; Client.performance = narrative synthesis
- stageProgress on OnboardingData is deprecated — always computed dynamically

## Growth Model Architecture
- Normalized data model: GrowthModel → Scenario → BudgetLineItem/MediaChannelPlan → MonthlyRecords
- Two modes: Planning (proposals/forecasts) and Operating (actuals/review)
- Scenario-aware (V1 uses single "base" scenario, ready for multi-scenario)
- Visibility: isInternal flags for client-safe filtering
- Snapshot versioning via serialized JSON
- All calculations are pure functions in src/lib/growthModelCalculations.ts
- Data transformers in src/lib/growthModelTransformers.ts

## Design System
- HSL color tokens defined in index.css :root
- Primary: 226 89% 63% (Iolite Blue)
- Font: Inter (sans), Source Serif 4 (serif)
- Panel class: bg-card rounded-lg border
- Tab pattern: tab-active / tab-inactive classes
- Status badges: status-badge base + status-{stage}
- Internal indicator: internal-indicator class with amber dot
