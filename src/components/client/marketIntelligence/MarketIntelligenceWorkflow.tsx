/**
 * MarketIntelligenceWorkflow — full-screen modal workflow.
 * Steps: readiness → generating → results → saved.
 */
import { useState, useCallback, useEffect } from 'react';
import { X, AlertTriangle, Check, Loader2 } from 'lucide-react';
import { useClientContext } from '@/contexts/ClientContext';
import { checkMIReadiness, collectMIInputs } from '@/lib/ai/marketIntelligenceReadiness';
import { generateMarketIntelligence } from '@/lib/ai/marketIntelligenceAdapter';
import { repository } from '@/lib/repository';
import type { MarketIntelligenceRun, MarketIntelligenceOutputs } from '@/types/marketIntelligence';
import MIResultsView from './MIResultsView';

type Phase = 'readiness' | 'generating' | 'results';

interface Props {
  onClose: () => void;
}

export default function MarketIntelligenceWorkflow({ onClose }: Props) {
  const { client, onboarding } = useClientContext();
  const { ready, checks } = checkMIReadiness(client, onboarding);

  const [phase, setPhase] = useState<Phase>(ready ? 'generating' : 'readiness');
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('');
  const [outputs, setOutputs] = useState<MarketIntelligenceOutputs | null>(null);
  const [savedRun, setSavedRun] = useState<MarketIntelligenceRun | null>(null);

  const runGeneration = useCallback(async () => {
    setPhase('generating');
    setProgress(0);
    const inputs = collectMIInputs(client, onboarding);

    try {
      const result = await generateMarketIntelligence(inputs, (pct, label) => {
        setProgress(pct);
        setProgressLabel(label);
      });
      setOutputs(result);

      // Auto-save as a run
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
      setPhase('readiness');
    }
  }, [client, onboarding]);

  // Auto-start if ready
  useEffect(() => {
    if (phase === 'generating' && !outputs) {
      runGeneration();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          {phase === 'readiness' && (
            <ReadinessGate
              checks={checks}
              ready={ready}
              onProceed={runGeneration}
            />
          )}

          {phase === 'generating' && (
            <GeneratingState progress={progress} label={progressLabel} />
          )}

          {phase === 'results' && outputs && (
            <MIResultsView
              outputs={outputs}
              run={savedRun}
              onRerun={runGeneration}
              onClose={onClose}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Readiness Gate ── */

function ReadinessGate({
  checks,
  ready,
  onProceed,
}: {
  checks: { key: string; label: string; met: boolean }[];
  ready: boolean;
  onProceed: () => void;
}) {
  return (
    <div className="space-y-6 max-w-lg mx-auto py-8">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto">
          <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
        </div>
        <h3 className="text-sm font-semibold">Input Checklist</h3>
        <p className="text-xs text-muted-foreground">
          The following information is needed before running Market Intelligence.
        </p>
      </div>

      <div className="space-y-2">
        {checks.map(c => (
          <div key={c.key} className="flex items-center gap-3 px-4 py-2.5 rounded-md bg-muted/50">
            {c.met ? (
              <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <Check className="h-3 w-3 text-primary-foreground" />
              </div>
            ) : (
              <div className="w-5 h-5 rounded-full border-2 border-amber-400 flex-shrink-0" />
            )}
            <span className={`text-sm ${c.met ? 'text-foreground' : 'text-muted-foreground'}`}>
              {c.label}
            </span>
          </div>
        ))}
      </div>

      {ready ? (
        <button
          onClick={onProceed}
          className="w-full py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:opacity-90 transition-opacity"
        >
          Run Market Intelligence
        </button>
      ) : (
        <p className="text-xs text-center text-muted-foreground">
          Complete the missing inputs in Discovery / Onboarding to proceed.
        </p>
      )}
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
