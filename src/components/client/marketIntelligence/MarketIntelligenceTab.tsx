/**
 * MarketIntelligenceTab — full tab view for Market Intelligence.
 * Shows run action + history.
 */
import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useClientContext } from '@/contexts/ClientContext';
import MarketIntelligenceWorkflow from './MarketIntelligenceWorkflow';
import MIRunHistory from './MIRunHistory';

export default function MarketIntelligenceTab() {
  const { client } = useClientContext();
  const [showWorkflow, setShowWorkflow] = useState(false);

  return (
    <div className="p-6 max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Market Intelligence</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Structured research: keywords, competitors, audiences, channels, and benchmarks.
          </p>
        </div>
        <button
          onClick={() => setShowWorkflow(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:opacity-90 transition-opacity"
        >
          <Sparkles className="h-4 w-4" />
          New Run
        </button>
      </div>

      <MIRunHistory
        clientId={client.id}
        onRerun={() => setShowWorkflow(true)}
      />

      {showWorkflow && (
        <MarketIntelligenceWorkflow onClose={() => setShowWorkflow(false)} />
      )}
    </div>
  );
}
