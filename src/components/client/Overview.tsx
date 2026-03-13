import { useState } from 'react';
import { SERVICE_CHANNEL_LABELS } from '@/types';
import { LIFECYCLE_STAGES, getProposalChecklist } from '@/types/onboarding';
import { format } from 'date-fns';
import { Check, Circle, Rocket, Settings, ArrowRight, ChevronRight } from 'lucide-react';
import ProposalReadinessChecklist from './ProposalReadinessChecklist';
import AiActionButton from '@/components/ai/AiActionButton';
import AiResultPanel from '@/components/ai/AiResultPanel';
import { runMarketResearch } from '@/lib/ai/aiActions';
import type { AiActionStatus, MarketResearchResult } from '@/types/ai';
import { useClientContext } from '@/contexts/ClientContext';

interface Props {
  onNavigateTab: (tab: string) => void;
  onOpenWizard: () => void;
  onActivateClient: () => void;
  onSetProposalMode: () => void;
}

export default function ClientOverview({ onNavigateTab, onOpenWizard, onActivateClient, onSetProposalMode }: Props) {
  const { client, onboarding, stageProgress, hasGrowthModel, saveAiArtifact } = useClientContext();
  const primaryContact = client.contacts.find(c => c.isPrimary);
  const proposalChecklist = getProposalChecklist(onboarding, client, hasGrowthModel);
  const isActive = onboarding.lifecycleStage === 'active_client';
  const isProposalReady = onboarding.lifecycleStage === 'proposal_ready';

  const [researchStatus, setResearchStatus] = useState<AiActionStatus>('idle');
  const [researchResult, setResearchResult] = useState<MarketResearchResult | null>(null);

  const handleResearch = async () => {
    setResearchStatus('loading');
    try {
      const result = await runMarketResearch({
        clientWebsite: onboarding.website,
        industry: client.industry,
        geography: onboarding.geography,
        businessModel: onboarding.discovery.businessModel,
        knownCompetitors: onboarding.discovery.topCompetitors ? onboarding.discovery.topCompetitors.split(',').map(s => s.trim()) : undefined,
      });
      setResearchResult(result);
      setResearchStatus('success');
    } catch {
      setResearchStatus('error');
    }
  };

  const handleApproveResearch = () => {
    if (!researchResult) return;
    saveAiArtifact({
      id: `art-${Date.now()}`,
      clientId: client.id,
      type: 'market_research',
      sourceModule: 'overview',
      content: researchResult as unknown as Record<string, unknown>,
      status: 'accepted',
      createdAt: new Date().toISOString(),
      acceptedAt: new Date().toISOString(),
    });
    setResearchStatus('idle');
    setResearchResult(null);
  };

  return (
    <div className="p-6 max-w-5xl space-y-6">
      {/* Lifecycle Status + Onboarding Progress */}
      <div className="grid grid-cols-3 gap-4">
        <div className="panel p-5 space-y-3">
          <h2 className="text-sm font-semibold">Lifecycle Status</h2>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-semibold text-primary capitalize">
              {LIFECYCLE_STAGES.find(s => s.key === onboarding.lifecycleStage)?.label || onboarding.lifecycleStage}
            </span>
          </div>
          {!isActive && (
            <button
              onClick={onOpenWizard}
              className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
            >
              <Settings className="h-3.5 w-3.5" />
              Continue Setup
            </button>
          )}
        </div>

        <div className="panel p-5 space-y-3">
          <h2 className="text-sm font-semibold">Onboarding Progress</h2>
          <div className="space-y-2">
            {stageProgress.slice(0, 5).map(sp => (
              <div key={sp.stage} className="flex items-center gap-2">
                {sp.status === 'complete' ? (
                  <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <Check className="h-2.5 w-2.5 text-primary-foreground" />
                  </div>
                ) : sp.status === 'in_progress' ? (
                  <div className="w-4 h-4 rounded-full border-2 border-primary flex items-center justify-center flex-shrink-0">
                    <Circle className="h-1.5 w-1.5 fill-primary text-primary" />
                  </div>
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-border flex-shrink-0" />
                )}
                <span className="text-xs capitalize text-muted-foreground">
                  {LIFECYCLE_STAGES.find(s => s.key === sp.stage)?.label}
                </span>
                {sp.percentComplete > 0 && sp.percentComplete < 100 && (
                  <span className="text-[10px] text-muted-foreground ml-auto">{sp.percentComplete}%</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="panel p-5 space-y-3">
          <h2 className="text-sm font-semibold">Quick Actions</h2>
          <div className="space-y-2">
            <button
              onClick={onOpenWizard}
              className="w-full flex items-center justify-between px-3 py-2 rounded-md bg-muted text-sm hover:bg-muted/80 transition-colors"
            >
              <span>Open Onboarding</span>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
            {isProposalReady && !isActive && (
              <button
                onClick={onActivateClient}
                className="w-full flex items-center justify-between px-3 py-2 rounded-md bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
              >
                <span className="flex items-center gap-2"><Rocket className="h-3.5 w-3.5" /> Activate Client</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              onClick={onSetProposalMode}
              className="w-full flex items-center justify-between px-3 py-2 rounded-md bg-muted text-sm hover:bg-muted/80 transition-colors"
            >
              <span>Enter Proposal Mode</span>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>

      {/* AI Market Research */}
      <div className="panel p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Market Research</h2>
          <AiActionButton label="Research Market" status={researchStatus} onClick={handleResearch} variant="compact" />
        </div>
        {researchStatus !== 'idle' && (
          <AiResultPanel
            title="Competitive & Market Research"
            status={researchStatus}
            sections={researchResult ? [
              { heading: 'Market Overview', body: researchResult.marketOverview },
              { heading: 'Top Competitors', body: researchResult.topCompetitors.map(c => `${c.name} — ${c.notes}`) },
              { heading: 'Common Acquisition Channels', body: researchResult.acquisitionChannels },
              { heading: 'Positioning Themes', body: researchResult.positioningThemes },
              { heading: 'Benchmark Notes', body: researchResult.benchmarkNotes.map(b => `${b.metric}: ${b.range} — ${b.notes}`) },
            ] : []}
            onApprove={handleApproveResearch}
            onDiscard={() => { setResearchStatus('idle'); setResearchResult(null); }}
            approveLabel="Save to Discovery"
          />
        )}
      </div>

      {/* Discovery Summary */}
      {onboarding.discovery.primaryProducts && (
        <div className="panel p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Discovery Summary</h2>
            <button onClick={onOpenWizard} className="text-xs text-primary hover:underline">Edit</button>
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Business Model</p>
              <p className="font-medium capitalize">{onboarding.discovery.businessModel.replace('_', ' ')}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Avg Order Value / Deal Size</p>
              <p className="font-medium">{onboarding.discovery.avgOrderValue || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Revenue Targets</p>
              <p className="font-medium">{onboarding.discovery.revenueTargets || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Core Customer Segments</p>
              <p>{onboarding.discovery.coreCustomerSegments || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Growth Priorities</p>
              <p>{onboarding.discovery.majorGrowthPriorities || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Time Horizon</p>
              <p>{onboarding.discovery.timeHorizon || '—'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Strategy Scope Summary */}
      {client.strategySections.length > 0 && (
        <div className="panel p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Strategy Scope</h2>
            <button onClick={() => onNavigateTab('strategy')} className="text-xs text-primary hover:underline">View Details</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {client.strategySections.map(s => (
              <span key={s.id} className="px-3 py-1.5 bg-primary/10 rounded-md text-xs font-medium text-primary">
                {SERVICE_CHANNEL_LABELS[s.channel]}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Growth Model Snapshot */}
      {hasGrowthModel && (
        <div className="panel p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Growth Model</h2>
            <button onClick={() => onNavigateTab('growth-model')} className="text-xs text-primary hover:underline">Open Model</button>
          </div>
          <p className="text-sm text-muted-foreground">Growth model initialized and available for review.</p>
        </div>
      )}

      {/* Proposal Readiness */}
      {!isActive && (
        <ProposalReadinessChecklist
          items={proposalChecklist}
          isReady={!!onboarding.proposalReadyAt}
          onMarkReady={() => {}}
          onEnterProposalMode={onSetProposalMode}
        />
      )}

      <div className="grid grid-cols-2 gap-6">
        <div className="panel p-5 space-y-4">
          <h2 className="text-sm font-semibold">Client Information</h2>
          <div className="space-y-3 text-sm">
            <div><p className="text-xs text-muted-foreground">Company</p><p className="font-medium">{client.company}</p></div>
            <div><p className="text-xs text-muted-foreground">Industry</p><p>{client.industry}</p></div>
            <div><p className="text-xs text-muted-foreground">Internal Owner</p><p>{client.internalOwner}</p></div>
            <div>
              <p className="text-xs text-muted-foreground">Contract Period</p>
              <p>{client.contractStart ? format(new Date(client.contractStart), 'MMM d, yyyy') : '—'} — {client.contractEnd ? format(new Date(client.contractEnd), 'MMM d, yyyy') : '—'}</p>
            </div>
          </div>
        </div>

        <div className="panel p-5 space-y-4">
          <h2 className="text-sm font-semibold">Primary Contact</h2>
          {primaryContact && (
            <div className="space-y-3 text-sm">
              <div><p className="text-xs text-muted-foreground">Name</p><p className="font-medium">{primaryContact.name}</p></div>
              <div><p className="text-xs text-muted-foreground">Title</p><p>{primaryContact.title}</p></div>
              <div><p className="text-xs text-muted-foreground">Email</p><p className="text-primary">{primaryContact.email}</p></div>
            </div>
          )}
          {client.contacts.length > 1 && (
            <p className="text-xs text-muted-foreground">+{client.contacts.length - 1} additional contacts</p>
          )}
        </div>
      </div>

      <div className="panel p-5 space-y-3">
        <h2 className="text-sm font-semibold">Active Channels</h2>
        <div className="flex flex-wrap gap-2">
          {client.activeChannels.map(ch => (
            <span key={ch} className="px-3 py-1.5 bg-muted rounded-md text-xs font-medium">
              {SERVICE_CHANNEL_LABELS[ch]}
            </span>
          ))}
        </div>
      </div>

      {client.notes && (
        <div className="panel p-5 space-y-3">
          <h2 className="text-sm font-semibold">Notes</h2>
          <p className="prose-body text-sm">{client.notes}</p>
        </div>
      )}

      <div className="panel p-5 space-y-3">
        <h2 className="text-sm font-semibold">Integrations</h2>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div><p className="text-xs text-muted-foreground">Slack</p><p>{client.slackChannel || 'Not connected'}</p></div>
          <div><p className="text-xs text-muted-foreground">Notion</p><p>{client.notionProjectId ? 'Connected' : 'Not connected'}</p></div>
          <div><p className="text-xs text-muted-foreground">Agency Analytics</p><p>{client.agencyAnalyticsId ? 'Connected' : 'Not connected'}</p></div>
        </div>
      </div>
    </div>
  );
}
