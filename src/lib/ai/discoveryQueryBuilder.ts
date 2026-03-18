/**
 * Shared discovery query builder — used by both Market Intelligence and Discovery competitor research.
 * Single source of truth for competitor discovery queries so the two paths cannot drift.
 */

import type { MasterBriefSignals } from '@/types/marketIntelligence';

export interface DiscoveryQueryInputs {
  industry: string;
  productsOrServices: string;
  targetAudience: string;
  geography: string;
  serviceArea: string;
  primaryCity?: string;
  businessModel: string;
  masterBriefSignals?: MasterBriefSignals;
}

export interface DiscoveryQueryContext {
  product: string;
  audience: string;
  isLocal: boolean;
  localArea: string;
  area: string;
  isB2B: boolean;
  isEcom: boolean;
}

/**
 * Build context from inputs — shared between MI and Discovery.
 */
export function buildDiscoveryQueryContext(inputs: DiscoveryQueryInputs): DiscoveryQueryContext {
  const industry = inputs.industry.toLowerCase();
  const localArea = inputs.primaryCity || inputs.serviceArea || inputs.geography || '';
  return {
    product: inputs.productsOrServices || inputs.industry,
    audience: inputs.targetAudience || 'target customers',
    isLocal: !!(inputs.primaryCity || inputs.serviceArea || (inputs.geography && !inputs.geography.toLowerCase().includes('national') && !inputs.geography.toLowerCase().includes('united states'))),
    localArea,
    area: inputs.geography || inputs.serviceArea || 'target market',
    isB2B: inputs.businessModel === 'lead_generation' || industry.includes('professional') || industry.includes('b2b'),
    isEcom: inputs.businessModel === 'ecommerce' || industry.includes('e-commerce') || industry.includes('ecommerce'),
  };
}

/**
 * Generate 3-7 discovery queries for competitor lookup.
 * Shared by MI adapter and Discovery wizard.
 */
export function generateDiscoveryQueries(inputs: DiscoveryQueryInputs, ctx?: DiscoveryQueryContext): string[] {
  const c = ctx || buildDiscoveryQueryContext(inputs);
  const product = c.product.toLowerCase();
  const loc = c.isLocal ? c.localArea : '';
  const queries: string[] = [];

  queries.push(`${product} ${loc}`.trim());
  queries.push(c.isLocal ? `best ${inputs.industry.toLowerCase()} ${loc}` : `best ${inputs.industry.toLowerCase()} companies`);

  const segment = c.audience.toLowerCase().split(',')[0]?.trim();
  if (segment) {
    queries.push(`${product} for ${segment}`);
  }

  queries.push(`${product} services ${loc}`.trim());

  if (c.isLocal) {
    queries.push(`${inputs.industry.toLowerCase()} ${loc} reviews`);
  }

  // Enhance with Master Brief signals
  const brief = inputs.masterBriefSignals;
  if (brief) {
    if (brief.painPoints?.length) {
      const pain = brief.painPoints[0].toLowerCase();
      queries.push(`${product} ${pain} ${loc}`.trim());
    }
    if (brief.audiences?.length) {
      const aud = brief.audiences[0].toLowerCase();
      if (aud !== segment) {
        queries.push(`${product} for ${aud} ${loc}`.trim());
      }
    }
    if (brief.industries?.length) {
      const ind = brief.industries[0].toLowerCase();
      if (ind !== inputs.industry.toLowerCase()) {
        queries.push(`${ind} ${product} ${loc}`.trim());
      }
    }
  }

  return [...new Set(queries.map(q => q.trim()).filter(Boolean))].slice(0, 7);
}
