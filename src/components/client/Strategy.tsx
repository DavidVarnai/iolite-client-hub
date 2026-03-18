import { SERVICE_CHANNEL_LABELS, StrategySection, ServiceChannel } from '@/types';
import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import AiActionButton from '@/components/ai/AiActionButton';
import AiResultPanel from '@/components/ai/AiResultPanel';
import { runStrategyDraft } from '@/lib/ai/aiActions';
import type { AiActionStatus, StrategyDraftResult } from '@/types/ai';
import type { OnboardingContinuation } from '@/types/onboarding';
import { useClientContext } from '@/contexts/ClientContext';
import { Plus, Trash2 } from 'lucide-react';
import RunMIButton from '@/components/client/marketIntelligence/RunMIButton';
import OnboardingContinuityPanel from './OnboardingContinuityPanel';

function StrategySectionCard({ section, proposalMode }: { section: StrategySection; proposalMode: boolean }) {
  const { client, onboarding, updateClient, saveAiArtifact } = useClientContext();
  const [showInternal, setShowInternal] = useState(false);
  const [aiStatus, setAiStatus] = useState<AiActionStatus>('idle');
  const [aiResult, setAiResult] = useState<StrategyDraftResult | null>(null);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState(section.clientSummary);
  const s = section.clientSummary;
  const int = section.internal;

  const handleGenerateDraft = async () => {
    setAiStatus('loading');
    try {
      // Only use approved + included brief signals
      const approvedSignals = getApprovedBriefSignals(onboarding.masterBrief);

      const result = await runStrategyDraft({
        channel: section.channel,
        industry: client.industry,
        businessModel: onboarding.discovery.businessModel,
        growthGoals: onboarding.discovery.primaryGrowthObjective || onboarding.discovery.majorGrowthPriorities || undefined,
        geography: onboarding.geography,
        discoveryContext: JSON.stringify({
          primaryProducts: onboarding.discovery.primaryProducts,
          revenueTarget: onboarding.discovery.revenueTarget,
          revenueTargets: onboarding.discovery.revenueTargets,
          coreCustomerSegments: onboarding.discovery.coreCustomerSegments,
          knownBottlenecks: onboarding.discovery.knownBottlenecks,
          currentTraffic: onboarding.discovery.currentTraffic,
        }),
        // Pass approved brief as separate structured object
        ...(approvedSignals ? {
          approvedMasterBriefInsights: JSON.stringify({
            audiences: approvedSignals.audiences,
            painPoints: approvedSignals.painPoints,
            valueProps: approvedSignals.valueProps,
            differentiators: approvedSignals.differentiators,
            positioning: approvedSignals.positioning,
          }),
        } : {}),
      });
      setAiResult(result);
      setAiStatus('success');
    } catch {
      setAiStatus('error');
    }
  };

  const handleApproveAi = () => {
    if (!aiResult) return;
    const updatedSections = client.strategySections.map(sec => {
      if (sec.id !== section.id) return sec;
      return {
        ...sec,
        clientSummary: {
          objective: aiResult.objectives,
          priorities: aiResult.keyInitiatives,
          plan: aiResult.timelineIdeas,
          expectedOutcomes: aiResult.successMetrics,
        },
      };
    });
    updateClient({ ...client, strategySections: updatedSections });
    saveAiArtifact({
      id: `art-${Date.now()}`,
      clientId: client.id,
      type: 'strategy_draft',
      sourceModule: 'strategy',
      contextId: section.id,
      content: aiResult as unknown as Record<string, unknown>,
      status: 'accepted',
      createdAt: new Date().toISOString(),
      acceptedAt: new Date().toISOString(),
    });
    setAiStatus('idle');
    setAiResult(null);
  };

  const handleSaveEdit = () => {
    const updatedSections = client.strategySections.map(sec =>
      sec.id === section.id ? { ...sec, clientSummary: editData } : sec
    );
    updateClient({ ...client, strategySections: updatedSections });
    setEditing(false);
  };

  const handleDelete = () => {
    if (!confirm(`Delete the ${SERVICE_CHANNEL_LABELS[section.channel]} strategy section?`)) return;
    const updatedSections = client.strategySections.filter(sec => sec.id !== section.id);
    updateClient({ ...client, strategySections: updatedSections });
  };

  return (
    <div id={`strategy-section-${section.id}`} className="panel">
      <div className="p-5 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">{SERVICE_CHANNEL_LABELS[section.channel]}</h3>
          <div className="flex items-center gap-2">
            {!proposalMode && (
              <>
                <AiActionButton label="Generate Draft" status={aiStatus} onClick={handleGenerateDraft} variant="compact" />
                <button onClick={() => { setEditing(!editing); setEditData(section.clientSummary); }}
                  className="text-xs text-primary font-medium hover:underline">
                  {editing ? 'Cancel Edit' : 'Edit'}
                </button>
                <button onClick={() => setShowInternal(!showInternal)}
                  className="text-xs text-primary font-medium hover:underline">
                  {showInternal ? 'Show Summary' : 'Internal'}
                </button>
                <button onClick={handleDelete} className="text-xs text-destructive hover:underline">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {editing ? (
        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 block">Objective</label>
            <textarea value={editData.objective} onChange={e => setEditData({ ...editData, objective: e.target.value })}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" rows={2} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 block">Priorities (one per line)</label>
            <textarea value={editData.priorities.join('\n')} onChange={e => setEditData({ ...editData, priorities: e.target.value.split('\n') })}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" rows={3} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 block">Plan</label>
            <textarea value={editData.plan} onChange={e => setEditData({ ...editData, plan: e.target.value })}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" rows={2} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 block">Expected Outcomes (one per line)</label>
            <textarea value={editData.expectedOutcomes.join('\n')} onChange={e => setEditData({ ...editData, expectedOutcomes: e.target.value.split('\n') })}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" rows={3} />
          </div>
          <button onClick={handleSaveEdit}
            className="px-4 py-2 bg-primary text-primary-foreground text-xs font-medium rounded-md hover:opacity-90 transition-opacity">
            Save Changes
          </button>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {(!showInternal || proposalMode) ? (
            <motion.div key="summary" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="p-5 space-y-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Objective</p>
                <p className="prose-body text-sm">{s.objective}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Key Priorities</p>
                <ul className="space-y-1">
                  {s.priorities.map((p, idx) => (
                    <li key={idx} className="text-sm flex items-start gap-2">
                      <span className="text-muted-foreground mt-1.5 w-1 h-1 rounded-full bg-foreground flex-shrink-0" />{p}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Plan</p>
                <p className="prose-body text-sm">{s.plan}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Expected Outcomes</p>
                <ul className="space-y-1">
                  {s.expectedOutcomes.map((o, idx) => (
                    <li key={idx} className="text-sm flex items-start gap-2">
                      <span className="text-muted-foreground mt-1.5 w-1 h-1 rounded-full bg-primary flex-shrink-0" />{o}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ) : (
            <motion.div key="internal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="p-5 space-y-4">
              <div className="internal-indicator mb-2">Internal Only</div>
              {[
                { label: 'Diagnosis', value: int.diagnosis },
                { label: 'Strategic Approach', value: int.approach },
                { label: 'Target Audience', value: int.targetAudience },
                { label: 'Timeline', value: int.timeline },
                { label: 'Internal Notes', value: int.internalNotes },
                { label: 'Resourcing', value: int.resourcing },
              ].map(field => (
                <div key={field.label}>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">{field.label}</p>
                  <p className="prose-body text-sm">{field.value}</p>
                </div>
              ))}
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Deliverables</p>
                <ul className="space-y-1">
                  {int.deliverables.map((d, idx) => (
                    <li key={idx} className="text-sm flex items-start gap-2"><span className="mt-1.5 w-1 h-1 rounded-full bg-foreground flex-shrink-0" />{d}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Dependencies</p>
                <ul className="space-y-1">
                  {int.dependencies.map((d, idx) => (
                    <li key={idx} className="text-sm flex items-start gap-2"><span className="mt-1.5 w-1 h-1 rounded-full bg-amber flex-shrink-0" />{d}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Success Metrics</p>
                <ul className="space-y-1">
                  {int.successMetrics.map((m, idx) => (
                    <li key={idx} className="text-sm flex items-start gap-2"><span className="mt-1.5 w-1 h-1 rounded-full bg-primary flex-shrink-0" />{m}</li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* AI Strategy Draft Result */}
      {aiStatus !== 'idle' && (
        <div className="px-5 pb-5">
          <AiResultPanel
            title={`${SERVICE_CHANNEL_LABELS[section.channel]} — Strategy Draft`}
            status={aiStatus}
            sections={aiResult ? [
              { heading: 'Objectives', body: aiResult.objectives },
              { heading: 'Key Initiatives', body: aiResult.keyInitiatives },
              { heading: 'Timeline', body: aiResult.timelineIdeas },
              { heading: 'Dependencies', body: aiResult.dependencies },
              { heading: 'Success Metrics', body: aiResult.successMetrics },
            ] : []}
            onApprove={handleApproveAi}
            onDiscard={() => { setAiStatus('idle'); setAiResult(null); }}
            approveLabel="Insert into Strategy"
          />
        </div>
      )}
    </div>
  );
}

const STRATEGY_CHANNELS: { channel: ServiceChannel; label: string }[] = [
  { channel: 'strategic_consulting', label: 'Strategic Consulting / CMO' },
  { channel: 'paid_media', label: 'Paid Media' },
  { channel: 'social_media', label: 'Social Media' },
  { channel: 'email_marketing', label: 'Email Marketing' },
  { channel: 'content_development', label: 'Content Development' },
  { channel: 'website_development', label: 'Website Development' },
  { channel: 'brand_strategy', label: 'Brand Strategy' },
  { channel: 'analytics_tracking', label: 'Analytics & Tracking' },
  { channel: 'app_development', label: 'App Development' },
];

interface StrategyProps {
  proposalMode: boolean;
  onboardingContinuation?: OnboardingContinuation | null;
  onReturnToWizard?: () => void;
  onPauseOnboarding?: () => void;
  onContinueToNext?: () => void;
}

export default function ClientStrategy({
  proposalMode,
  onboardingContinuation,
  onReturnToWizard,
  onPauseOnboarding,
  onContinueToNext,
}: StrategyProps) {
  const { client, updateClient } = useClientContext();
  const [showAddSection, setShowAddSection] = useState(false);
  const [newSectionId, setNewSectionId] = useState<string | null>(null);

  const existingChannels = new Set(client.strategySections.map(s => s.channel));
  const availableChannels = STRATEGY_CHANNELS.filter(c => !existingChannels.has(c.channel));

  // Auto-scroll to newly added section
  useEffect(() => {
    if (newSectionId) {
      const el = document.getElementById(`strategy-section-${newSectionId}`);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
      }
      setNewSectionId(null);
    }
  }, [newSectionId, client.strategySections]);

  const handleAddSection = (channel: ServiceChannel) => {
    const sectionId = `s-${Date.now()}`;
    const newSection: StrategySection = {
      id: sectionId,
      channel,
      clientSummary: { objective: '', priorities: [], plan: '', expectedOutcomes: [] },
      internal: {
        diagnosis: '', approach: '', targetAudience: '', deliverables: [],
        dependencies: [], timeline: '', internalNotes: '', resourcing: '', successMetrics: [],
      },
    };
    updateClient({ ...client, strategySections: [...client.strategySections, newSection] });
    setShowAddSection(false);
    setNewSectionId(sectionId);
  };

  // Check if strategy has meaningful content (for continuity panel)
  const hasMeaningfulStrategy = client.strategySections.some(s =>
    s.clientSummary.objective && s.clientSummary.priorities.length > 0
  );

  return (
    <div className="max-w-4xl space-y-6">
      {/* Onboarding continuity panel */}
      {onboardingContinuation && onReturnToWizard && onPauseOnboarding && (
        <OnboardingContinuityPanel
          continuation={onboardingContinuation}
          onReturnToWizard={onReturnToWizard}
          onPauseOnboarding={onPauseOnboarding}
          onContinueToNext={onContinueToNext}
          stepReady={hasMeaningfulStrategy}
        />
      )}

      <div className="px-6 pt-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Strategy</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {proposalMode ? 'Client-facing strategy summary' : 'Full strategic documentation by channel'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {proposalMode && <span className="status-proposal">Proposal View</span>}
          {!proposalMode && <RunMIButton variant="compact" />}
          {!proposalMode && availableChannels.length > 0 && (
            <button onClick={() => setShowAddSection(!showAddSection)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-md hover:opacity-90 transition-opacity">
              <Plus className="h-3.5 w-3.5" /> Add Section
            </button>
          )}
        </div>
      </div>

      {showAddSection && (
        <div className="panel p-4">
          <p className="text-xs font-medium text-muted-foreground mb-2">Select a channel:</p>
          <div className="flex flex-wrap gap-2">
            {availableChannels.map(ch => (
              <button key={ch.channel} onClick={() => handleAddSection(ch.channel)}
                className="px-3 py-1.5 bg-muted rounded-md text-xs font-medium hover:bg-primary/10 hover:text-primary transition-colors">
                {ch.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {client.strategySections.length === 0 ? (
        <div className="panel p-8 text-center">
          <p className="text-sm text-muted-foreground">No strategy sections yet. Add channels to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {client.strategySections.map(section => (
            <StrategySectionCard key={section.id} section={section} proposalMode={proposalMode} />
          ))}
        </div>
      )}
      </div>
    </div>
  );
}
