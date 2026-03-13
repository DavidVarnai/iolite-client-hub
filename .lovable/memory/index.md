Design system, architecture decisions, and onboarding module for the Agency OS project.

## Growth Model Architecture
- Normalized data model: GrowthModel → Scenario → BudgetLineItem/MediaChannelPlan → MonthlyRecords
- Two modes: Planning (proposals/forecasts) and Operating (actuals/review)
- Scenario-aware (V1 uses single "base" scenario, ready for multi-scenario)
- Visibility: isInternal flags for client-safe filtering
- Snapshot versioning via serialized JSON
- All calculations are pure functions in src/lib/growthModelCalculations.ts
- Data transformers in src/lib/growthModelTransformers.ts

## Client Lifecycle & Onboarding
- 6-stage lifecycle: Lead → Discovery → Strategy → Growth Model → Proposal Ready → Active Client
- Types in src/types/onboarding.ts, seed data in src/data/onboardingSeed.ts
- Lifecycle bar integrated into ClientHub (hidden in proposal mode)
- Onboarding wizard: 5-step modal (Setup, Discovery, Strategy Draft, Growth Model, Proposal Ready)
- Overview tab is the workflow home base with lifecycle status, discovery summary, proposal checklist
- New client creation modal on Clients page with guided intake
- computeStageReadiness() dynamically calculates progress from actual data
- NextStepCard provides contextual guidance prompts
- ProposalReadinessChecklist shows checklist before marking proposal ready
- Activation flow transitions client to operating mode + saves baseline snapshot

## Design System
- HSL color tokens defined in index.css :root
- Primary: 226 89% 63% (Iolite Blue)
- Font: Inter (sans), Source Serif 4 (serif)
- Panel class: bg-card rounded-lg border
- Tab pattern: tab-active / tab-inactive classes
- Status badges: status-badge base + status-{stage}
- Internal indicator: internal-indicator class with amber dot
