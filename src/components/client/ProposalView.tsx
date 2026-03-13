/**
 * ProposalView — generated proposal tab for the Client Hub.
 * Pulls structured data from Bundles, Pricing & Services, Growth Model, and Strategy.
 */
import { useState, useMemo, useCallback } from 'react';
import {
  FileText, Sparkles, Pencil, Check, X, Clock, Target, DollarSign,
  TrendingUp, Calendar, ChevronRight, AlertCircle, Package, Plus, Minus,
  BarChart3, Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useClientContext } from '@/contexts/ClientContext';
import { repository } from '@/lib/repository';
import { calcRollups, calcFunnelOutputs } from '@/lib/growthModelCalculations';
import type { Proposal, ProposalStatus, ProposalPricingLine, ProposalSummaryData, ProposalTimelineData } from '@/types/proposal';
import { PROPOSAL_STATUS_LABELS } from '@/types/proposal';
import type { SalesBundle, ServiceLine, ServicePackage } from '@/types/services';
import { PACKAGE_PRICING_MODEL_LABELS } from '@/types/services';
import type { GrowthModel } from '@/types/growthModel';

const fmt = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });

const STATUS_COLORS: Record<ProposalStatus, string> = {
  draft: 'bg-muted text-muted-foreground',
  ready: 'bg-primary/10 text-primary',
  presented: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  approved: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  archived: 'bg-muted text-muted-foreground',
};

/* ═══════════════════════════════════════════
   PRICING HELPERS
   ═══════════════════════════════════════════ */

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
  const price = sl.defaultRateMin || 0;
  return {
    id: `pl-sl-${sl.id}`,
    label: sl.name,
    description: sl.description,
    type: 'service',
    serviceLineId: sl.id,
    monthlyPrice: price,
    notes: price > 0 ? `Rate: ${fmt(price)}${sl.defaultRateMax && sl.defaultRateMax !== price ? `–${fmt(sl.defaultRateMax)}` : ''}/hr` : 'Pricing to be confirmed',
  };
}

/* ═══════════════════════════════════════════
   GROWTH MODEL HELPERS
   ═══════════════════════════════════════════ */

