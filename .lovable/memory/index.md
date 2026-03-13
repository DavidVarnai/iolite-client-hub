Design system and architecture decisions for the Agency OS project.

## Growth Model Architecture
- Normalized data model: GrowthModel → Scenario → BudgetLineItem/MediaChannelPlan → MonthlyRecords
- Two modes: Planning (proposals/forecasts) and Operating (actuals/review)
- Scenario-aware (V1 uses single "base" scenario, ready for multi-scenario)
- Visibility: isInternal flags for client-safe filtering
- Snapshot versioning via serialized JSON
- All calculations are pure functions in src/lib/growthModelCalculations.ts
- Data transformers in src/lib/growthModelTransformers.ts

## Team & Economics Architecture
- Types in src/types/economics.ts
- Stackable compensation components per team member (salary, flat fee, hourly, rev share, profit share)
- Client assignments with per-client overrides
- Pure calculation functions in src/lib/economicsCalculations.ts
- Revenue categories aligned with service lines
- Seed data in src/data/economicsSeed.ts
- Admin UI: src/components/admin/AdminTeamEconomics.tsx
- Client UI: src/components/client/UnitEconomics.tsx (tab: unit-economics)
- Repository: teamMembers, compensation, clientAssignments, clientEconomics, economicsDefaults

## Design System
- HSL color tokens defined in index.css :root
- Primary: 224 57% 34% (Blue 1 #243D87)
- Font: Inter (sans), Source Serif 4 (serif)
- Panel class: bg-card rounded-lg border
- Tab pattern: tab-active / tab-inactive classes
- Status badges: status-badge base + status-{stage}
- Internal indicator: internal-indicator class with amber dot
