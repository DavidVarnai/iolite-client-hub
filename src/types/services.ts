/**
 * Pricing & Services types — agency service line and package definitions.
 */

/* ── Service Line ── */

export type PricingType =
  | 'hourly'
  | 'tier_package'
  | 'scope_package'
  | 'spend_percentage'
  | 'retainer_plus_volume'
  | 'add_on_package';

export const PRICING_TYPE_LABELS: Record<PricingType, string> = {
  hourly: 'Hourly',
  tier_package: 'Tier Package',
  scope_package: 'Scope Package',
  spend_percentage: 'Spend %',
  retainer_plus_volume: 'Retainer + Volume',
  add_on_package: 'Add-on Package',
};

export type ServiceUnit =
  | 'hour'
  | 'month'
  | 'campaign'
  | 'creative_package'
  | 'spend_percentage';

export const SERVICE_UNIT_LABELS: Record<ServiceUnit, string> = {
  hour: 'Hour',
  month: 'Month',
  campaign: 'Campaign',
  creative_package: 'Creative Package',
  spend_percentage: 'Spend %',
};

export type ServiceLineStatus = 'active' | 'archived';

export interface ServiceLine {
  id: string;
  name: string;
  description: string;
  pricingType: PricingType;
  defaultUnit: ServiceUnit;
  status: ServiceLineStatus;
}

/* ── Package Pricing Model ── */

export type PackagePricingModel =
  | 'hourly'
  | 'flat_monthly'
  | 'tier_package'
  | 'spend_percentage'
  | 'retainer_plus_volume'
  | 'add_on_package';

export const PACKAGE_PRICING_MODEL_LABELS: Record<PackagePricingModel, string> = {
  hourly: 'Hourly',
  flat_monthly: 'Flat Monthly',
  tier_package: 'Tier Package',
  spend_percentage: 'Spend %',
  retainer_plus_volume: 'Retainer + Volume',
  add_on_package: 'Add-on Package',
};

/* ── Spend Tier (for spend_percentage packages) ── */

export interface SpendTier {
  label: string;       // e.g. "First $20k"
  upTo: number | null; // null = unlimited
  rate: number;        // percentage as decimal, e.g. 0.15
}

/* ── Deliverable ── */

export interface PackageDeliverable {
  key: string;
  label: string;
  value: string | number | boolean;
}

/* ── Service Package ── */

export interface ServicePackage {
  id: string;
  serviceLineId: string;
  name: string;
  description: string;
  pricingModel: PackagePricingModel;
  basePrice: number;
  minimumFee?: number;
  pricingRules: Record<string, unknown>;
  deliverables: PackageDeliverable[];
  internalCost?: number;
  active: boolean;
}

/* ── Sales Bundle ── */

export interface BundleServiceRef {
  serviceLineId: string;
  packageId?: string;       // optional — some included services may not have a package yet
  label?: string;           // display override, e.g. "Analytics Setup"
}

export interface SalesBundle {
  id: string;
  name: string;
  description: string;
  targetClientType: string;
  includedServices: BundleServiceRef[];
  optionalAddOns: BundleServiceRef[];
  estimatedMonthlyPrice?: number;
  active: boolean;
}
