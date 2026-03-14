/**
 * RunMIButton — "Run Market Intelligence" entry point.
 * Shows readiness gate or triggers the workflow.
 */
import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useClientContext } from '@/contexts/ClientContext';
import { checkMIReadiness } from '@/lib/ai/marketIntelligenceReadiness';
import MarketIntelligenceWorkflow from './MarketIntelligenceWorkflow';

interface Props {
  variant?: 'default' | 'compact';
}

export default function RunMIButton({ variant = 'default' }: Props) {
  const { client, onboarding } = useClientContext();
  const [showWorkflow, setShowWorkflow] = useState(false);
  const { ready } = checkMIReadiness(client, onboarding);

  if (variant === 'compact') {
    return (
      <>
        <button
          onClick={() => setShowWorkflow(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Run Intelligence
        </button>
        {showWorkflow && (
          <MarketIntelligenceWorkflow onClose={() => setShowWorkflow(false)} />
        )}
      </>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowWorkflow(true)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-md bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
      >
        <span className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5" />
          Run Market Intelligence
        </span>
        {!ready && (
          <span className="text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-1.5 py-0.5 rounded">
            Missing inputs
          </span>
        )}
      </button>
      {showWorkflow && (
        <MarketIntelligenceWorkflow onClose={() => setShowWorkflow(false)} />
      )}
    </>
  );
}
