import { useState } from 'react';
import { Client, SERVICE_CHANNEL_LABELS } from '@/types';
import AiActionButton from '@/components/ai/AiActionButton';
import AiResultPanel from '@/components/ai/AiResultPanel';
import { runPerformanceAnalysis } from '@/lib/ai/aiActions';
import type { AiActionStatus, PerformanceAnalysisResult } from '@/types/ai';

export default function ClientPerformance({ client }: { client: Client }) {
  const [analysisStatus, setAnalysisStatus] = useState<AiActionStatus>('idle');
  const [analysisResult, setAnalysisResult] = useState<PerformanceAnalysisResult | null>(null);

  const handleAnalyze = async () => {
    setAnalysisStatus('loading');
    try {
      const result = await runPerformanceAnalysis({ months: [] });
      setAnalysisResult(result);
      setAnalysisStatus('success');
    } catch {
      setAnalysisStatus('error');
    }
  };
  if (client.performance.length === 0) {
    return (
      <div className="p-6 max-w-4xl">
        <h2 className="text-lg font-semibold">Performance</h2>
        <p className="text-sm text-muted-foreground mt-1">No performance reports available yet.</p>
        <div className="panel p-8 mt-4 text-center">
          <p className="text-sm text-muted-foreground">Agency Analytics integration pending. Connect to pull reporting data.</p>
        </div>
      </div>
    );
  }

  const report = client.performance[0];

  return (
    <div className="p-6 max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold">Performance — {report.period}</h2>
        <AiActionButton label="Analyze Performance" status={analysisStatus} onClick={handleAnalyze} variant="compact" />
      </div>
      <p className="text-sm text-muted-foreground mt-0.5">Narrative performance summary with key metrics.</p>

      {/* AI Analysis */}
      {analysisStatus !== 'idle' && (
        <AiResultPanel
          title="AI Performance Analysis"
          status={analysisStatus}
          sections={analysisResult ? [
            { heading: 'Summary', body: analysisResult.summary },
            { heading: 'Key Drivers', body: analysisResult.keyDrivers },
            { heading: 'Risks & Issues', body: analysisResult.risks },
            { heading: 'Recommended Actions', body: analysisResult.recommendedActions },
          ] : []}
          onApprove={() => { setAnalysisStatus('idle'); }}
          onDiscard={() => { setAnalysisStatus('idle'); setAnalysisResult(null); }}
          approveLabel="Copy to Meeting Notes"
        />
      )}

      {/* Executive summary */}
      <div className="panel p-5">
        <h3 className="text-sm font-semibold mb-2">Executive Summary</h3>
        <p className="prose-body text-sm">{report.executiveSummary}</p>
      </div>

      {/* Channel highlights */}
      {report.channelHighlights.map((ch, idx) => (
        <div key={idx} className="panel p-5 space-y-4">
          <h3 className="text-sm font-semibold">{SERVICE_CHANNEL_LABELS[ch.channel]}</h3>
          <p className="prose-body text-sm">{ch.narrative}</p>
          <div className="flex gap-6">
            {Object.entries(ch.metrics).map(([key, value]) => (
              <div key={key}>
                <p className="text-xs text-muted-foreground">{key}</p>
                <p className="text-lg font-semibold">{value}</p>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Wins, Risks, Next Steps */}
      <div className="grid grid-cols-3 gap-4">
        <div className="panel p-5">
          <h3 className="text-sm font-semibold mb-3">Wins</h3>
          <ul className="space-y-2">
            {report.wins.map((w, i) => (
              <li key={i} className="text-sm flex items-start gap-2">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                {w}
              </li>
            ))}
          </ul>
        </div>
        <div className="panel p-5">
          <h3 className="text-sm font-semibold mb-3">Risks & Issues</h3>
          <ul className="space-y-2">
            {report.risks.map((r, i) => (
              <li key={i} className="text-sm flex items-start gap-2">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber flex-shrink-0" />
                {r}
              </li>
            ))}
          </ul>
        </div>
        <div className="panel p-5">
          <h3 className="text-sm font-semibold mb-3">Next Steps</h3>
          <ul className="space-y-2">
            {report.nextSteps.map((n, i) => (
              <li key={i} className="text-sm flex items-start gap-2">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                {n}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
