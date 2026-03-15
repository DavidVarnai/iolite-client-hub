/**
 * ResearchSetupStep — editable research scope before running MI.
 */
import { useState } from 'react';
import { Sparkles, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import type { MarketIntelligenceInputs, LocalRadius } from '@/types/marketIntelligence';
import { LOCAL_RADIUS_OPTIONS, CHANNEL_TYPE_MAP } from '@/types/marketIntelligence';

interface Props {
  initialInputs: MarketIntelligenceInputs;
  onRun: (inputs: MarketIntelligenceInputs) => void;
}

const ALL_CHANNELS = Object.keys(CHANNEL_TYPE_MAP);

export default function ResearchSetupStep({ initialInputs, onRun }: Props) {
  const [inputs, setInputs] = useState<MarketIntelligenceInputs>(initialInputs);

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

  return (
    <div className="space-y-6 max-w-2xl mx-auto py-4">
      <div className="text-center space-y-1">
        <h3 className="text-sm font-semibold">Research Scope</h3>
        <p className="text-xs text-muted-foreground">
          Review and adjust inputs before running Market Intelligence.
        </p>
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
