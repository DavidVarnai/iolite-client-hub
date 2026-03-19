/**
 * ProposalView — main orchestrator for the proposal tab in Client Hub.
 * Delegates rendering to extracted sub-components and generation to pure functions.
 */
import { useState, useMemo, useCallback } from 'react';
import {
  FileText, Sparkles, Check, Target, DollarSign,
  TrendingUp, Calendar, ChevronRight, Clock, BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useClientContext } from '@/contexts/ClientContext';
import { repository } from '@/lib/repository';
import type { Proposal, ProposalStatus, ProposalSummaryData, ProposalTimelineData } from '@/types/proposal';
import { PROPOSAL_STATUS_LABELS } from '@/types/proposal';

import { generateProposal, type GenerationConfig } from './proposalGeneration';
import EditableText from './EditableText';
import ProposalHeader from './ProposalHeader';
import { ProposalSection, SectionHeader, PlaceholderNotice } from './ProposalSection';
import ProposalPricingTable from './ProposalPricingTable';
import ProposalGrowthModelPlaceholder from './ProposalGrowthModelPlaceholder';
import ProposalConfigPanel from './ProposalConfigPanel';
import RevenueModelDisplay from '../RevenueModelDisplay';
import { formatCurrency } from '@/lib/parsing';
import type { ProposedAgencyService } from '@/types/commercialServices';
import { calcPaidMediaFee } from '@/types/commercialServices';
import { PROPOSAL_PRICING_MODEL_LABELS } from '@/types/commercialServices';
import { Briefcase, ArrowRight } from 'lucide-react';

  const refresh = useCallback(() => {
    const updated = repository.proposals.getByClient(client.id);
    setProposals(updated);
    return updated;
  }, [client.id]);

  const handleGenerate = useCallback((config: GenerationConfig) => {
    const proposal = generateProposal(client.id, config);
    repository.proposals.save(proposal);
    refresh();
    setActiveProposalId(proposal.id);
    setShowConfig(false);
    toast.success('Proposal generated from system data');
  }, [client.id, refresh]);

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

        {/* Proposed Agency Services — commercial pricing layer */}
        {!proposalMode && (
          <ProposalSection>
            <ProposedAgencyServices services={proposedServices} onChange={handleServicesChange} />
          </ProposalSection>
        )}

        {/* Pricing Summary */}
        {defaults.showPricingBreakdown && (
          <ProposalSection>
            <SectionHeader icon={DollarSign} title="Investment Summary" />
            <ProposalPricingTable pricing={p.pricingData} proposalMode={proposalMode} />
          </ProposalSection>
        )}

        {/* Revenue Economics (read-only from Discovery) */}
        {onboarding.discovery.legacyRevenueModel?.revenuePerConversion > 0 && (
          <ProposalSection>
            <SectionHeader icon={BarChart3} title="Revenue Economics" />
            <RevenueModelDisplay
              revenueModel={onboarding.discovery.legacyRevenueModel}
              showEditHint={!proposalMode}
              onEditClick={!proposalMode ? undefined : undefined}
              variant="card"
            />
            {!proposalMode && (
              <p className="text-[10px] text-muted-foreground mt-3 italic">
                This section is read-only. To update revenue assumptions, edit them in Discovery.
              </p>
            )}
          </ProposalSection>
        )}

        {defaults.showProjections && (
          <ProposalSection>
            <SectionHeader icon={TrendingUp} title="Projected Outcomes" />
            {!hasGrowthModel && !proposalMode && p.projectionData.kpiHighlights.length <= 1 && (
              <ProposalGrowthModelPlaceholder />
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
