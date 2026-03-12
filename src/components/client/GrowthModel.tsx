import { useState, useMemo } from 'react';
import { Client } from '@/types';
import { getGrowthModelForClient } from '@/data/growthModelSeed';
import type { GrowthModel, GrowthModelMode } from '@/types/growthModel';
import { calcRollups } from '@/lib/growthModelCalculations';
import SummaryBar from './growth/SummaryBar';
import InvestmentPlan from './growth/InvestmentPlan';
import ChannelAssumptions from './growth/ChannelAssumptions';
import RevenueModel from './growth/RevenueModel';
import ForecastVsActual from './growth/ForecastVsActual';
import ExecutiveSummary from './growth/ExecutiveSummary';
import SnapshotManager from './growth/SnapshotManager';

type SubTab = 'investment' | 'assumptions' | 'revenue' | 'forecast' | 'summary';

const SUB_TABS: { key: SubTab; label: string }[] = [
  { key: 'investment', label: 'Investment Plan' },
  { key: 'assumptions', label: 'Channel Assumptions' },
  { key: 'revenue', label: 'Revenue Model' },
  { key: 'forecast', label: 'Forecast vs Actual' },
  { key: 'summary', label: 'Executive Summary' },
];

export default function GrowthModelView({ client }: { client: Client }) {
  const seedModel = getGrowthModelForClient(client.id);
  const [model, setModel] = useState<GrowthModel | null>(seedModel || null);
  const [mode, setMode] = useState<GrowthModelMode>('planning');
  const [activeTab, setActiveTab] = useState<SubTab>('investment');

  const rollups = useMemo(() => model ? calcRollups(model) : null, [model]);

  if (!model) {
    return (
      <div className="p-6">
        <div className="panel p-8 text-center">
          <h3 className="text-lg font-semibold text-foreground mb-2">No Growth Model</h3>
          <p className="text-sm text-muted-foreground mb-4">Create a growth model to start planning investment, channels, and revenue projections.</p>
          <button className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
            Create Growth Model
          </button>
        </div>
      </div>
    );
  }

  const scenario = model.scenarios.find(s => s.isDefault) || model.scenarios[0];

  return (
    <div className="flex flex-col h-full">
      {/* Mode toggle + snapshot manager */}
      <div className="border-b px-6 py-3 flex items-center justify-between bg-background">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-foreground">{model.name}</h2>
          <span className="status-badge bg-primary/10 text-primary text-xs">{model.status}</span>
        </div>
        <div className="flex items-center gap-3">
          <SnapshotManager model={model} onSave={(snap) => setModel({ ...model, snapshots: [...model.snapshots, snap] })} />
          <div className="flex rounded-md border overflow-hidden">
            <button
              onClick={() => setMode('planning')}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                mode === 'planning' ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:text-foreground'
              }`}
            >
              Planning
            </button>
            <button
              onClick={() => setMode('operating')}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                mode === 'operating' ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:text-foreground'
              }`}
            >
              Operating
            </button>
          </div>
        </div>
      </div>

      {/* Summary bar */}
      {rollups && <SummaryBar rollups={rollups} />}

      {/* Sub-tabs */}
      <div className="border-b px-6 flex items-center gap-0 overflow-x-auto bg-background">
        {SUB_TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-3 py-2.5 text-xs font-medium whitespace-nowrap transition-colors ${
              activeTab === t.key ? 'text-foreground border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'investment' && scenario && (
          <InvestmentPlan model={model} scenario={scenario} onUpdate={setModel} />
        )}
        {activeTab === 'assumptions' && scenario && (
          <ChannelAssumptions model={model} scenario={scenario} onUpdate={setModel} />
        )}
        {activeTab === 'revenue' && scenario && (
          <RevenueModel model={model} scenario={scenario} />
        )}
        {activeTab === 'forecast' && scenario && (
          <ForecastVsActual model={model} scenario={scenario} onUpdate={setModel} />
        )}
        {activeTab === 'summary' && (
          <ExecutiveSummary model={model} mode={mode} />
        )}
      </div>
    </div>
  );
}
