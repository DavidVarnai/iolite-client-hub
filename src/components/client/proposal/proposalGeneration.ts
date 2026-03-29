/**
 * Proposal generation — pure functions to build a Proposal from source data.
 * Now generates from proposedAgencyServices (Services Config) instead of package selection.
 */
import { repository } from '@/lib/repository';
import { calcRollups } from '@/lib/growthModelCalculations';
import type { Proposal, ProposalPricingLine } from '@/types/proposal';
import type { GrowthModel } from '@/types/growthModel';
import type { ProposedAgencyService } from '@/types/commercialServices';
import { resolveServiceFee, resolveSetupFee, FLEX_PRICING_MODE_LABELS } from '@/types/commercialServices';
import { fmt } from './proposalHelpers';

/* ── Types ── */

export interface GenerationConfig {
  services: ProposedAgencyService[];
}

/* ── Pricing line builders ── */

function buildPricingLineFromService(
  svc: ProposedAgencyService,
  packageBasePrice: number,
  monthlyMediaSpend: number,
  packageName: string | null,
  pricingModel?: string,
): ProposalPricingLine {
  const monthlyPrice = resolveServiceFee(svc, packageBasePrice, monthlyMediaSpend, pricingModel);
  const setupFee = resolveSetupFee(svc);

  let pricingLabel = packageName || 'Custom';
  if (svc.flexPricing) {
    pricingLabel = svc.flexPricing.label || FLEX_PRICING_MODE_LABELS[svc.flexPricing.mode];
  }

  return {
    id: `pl-${svc.id}`,
    label: `${svc.serviceLine} — ${pricingLabel}`,
    description: svc.notes || undefined,
    type: svc.flexPricing ? 'service' : 'package',
    serviceLineId: svc.serviceLineId,
    packageId: svc.selectedPackageId || undefined,
    monthlyPrice,
    notes: setupFee > 0 ? `Setup fee: ${fmt(setupFee)}` : undefined,
  };
}

/* ── Growth model projection extraction ── */

export function extractGrowthProjections(gm: GrowthModel) {
  const rollups = calcRollups(gm);
  const scenario = gm.scenarios.find(s => s.isDefault) || gm.scenarios[0];

  const kpiHighlights: { label: string; target: string }[] = [];
  if (rollups.forecastRevenue > 0)
    kpiHighlights.push({ label: 'Projected Revenue', target: fmt(rollups.forecastRevenue) });
  if (rollups.forecastCpl > 0)
    kpiHighlights.push({ label: 'Target CPL', target: fmt(rollups.forecastCpl) });
  if (rollups.forecastCpa > 0)
    kpiHighlights.push({ label: 'Target CPA', target: fmt(rollups.forecastCpa) });
  if (rollups.totalMediaBudget > 0 && rollups.forecastRevenue > 0)
    kpiHighlights.push({
      label: 'Return on Media',
      target: `${(rollups.forecastRevenue / rollups.totalMediaBudget).toFixed(1)}x`,
    });

  const outcomes: string[] = [];
  if (rollups.forecastRevenue > 0)
    outcomes.push(`Projected ${fmt(rollups.forecastRevenue)} in revenue over ${gm.monthCount} months`);
  if (rollups.totalMediaBudget > 0)
    outcomes.push(`${fmt(rollups.totalMediaBudget)} total media investment planned`);
  if (scenario?.channelAssumptions.length)
    outcomes.push(`${scenario.channelAssumptions.length} channel(s) modeled with funnel assumptions`);

  const narratives = gm.narratives.filter(n => !n.isInternal);
  const planSummary = narratives.find(n => n.section === 'plan_summary')?.content;

  return {
    projectedMonthlyInvestment: rollups.totalInvestment / Math.max(gm.monthCount, 1),
    projectedOutcomes: outcomes.length > 0 ? outcomes : ['Growth projections available — review model for details.'],
    projectedRevenueImpact: rollups.forecastRevenue > 0 ? `${fmt(rollups.forecastRevenue)} projected revenue` : undefined,
    kpiHighlights: kpiHighlights.length > 0 ? kpiHighlights : [{ label: 'KPIs', target: 'See Growth Model' }],
    planSummary,
  };
}

/* ── Main generation function ── */

