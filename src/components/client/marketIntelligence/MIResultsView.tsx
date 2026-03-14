/**
 * MIResultsView — structured display of Market Intelligence outputs.
 * Shows each output section as a clean card.
 */
import { Check, RotateCcw, Tag, Users, Target, BarChart3, FileText, Shield } from 'lucide-react';
import type { MarketIntelligenceOutputs, MarketIntelligenceRun } from '@/types/marketIntelligence';
import { format } from 'date-fns';

interface Props {
  outputs: MarketIntelligenceOutputs;
  run: MarketIntelligenceRun | null;
  onRerun: () => void;
  onClose: () => void;
}

export default function MIResultsView({ outputs, run, onRerun, onClose }: Props) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Check className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Research Complete</h3>
            {run?.generatedAt && (
              <p className="text-[11px] text-muted-foreground">
                Generated {format(new Date(run.generatedAt), 'MMM d, yyyy · h:mm a')}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onRerun}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-muted hover:bg-muted/80 transition-colors"
          >
            <RotateCcw className="h-3 w-3" /> Re-run
          </button>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-md text-xs font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Done
          </button>
        </div>
      </div>

      {/* Research Summary */}
      <div className="panel p-5 space-y-2">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          <h4 className="text-sm font-semibold">Research Summary</h4>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{outputs.researchSummary}</p>
      </div>

      {/* Keyword Themes */}
      {outputs.keywordThemes.length > 0 && (
        <div className="panel p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-semibold">Keyword Themes</h4>
            <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              {outputs.keywordThemes.length} themes
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {outputs.keywordThemes.map(kt => (
              <div key={kt.id} className="bg-muted/50 rounded-lg p-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{kt.theme}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                    kt.intentType === 'transactional' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : kt.intentType === 'commercial' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    : kt.intentType === 'informational' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                    : 'bg-muted text-muted-foreground'
                  }`}>
                    {kt.intentType}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {kt.keywordExamples.map((kw, i) => (
                    <span key={i} className="text-[11px] bg-background border px-1.5 py-0.5 rounded">
                      {kw}
                    </span>
                  ))}
                </div>
                {kt.notes && (
                  <p className="text-[11px] text-muted-foreground">{kt.notes}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Competitor Profiles */}
      {outputs.competitorProfiles.length > 0 && (
        <div className="panel p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-semibold">Competitor Profiles</h4>
          </div>
          <div className="space-y-3">
            {outputs.competitorProfiles.map(cp => (
              <div key={cp.id} className="bg-muted/50 rounded-lg p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{cp.name}</span>
                  <span className="text-[10px] text-muted-foreground">{cp.geography}</span>
                </div>
                <p className="text-xs text-muted-foreground">{cp.positioning}</p>
                <p className="text-xs"><span className="font-medium">Channels:</span> {cp.channelObservations}</p>
                {cp.notes && <p className="text-[11px] text-amber-600 dark:text-amber-400">{cp.notes}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audience Models */}
      {outputs.audienceModels.length > 0 && (
        <div className="panel p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-semibold">Audience Models</h4>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {outputs.audienceModels.map(am => (
              <div key={am.id} className="bg-muted/50 rounded-lg p-3 space-y-1.5">
                <span className="text-xs font-semibold text-primary">{am.channel}</span>
                <p className="text-sm">{am.audienceDefinition}</p>
                {(am.estimatedReachMin || am.estimatedReachMax) && (
                  <p className="text-[11px] text-muted-foreground">
                    Est. reach: {am.estimatedReachMin?.toLocaleString()} – {am.estimatedReachMax?.toLocaleString()}
                  </p>
                )}
                <p className="text-[11px] text-muted-foreground">{am.reasoning}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Channel Recommendations */}
      {outputs.channelRecommendations.length > 0 && (
        <div className="panel p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-semibold">Channel Recommendations</h4>
          </div>
          <div className="space-y-2">
            {outputs.channelRecommendations.map((cr, i) => (
              <div key={i} className="flex items-start gap-3 bg-muted/50 rounded-lg p-3">
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold mt-0.5 flex-shrink-0 ${
                  cr.priority === 'high' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : cr.priority === 'medium' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'bg-muted text-muted-foreground'
                }`}>
                  {cr.priority}
                </span>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{cr.channel}</span>
                    <span className="text-[11px] text-muted-foreground">— {cr.role}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{cr.rationale}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Benchmark Assumptions */}
      {outputs.benchmarkAssumptions.length > 0 && (
        <div className="panel p-5 space-y-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-semibold">Benchmark Assumptions</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2 pr-4 text-xs font-medium text-muted-foreground">Channel</th>
                  <th className="py-2 pr-4 text-xs font-medium text-muted-foreground">Metric</th>
                  <th className="py-2 pr-4 text-xs font-medium text-muted-foreground text-right">Low</th>
                  <th className="py-2 pr-4 text-xs font-medium text-muted-foreground text-right">Recommended</th>
                  <th className="py-2 pr-4 text-xs font-medium text-muted-foreground text-right">High</th>
                  <th className="py-2 text-xs font-medium text-muted-foreground">Rationale</th>
                </tr>
              </thead>
              <tbody>
                {outputs.benchmarkAssumptions.map((ba, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="py-2 pr-4 text-xs">{ba.channel}</td>
                    <td className="py-2 pr-4 text-xs font-medium">{ba.metric}</td>
                    <td className="py-2 pr-4 text-xs text-right text-muted-foreground">{ba.low}</td>
                    <td className="py-2 pr-4 text-xs text-right font-semibold text-primary">{ba.recommended}</td>
                    <td className="py-2 pr-4 text-xs text-right text-muted-foreground">{ba.high}</td>
                    <td className="py-2 text-[11px] text-muted-foreground">{ba.rationale}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
