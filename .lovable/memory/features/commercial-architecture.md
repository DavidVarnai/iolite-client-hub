---
name: Commercial Architecture
description: Agency commercial architecture: Admin Packages = source of truth, Services Config = deal builder, no duplicate pricing logic.
type: feature
---

## Source of Truth
- **Admin Packages** (`ServicePackage`) = single source of truth for all pricing
- **Services Config** = deal builder (select package, not configure pricing)
- `ProposedAgencyService` stores `serviceLineId` + `selectedPackageId` + optional `pricingOverrides`

## Data Model
- `ProposedAgencyService.selectedPackageId` → links to admin package
- `ProposedAgencyService.overrideEnabled` + `pricingOverrides` → optional pricing override
- `resolveServiceFee()` and `resolveSetupFee()` in `types/commercialServices.ts` resolve effective pricing

## ServiceLine (simplified)
- name, description, pricingType, defaultUnit, status
- NO `defaultRateMin`/`defaultRateMax` (pricing lives in packages only)

## Flow
Services Config (select packages) → Growth Model (read-only summary) → Proposal (read-only display)

## Paid Media
- `PaidMediaPricingConfig` on the service for auto-calc from media spend
- `calcPaidMediaFee()` handles flat/percent/tiered modes with minimum floor
