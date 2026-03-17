/**
 * MIResultsView — structured display with Top 10 Keywords, Top 10 Competitors,
 * channel recommendations, summary, refinement input, and approval actions.
 * Benchmark assumptions are gated behind approved keyword + competitor research.
 * Competitors are classified as direct, indirect, or directory/platform.
 */
import { useState } from 'react';
import {
  Check, RotateCcw, Search, Shield, Target, BarChart3,
  FileText, Radio, Users, Send, CheckCircle2, Lock, Globe,
  Zap, MapPin, AlertTriangle, Building2, Layers,
} from 'lucide-react';
import type {
  MarketIntelligenceOutputs,
  MarketIntelligenceRun,
  AudienceModel,
  BenchmarkAssumption,
  CompetitorProfile,
  ChannelType,
  SourceType,
  SourceConfidence,
  CompetitorType,
  SERPSource,
  ResearchSourceMode,
} from '@/types/marketIntelligence';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';

interface Props {
  outputs: MarketIntelligenceOutputs;
  run: MarketIntelligenceRun | null;
  onRerun: () => void;
  onRefine: (note: string) => void;
  onApprove: () => void;
  onClose: () => void;
}

export default function MIResultsView({ outputs, run, onRerun, onRefine, onApprove, onClose }: Props) {
  const [refinementNote, setRefinementNote] = useState('');
  const isApproved = run?.status === 'approved';
  const hasKeywords = outputs.keywordThemes.length > 0;
  const hasCompetitors = outputs.competitorProfiles.length > 0;
  const benchmarksReady = isApproved && hasKeywords && hasCompetitors;

  const directCompetitors = outputs.competitorProfiles.filter(c => c.competitorType === 'direct' || !c.competitorType);
  const directoryCompetitors = outputs.competitorProfiles.filter(c => c.competitorType === 'directory_platform');
  const gapIndicator = directCompetitors.find(c => c.name.startsWith('⚠'));
  const realDirectCompetitors = directCompetitors.filter(c => !c.name.startsWith('⚠'));

  const benchmarksByChannel = outputs.benchmarkAssumptions.reduce<Record<string, BenchmarkAssumption[]>>((acc, ba) => {
    (acc[ba.channel] ??= []).push(ba);
    return acc;
  }, {});

  const audienceModels = outputs.audienceModels.filter(a => a.channelType === 'audience');
  const audiencesByChannel = audienceModels.reduce<Record<string, AudienceModel[]>>((acc, am) => {
    (acc[am.channel] ??= []).push(am);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isApproved ? 'bg-green-100 dark:bg-green-900/30' : 'bg-primary/10'}`}>
            {isApproved ? <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" /> : <Check className="h-4 w-4 text-primary" />}
          </div>
          <div>
            <h3 className="text-sm font-semibold">
              {isApproved ? 'Research Approved' : 'Research Complete — Review & Approve'}
            </h3>
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
          {!isApproved && (
            <button
              onClick={onApprove}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-green-600 text-white hover:bg-green-700 transition-colors"
            >
              <CheckCircle2 className="h-3 w-3" /> Approve Findings
            </button>
          )}
          <button onClick={onClose} className="px-3 py-1.5 rounded-md text-xs font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
            Done
          </button>
        </div>
      </div>

      {/* ─── RESEARCH SOURCE MODE ─── */}
      <ResearchSourceBanner
        sourceMode={outputs.researchSourceMode}
        sourceNote={outputs.researchSourceNote}
        selectedMode={outputs.selectedResearchMode}
      />

      {/* ─── DISCOVERY QUERIES ─── */}
      {outputs.discoveryQueries && outputs.discoveryQueries.length > 0 && (
        <div className="panel p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-semibold">Discovery Queries</h4>
            <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              {outputs.researchSourceMode === 'live_search' ? 'Used for live Google search' : 'Modeled from search intent patterns'}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {outputs.discoveryQueries.map((q, i) => (
              <span key={i} className="text-xs bg-accent/50 text-accent-foreground px-2.5 py-1 rounded-md font-medium">"{q}"</span>
            ))}
          </div>
        </div>
      )}

      {/* ─── CORE SEARCH KEYWORDS ─── */}
      {outputs.coreSearchKeywords && outputs.coreSearchKeywords.length > 0 && (
        <div className="panel p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-semibold">Core Search Keywords</h4>
            <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">Keyword themes for targeting</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {outputs.coreSearchKeywords.map((kw, i) => (
              <span key={i} className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-md font-medium">{kw}</span>
            ))}
          </div>
        </div>
      )}

      {/* ─── TOP 10 KEYWORDS ─── */}
      {hasKeywords && (
        <div className="panel p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-semibold">Top {outputs.keywordThemes.length} Keywords</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2 pr-3 text-xs font-medium text-muted-foreground">Keyword / Theme</th>
                  <th className="py-2 pr-3 text-xs font-medium text-muted-foreground">Intent</th>
                  <th className="py-2 pr-3 text-xs font-medium text-muted-foreground">Priority</th>
                  <th className="py-2 pr-3 text-xs font-medium text-muted-foreground">Source</th>
                  <th className="py-2 text-xs font-medium text-muted-foreground">Notes</th>
                </tr>
              </thead>
              <tbody>
                {outputs.keywordThemes.map(kt => (
                  <tr key={kt.id} className="border-b last:border-0">
                    <td className="py-2 pr-3">
                      <div className="font-medium text-xs">{kt.theme}</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {kt.keywordExamples.slice(0, 3).map((kw, i) => (
                          <span key={i} className="text-[10px] bg-muted px-1.5 py-0.5 rounded">{kw}</span>
                        ))}
                      </div>
                    </td>
                    <td className="py-2 pr-3"><IntentBadge intent={kt.intentType} /></td>
                    <td className="py-2 pr-3"><PriorityBadge priority={kt.priority || 'medium'} /></td>
                    <td className="py-2 pr-3">
                      <SourceBadge type={kt.sourceType} confidence={kt.sourceConfidence} />
                    </td>
                    <td className="py-2 text-[11px] text-muted-foreground max-w-[200px]">
                      {kt.demandCaptureRationale || kt.notes || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── DIRECT COMPETITORS ─── */}
      {realDirectCompetitors.length > 0 && (
        <div className="panel p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-semibold">Direct Competitors ({realDirectCompetitors.length})</h4>
            <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              {outputs.researchSourceMode === 'live_search'
                ? 'From live Google search results'
                : 'Modeled from discovery queries & industry pools'}
            </span>
          </div>
          <CompetitorTable competitors={realDirectCompetitors} />
          <p className="text-[10px] text-muted-foreground mt-2 italic">
            {outputs.researchSourceMode === 'live_search'
              ? 'Competitors identified from live Google search results for the discovery queries above. Rankings reflect frequency across queries and organic/paid presence.'
              : 'Methodology: Competitors are identified using generated discovery queries matched against modeled industry pools. Rankings reflect query frequency and organic/paid weighting. This is not live Google SERP data — results are modeled estimates.'}
          </p>
        </div>
      )}

      {/* ─── GAP INDICATOR ─── */}
      {gapIndicator && (
        <div className="panel border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-xs font-semibold text-amber-700 dark:text-amber-400">Insufficient Verified Competitors</h4>
              <p className="text-xs text-amber-600/80 dark:text-amber-400/70 mt-1">{gapIndicator.positioning}</p>
              <p className="text-xs text-amber-600/80 dark:text-amber-400/70 mt-0.5">{gapIndicator.channelObservations}</p>
            </div>
          </div>
        </div>
      )}

      {/* ─── DIRECTORIES & PLATFORMS ─── */}
      {directoryCompetitors.length > 0 && (
        <div className="panel p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-muted-foreground" />
            <h4 className="text-sm font-semibold text-muted-foreground">Directories & Platforms ({directoryCompetitors.length})</h4>
            <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">Not direct competitors — capture search traffic</span>
          </div>
          <CompetitorTable competitors={directoryCompetitors} />
        </div>
      )}

      {/* ─── CHANNEL RECOMMENDATIONS ─── */}
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

      {/* ─── AUDIENCE MODELS ─── */}
      {Object.keys(audiencesByChannel).length > 0 && (
        <div className="panel p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-semibold">Audience Models</h4>
          </div>
          {Object.entries(audiencesByChannel).map(([channel, models]) => (
            <div key={channel} className="space-y-2">
              <h5 className="text-xs font-semibold text-primary uppercase tracking-wider">{channel}</h5>
              {models.map(am => (
                <AudienceModelCard key={am.id} model={am} />
              ))}
            </div>
          ))}
        </div>
      )}

      {/* ─── RESEARCH SUMMARY ─── */}
      <div className="panel p-5 space-y-2">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          <h4 className="text-sm font-semibold">Research Summary</h4>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{outputs.researchSummary}</p>
      </div>

      {/* ─── REFINEMENT INPUT ─── */}
      {!isApproved && (
        <div className="panel p-5 space-y-3">
          <h4 className="text-sm font-semibold">Refine Research</h4>
          <p className="text-xs text-muted-foreground">
            Guide another research pass with specific instructions.
          </p>
          <Textarea
            value={refinementNote}
            onChange={e => setRefinementNote(e.target.value)}
            placeholder="e.g. focus on local competitors within 25 miles, prioritize commercial-intent keywords, exclude large national firms..."
            className="min-h-[60px] text-sm"
          />
          <button
            onClick={() => {
              if (refinementNote.trim()) onRefine(refinementNote.trim());
            }}
            disabled={!refinementNote.trim()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <Send className="h-3 w-3" /> Refine & Re-run
          </button>
        </div>
      )}

      {/* ─── BENCHMARK ASSUMPTIONS — gated ─── */}
      {benchmarksReady ? (
        outputs.benchmarkAssumptions.length > 0 && (
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
        )
      ) : (
        <div className="panel p-5">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Lock className="h-4 w-4" />
            <div>
              <h4 className="text-sm font-medium">Benchmark Assumptions — Pending</h4>
              <p className="text-xs mt-0.5">
                {!hasKeywords || !hasCompetitors
                  ? 'Top 10 Keywords and Competitors must be identified first.'
                  : 'Approve the findings above to unlock benchmark assumptions.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Approved banner */}
      {isApproved && run?.approved && (
        <div className="panel border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10 p-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="text-xs font-semibold text-green-700 dark:text-green-400">
              Findings approved and saved to client profile
            </span>
            <span className="text-[10px] text-green-600/70 dark:text-green-400/70 ml-auto">
              {format(new Date(run.approved.approvedAt), 'MMM d, yyyy · h:mm a')}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Sub-components ── */

function CompetitorTable({ competitors }: { competitors: CompetitorProfile[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left">
            <th className="py-2 pr-3 text-xs font-medium text-muted-foreground">Business</th>
            <th className="py-2 pr-3 text-xs font-medium text-muted-foreground">Website</th>
            <th className="py-2 pr-3 text-xs font-medium text-muted-foreground">SERP Source</th>
            <th className="py-2 pr-3 text-xs font-medium text-muted-foreground">Confidence</th>
            <th className="py-2 pr-3 text-xs font-medium text-muted-foreground">Source</th>
            <th className="py-2 text-xs font-medium text-muted-foreground">Details</th>
          </tr>
        </thead>
        <tbody>
          {competitors.map(cp => (
            <tr key={cp.id} className="border-b last:border-0">
              <td className="py-2 pr-3">
                <div className="font-medium text-xs">{cp.name}</div>
                <div className="text-[10px] text-muted-foreground">{cp.geography}</div>
              </td>
              <td className="py-2 pr-3">
                {cp.websiteUrl ? (
                  <a href={cp.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] text-primary hover:underline flex items-center gap-1">
                    <Globe className="h-3 w-3" />
                    {cp.websiteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                  </a>
                ) : (
                  <span className="text-[11px] text-muted-foreground">—</span>
                )}
              </td>
              <td className="py-2 pr-3">
                <SERPSourceBadge source={cp.serpSource} />
                {cp.queryFrequency != null && cp.totalQueries != null && (
                  <span className="text-[9px] text-muted-foreground block mt-0.5">
                    {cp.queryFrequency}/{cp.totalQueries} queries
                  </span>
                )}
              </td>
              <td className="py-2 pr-3">
                {cp.confidenceScore != null ? (
                  <div className="flex items-center gap-1.5">
                    <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${cp.confidenceScore >= 60 ? 'bg-green-500' : cp.confidenceScore >= 30 ? 'bg-blue-500' : 'bg-muted-foreground'}`}
                        style={{ width: `${cp.confidenceScore}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-medium">{cp.confidenceScore}%</span>
                  </div>
                ) : (
                  <span className="text-[10px] text-muted-foreground">—</span>
                )}
              </td>
              <td className="py-2 pr-3">
                <SourceBadge type={cp.sourceType} confidence={cp.sourceConfidence} />
              </td>
              <td className="py-2 text-[11px] text-muted-foreground max-w-[250px]">
                <div>{cp.positioning}</div>
                {cp.rankingKeywords && cp.rankingKeywords.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {cp.rankingKeywords.slice(0, 3).map((kw, i) => (
                      <span key={i} className="text-[10px] bg-muted px-1.5 py-0.5 rounded">{kw}</span>
                    ))}
                  </div>
                )}
                {cp.estimatedDomainAuthority != null && (
                  <span className="text-[10px] text-muted-foreground">DA ~{cp.estimatedDomainAuthority}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

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
          <div className="flex flex-wrap gap-1">
            {model.targetingCriteria.map((tc, i) => (
              <span key={i} className="text-[11px] bg-background border px-1.5 py-0.5 rounded">{tc}</span>
            ))}
          </div>
        </div>
        {(model.recommendedCPM || model.recommendedCTR || model.recommendedCVR) && (
          <div className="flex gap-3 ml-4 flex-shrink-0">
            {model.recommendedCPM != null && <MetricCell label="CPM" value={`$${model.recommendedCPM}`} />}
            {model.recommendedCTR != null && <MetricCell label="CTR" value={`${model.recommendedCTR}%`} />}
            {model.recommendedCVR != null && <MetricCell label="CVR" value={`${model.recommendedCVR}%`} />}
          </div>
        )}
      </div>
      <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
        {(model.estimatedReachMin || model.estimatedReachMax) && (
          <span>Est. reach: {model.estimatedReachMin?.toLocaleString()} – {model.estimatedReachMax?.toLocaleString()}</span>
        )}
        <button onClick={() => setExpanded(!expanded)} className="text-primary hover:underline">
          {expanded ? 'Hide rationale' : 'Show rationale'}
        </button>
      </div>
      {expanded && <p className="text-[11px] text-muted-foreground italic border-t pt-2">{model.reasoning}</p>}
    </div>
  );
}

function MetricCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-[10px] text-muted-foreground uppercase">{label}</p>
      <p className="text-xs font-semibold text-primary">{value}</p>
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

function RelevanceBadge({ value }: { value: string }) {
  if (value === 'n/a') return <span className="text-[10px] text-muted-foreground">—</span>;
  const cls = value === 'high'
    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    : value === 'medium'
      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      : 'bg-muted text-muted-foreground';
  return <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${cls}`}>{value}</span>;
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

function SERPSourceBadge({ source }: { source?: SERPSource }) {
  if (!source) return <span className="text-[10px] text-muted-foreground">—</span>;
  const config: Record<SERPSource, { label: string; cls: string }> = {
    organic: { label: 'Organic', cls: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    paid: { label: 'Paid', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    both: { label: 'Organic + Paid', cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  };
  const { label, cls } = config[source];
  return <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold whitespace-nowrap ${cls}`}>{label}</span>;
}

function SourceBadge({ type, confidence }: { type?: SourceType; confidence?: SourceConfidence }) {
  if (!type) return <span className="text-[10px] text-muted-foreground">—</span>;

  const typeLabels: Record<SourceType, { label: string; cls: string }> = {
    manual: { label: 'Manual', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    google_serp: { label: 'Google SERP', cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    google_maps: { label: 'Google Maps', cls: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    ai_inference: { label: 'AI Inference', cls: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
    prior_approved_research: { label: 'Prior Research', cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    internal_benchmark: { label: 'Benchmark', cls: 'bg-muted text-muted-foreground' },
  };

  const { label, cls } = typeLabels[type] || { label: type, cls: 'bg-muted text-muted-foreground' };

  return (
    <div className="flex flex-col gap-0.5">
      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium whitespace-nowrap ${cls}`}>{label}</span>
      {confidence && (
        <span className="text-[9px] text-muted-foreground">{confidence} conf.</span>
      )}
    </div>
  );
}

function ResearchSourceBanner({
  sourceMode,
  sourceNote,
  selectedMode,
}: {
  sourceMode?: ResearchSourceMode;
  sourceNote?: string;
  selectedMode?: 'auto' | 'live_only' | 'modeled_only';
}) {
  const isLive = sourceMode === 'live_search';
  const isFallback = selectedMode === 'auto' && sourceMode === 'modeled_fallback';
  const modeLabels: Record<string, string> = {
    auto: 'Auto',
    live_only: 'Live Only',
    modeled_only: 'Modeled Only',
  };
  return (
    <div className={`panel p-4 space-y-2 ${isLive ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10' : 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10'}`}>
      <div className="flex items-start gap-3">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${isLive ? 'bg-green-100 dark:bg-green-900/30' : 'bg-amber-100 dark:bg-amber-900/30'}`}>
          {isLive
            ? <Globe className="h-3 w-3 text-green-600 dark:text-green-400" />
            : <AlertTriangle className="h-3 w-3 text-amber-600 dark:text-amber-400" />}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className={`text-xs font-semibold ${isLive ? 'text-green-700 dark:text-green-400' : 'text-amber-700 dark:text-amber-400'}`}>
              {isLive ? 'Live Search Results' : 'Modeled Results'}
            </h4>
            {selectedMode && (
              <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                Selected: {modeLabels[selectedMode] || selectedMode}
              </span>
            )}
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${isLive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
              {isLive ? 'LIVE' : 'MODELED'}
            </span>
          </div>
          <p className={`text-xs mt-1 ${isLive ? 'text-green-600/80 dark:text-green-400/70' : 'text-amber-600/80 dark:text-amber-400/70'}`}>
            {sourceNote || (isLive
              ? 'Competitors identified from live Google search results via SerpAPI.'
              : 'Using modeled industry pools. Configure SerpAPI to enable live results.')}
          </p>
        </div>
      </div>
      {isFallback && (
        <div className="flex items-center gap-2 ml-9 pt-1 border-t border-amber-200/50 dark:border-amber-800/50">
          <AlertTriangle className="h-3 w-3 text-amber-500 shrink-0" />
          <p className="text-[11px] text-amber-600/80 dark:text-amber-400/70">
            Mode was set to Auto but live search was unavailable or failed. Results were generated using modeled industry pools instead. Check your SerpAPI configuration to enable live results.
          </p>
        </div>
      )}
    </div>
  );
}
