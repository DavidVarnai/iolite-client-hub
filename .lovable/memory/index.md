# Memory: index.md
Design system and architecture decisions for the Agency OS project.

## Branding
- App name: "Agency OS" (by Iolite Ventures)
- Sidebar shows "IV" logo mark + "Agency OS" text
- All references to "Iolite Client Hub" replaced with "Agency OS"

## Brand Colors (Iolite Ventures)
- Black: #1E1E1E (foreground)
- White: #FFFFFF (background)
- Blue 1: #243D87 / 224 57% 34% (primary — sidebar bg, buttons, ring)
- Blue 2: #536EB5 / 224 39% 52% (secondary)
- Blue 3: #9DBEE4 / 212 57% 75% (accent — light highlight)

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
- Font: Inter (sans), Source Serif 4 (serif)
- Panel class: bg-card rounded-lg border
- Tab pattern: tab-active / tab-inactive classes
- Status badges: status-badge base + status-{stage}
- Internal indicator: internal-indicator class with amber dot
- Dark sidebar with white text (Blue 1 background)
