/**
 * ResearchSetupStep — editable research scope before running MI.
 */
import { useState } from 'react';
import { Sparkles, MapPin, Globe, Database, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import type { MarketIntelligenceInputs, LocalRadius, CompetitorResearchPreference } from '@/types/marketIntelligence';
import { LOCAL_RADIUS_OPTIONS, CHANNEL_TYPE_MAP } from '@/types/marketIntelligence';
import { repository } from '@/lib/repository';

interface Props {
  initialInputs: MarketIntelligenceInputs;
  onRun: (inputs: MarketIntelligenceInputs) => void;
}

const ALL_CHANNELS = Object.keys(CHANNEL_TYPE_MAP);

const RESEARCH_MODE_OPTIONS: { value: CompetitorResearchPreference; label: string; icon: typeof Globe; description: string }[] = [
  { value: 'auto', label: 'Auto', icon: Sparkles, description: 'Try live search, fall back to modeled' },
  { value: 'live_only', label: 'Live Search', icon: Globe, description: 'Real Google results via SerpAPI' },
  { value: 'modeled_only', label: 'Modeled', icon: Database, description: 'Modeled industry pools (no API cost)' },
];

export default function ResearchSetupStep({ initialInputs, onRun }: Props) {
  const [inputs, setInputs] = useState<MarketIntelligenceInputs>(() => {
    const defaults = repository.marketIntelligenceDefaults.get();
    const adminMode = defaults.competitorResearchMode || 'auto';
    return {
      ...initialInputs,
      competitorResearchMode: initialInputs.competitorResearchMode || adminMode,
    };
  });

  const update = (patch: Partial<MarketIntelligenceInputs>) =>
    setInputs(prev => ({ ...prev, ...patch }));

  const isLocal = !!(inputs.serviceArea?.trim() || inputs.primaryCity?.trim());

  const toggleChannel = (ch: string) => {
    const current = inputs.selectedChannels;
    update({
      selectedChannels: current.includes(ch)
        ? current.filter(c => c !== ch)
        : [...current, ch],
    });
  };

  const activeMode = inputs.competitorResearchMode || 'auto';
  const hasBriefSignals = !!(inputs.masterBriefSignals && (
    inputs.masterBriefSignals.audiences?.length ||
    inputs.masterBriefSignals.inferredCompetitors?.length ||
    inputs.masterBriefSignals.painPoints?.length
  ));

  return (
    <div className="space-y-6 max-w-2xl mx-auto py-4">
      <div className="text-center space-y-1">
        <h3 className="text-sm font-semibold">Research Scope</h3>
        <p className="text-xs text-muted-foreground">
          Review and adjust inputs before running Market Intelligence.
        </p>
      </div>

      {/* Master Brief Enhancement indicator */}
      {hasBriefSignals && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-primary/5 border border-primary/15">
          <FileText className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs text-primary font-medium">Enhanced with Master Brief insights</span>
          <span className="text-[10px] text-muted-foreground">
            — {[
              inputs.masterBriefSignals?.inferredCompetitors?.length ? `${inputs.masterBriefSignals.inferredCompetitors.length} competitors` : '',
              inputs.masterBriefSignals?.audiences?.length ? `${inputs.masterBriefSignals.audiences.length} audiences` : '',
              inputs.masterBriefSignals?.painPoints?.length ? `${inputs.masterBriefSignals.painPoints.length} pain points` : '',
            ].filter(Boolean).join(', ')} will be used to enhance discovery
          </span>
        </div>
      )}

      {/* Competitor Research Mode */}
      <div className="panel p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold">Competitor Research Mode</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {RESEARCH_MODE_OPTIONS.map(opt => {
            const Icon = opt.icon;
            const isActive = activeMode === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => update({ competitorResearchMode: opt.value })}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-lg text-center transition-colors border ${
                  isActive
                    ? 'bg-primary/10 border-primary text-primary'
                    : 'bg-muted/50 border-transparent hover:bg-muted text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="text-xs font-medium">{opt.label}</span>
                <span className="text-[10px] text-muted-foreground leading-tight">{opt.description}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of editable fields */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Industry">
          <Input
            value={inputs.industry}
            onChange={e => update({ industry: e.target.value })}
            className="h-8 text-sm"
          />
        </Field>
        <Field label="Products / Services">
          <Input
            value={inputs.productsOrServices}
            onChange={e => update({ productsOrServices: e.target.value })}
            className="h-8 text-sm"
          />
        </Field>
        <Field label="Target Audience" span={2}>
          <Input
            value={inputs.targetAudience}
            onChange={e => update({ targetAudience: e.target.value })}
            className="h-8 text-sm"
          />
        </Field>
        <Field label="Geography">
          <Input
            value={inputs.geography}
            onChange={e => update({ geography: e.target.value })}
            className="h-8 text-sm"
            placeholder="e.g. United States, Northeast US"
          />
        </Field>
        <Field label="Service Area">
          <Input
            value={inputs.serviceArea}
            onChange={e => update({ serviceArea: e.target.value })}
            className="h-8 text-sm"
            placeholder="e.g. DTC Home Goods, Corporate Law"
          />
        </Field>
        <Field label="Primary City / Metro">
          <Input
            value={inputs.primaryCity || ''}
            onChange={e => update({ primaryCity: e.target.value })}
            className="h-8 text-sm"
            placeholder="e.g. Dallas, TX"
          />
        </Field>
        <Field label="Primary Goal">
          <Input
            value={inputs.primaryGoal}
            onChange={e => update({ primaryGoal: e.target.value })}
            className="h-8 text-sm"
          />
        </Field>
      </div>

      {/* Locality: Radius selector */}
      {isLocal && (
        <div className="panel p-4 space-y-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold">Local Radius</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {LOCAL_RADIUS_OPTIONS.map(opt => (
              <button
                key={String(opt.value)}
                onClick={() => update({ localRadius: opt.value })}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  inputs.localRadius === opt.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80 text-foreground'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {inputs.localRadius === 'custom' && (
            <Input
              type="number"
              value={inputs.customRadiusMiles || ''}
              onChange={e => update({ customRadiusMiles: Number(e.target.value) })}
              placeholder="Miles"
              className="h-8 text-sm w-32"
            />
          )}
        </div>
      )}

      {/* Channel selector */}
      <div className="space-y-2">
        <Label className="text-xs">Selected Channels</Label>
        <div className="flex flex-wrap gap-2">
          {ALL_CHANNELS.map(ch => (
            <button
              key={ch}
              onClick={() => toggleChannel(ch)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                inputs.selectedChannels.includes(ch)
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80 text-foreground'
              }`}
            >
              {ch}
            </button>
          ))}
        </div>
      </div>

      {/* Known competitors */}
      <Field label="Known Competitors" hint="(comma-separated)">
        <Input
          value={(inputs.knownCompetitors || []).join(', ')}
          onChange={e =>
            update({
              knownCompetitors: e.target.value
                .split(',')
                .map(s => s.trim())
                .filter(Boolean),
            })
          }
          className="h-8 text-sm"
          placeholder="e.g. Competitor A, Competitor B"
        />
      </Field>

      {/* Run button */}
      <button
        onClick={() => onRun(inputs)}
        className="w-full py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
      >
        <Sparkles className="h-4 w-4" />
        Run Market Intelligence
      </button>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
  span,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  span?: number;
}) {
  return (
    <div className={span === 2 ? 'col-span-2' : ''}>
      <Label className="text-xs mb-1 block">
        {label}
        {hint && <span className="text-muted-foreground font-normal ml-1">{hint}</span>}
      </Label>
      {children}
    </div>
  );
}
