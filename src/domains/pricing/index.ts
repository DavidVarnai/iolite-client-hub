/**
 * Pricing domain barrel — service lines, packages, bundles, commercial types.
 */
export type {
  ServiceLine,
  ServicePackage,
  SalesBundle,
  BundleServiceRef,
  PricingType,
  PackagePricingModel,
  PackageDeliverable,
  SpendTier,
  ServiceUnit,
  ServiceLineStatus,
} from '@/types/services';

export {
  PRICING_TYPE_LABELS,
  SERVICE_UNIT_LABELS,
  PACKAGE_PRICING_MODEL_LABELS,
  pricingModelUnit,
} from '@/types/services';

export type { FlexPricing, FlexPricingMode } from '@/types/commercialServices';
export { FLEX_PRICING_MODE_LABELS } from '@/types/commercialServices';