function extractGrowthProjections(gm: GrowthModel) {
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

/* ═══════════════════════════════════════════
   PROPOSAL GENERATION LOGIC
   ═══════════════════════════════════════════ */

interface GenerationConfig {
  bundleId?: string;
  selectedServiceLineIds: string[];
  selectedPackageIds: string[];
  selectedAddOnIds: string[];
}

function generateProposal(clientId: string, config: GenerationConfig): Proposal {
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

  // Packages (including add-ons)
  const pkgIds = [...config.selectedPackageIds, ...config.selectedAddOnIds];
  for (const pkgId of pkgIds) {
    const pkg = allPackages.find(p => p.id === pkgId);
    if (!pkg) continue;
    const sl = allServiceLines.find(s => s.id === pkg.serviceLineId);
    const isAddOn = config.selectedAddOnIds.includes(pkgId);
    pricingLines.push(buildPricingLine(pkg, sl || null, isAddOn ? 'add_on' : 'package'));
  }

  // Service lines without a selected package → hourly/service line
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

/* ═══════════════════════════════════════════
   INLINE EDITABLE TEXT
   ═══════════════════════════════════════════ */

function EditableText({ value, onChange, multiline = false, className = '' }: {
  value: string; onChange: (v: string) => void; multiline?: boolean; className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  if (editing) {
    return (
      <div className="space-y-2">
        {multiline ? (
          <Textarea value={draft} onChange={e => setDraft(e.target.value)} rows={4} className="text-sm" />
        ) : (
          <Input value={draft} onChange={e => setDraft(e.target.value)} className="text-sm" />
        )}
        <div className="flex gap-1.5">
          <Button size="sm" variant="default" onClick={() => { onChange(draft); setEditing(false); }}>
            <Check className="h-3.5 w-3.5 mr-1" /> Save
          </Button>
          <Button size="sm" variant="ghost" onClick={() => { setDraft(value); setEditing(false); }}>
            <X className="h-3.5 w-3.5 mr-1" /> Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`group relative ${className}`}>
      <div className="whitespace-pre-wrap">{value}</div>
      <button
        onClick={() => { setDraft(value); setEditing(true); }}
        className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-background border rounded-md p-1.5 shadow-sm"
      >
        <Pencil className="h-3 w-3 text-muted-foreground" />
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════
   SECTION COMPONENTS
   ═══════════════════════════════════════════ */

function ProposalHeader({ proposal, onUpdate, proposalMode }: {
  proposal: Proposal; onUpdate: (p: Proposal) => void; proposalMode: boolean;
}) {
  return (
    <div className="text-center space-y-4 py-8">
      {!proposalMode && (
        <div className="flex items-center justify-center gap-3 mb-2">
          <Badge className={`${STATUS_COLORS[proposal.status]} text-xs font-medium px-3 py-1`}>
            {PROPOSAL_STATUS_LABELS[proposal.status]}
          </Badge>
          <span className="text-xs text-muted-foreground">v{proposal.version}</span>
          {proposal.generatedAt && (
            <span className="text-xs text-muted-foreground">
              Generated {new Date(proposal.generatedAt).toLocaleDateString()}
            </span>
          )}
        </div>
      )}
      {proposalMode ? (
        <h1 className="text-3xl md:text-4xl font-serif font-semibold tracking-tight text-foreground">{proposal.name}</h1>
      ) : (
        <EditableText
          value={proposal.name}
          onChange={name => onUpdate({ ...proposal, name, updatedAt: new Date().toISOString() })}
          className="text-3xl md:text-4xl font-serif font-semibold tracking-tight text-foreground"
        />
      )}
      <p className="text-sm text-muted-foreground">
        Prepared for <span className="font-medium text-foreground">{repository.clients.getById(proposal.clientId)?.company || 'Client'}</span>
      </p>
    </div>
  );
}

function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <h2 className="text-lg font-serif font-semibold tracking-tight">{title}</h2>
    </div>
  );
}

function ProposalSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-card border rounded-xl p-6 md:p-8 ${className}`}
    >
      {children}
    </motion.div>
  );
}

function PricingTable({ pricing, proposalMode }: { pricing: Proposal['pricingData']; proposalMode: boolean }) {
  const hasSetupFees = pricing.lines.some(l => l.setupFee);

  return (
    <div className="overflow-hidden rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted/50">
            <th className="text-left px-5 py-3 font-medium text-muted-foreground">Service</th>
            <th className="text-right px-5 py-3 font-medium text-muted-foreground">Monthly</th>
            {hasSetupFees && <th className="text-right px-5 py-3 font-medium text-muted-foreground">Setup</th>}
          </tr>
        </thead>
        <tbody>
          {pricing.lines.map(line => (
            <tr key={line.id} className="border-t">
              <td className="px-5 py-4">
                <div className="font-medium">{line.label}</div>
                {line.description && <div className="text-xs text-muted-foreground mt-0.5">{line.description}</div>}
                {line.notes && !proposalMode && <div className="text-xs text-amber-600 mt-0.5 italic">{line.notes}</div>}
              </td>
              <td className="text-right px-5 py-4 font-medium tabular-nums">
                {line.monthlyPrice > 0 ? fmt(line.monthlyPrice) : '—'}
              </td>
              {hasSetupFees && (
                <td className="text-right px-5 py-4 tabular-nums text-muted-foreground">
                  {line.setupFee ? fmt(line.setupFee) : '—'}
                </td>
              )}
            </tr>
          ))}
        </tbody>
        <tfoot>
          {pricing.discountAmount && (
            <tr className="border-t">
              <td className="px-5 py-3 text-sm text-muted-foreground">{pricing.discountLabel || 'Discount'}</td>
              <td className="text-right px-5 py-3 text-sm text-emerald-600 font-medium tabular-nums">
                −{fmt(pricing.discountAmount)}
              </td>
              {hasSetupFees && <td />}
            </tr>
          )}
          <tr className="border-t bg-muted/30">
            <td className="px-5 py-4 font-semibold">Total Monthly Investment</td>
            <td className="text-right px-5 py-4 font-bold text-lg tabular-nums">{fmt(pricing.total)}</td>
            {hasSetupFees && (
              <td className="text-right px-5 py-4 font-medium tabular-nums text-muted-foreground">
                {fmt(pricing.lines.reduce((s, l) => s + (l.setupFee || 0), 0))}
              </td>
            )}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

/* ═══════════════════════════════════════════
   CONFIGURATION PANEL (Bundle / Service Selection)
   ═══════════════════════════════════════════ */

function ProposalConfigPanel({ clientId, onGenerate }: {
  clientId: string;
  onGenerate: (config: GenerationConfig) => void;
}) {
  const bundles = useMemo(() => repository.salesBundles.getAll().filter(b => b.active), []);
  const serviceLines = useMemo(() => repository.serviceLines.getAll().filter(sl => sl.status === 'active'), []);
  const allPackages = useMemo(() => repository.servicePackages.getAll().filter(p => p.active), []);
  const growthModel = useMemo(() => repository.growthModels.get(clientId) || null, [clientId]);

  const [selectedBundleId, setSelectedBundleId] = useState<string | undefined>();
  const [selectedSlIds, setSelectedSlIds] = useState<string[]>([]);
  const [selectedPkgIds, setSelectedPkgIds] = useState<string[]>([]);
  const [selectedAddOnIds, setSelectedAddOnIds] = useState<string[]>([]);

  const selectedBundle = bundles.find(b => b.id === selectedBundleId);

  const handleBundleSelect = (bundleId: string) => {
    if (bundleId === '__none__') {
      setSelectedBundleId(undefined);
      return;
    }
    const bundle = bundles.find(b => b.id === bundleId);
    if (!bundle) return;
    setSelectedBundleId(bundleId);

    // Preload bundle's included services and packages
    const slIds = bundle.includedServices.map(s => s.serviceLineId).filter(Boolean);
    const pkgIds = bundle.includedServices.map(s => s.packageId).filter(Boolean) as string[];
    setSelectedSlIds([...new Set(slIds)]);
    setSelectedPkgIds([...new Set(pkgIds)]);
    setSelectedAddOnIds([]);
  };

  const toggleServiceLine = (slId: string) => {
    setSelectedSlIds(prev =>
      prev.includes(slId) ? prev.filter(id => id !== slId) : [...prev, slId]
    );
    // Remove associated packages when deselecting
    if (selectedSlIds.includes(slId)) {
      const pkgsToRemove = allPackages.filter(p => p.serviceLineId === slId).map(p => p.id);
      setSelectedPkgIds(prev => prev.filter(id => !pkgsToRemove.includes(id)));
      setSelectedAddOnIds(prev => prev.filter(id => !pkgsToRemove.includes(id)));
    }
  };

  const selectPackage = (slId: string, pkgId: string) => {
    // Only one package per service line
    const otherPkgs = allPackages.filter(p => p.serviceLineId === slId).map(p => p.id);
    setSelectedPkgIds(prev => [...prev.filter(id => !otherPkgs.includes(id)), pkgId]);
    if (!selectedSlIds.includes(slId)) setSelectedSlIds(prev => [...prev, slId]);
  };

  const toggleAddOn = (pkgId: string) => {
    setSelectedAddOnIds(prev =>
      prev.includes(pkgId) ? prev.filter(id => id !== pkgId) : [...prev, pkgId]
    );
  };

  const totalEstimate = useMemo(() => {
    let total = 0;
    for (const pkgId of [...selectedPkgIds, ...selectedAddOnIds]) {
      const pkg = allPackages.find(p => p.id === pkgId);
      if (pkg) total += pkg.basePrice;
    }
    for (const slId of selectedSlIds) {
      const hasPkg = [...selectedPkgIds, ...selectedAddOnIds].some(
        pkgId => allPackages.find(p => p.id === pkgId)?.serviceLineId === slId
      );
      if (!hasPkg) {
        const sl = serviceLines.find(s => s.id === slId);
        if (sl?.defaultRateMin) total += sl.defaultRateMin;
      }
    }
    return total;
  }, [selectedSlIds, selectedPkgIds, selectedAddOnIds, allPackages, serviceLines]);

  const canGenerate = selectedSlIds.length > 0 || selectedPkgIds.length > 0;

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <FileText className="h-7 w-7 text-primary" />
        </div>
        <h2 className="text-2xl font-serif font-semibold">Configure Proposal</h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Select services and packages to generate a proposal. You can edit all content after generation.
        </p>
      </div>

      {/* Bundle selector */}
      <div className="bg-card border rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2.5">
          <Package className="h-4.5 w-4.5 text-primary" />
          <h3 className="font-semibold text-sm">Start from a Bundle</h3>
          <span className="text-xs text-muted-foreground">(optional)</span>
        </div>
        <Select value={selectedBundleId || '__none__'} onValueChange={handleBundleSelect}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a bundle..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">No bundle — manual selection</SelectItem>
            {bundles.map(b => (
              <SelectItem key={b.id} value={b.id}>
                <div className="flex items-center gap-2">
                  <span>{b.name}</span>
                  {b.estimatedMonthlyPrice && (
                    <span className="text-xs text-muted-foreground">~{fmt(b.estimatedMonthlyPrice)}/mo</span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedBundle && (
          <div className="text-xs text-muted-foreground bg-muted/30 rounded-lg px-4 py-3">
            <div className="font-medium text-foreground mb-1">{selectedBundle.name}</div>
            {selectedBundle.description}
            {selectedBundle.optionalAddOns.length > 0 && (
              <div className="mt-2 pt-2 border-t border-border/50">
                <span className="font-medium text-foreground">Optional add-ons: </span>
                {selectedBundle.optionalAddOns.map(a => a.label || a.serviceLineId).join(', ')}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Service Lines & Packages */}
      <div className="bg-card border rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2.5">
          <Layers className="h-4.5 w-4.5 text-primary" />
          <h3 className="font-semibold text-sm">Services & Packages</h3>
        </div>
        <div className="space-y-3">
          {serviceLines.map(sl => {
            const isSelected = selectedSlIds.includes(sl.id);
            const pkgsForSl = allPackages.filter(p => p.serviceLineId === sl.id);
            const selectedPkg = pkgsForSl.find(p => selectedPkgIds.includes(p.id));

            return (
              <div key={sl.id} className={`rounded-lg border transition-colors ${isSelected ? 'border-primary/30 bg-primary/5' : 'border-border'}`}>
                <div className="flex items-center gap-3 px-4 py-3">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleServiceLine(sl.id)}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{sl.name}</div>
                    <div className="text-xs text-muted-foreground">{sl.description}</div>
                  </div>
                  {isSelected && pkgsForSl.length > 0 && (
                    <Select
                      value={selectedPkg?.id || '__none__'}
                      onValueChange={v => v !== '__none__' && selectPackage(sl.id, v)}
                    >
                      <SelectTrigger className="w-48 h-8 text-xs">
                        <SelectValue placeholder="Select tier..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">No package</SelectItem>
                        {pkgsForSl.map(pkg => (
                          <SelectItem key={pkg.id} value={pkg.id}>
                            {pkg.name} — {fmt(pkg.basePrice)}/mo
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                {/* Deliverables preview */}
                {isSelected && selectedPkg && selectedPkg.deliverables.length > 0 && (
                  <div className="px-4 pb-3 pt-0">
                    <div className="flex flex-wrap gap-1.5">
                      {selectedPkg.deliverables
                        .filter(d => d.value !== false && d.value !== '0' && d.value !== 0)
                        .map(d => (
                          <span key={d.key} className="text-[11px] bg-muted rounded-md px-2 py-0.5">
                            {d.label}: <span className="font-medium">{String(d.value)}</span>
                          </span>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bundle Add-ons (when a bundle is selected) */}
      {selectedBundle && selectedBundle.optionalAddOns.length > 0 && (
        <div className="bg-card border rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2.5">
            <Plus className="h-4.5 w-4.5 text-primary" />
            <h3 className="font-semibold text-sm">Optional Add-ons</h3>
          </div>
          <div className="space-y-2">
            {selectedBundle.optionalAddOns.map((addon, i) => {
              const pkg = addon.packageId ? allPackages.find(p => p.id === addon.packageId) : null;
              const isChecked = pkg ? selectedAddOnIds.includes(pkg.id) : false;
              return (
                <div key={i} className="flex items-center gap-3 px-4 py-2.5 rounded-lg border">
                  <Checkbox
                    checked={isChecked}
                    disabled={!pkg}
                    onCheckedChange={() => pkg && toggleAddOn(pkg.id)}
                  />
                  <div className="flex-1">
                    <span className="text-sm">{addon.label || pkg?.name || addon.serviceLineId}</span>
                  </div>
                  {pkg && <span className="text-xs text-muted-foreground tabular-nums">{fmt(pkg.basePrice)}/mo</span>}
                  {!pkg && <span className="text-xs text-muted-foreground italic">Package not configured</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Growth Model status */}
      <div className="bg-card border rounded-xl p-6">
        <div className="flex items-center gap-2.5 mb-3">
          <BarChart3 className="h-4.5 w-4.5 text-primary" />
          <h3 className="font-semibold text-sm">Growth Model</h3>
        </div>
        {growthModel ? (
          <div className="flex items-center gap-2 text-sm">
            <Check className="h-4 w-4 text-emerald-500" />
            <span className="text-foreground/80">
              <span className="font-medium">{growthModel.name}</span> — projections will be included in the proposal.
            </span>
          </div>
        ) : (
          <div className="flex items-start gap-2 text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/20 rounded-md px-3 py-2.5">
            <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <span>No Growth Model found for this client. Projections will use placeholder values. Create a Growth Model to auto-populate forecasts.</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between bg-card border rounded-xl px-6 py-4">
        <div>
          <div className="text-xs text-muted-foreground">Estimated Monthly Total</div>
          <div className="text-xl font-bold tabular-nums">{fmt(totalEstimate)}</div>
        </div>
        <Button size="lg" onClick={() => onGenerate({
          bundleId: selectedBundleId,
          selectedServiceLineIds: selectedSlIds,
          selectedPackageIds: selectedPkgIds,
          selectedAddOnIds: selectedAddOnIds,
        })} disabled={!canGenerate} className="gap-2">
          <Sparkles className="h-4 w-4" /> Generate Proposal
        </Button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   PLACEHOLDER NOTICE
   ═══════════════════════════════════════════ */

function PlaceholderNotice({ text }: { text: string }) {
  if (!text.startsWith('[')) return null;
  return (
    <div className="flex items-start gap-2 text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/20 rounded-md px-3 py-2 mt-2">
      <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
      <span>This section contains placeholder content. Connect the relevant data to auto-populate.</span>
    </div>
  );
}

/* ═══════════════════════════════════════════
   GROWTH MODEL EMPTY STATE (in proposal)
   ═══════════════════════════════════════════ */

function GrowthModelPlaceholder() {
  return (
    <div className="flex items-start gap-3 bg-muted/30 rounded-lg px-5 py-4">
      <BarChart3 className="h-5 w-5 text-muted-foreground mt-0.5" />
      <div>
        <div className="text-sm font-medium text-foreground/80">Growth Model Not Connected</div>
        <div className="text-xs text-muted-foreground mt-1">
          Create a Growth Model for this client to auto-populate revenue projections, KPIs, and channel forecasts.
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN PROPOSAL VIEW
   ═══════════════════════════════════════════ */

export default function ProposalView({ proposalMode = false }: { proposalMode?: boolean }) {
  const { client, growthModel: contextGrowthModel } = useClientContext();
  const [proposals, setProposals] = useState<Proposal[]>(() => repository.proposals.getByClient(client.id));
  const [activeProposalId, setActiveProposalId] = useState<string | null>(proposals[0]?.id || null);
  const [showConfig, setShowConfig] = useState(false);
  const defaults = useMemo(() => repository.proposalDefaults.get(), []);

  const activeProposal = proposals.find(p => p.id === activeProposalId) || null;

  const refresh = () => {
    const updated = repository.proposals.getByClient(client.id);
    setProposals(updated);
    return updated;
  };

  const handleGenerate = useCallback((config: GenerationConfig) => {
    const proposal = generateProposal(client.id, config);
    repository.proposals.save(proposal);
    refresh();
    setActiveProposalId(proposal.id);
    setShowConfig(false);
    toast.success('Proposal generated from system data');
  }, [client.id]);

  const handleUpdate = (proposal: Proposal) => {
    const updated = { ...proposal, updatedAt: new Date().toISOString() };
    repository.proposals.save(updated);
    refresh();
  };

  const handleStatusChange = (status: ProposalStatus) => {
    if (!activeProposal) return;
    handleUpdate({ ...activeProposal, status });
    toast.success(`Proposal marked as ${PROPOSAL_STATUS_LABELS[status]}`);
  };

  const updateSummary = (key: keyof ProposalSummaryData, value: string) => {
    if (!activeProposal) return;
    handleUpdate({ ...activeProposal, summaryData: { ...activeProposal.summaryData, [key]: value } });
  };

  const updateTimeline = (key: keyof ProposalTimelineData, value: string) => {
    if (!activeProposal) return;
    handleUpdate({ ...activeProposal, timelineData: { ...activeProposal.timelineData, [key]: value } });
  };

  // Show config panel
  if (showConfig || (proposals.length === 0 && !activeProposal)) {
    return <ProposalConfigPanel clientId={client.id} onGenerate={handleGenerate} />;
  }

  if (!activeProposal) {
    return <ProposalConfigPanel clientId={client.id} onGenerate={handleGenerate} />;
  }

  const p = activeProposal;
  const hasGrowthModel = !!contextGrowthModel;

  return (
    <div className={`${proposalMode ? 'bg-background' : ''}`}>
      {/* Proposal selector + actions bar (internal only) */}
      {!proposalMode && (
        <div className="px-6 py-4 border-b bg-muted/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {proposals.length > 1 && (
              <Select value={activeProposalId || ''} onValueChange={setActiveProposalId}>
                <SelectTrigger className="w-64 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {proposals.map(pr => (
                    <SelectItem key={pr.id} value={pr.id}>
                      {pr.name} (v{pr.version})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Select value={p.status} onValueChange={v => handleStatusChange(v as ProposalStatus)}>
              <SelectTrigger className="w-36 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PROPOSAL_STATUS_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => setShowConfig(true)} className="gap-1.5">
              <Sparkles className="h-3.5 w-3.5" /> New Proposal
            </Button>
          </div>
        </div>
      )}

      {/* Proposal content */}
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">

        {/* Header */}
        <ProposalHeader proposal={p} onUpdate={handleUpdate} proposalMode={proposalMode} />

        <Separator />

        {/* Executive Summary */}
        <ProposalSection>
          <SectionHeader icon={FileText} title="Executive Summary" />
          {proposalMode ? (
            <p className="text-sm leading-relaxed text-foreground/90">{p.summaryData.executiveSummary}</p>
          ) : (
            <>
              <EditableText
                value={p.summaryData.executiveSummary}
                onChange={v => updateSummary('executiveSummary', v)}
                multiline
                className="text-sm leading-relaxed text-foreground/90"
              />
              <PlaceholderNotice text={p.summaryData.executiveSummary} />
            </>
          )}
        </ProposalSection>

        {/* Strategy Summary */}
        <ProposalSection>
          <SectionHeader icon={Target} title="Strategy Summary" />
          {proposalMode ? (
            <div className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">{p.summaryData.strategySummary}</div>
          ) : (
            <>
              <EditableText
                value={p.summaryData.strategySummary}
                onChange={v => updateSummary('strategySummary', v)}
                multiline
                className="text-sm leading-relaxed text-foreground/90"
              />
              <PlaceholderNotice text={p.summaryData.strategySummary} />
            </>
          )}
        </ProposalSection>

        {/* Scope of Work */}
        <ProposalSection>
          <SectionHeader icon={ChevronRight} title="Scope of Work" />
          {!proposalMode && (
            <EditableText
              value={p.summaryData.scopeSummary}
              onChange={v => updateSummary('scopeSummary', v)}
              multiline
              className="text-sm leading-relaxed text-foreground/90 mb-4"
            />
          )}
          {proposalMode && (
            <p className="text-sm leading-relaxed text-foreground/90 mb-4">{p.summaryData.scopeSummary}</p>
          )}
          {p.pricingData.lines.length > 0 && (
            <div className="space-y-2">
              {p.pricingData.lines.map(line => (
                <div key={line.id} className="flex items-start gap-3 bg-muted/30 rounded-lg px-4 py-3">
                  <div className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center mt-0.5 shrink-0">
                    <ChevronRight className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{line.label}</div>
                    {line.description && <div className="text-xs text-muted-foreground mt-0.5">{line.description}</div>}
                  </div>
                  <Badge variant="outline" className="text-xs shrink-0">{line.type.replace('_', ' ')}</Badge>
                </div>
              ))}
            </div>
          )}
          <PlaceholderNotice text={p.summaryData.scopeSummary} />
        </ProposalSection>

        {/* Pricing Summary */}
        {defaults.showPricingBreakdown && (
          <ProposalSection>
            <SectionHeader icon={DollarSign} title="Investment Summary" />
            <PricingTable pricing={p.pricingData} proposalMode={proposalMode} />
          </ProposalSection>
        )}

        {/* Projected Outcomes */}
        {defaults.showProjections && (
          <ProposalSection>
            <SectionHeader icon={TrendingUp} title="Projected Outcomes" />
            {!hasGrowthModel && !proposalMode && p.projectionData.kpiHighlights.length <= 1 && (
              <GrowthModelPlaceholder />
            )}
            {(hasGrowthModel || p.projectionData.kpiHighlights.length > 1 || proposalMode) && (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {p.projectionData.kpiHighlights.map((kpi, i) => (
                    <div key={i} className="text-center bg-muted/30 rounded-lg px-3 py-4">
                      <div className="text-xs text-muted-foreground mb-1 capitalize">{kpi.label}</div>
                      <div className="text-lg font-bold text-primary tabular-nums">{kpi.target}</div>
                    </div>
                  ))}
                </div>
                {p.projectionData.projectedRevenueImpact && (
                  <div className="bg-primary/5 border border-primary/10 rounded-lg px-5 py-4 text-center mb-4">
                    <div className="text-xs text-muted-foreground mb-1">Projected Revenue Impact</div>
                    <div className="text-xl font-serif font-semibold text-primary">{p.projectionData.projectedRevenueImpact}</div>
                  </div>
                )}
                <div className="space-y-2">
                  {p.projectionData.projectedOutcomes.map((outcome, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-sm">
                      <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="h-3 w-3 text-primary" />
                      </div>
                      <span className="text-foreground/90">{outcome}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </ProposalSection>
        )}

        {/* Timeline */}
        {defaults.showTimeline && (
          <ProposalSection>
            <SectionHeader icon={Calendar} title="Timeline & Next Steps" />
            <div className="space-y-4">
              {[
                { key: 'first30' as const, label: 'First 30 Days', value: p.timelineData.first30 },
                { key: 'first60' as const, label: 'First 60 Days', value: p.timelineData.first60 },
                { key: 'first90' as const, label: 'First 90 Days', value: p.timelineData.first90 },
              ].map(item => (
                <div key={item.key} className="flex gap-4">
                  <div className="shrink-0 w-28">
                    <div className="text-xs font-medium text-primary bg-primary/10 rounded-md px-2.5 py-1.5 text-center">
                      {item.label}
                    </div>
                  </div>
                  <div className="flex-1 text-sm text-foreground/90 pt-1">
                    {proposalMode ? (
                      <span>{item.value}</span>
                    ) : (
                      <EditableText value={item.value} onChange={v => updateTimeline(item.key, v)} multiline />
                    )}
                  </div>
                </div>
              ))}
            </div>
            {p.timelineData.implementationNotes && (
              <>
                <Separator className="my-6" />
                <div className="bg-primary/5 border border-primary/10 rounded-lg px-6 py-5 text-center">
                  <Clock className="h-5 w-5 text-primary mx-auto mb-2" />
                  {proposalMode ? (
                    <p className="text-sm leading-relaxed text-foreground/90">{p.timelineData.implementationNotes}</p>
                  ) : (
                    <EditableText
                      value={p.timelineData.implementationNotes}
                      onChange={v => updateTimeline('implementationNotes', v)}
                      multiline
                      className="text-sm leading-relaxed text-foreground/90"
                    />
                  )}
                </div>
              </>
            )}
          </ProposalSection>
        )}

        {/* Assumptions Note */}
        {!proposalMode && defaults.defaultAssumptionsNote && (
          <div className="text-xs text-muted-foreground text-center px-8 py-4 italic">
            {defaults.defaultAssumptionsNote}
          </div>
        )}
      </div>
    </div>
  );
}
