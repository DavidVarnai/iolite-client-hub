/**
 * MIResultsView — channel-aware structured display of Market Intelligence outputs.
 * Search channels show keyword themes; audience channels show audience models with CPM/CTR/CVR.
 */
import { useState } from 'react';
import { Check, RotateCcw, Tag, Users, Target, BarChart3, FileText, Shield, Search, Radio } from 'lucide-react';
import type {
  MarketIntelligenceOutputs,
  MarketIntelligenceRun,
  AudienceModel,
  BenchmarkAssumption,
  ChannelType,
} from '@/types/marketIntelligence';
import { format } from 'date-fns';

interface Props {
  outputs: MarketIntelligenceOutputs;
  run: MarketIntelligenceRun | null;
  onRerun: () => void;
  onClose: () => void;
}

export default function MIResultsView({ outputs, run, onRerun, onClose }: Props) {
  const searchAudiences = outputs.audienceModels.filter(a => a.channelType === 'search');
  const audienceModels = outputs.audienceModels.filter(a => a.channelType === 'audience');

  // Group benchmarks by channel
  const benchmarksByChannel = outputs.benchmarkAssumptions.reduce<Record<string, BenchmarkAssumption[]>>((acc, ba) => {
    (acc[ba.channel] ??= []).push(ba);
    return acc;
  }, {});

  // Group audience models by channel
  const audiencesByChannel = audienceModels.reduce<Record<string, AudienceModel[]>>((acc, am) => {
    (acc[am.channel] ??= []).push(am);
    return acc;
  }, {});

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
          <button onClick={onRerun} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-muted hover:bg-muted/80 transition-colors">
            <RotateCcw className="h-3 w-3" /> Re-run
          </button>
          <button onClick={onClose} className="px-3 py-1.5 rounded-md text-xs font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
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
                <div className="flex flex-col items-center gap-1 flex-shrink-0 mt-0.5">
                  <PriorityBadge priority={cr.priority} />
                  <ChannelTypeBadge type={cr.channelType} />
                </div>
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

      {/* ─── SEARCH SECTION: Keyword Themes ─── */}
      {outputs.keywordThemes.length > 0 && (
        <div className="panel p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-semibold">Search & Keyword Themes</h4>
            <ChannelTypeBadge type="search" />
            <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              {outputs.keywordThemes.length} themes
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {outputs.keywordThemes.map(kt => (
              <div key={kt.id} className="bg-muted/50 rounded-lg p-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{kt.theme}</span>
                  <IntentBadge intent={kt.intentType} />
                </div>
                <div className="flex flex-wrap gap-1">
                  {kt.keywordExamples.map((kw, i) => (
                    <span key={i} className="text-[11px] bg-background border px-1.5 py-0.5 rounded">{kw}</span>
                  ))}
                </div>
                {kt.demandCaptureRationale && (
                  <p className="text-[11px] text-muted-foreground italic">{kt.demandCaptureRationale}</p>
                )}
                {kt.notes && <p className="text-[11px] text-muted-foreground">{kt.notes}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── AUDIENCE SECTION: Per-channel audience models ─── */}
      {Object.keys(audiencesByChannel).length > 0 && (
        <div className="panel p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-semibold">Audience Models</h4>
            <ChannelTypeBadge type="audience" />
          </div>

          {Object.entries(audiencesByChannel).map(([channel, models]) => (
            <div key={channel} className="space-y-2">
              <h5 className="text-xs font-semibold text-primary uppercase tracking-wider">{channel}</h5>
              <div className="grid grid-cols-1 gap-3">
                {models.map(am => (
                  <AudienceModelCard key={am.id} model={am} />
                ))}
              </div>
            </div>
          ))}
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

      {/* ─── BENCHMARK ASSUMPTIONS — grouped by channel ─── */}
      {outputs.benchmarkAssumptions.length > 0 && (
        <div className="panel p-5 space-y-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-semibold">Benchmark Assumptions</h4>
            <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded italic">
              Modeled assumptions — validate with actuals
            </span>
          </div>

          {Object.entries(benchmarksByChannel).map(([channel, benchmarks]) => (
            <div key={channel} className="space-y-2">
              <div className="flex items-center gap-2">
                <h5 className="text-xs font-semibold uppercase tracking-wider">{channel}</h5>
                <ChannelTypeBadge type={benchmarks[0]?.channelType || 'other'} />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="py-1.5 pr-4 text-xs font-medium text-muted-foreground">Metric</th>
                      <th className="py-1.5 pr-4 text-xs font-medium text-muted-foreground text-right">Low</th>
                      <th className="py-1.5 pr-4 text-xs font-medium text-muted-foreground text-right">Rec.</th>
                      <th className="py-1.5 pr-4 text-xs font-medium text-muted-foreground text-right">High</th>
                      <th className="py-1.5 text-xs font-medium text-muted-foreground">Rationale</th>
                    </tr>
                  </thead>
                  <tbody>
                    {benchmarks.map((ba, i) => (
                      <tr key={i} className="border-b last:border-0">
                        <td className="py-1.5 pr-4 text-xs font-medium">{ba.metric}</td>
                        <td className="py-1.5 pr-4 text-xs text-right text-muted-foreground">{formatBenchmarkValue(ba.low, ba.unit)}</td>
                        <td className="py-1.5 pr-4 text-xs text-right font-semibold text-primary">{formatBenchmarkValue(ba.recommended, ba.unit)}</td>
                        <td className="py-1.5 pr-4 text-xs text-right text-muted-foreground">{formatBenchmarkValue(ba.high, ba.unit)}</td>
                        <td className="py-1.5 text-[11px] text-muted-foreground">{ba.rationale}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Sub-components ── */

function AudienceModelCard({ model }: { model: AudienceModel }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-muted/50 rounded-lg p-3 space-y-2">
      <div className="flex items-start justify-between">
        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-2">
            <FunnelBadge stage={model.funnelStage} />
            <span className="text-sm font-medium">{model.audienceDefinition}</span>
          </div>

          {/* Targeting criteria */}
          <div className="flex flex-wrap gap-1">
            {model.targetingCriteria.map((tc, i) => (
              <span key={i} className="text-[11px] bg-background border px-1.5 py-0.5 rounded">{tc}</span>
            ))}
          </div>
        </div>

        {/* Quick metrics */}
        {(model.recommendedCPM || model.recommendedCTR || model.recommendedCVR) && (
          <div className="flex gap-3 ml-4 flex-shrink-0">
            {model.recommendedCPM != null && (
              <div className="text-center">
                <p className="text-[10px] text-muted-foreground uppercase">CPM</p>
                <p className="text-xs font-semibold text-primary">${model.recommendedCPM}</p>
              </div>
            )}
            {model.recommendedCTR != null && (
              <div className="text-center">
                <p className="text-[10px] text-muted-foreground uppercase">CTR</p>
                <p className="text-xs font-semibold text-primary">{model.recommendedCTR}%</p>
              </div>
            )}
            {model.recommendedCVR != null && (
              <div className="text-center">
                <p className="text-[10px] text-muted-foreground uppercase">CVR</p>
                <p className="text-xs font-semibold text-primary">{model.recommendedCVR}%</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Reach + reasoning */}
      <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
        {(model.estimatedReachMin || model.estimatedReachMax) && (
          <span>Est. reach: {model.estimatedReachMin?.toLocaleString()} – {model.estimatedReachMax?.toLocaleString()}</span>
        )}
        <button onClick={() => setExpanded(!expanded)} className="text-primary hover:underline">
          {expanded ? 'Hide rationale' : 'Show rationale'}
        </button>
      </div>

      {expanded && (
        <p className="text-[11px] text-muted-foreground italic border-t pt-2">{model.reasoning}</p>
      )}
    </div>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const cls = priority === 'high'
    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    : priority === 'medium'
      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      : 'bg-muted text-muted-foreground';
  return <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${cls}`}>{priority}</span>;
}

function ChannelTypeBadge({ type }: { type: ChannelType }) {
  const label = type === 'search' ? 'Search' : type === 'audience' ? 'Audience' : type === 'content' ? 'Content' : type === 'email' ? 'Email' : 'Other';
  const icon = type === 'search' ? <Search className="h-2.5 w-2.5" /> : type === 'audience' ? <Radio className="h-2.5 w-2.5" /> : null;
  return (
    <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
      {icon} {label}
    </span>
  );
}

function IntentBadge({ intent }: { intent: string }) {
  const cls = intent === 'transactional' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    : intent === 'commercial' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    : intent === 'informational' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
    : 'bg-muted text-muted-foreground';
  return <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${cls}`}>{intent}</span>;
}

function FunnelBadge({ stage }: { stage: string }) {
  const cls = stage === 'conversion' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    : stage === 'consideration' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    : stage === 'awareness' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
    : 'bg-muted text-muted-foreground';
  return <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${cls}`}>{stage}</span>;
}

function formatBenchmarkValue(value: number, unit: string): string {
  if (unit === '$') return `$${value.toLocaleString(undefined, { minimumFractionDigits: value < 1 ? 2 : 0, maximumFractionDigits: 2 })}`;
  if (unit === '%' || unit === '%/mo') return `${value}${unit}`;
  return `${value} ${unit}`;
}
