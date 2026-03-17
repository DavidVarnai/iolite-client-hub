/**
 * Market Intelligence readiness checker and input collector.
 * Pure functions — no side effects.
 */
import type { Client } from '@/types';
import type { OnboardingData } from '@/types/onboarding';
import type { MarketIntelligenceInputs } from '@/types/marketIntelligence';

export interface ReadinessCheck {
  key: string;
  label: string;
  met: boolean;
}

export function checkMIReadiness(
  client: Client,
  onboarding: OnboardingData,
): { ready: boolean; checks: ReadinessCheck[] } {
  const d = onboarding.discovery;

  const checks: ReadinessCheck[] = [
    { key: 'industry', label: 'Industry is set', met: !!client.industry?.trim() },
    {
      key: 'service_area',
      label: 'Service area or geography defined',
      met: !!(onboarding.serviceArea?.trim() || onboarding.geography?.trim()),
    },
    {
      key: 'website_or_products',
      label: 'Website or products/services described',
      met: !!(onboarding.website?.trim() || d.primaryProducts?.trim()),
    },
    {
      key: 'target_audience',
      label: 'Target audience / customer segments defined',
      met: !!d.coreCustomerSegments?.trim(),
    },
    {
      key: 'primary_goal',
      label: 'Primary growth goal defined',
      met: !!(d.primaryGrowthObjective?.trim() || d.majorGrowthPriorities?.trim() || onboarding.primaryGrowthGoal),
    },
  ];

  return { ready: checks.every(c => c.met), checks };
}

export function collectMIInputs(
  client: Client,
  onboarding: OnboardingData,
): MarketIntelligenceInputs {
  const d = onboarding.discovery;
  const channels = client.activeChannels.map(ch => {
    const map: Record<string, string> = {
      paid_media: 'Paid Media',
      social_media: 'Social Media',
      email_marketing: 'Email Marketing',
      content_development: 'Content/SEO',
      website_development: 'Website',
      strategic_consulting: 'Strategic Consulting',
      brand_strategy: 'Brand Strategy',
      app_development: 'App Development',
      analytics_tracking: 'Analytics',
    };
    return map[ch] || ch;
  });

  return {
    industry: client.industry,
    serviceArea: onboarding.serviceArea || '',
    geography: onboarding.geography || '',
    businessModel: d.businessModel || '',
    website: onboarding.website || '',
    productsOrServices: d.primaryProducts || '',
    targetAudience: d.coreCustomerSegments || '',
    knownCompetitors: d.topCompetitors ? d.topCompetitors.split(',').map(s => s.trim()).filter(Boolean) : undefined,
    primaryGoal: d.primaryGrowthObjective || d.majorGrowthPriorities || onboarding.primaryGrowthGoal || '',
    budgetRange: '',
    selectedChannels: channels,
  };
}
