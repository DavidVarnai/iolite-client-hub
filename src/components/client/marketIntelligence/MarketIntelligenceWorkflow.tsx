/**
 * MarketIntelligenceWorkflow — full-screen modal workflow.
 * Steps: setup → generating → results (with refinement & approval).
 */
import { useState, useCallback } from 'react';
import { X, Loader2, AlertTriangle } from 'lucide-react';
import { useClientContext } from '@/contexts/ClientContext';
import { collectMIInputs } from '@/lib/ai/marketIntelligenceReadiness';
import { generateMarketIntelligence } from '@/lib/ai/marketIntelligenceAdapter';
import { repository } from '@/lib/repository';
import type { MarketIntelligenceRun, MarketIntelligenceInputs, MarketIntelligenceOutputs } from '@/types/marketIntelligence';
import MIResultsView from './MIResultsView';
import ResearchSetupStep from './ResearchSetupStep';

type Phase = 'setup' | 'generating' | 'results';

interface Props {
  onClose: () => void;
}

export default function MarketIntelligenceWorkflow({ onClose }: Props) {
  const { client, onboarding } = useClientContext();

  const [phase, setPhase] = useState<Phase>('setup');
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('');
  const [outputs, setOutputs] = useState<MarketIntelligenceOutputs | null>(null);
  const [savedRun, setSavedRun] = useState<MarketIntelligenceRun | null>(null);
  const [currentInputs, setCurrentInputs] = useState<MarketIntelligenceInputs>(() =>
    collectMIInputs(client, onboarding),
  );

  const runGeneration = useCallback(async (inputs: MarketIntelligenceInputs) => {
    setCurrentInputs(inputs);
    setPhase('generating');
    setProgress(0);

    try {
      const result = await generateMarketIntelligence(inputs, (pct, label) => {
        setProgress(pct);
        setProgressLabel(label);
      });
      setOutputs(result);

      const run: MarketIntelligenceRun = {
        id: `mi-${Date.now()}`,
        clientId: client.id,
        status: 'complete',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        generatedAt: new Date().toISOString(),
        inputs,
        outputs: result,
      };
      repository.marketIntelligence.save(run);
      setSavedRun(run);
      setPhase('results');
    } catch {
      setPhase('setup');
    }
  }, [client.id]);

  const handleRefine = useCallback((refinementNote: string) => {
    const refined = { ...currentInputs, refinementNote };
    runGeneration(refined);
  }, [currentInputs, runGeneration]);

  const handleApprove = useCallback(() => {
    if (!savedRun || !outputs) return;
    const approved: MarketIntelligenceRun = {
      ...savedRun,
      status: 'approved',
      updatedAt: new Date().toISOString(),
      approved: {
        approvedAt: new Date().toISOString(),
        approvedKeywords: outputs.keywordThemes,
        approvedCompetitors: outputs.competitorProfiles,
        approvedRadius: currentInputs.localRadius,
        approvedCustomRadius: currentInputs.customRadiusMiles,
        approvedChannelRecommendations: outputs.channelRecommendations,
        researchSummary: outputs.researchSummary,
      },
    };
    repository.marketIntelligence.save(approved);
    setSavedRun(approved);
  }, [savedRun, outputs, currentInputs]);

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-card border rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="text-base font-semibold">Market Intelligence</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{client.name}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-muted transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {phase === 'setup' && (
            <ResearchSetupStep
              initialInputs={currentInputs}
              onRun={runGeneration}
            />
          )}

          {phase === 'generating' && (
            <GeneratingState progress={progress} label={progressLabel} />
          )}

          {phase === 'results' && outputs && (
            <MIResultsView
              outputs={outputs}
              run={savedRun}
              onRerun={() => setPhase('setup')}
              onRefine={handleRefine}
              onApprove={handleApprove}
              onClose={onClose}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Generating State ── */

function GeneratingState({ progress, label }: { progress: number; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-6">
      <Loader2 className="h-10 w-10 text-primary animate-spin" />
      <div className="text-center space-y-2">
        <h3 className="text-sm font-semibold">Running Market Intelligence</h3>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
      <div className="w-64 h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-[11px] text-muted-foreground">{progress}%</p>
    </div>
  );
}
