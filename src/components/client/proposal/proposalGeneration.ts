/**
 * Proposal generation — pure functions to build a Proposal from source data.
 * No side effects, no repository writes.
 */
import { repository } from '@/lib/repository';
import { calcRollups } from '@/lib/growthModelCalculations';
import type { Proposal, ProposalPricingLine } from '@/types/proposal';
import type { ServiceLine, ServicePackage } from '@/types/services';
import { PACKAGE_PRICING_MODEL_LABELS } from '@/types/services';
import type { GrowthModel } from '@/types/growthModel';
import { fmt } from './proposalHelpers';

/* ── Types ── */

export interface GenerationConfig {
  bundleId?: string;
  selectedServiceLineIds: string[];
  selectedPackageIds: string[];
  selectedAddOnIds: string[];
}

/* ── Pricing line builders ── */

function resolvePackagePrice(pkg: ServicePackage): number {
  return pkg.basePrice;
}

function buildPricingLine(
  pkg: ServicePackage,
  sl: ServiceLine | null,
  type: 'service' | 'package' | 'add_on',
): ProposalPricingLine {
  return {
    id: `pl-${pkg.id}`,
    label: `${sl?.name || 'Service'} — ${pkg.name}`,
    description: pkg.description,
    type,
    serviceLineId: pkg.serviceLineId,
    packageId: pkg.id,
    monthlyPrice: resolvePackagePrice(pkg),
    notes: pkg.pricingModel !== 'flat_monthly' && pkg.pricingModel !== 'add_on_package'
      ? `Pricing model: ${PACKAGE_PRICING_MODEL_LABELS[pkg.pricingModel]}${pkg.minimumFee ? ` (min ${fmt(pkg.minimumFee)})` : ''}`
      : undefined,
  };
}

function buildServiceOnlyLine(sl: ServiceLine): ProposalPricingLine {
  return {
    id: `pl-sl-${sl.id}`,
    label: sl.name,
    description: sl.description,
    type: 'service',
    serviceLineId: sl.id,
    monthlyPrice: 0,
    notes: 'Pricing configured in packages',
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
  const allServiceLines = repository.serviceLines.getAll();
  const growthModel = repository.growthModels.get(clientId) || null;
  const now = new Date().toISOString();

  const clientName = client?.name || 'Client';
  const title = defaults.titleFormat.replace('{clientName}', clientName);

  // ── Strategy ──
  const strategies = client?.strategySections || [];
  const strategySummary = strategies.length > 0
    ? strategies
        .map(s => `**${s.channel.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}**: ${s.clientSummary.objective}`)
        .join('\n\n')
    : '[Strategy summary will be populated once strategy sections are defined.]';

  const expectedOutcomes = strategies.flatMap(s => s.clientSummary.expectedOutcomes);

  // ── Pricing lines from selected packages ──
  const pricingLines: ProposalPricingLine[] = [];

  const pkgIds = [...config.selectedPackageIds, ...config.selectedAddOnIds];
  for (const pkgId of pkgIds) {
    const pkg = allPackages.find(p => p.id === pkgId);
    if (!pkg) continue;
    const sl = allServiceLines.find(s => s.id === pkg.serviceLineId);
    const isAddOn = config.selectedAddOnIds.includes(pkgId);
    pricingLines.push(buildPricingLine(pkg, sl || null, isAddOn ? 'add_on' : 'package'));
  }

  for (const slId of config.selectedServiceLineIds) {
    const hasPackage = pricingLines.some(l => l.serviceLineId === slId);
    if (hasPackage) continue;
    const sl = allServiceLines.find(s => s.id === slId);
    if (sl) pricingLines.push(buildServiceOnlyLine(sl));
  }

  const subtotal = pricingLines.reduce((s, l) => s + l.monthlyPrice, 0);

  // ── Scope summary from deliverables ──
  const deliverableSummaries: string[] = [];
  for (const line of pricingLines) {
    if (!line.packageId) {
      deliverableSummaries.push(line.label);
      continue;
    }
    const pkg = allPackages.find(p => p.id === line.packageId);
    if (pkg && pkg.deliverables.length > 0) {
      const dels = pkg.deliverables
        .filter(d => d.value !== false && d.value !== '0' && d.value !== 0)
        .map(d => `${d.label}: ${d.value}`)
        .join(', ');
      deliverableSummaries.push(`${line.label} (${dels})`);
    } else {
      deliverableSummaries.push(line.label);
    }
  }
  const scopeSummary = deliverableSummaries.length > 0
    ? deliverableSummaries.join('. ') + '. Includes monthly reporting and regular strategy reviews.'
    : '[Scope will be populated when services are selected.]';

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
  if (pricingLines.length > 0) {
    const serviceNames = pricingLines.map(l => l.label.split(' — ')[0]);
    const unique = [...new Set(serviceNames)];
    execParts.push(
      `This engagement encompasses ${unique.join(', ')} — designed to drive measurable growth for ${clientName}.`
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
    selectedBundleId: config.bundleId,
    selectedServiceLineIds: config.selectedServiceLineIds,
    selectedPackageIds: config.selectedPackageIds,
    selectedAddOnIds: config.selectedAddOnIds,
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
