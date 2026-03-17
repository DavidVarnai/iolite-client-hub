import { useMemo, useState } from 'react';
import type { GrowthModel, GrowthModelScenario, FunnelType, ChannelAssumption } from '@/types/growthModel';
import type { MarketIntelligenceRun, BenchmarkAssumption, AudienceModel } from '@/types/marketIntelligence';
import { getChannelType } from '@/types/marketIntelligence';
import { calcFunnelOutputs } from '@/lib/growthModelCalculations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useClientContext } from '@/contexts/ClientContext';
import { repository } from '@/lib/repository';
import { Info, Sparkles, ChevronDown, ChevronUp, Check, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import RevenueModelDisplay from '@/components/client/RevenueModelDisplay';

interface Props {
  model: GrowthModel;
  scenario: GrowthModelScenario;
  onUpdate: (model: GrowthModel) => void;
}

const FUNNEL_TYPES: { value: FunnelType; label: string }[] = [
  { value: 'ecommerce', label: 'Ecommerce' },
  { value: 'lead_gen', label: 'Lead Gen' },
  { value: 'phone_calls', label: 'Phone Calls' },
  { value: 'hybrid', label: 'Hybrid' },
];

function InputField({ label, value, onChange, suffix, suggestion, onApply }: {
  label: string; value: number; onChange: (v: number) => void; suffix?: string;
  suggestion?: { value: number; rationale: string } | null;
  onApply?: (v: number) => void;
}) {
  const [showTip, setShowTip] = useState(false);
  const hasSuggestion = suggestion && suggestion.value > 0;

  return (
    <div>
      <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{label}</label>
      <div className="relative">
        <Input
          type="number"
          value={value || ''}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className={`h-8 text-xs tabular-nums pr-8 ${hasSuggestion ? 'border-primary/30' : ''}`}
          step="any"
        />
        {suffix && <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">{suffix}</span>}
      </div>
      {hasSuggestion && (
        <div className="mt-0.5 relative">
          <button
            onClick={() => setShowTip(!showTip)}
            className="flex items-center gap-1 text-[9px] text-primary hover:underline"
          >
            <Sparkles className="h-2.5 w-2.5" />
            MI: {suffix === '$' ? '$' : ''}{suggestion.value}{suffix === '%' ? '%' : ''}
            {onApply && (
              <button
                onClick={(e) => { e.stopPropagation(); onApply(suggestion.value); }}
                className="ml-1 text-[9px] bg-primary/10 text-primary px-1 rounded hover:bg-primary/20"
              >
                Apply
              </button>
            )}
          </button>
          {showTip && (
            <div className="absolute z-10 top-full left-0 mt-1 w-56 bg-popover border rounded-md p-2 shadow-lg">
              <p className="text-[10px] text-muted-foreground">{suggestion.rationale}</p>
              <p className="text-[9px] text-primary/60 mt-1">Source: Market Intelligence</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function fmt(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toFixed(0);
}

/** Map MI benchmarks to ChannelAssumption fields for a given channel */
function getMISuggestions(
  benchmarks: BenchmarkAssumption[],
  audiences: AudienceModel[],
  channel: string,
): Record<string, { value: number; rationale: string }> {
  const result: Record<string, { value: number; rationale: string }> = {};
  const channelBenchmarks = benchmarks.filter(b => b.channel === channel);
  const channelAudiences = audiences.filter(a => a.channel === channel);

  for (const b of channelBenchmarks) {
    const metric = b.metric.toLowerCase();
    if (metric.includes('cpm')) {
      result.cpm = { value: b.recommended, rationale: b.rationale };
    } else if (metric === 'ctr' || metric.includes('ctr')) {
      result.ctr = { value: b.recommended, rationale: b.rationale };
    } else if (metric === 'cpc' || metric.includes('cpc')) {
      result.cpc = { value: b.recommended, rationale: b.rationale };
    } else if (metric === 'cvr' || metric.includes('cvr') || metric.includes('conv')) {
      result.lpConvRate = { value: b.recommended, rationale: b.rationale };
    } else if (metric.includes('cpl')) {
      result.targetCpl = { value: b.recommended, rationale: b.rationale };
    } else if (metric.includes('cpa')) {
      result.targetCpa = { value: b.recommended, rationale: b.rationale };
    }
  }

  // For audience channels, derive from audience model metrics if not already set
  const chType = getChannelType(channel);
  if (chType === 'audience') {
    // Use the prospecting (awareness/consideration) audience as primary source
    const primary = channelAudiences.find(a => a.funnelStage === 'awareness' || a.funnelStage === 'consideration')
      || channelAudiences[0];
    if (primary) {
      if (primary.recommendedCPM && !result.cpm) {
        result.cpm = { value: primary.recommendedCPM, rationale: primary.reasoning };
      }
      if (primary.recommendedCTR && !result.ctr) {
        result.ctr = { value: primary.recommendedCTR, rationale: primary.reasoning };
      }
      if (primary.recommendedCVR && !result.lpConvRate) {
        result.lpConvRate = { value: primary.recommendedCVR, rationale: primary.reasoning };
      }
    }
  }

  return result;
}

export default function ChannelAssumptions({ model, scenario, onUpdate }: Props) {
  const { client, onboarding } = useClientContext();
  const [showMIBanner, setShowMIBanner] = useState(true);

  const revenueModel = onboarding.discovery.revenueModel;
  const globalAov = useMemo(() => {
    if (revenueModel?.revenuePerConversion > 0) return revenueModel.revenuePerConversion;
    const raw = onboarding.discovery.avgOrderValue || '';
    const parsed = parseFloat(raw.replace(/[^0-9.]/g, ''));
    return isNaN(parsed) ? 0 : parsed;
  }, [revenueModel, onboarding.discovery.avgOrderValue]);

  // Fetch latest MI run for this client
  const miRun = useMemo<MarketIntelligenceRun | null>(() => {
    return repository.marketIntelligence.getLatestByClient(client.id);
  }, [client.id]);

  const handleFunnelChange = (ft: FunnelType) => {
    onUpdate({ ...model, funnelType: ft });
  };

  const handleAssumptionChange = (channelId: string, field: keyof ChannelAssumption, value: number) => {
    const updatedScenarios = model.scenarios.map(s => {
      if (s.id !== scenario.id) return s;
      return {
        ...s,
        channelAssumptions: s.channelAssumptions.map(ca =>
          ca.id === channelId ? { ...ca, [field]: value } : ca
        ),
      };
    });
    onUpdate({ ...model, scenarios: updatedScenarios });
  };

  const handleApplyAllMI = () => {
    if (!miRun) return;
    const { benchmarkAssumptions, audienceModels } = miRun.outputs;
    let appliedCount = 0;

    const updatedScenarios = model.scenarios.map(s => {
      if (s.id !== scenario.id) return s;
      return {
        ...s,
        channelAssumptions: s.channelAssumptions.map(ca => {
          const suggestions = getMISuggestions(benchmarkAssumptions, audienceModels, ca.channel);
          if (Object.keys(suggestions).length === 0) return ca;

          const updated = { ...ca };
          for (const [field, { value }] of Object.entries(suggestions)) {
            const key = field as keyof ChannelAssumption;
            // Only apply if current value is 0 (empty)
            if ((updated[key] as number) === 0) {
              (updated as any)[key] = value;
              appliedCount++;
            }
          }
          return updated;
        }),
      };
    });

    onUpdate({ ...model, scenarios: updatedScenarios });
    toast.success(`Applied ${appliedCount} research-based assumptions`, {
      description: 'Only empty fields were populated. Existing values were preserved.',
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* MI Integration Banner */}
      {miRun && miRun.status === 'complete' && showMIBanner && (
        <div className="panel border-primary/20 bg-primary/5 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold text-foreground">Market Intelligence Available</span>
              <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                {miRun.outputs.benchmarkAssumptions.length} benchmarks · {miRun.outputs.audienceModels.length} audience models
              </span>
            </div>
            <button onClick={() => setShowMIBanner(false)} className="text-muted-foreground hover:text-foreground text-xs">✕</button>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Research-based assumptions are available from the latest Market Intelligence run.
            You can apply them to empty fields or use individual suggestions per channel.
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={handleApplyAllMI}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            >
              <Sparkles className="h-3 w-3" /> Apply Research-Based Assumptions
            </button>
            <span className="text-[10px] text-muted-foreground italic">Only fills empty fields — existing values stay unchanged</span>
          </div>
        </div>
      )}

      {!miRun && (
        <div className="panel p-4 flex items-center gap-3 border-dashed">
          <Info className="h-4 w-4 text-muted-foreground shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">
              No Market Intelligence run found for this client. Run Market Intelligence from the Intelligence tab to get research-based benchmark suggestions.
            </p>
          </div>
        </div>
      )}

      {/* Revenue per Conversion — read-only from Discovery */}
      {revenueModel && <RevenueModelDisplay revenueModel={revenueModel} />}

      {/* Funnel type selector */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-semibold text-foreground">Funnel Model</label>
        <Select value={model.funnelType} onValueChange={(v) => handleFunnelChange(v as FunnelType)}>
          <SelectTrigger className="w-[180px] h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FUNNEL_TYPES.map(ft => (
              <SelectItem key={ft.value} value={ft.value} className="text-xs">{ft.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Channel cards */}
      <div className="grid gap-4">
        {scenario.channelAssumptions.map(ca => {
          const mp = scenario.mediaChannelPlans.find(m => m.channel === ca.channel);
          const avgBudget = mp && mp.monthlyRecords.length > 0
            ? mp.monthlyRecords.reduce((s, r) => s + r.plannedBudget, 0) / mp.monthlyRecords.length : 0;
          const caWithGlobalAov = { ...ca, aov: globalAov || ca.aov };
          const output = calcFunnelOutputs(caWithGlobalAov, avgBudget, model.funnelType);

          const suggestions = miRun?.status === 'complete'
            ? getMISuggestions(miRun.outputs.benchmarkAssumptions, miRun.outputs.audienceModels, ca.channel)
            : {};

          const channelAudiences = miRun?.status === 'complete'
            ? miRun.outputs.audienceModels.filter(a => a.channel === ca.channel && a.channelType === 'audience')
            : [];

          return (
            <ChannelCard
              key={ca.id}
              ca={ca}
              avgBudget={avgBudget}
              output={output}
              model={model}
              onAssumptionChange={handleAssumptionChange}
              globalAov={globalAov}
              suggestions={suggestions}
              audiences={channelAudiences}
            />
          );
        })}
      </div>
    </div>
  );
}

function ChannelCard({ ca, avgBudget, output, model, onAssumptionChange, globalAov, suggestions, audiences }: {
  ca: ChannelAssumption;
  avgBudget: number;
  output: ReturnType<typeof calcFunnelOutputs>;
  model: GrowthModel;
  onAssumptionChange: (channelId: string, field: keyof ChannelAssumption, value: number) => void;
  globalAov: number;
  suggestions: Record<string, { value: number; rationale: string }>;
  audiences: AudienceModel[];
}) {
  const [showAudiences, setShowAudiences] = useState(false);
  const hasSuggestions = Object.keys(suggestions).length > 0;
  const channelType = getChannelType(ca.channel);

  const applySuggestion = (field: keyof ChannelAssumption, value: number) => {
    onAssumptionChange(ca.id, field, value);
    toast.success(`Applied ${field} = ${value}`, { description: `From Market Intelligence for ${ca.channel}` });
  };

  const applyAllForChannel = () => {
    let count = 0;
    for (const [field, { value }] of Object.entries(suggestions)) {
      onAssumptionChange(ca.id, field as keyof ChannelAssumption, value);
      count++;
    }
    toast.success(`Applied ${count} suggestions for ${ca.channel}`);
  };

  return (
    <Card className="border">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>{ca.channel}</span>
            {channelType === 'search' && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">Search</span>
            )}
            {channelType === 'audience' && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">Audience</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {hasSuggestions && (
              <button
                onClick={applyAllForChannel}
                className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                <Sparkles className="h-3 w-3" /> Apply MI Suggestions
              </button>
            )}
            <span className="text-xs font-normal text-muted-foreground">
              Avg. monthly budget: ${avgBudget.toLocaleString()}
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Audience insights for audience-based channels */}
        {audiences.length > 0 && (
          <div className="border rounded-md bg-primary/5 border-primary/10">
            <button
              onClick={() => setShowAudiences(!showAudiences)}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-primary"
            >
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-3 w-3" />
                {audiences.length} MI Audience Model{audiences.length > 1 ? 's' : ''}
              </span>
              {showAudiences ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
            {showAudiences && (
              <div className="px-3 pb-3 space-y-2">
                {audiences.map(am => (
                  <div key={am.id} className="bg-background rounded-md p-2.5 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-medium">{am.audienceDefinition}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{am.funnelStage}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {am.targetingCriteria.map((tc, i) => (
                        <span key={i} className="text-[10px] bg-muted px-1.5 py-0.5 rounded">{tc}</span>
                      ))}
                    </div>
                    <div className="flex gap-4 text-[10px] text-muted-foreground">
                      {am.estimatedReachMin != null && am.estimatedReachMax != null && (
                        <span>Reach: {am.estimatedReachMin.toLocaleString()} – {am.estimatedReachMax.toLocaleString()}</span>
                      )}
                      {am.recommendedCPM != null && <span>CPM: ${am.recommendedCPM}</span>}
                      {am.recommendedCTR != null && <span>CTR: {am.recommendedCTR}%</span>}
                      {am.recommendedCVR != null && <span>CVR: {am.recommendedCVR}%</span>}
                    </div>
                    <p className="text-[10px] text-muted-foreground italic">{am.reasoning}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Input fields */}
        <div>
          <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Assumptions (Inputs)</h4>
          <div className="grid grid-cols-5 gap-3">
            <InputField label="CPM" value={ca.cpm} onChange={(v) => onAssumptionChange(ca.id, 'cpm', v)} suffix="$"
              suggestion={suggestions.cpm} onApply={(v) => applySuggestion('cpm', v)} />
            <InputField label="CTR" value={ca.ctr} onChange={(v) => onAssumptionChange(ca.id, 'ctr', v)} suffix="%"
              suggestion={suggestions.ctr} onApply={(v) => applySuggestion('ctr', v)} />
            <InputField label="CPC" value={ca.cpc} onChange={(v) => onAssumptionChange(ca.id, 'cpc', v)} suffix="$"
              suggestion={suggestions.cpc} onApply={(v) => applySuggestion('cpc', v)} />
            <InputField label="LP Conv Rate" value={ca.lpConvRate} onChange={(v) => onAssumptionChange(ca.id, 'lpConvRate', v)} suffix="%"
              suggestion={suggestions.lpConvRate} onApply={(v) => applySuggestion('lpConvRate', v)} />
            <div>
              <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">AOV / Deal</label>
              <div className="relative">
                <Input
                  type="number"
                  value={globalAov || ca.aov || ''}
                  readOnly
                  className="h-8 text-xs tabular-nums pr-8 bg-muted/50 cursor-not-allowed"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">$</span>
              </div>
              <p className="text-[9px] text-muted-foreground mt-0.5">From Discovery</p>
            </div>
            {(model.funnelType === 'lead_gen' || model.funnelType === 'hybrid') && (
              <>
                <InputField label="Lead Conv" value={ca.leadConvRate} onChange={(v) => onAssumptionChange(ca.id, 'leadConvRate', v)} suffix="%" />
                <InputField label="Qual Rate" value={ca.qualRate} onChange={(v) => onAssumptionChange(ca.id, 'qualRate', v)} suffix="%" />
                <InputField label="Close Rate" value={ca.closeRate} onChange={(v) => onAssumptionChange(ca.id, 'closeRate', v)} suffix="%" />
              </>
            )}
            {(model.funnelType === 'phone_calls' || model.funnelType === 'hybrid') && (
              <InputField label="Call Conv" value={ca.callConvRate} onChange={(v) => onAssumptionChange(ca.id, 'callConvRate', v)} suffix="%" />
            )}
            <InputField label="Target CPL" value={ca.targetCpl} onChange={(v) => onAssumptionChange(ca.id, 'targetCpl', v)} suffix="$"
              suggestion={suggestions.targetCpl} onApply={(v) => applySuggestion('targetCpl', v)} />
            <InputField label="Target CPA" value={ca.targetCpa} onChange={(v) => onAssumptionChange(ca.id, 'targetCpa', v)} suffix="$"
              suggestion={suggestions.targetCpa} onApply={(v) => applySuggestion('targetCpa', v)} />
          </div>
        </div>

        {/* Calculated outputs */}
        <div className="border-t pt-3">
          <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Projected Monthly Output (Calculated)</h4>
          <div className="grid grid-cols-5 gap-3">
            {[
              { label: 'Impressions', value: fmt(output.impressions) },
              { label: 'Clicks', value: fmt(output.clicks) },
              ...(model.funnelType !== 'ecommerce' ? [{ label: 'Leads', value: fmt(output.leads) }] : []),
              ...(model.funnelType === 'phone_calls' || model.funnelType === 'hybrid' ? [{ label: 'Calls', value: fmt(output.calls) }] : []),
              ...(model.funnelType === 'lead_gen' || model.funnelType === 'hybrid' ? [
                { label: 'MQLs', value: fmt(output.mqls) },
                { label: 'SQLs', value: fmt(output.sqls) },
              ] : []),
              { label: 'Customers', value: fmt(output.customers) },
              { label: 'Revenue', value: `$${fmt(output.revenue)}` },
            ].map(item => (
              <div key={item.label} className="bg-muted/50 rounded-md px-3 py-2">
                <p className="text-[10px] text-muted-foreground">{item.label}</p>
                <p className="text-sm font-semibold text-foreground tabular-nums">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
