/**
 * ProposalView — generated proposal tab for the Client Hub.
 * Renders a presentation-ready proposal from system data with inline editing.
 */
import { useState, useMemo } from 'react';
import { FileText, Sparkles, Pencil, Check, X, Clock, Target, DollarSign, TrendingUp, Calendar, ChevronRight, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useClientContext } from '@/contexts/ClientContext';
import { repository } from '@/lib/repository';
import type { Proposal, ProposalStatus, ProposalDefaults, ProposalPricingLine, ProposalSummaryData, ProposalTimelineData } from '@/types/proposal';
import { PROPOSAL_STATUS_LABELS } from '@/types/proposal';

const fmt = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });

const STATUS_COLORS: Record<ProposalStatus, string> = {
  draft: 'bg-muted text-muted-foreground',
  ready: 'bg-primary/10 text-primary',
  presented: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  approved: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  archived: 'bg-muted text-muted-foreground',
};

/* ═══════════════════════════════════════════
   PROPOSAL GENERATION LOGIC
   ═══════════════════════════════════════════ */

function generateProposal(clientId: string): Proposal {
  const client = repository.clients.getById(clientId);
  const defaults = repository.proposalDefaults.get();
  const packages = repository.servicePackages.getAll();
  const serviceLines = repository.serviceLines.getAll();
  const now = new Date().toISOString();

  const clientName = client?.name || 'Client';
  const title = defaults.titleFormat.replace('{clientName}', clientName);

  // Pull strategy summaries
  const strategies = client?.strategySections || [];
  const strategySummary = strategies.length > 0
    ? strategies.map(s => `**${s.channel.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}**: ${s.clientSummary.objective}`).join('\n\n')
    : '[Strategy summary will be populated once strategy sections are defined.]';

  const expectedOutcomes = strategies.flatMap(s => s.clientSummary.expectedOutcomes);

  // Pull active service lines + packages for pricing lines
  const activePackages = packages.filter(p => p.active).slice(0, 4);
  const pricingLines: ProposalPricingLine[] = activePackages.map((pkg, i) => {
    const sl = serviceLines.find(s => s.id === pkg.serviceLineId);
    return {
      id: `pl-gen-${i}`,
      label: `${sl?.name || 'Service'} — ${pkg.name}`,
      description: pkg.description,
      type: 'package' as const,
      serviceLineId: pkg.serviceLineId,
      packageId: pkg.id,
      monthlyPrice: pkg.basePrice,
    };
  });

  const subtotal = pricingLines.reduce((s, l) => s + l.monthlyPrice, 0);

  const proposal: Proposal = {
    id: `prop_${Date.now()}`,
    clientId,
    name: title,
    status: 'draft',
    version: 1,
    createdAt: now,
    updatedAt: now,
    generatedAt: now,
    selectedServiceLineIds: [...new Set(pricingLines.map(l => l.serviceLineId).filter(Boolean) as string[])],
    selectedPackageIds: pricingLines.map(l => l.packageId).filter(Boolean) as string[],
    selectedAddOnIds: [],
    summaryData: {
      executiveSummary: defaults.defaultExecutiveIntro.replace('your team', clientName),
      strategySummary,
      scopeSummary: pricingLines.length > 0
        ? pricingLines.map(l => l.label).join(', ') + '. Includes monthly reporting and regular strategy reviews.'
        : '[Scope will be populated when services are selected.]',
      expectedOutcomesSummary: expectedOutcomes.length > 0
        ? expectedOutcomes.join('. ') + '.'
        : '[Expected outcomes will be populated from strategy sections.]',
    },
    pricingData: {
      lines: pricingLines,
      subtotal,
      total: subtotal,
    },
    projectionData: {
      projectedMonthlyInvestment: subtotal,
      projectedOutcomes: expectedOutcomes.length > 0 ? expectedOutcomes : ['Outcomes will be defined during strategy development.'],
      kpiHighlights: strategies.length > 0
        ? strategies.flatMap(s => s.clientSummary.expectedOutcomes.slice(0, 1).map(o => ({ label: s.channel.replace(/_/g, ' '), target: o })))
        : [{ label: 'KPIs', target: 'To be defined' }],
    },
    timelineData: {
      first30: defaults.defaultTimelineLabels.first30 + ': Discovery, onboarding, and initial audits.',
      first60: defaults.defaultTimelineLabels.first60 + ': Strategy execution and optimization.',
      first90: defaults.defaultTimelineLabels.first90 + ': Scaling and performance acceleration.',
      implementationNotes: defaults.defaultCtaText,
    },
  };

  return proposal;
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
   EMPTY STATE
   ═══════════════════════════════════════════ */

function EmptyProposalState({ onGenerate }: { onGenerate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6">
      <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
        <FileText className="h-8 w-8 text-primary" />
      </div>
      <h2 className="text-xl font-serif font-semibold mb-2">No Proposal Yet</h2>
      <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
        Generate a proposal from this client's strategy, services, and pricing data. You can edit the generated content before sharing.
      </p>
      <Button size="lg" onClick={onGenerate} className="gap-2">
        <Sparkles className="h-4 w-4" /> Generate Proposal
      </Button>
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
   MAIN PROPOSAL VIEW
   ═══════════════════════════════════════════ */

export default function ProposalView({ proposalMode = false }: { proposalMode?: boolean }) {
  const { client } = useClientContext();
  const [proposals, setProposals] = useState<Proposal[]>(() => repository.proposals.getByClient(client.id));
  const [activeProposalId, setActiveProposalId] = useState<string | null>(proposals[0]?.id || null);
  const defaults = useMemo(() => repository.proposalDefaults.get(), []);

  const activeProposal = proposals.find(p => p.id === activeProposalId) || null;

  const refresh = () => {
    const updated = repository.proposals.getByClient(client.id);
    setProposals(updated);
    return updated;
  };

  const handleGenerate = () => {
    const proposal = generateProposal(client.id);
    repository.proposals.save(proposal);
    const updated = refresh();
    setActiveProposalId(proposal.id);
    toast.success('Proposal generated from system data');
  };

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

  // No proposals — show empty state
  if (proposals.length === 0) {
    return <EmptyProposalState onGenerate={handleGenerate} />;
  }

  // No active proposal selected
  if (!activeProposal) {
    return <EmptyProposalState onGenerate={handleGenerate} />;
  }

  const p = activeProposal;

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
            <Button size="sm" variant="outline" onClick={handleGenerate} className="gap-1.5">
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
          <p className="text-sm leading-relaxed text-foreground/90 mb-4">{p.summaryData.scopeSummary}</p>
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
                  <Badge variant="outline" className="text-xs shrink-0">{line.type}</Badge>
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
