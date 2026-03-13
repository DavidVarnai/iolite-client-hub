Codebase architecture decisions and structural patterns.

## Architecture (Post-Refactor)
- Domain barrel exports: src/domains/{clients,pricing,economics,admin,ai}/index.ts
- Repository split: lib/repository/{helpers,clientsRepo,economicsRepo,pricingRepo,settingsRepo}.ts
- localStorageRepo.ts is now a thin composer importing from domain repos
- Calculations module: lib/calculations/{economics}.ts with barrel at index.ts
- lib/economicsCalculations.ts is a re-export shim for backward compatibility
- AdminTeamEconomics split into: teamEconomics/{TeamMembersTable,TeamMemberForm,CompensationPanel,CompensationCard,CompensationForm,ClientAssignmentsPanel,EconomicsDefaultsPanel}
- Reusable UI: components/ui/common/{PanelSection,FormRow,BadgeList}

## Design System
- HSL color tokens defined in index.css :root
- Primary: 226 89% 63% (Iolite Blue)
- Font: Inter (sans), Source Serif 4 (serif)
- Panel class: bg-card rounded-lg border
- Tab pattern: tab-active / tab-inactive classes
- Status badges: status-badge base + status-{stage}
- Internal indicator: internal-indicator class with amber dot

## Growth Model Architecture
- Normalized data model: GrowthModel → Scenario → BudgetLineItem/MediaChannelPlan → MonthlyRecords
- Two modes: Planning and Operating
- Snapshot versioning via serialized JSON
- All calculations are pure functions