export function generateProposal(clientId: string, config: GenerationConfig): Proposal {
  const client = repository.clients.getById(clientId);
  const defaults = repository.proposalDefaults.get();
  const allPackages = repository.servicePackages.getAll();
  const growthModel = repository.growthModels.get(clientId) || null;
  const now = new Date().toISOString();

  const clientName = client?.name || 'Client';
  const title = defaults.titleFormat.replace('{clientName}', clientName);

  // ── Media spend for paid media fee calc ──
  let monthlyMediaSpend = 0;
  if (growthModel) {
    const scenario = growthModel.scenarios.find(s => s.isDefault) || growthModel.scenarios[0];
    if (scenario) {
      const totalBudget = scenario.mediaChannelPlans.reduce(
        (sum, mp) => sum + mp.monthlyRecords.reduce((s, r) => s + r.plannedBudget, 0), 0
      );
      monthlyMediaSpend = totalBudget / (growthModel.monthCount || 1);
    }
  }

  // ── Strategy ──
  const strategies = client?.strategySections || [];
  const strategySummary = strategies.length > 0
    ? strategies
        .map(s => `**${s.channel.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}**: ${s.clientSummary.objective}`)
        .join('\n\n')
    : '[Strategy summary will be populated once strategy sections are defined.]';

  const expectedOutcomes = strategies.flatMap(s => s.clientSummary.expectedOutcomes);

  // ── Pricing lines from proposedAgencyServices ──
  const pricingLines: ProposalPricingLine[] = [];

  for (const svc of config.services) {
    const pkg = allPackages.find(p => p.id === svc.selectedPackageId);
    pricingLines.push(buildPricingLineFromService(
      svc,
      pkg?.basePrice ?? 0,
      monthlyMediaSpend,
      pkg?.name ?? null,
      pkg?.pricingModel,
    ));
  }

  const subtotal = pricingLines.reduce((s, l) => s + l.monthlyPrice, 0);

  // ── Scope summary from services ──
  const scopeItems = config.services.map(svc => {
    const pkg = allPackages.find(p => p.id === svc.selectedPackageId);
    if (pkg && pkg.deliverables.length > 0) {
      const dels = pkg.deliverables
        .filter(d => d.value !== false && d.value !== '0' && d.value !== 0)
        .map(d => `${d.label}: ${d.value}`)
        .join(', ');
      return `${svc.serviceLine} (${dels})`;
    }
    return svc.serviceLine;
  });
  const scopeSummary = scopeItems.length > 0
    ? scopeItems.join('. ') + '. Includes monthly reporting and regular strategy reviews.'
    : '[Scope will be populated when services are configured.]';

  // ── Growth model projections ──
  let projectionData;
  if (growthModel) {
    const gmProjections = extractGrowthProjections(growthModel);
    projectionData = {
      projectedMonthlyInvestment: gmProjections.projectedMonthlyInvestment || subtotal,
      projectedOutcomes: gmProjections.projectedOutcomes,
      projectedRevenueImpact: gmProjections.projectedRevenueImpact,
      kpiHighlights: gmProjections.kpiHighlights,
    };
  } else {
    projectionData = {
      projectedMonthlyInvestment: subtotal,
      projectedOutcomes: expectedOutcomes.length > 0
        ? expectedOutcomes
        : ['Outcomes will be defined during strategy development.'],
      kpiHighlights: strategies.length > 0
        ? strategies.flatMap(s =>
            s.clientSummary.expectedOutcomes.slice(0, 1).map(o => ({
              label: s.channel.replace(/_/g, ' '),
              target: o,
            }))
          )
        : [{ label: 'KPIs', target: 'To be defined' }],
    };
  }

  // ── Exec summary ──
  const execParts: string[] = [defaults.defaultExecutiveIntro.replace('your team', clientName)];
  if (config.services.length > 0) {
    const serviceNames = [...new Set(config.services.map(s => s.serviceLine))];
    execParts.push(
      `This engagement encompasses ${serviceNames.join(', ')} — designed to drive measurable growth for ${clientName}.`
    );
  }

  return {
    id: `prop_${Date.now()}`,
    clientId,
    name: title,
    status: 'draft',
    version: 1,
    createdAt: now,
    updatedAt: now,
    generatedAt: now,
    selectedBundleId: undefined,
    selectedServiceLineIds: config.services.map(s => s.serviceLineId),
    selectedPackageIds: config.services.map(s => s.selectedPackageId).filter(Boolean),
    selectedAddOnIds: [],
    summaryData: {
      executiveSummary: execParts.join('\n\n'),
      strategySummary,
      scopeSummary,
      expectedOutcomesSummary: expectedOutcomes.length > 0
        ? expectedOutcomes.join('. ') + '.'
        : '[Expected outcomes will be populated from strategy sections.]',
    },
    pricingData: { lines: pricingLines, subtotal, total: subtotal },
    projectionData,
    timelineData: {
      first30: defaults.defaultTimelineLabels.first30 + ': Discovery, onboarding, and initial audits.',
      first60: defaults.defaultTimelineLabels.first60 + ': Strategy execution and optimization.',
      first90: defaults.defaultTimelineLabels.first90 + ': Scaling and performance acceleration.',
      implementationNotes: defaults.defaultCtaText,
    },
  };
}
