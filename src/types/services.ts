/**
 * Pricing & Services types — agency service line definitions.
 */

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
  defaultRateMin?: number;
  defaultRateMax?: number;
}
