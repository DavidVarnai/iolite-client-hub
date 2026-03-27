import { useState, useMemo } from 'react';
import type { GrowthModel, GrowthModelMode, GrowthModelScenario } from '@/types/growthModel';
import type { OnboardingContinuation } from '@/types/onboarding';
import { GROWTH_MODEL_TEMPLATES, initializeFromTemplate } from '@/lib/growthModelTemplates';
import SummaryBar from './growth/SummaryBar';
import InvestmentPlan from './growth/InvestmentPlan';
import RevenueModel from './growth/RevenueModel';
import ForecastVsActual from './growth/ForecastVsActual';
import ExecutiveSummary from './growth/ExecutiveSummary';
import SnapshotManager from './growth/SnapshotManager';
import OnboardingContinuityPanel from './OnboardingContinuityPanel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import { useClientContext } from '@/contexts/ClientContext';
import type { ProposedAgencyService } from '@/types/commercialServices';
import { resolveServiceFee, resolveSetupFee } from '@/types/commercialServices';
import { repository } from '@/lib/repository';

type SubTab = 'investment' | 'revenue' | 'forecast' | 'summary';

const SUB_TABS: { key: SubTab; label: string }[] = [
  { key: 'investment', label: 'Investment Plan' },
  { key: 'revenue', label: 'Revenue Projections' },
  { key: 'forecast', label: 'Forecast vs Actual' },
  { key: 'summary', label: 'Executive Summary' },
];

interface GrowthModelViewProps {
  onboardingContinuation?: OnboardingContinuation | null;
  onReturnToWizard?: () => void;
  onPauseOnboarding?: () => void;
  onContinueToNext?: () => void;
}

/** Compute rollups from model + proposedAgencyServices */
function computeRollups(model: GrowthModel, services: ProposedAgencyService[], monthlyMediaSpend: number) {
  const scenario = model.scenarios.find(s => s.isDefault) || model.scenarios[0];
  if (!scenario) return null;

  const totalMediaBudget = scenario.mediaChannelPlans
    .reduce((sum, mp) => sum + mp.monthlyRecords.reduce((s, r) => s + r.plannedBudget, 0), 0);

  const totalOtherCosts = scenario.budgetLineItems
    .filter(li => li.category === 'other')
    .reduce((sum, li) => sum + li.monthlyRecords.reduce((s, r) => s + r.plannedAmount, 0), 0);

  // Agency fees from proposedAgencyServices
  let monthlyAgencyFees = 0;
  let totalSetupFees = 0;
  for (const svc of services) {
    if (svc.serviceLine === 'Paid Media Management' && svc.paidMediaConfig) {
      monthlyAgencyFees += calcPaidMediaFee(svc.paidMediaConfig, monthlyMediaSpend).fee;
    } else {
      monthlyAgencyFees += svc.monthlyFee;
    }
    totalSetupFees += svc.setupFee;
  }
  const totalAgencyFees = (monthlyAgencyFees * model.monthCount) + totalSetupFees;
  const totalInvestment = totalAgencyFees + totalMediaBudget + totalOtherCosts;

  // Simple CPA-based projection
  const perf = model.performanceInputs;
  const forecastLeads = perf.targetCpa > 0 ? Math.round(totalMediaBudget / perf.targetCpa) : 0;
  const forecastCustomers = Math.round(forecastLeads * (perf.closeRate / 100));
  const forecastRevenue = forecastCustomers * perf.avgDealValue;

  const forecastCpl = forecastLeads > 0 ? totalMediaBudget / forecastLeads : 0;
  const forecastCpa = forecastLeads > 0 ? totalInvestment / forecastLeads : 0;

  const actualSpend = model.actuals.reduce((s, a) => s + a.actualSpend, 0);
  const actualRevenue = model.actuals.reduce((s, a) => s + a.actualRevenue, 0);
  const variance = forecastRevenue > 0 ? ((actualRevenue - forecastRevenue) / forecastRevenue) * 100 : 0;

  return {
    totalAgencyFees, totalMediaBudget, totalOtherCosts, totalInvestment,
    forecastRevenue: Math.round(forecastRevenue),
    forecastCpa: Math.round(forecastCpa),
    forecastCpl: Math.round(forecastCpl),
    actualSpend, actualRevenue,
    variance: Math.round(variance * 10) / 10,
  };
}

export default function GrowthModelView({
  onboardingContinuation,
  onReturnToWizard,
  onPauseOnboarding,
  onContinueToNext,
}: GrowthModelViewProps) {
  const { client, growthModel: model, updateGrowthModel, onboarding } = useClientContext();
  const [mode, setMode] = useState<GrowthModelMode>('planning');
  const [activeTab, setActiveTab] = useState<SubTab>('investment');

  const proposedServices: ProposedAgencyService[] = (onboarding as any).proposedAgencyServices || [];

  const monthlyMediaSpend = useMemo(() => {
    if (!model) return 0;
    const scenario = model.scenarios.find(s => s.isDefault) || model.scenarios[0];
    if (!scenario) return 0;
    const totalBudget = scenario.mediaChannelPlans.reduce(
      (sum, mp) => sum + mp.monthlyRecords.reduce((s, r) => s + r.plannedBudget, 0), 0
    );
    return totalBudget / (model.monthCount || 1);
  }, [model]);

  const rollups = useMemo(() => model ? computeRollups(model, proposedServices, monthlyMediaSpend) : null, [model, proposedServices, monthlyMediaSpend]);

  const handleCreateFromTemplate = (templateId: string) => {
    const template = GROWTH_MODEL_TEMPLATES.find(t => t.id === templateId);
    if (!template) return;

    const now = new Date();
    const startMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const initialized = initializeFromTemplate(template, client.id, `${client.name} Growth Plan`, startMonth);
    const scenarioId = `sc-${Date.now()}`;
    const modelId = `gm-${Date.now()}`;

    const newModel: GrowthModel = {
      id: modelId,
      clientId: client.id,
      name: `${client.name} Growth Plan`,
      status: 'draft',
      startMonth,
      monthCount: initialized.monthCount,
      funnelType: initialized.funnelType,
      visibility: 'internal',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      performanceInputs: { targetCpa: 50, closeRate: 20, avgDealValue: 1000 },
      scenarios: [{
        id: scenarioId,
        modelId,
        name: 'base',
        isDefault: true,
        createdAt: now.toISOString(),
        budgetLineItems: initialized.budgetLineItems,
        mediaChannelPlans: initialized.mediaChannelPlans,
        channelAssumptions: initialized.channelAssumptions,
        revenueAssumption: initialized.revenueAssumption,
      }],
      actuals: [],
      narratives: [],
      snapshots: [],
    };

    updateGrowthModel(newModel);
  };

  const handleModelUpdate = (updated: GrowthModel) => {
    updateGrowthModel(updated);
  };

  if (!model) {
    return (
      <div>
        {onboardingContinuation && onReturnToWizard && onPauseOnboarding && (
          <OnboardingContinuityPanel
            continuation={onboardingContinuation}
            onReturnToWizard={onReturnToWizard}
            onPauseOnboarding={onPauseOnboarding}
            onContinueToNext={onContinueToNext}
            stepReady={false}
          />
        )}
        <div className="p-6">
        <div className="panel p-8 text-center mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-2">No Growth Model</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Choose a template to get started quickly, pre-loaded with media channels and industry assumptions.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {GROWTH_MODEL_TEMPLATES.map(tpl => (
            <Card
              key={tpl.id}
              className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all group"
              onClick={() => handleCreateFromTemplate(tpl.id)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  {tpl.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-3">{tpl.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  <span className="status-badge bg-primary/10 text-primary text-[10px]">{tpl.funnelType.replace('_', ' ')}</span>
                  <span className="status-badge bg-muted text-muted-foreground text-[10px]">{tpl.mediaChannels.length} channels</span>
                  <span className="status-badge bg-muted text-muted-foreground text-[10px]">{tpl.defaultMonthCount} months</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        </div>
      </div>
    );
  }

  const scenario = model.scenarios.find(s => s.isDefault) || model.scenarios[0];

  return (
    <div className="flex flex-col h-full">
      {onboardingContinuation && onReturnToWizard && onPauseOnboarding && (
        <OnboardingContinuityPanel
          continuation={onboardingContinuation}
          onReturnToWizard={onReturnToWizard}
          onPauseOnboarding={onPauseOnboarding}
          onContinueToNext={onContinueToNext}
          stepReady={!!model}
        />
      )}
      <div className="border-b px-6 py-3 flex items-center justify-between bg-background">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-foreground">{model.name}</h2>
          <span className="status-badge bg-primary/10 text-primary text-xs">{model.status}</span>
        </div>
        <div className="flex items-center gap-3">
          <SnapshotManager model={model} onSave={(snap) => handleModelUpdate({ ...model, snapshots: [...model.snapshots, snap] })} />
          <div className="flex rounded-md border overflow-hidden">
            <button onClick={() => setMode('planning')}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                mode === 'planning' ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:text-foreground'
              }`}>Planning</button>
            <button onClick={() => setMode('operating')}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                mode === 'operating' ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:text-foreground'
              }`}>Operating</button>
          </div>
        </div>
      </div>

      {rollups && <SummaryBar rollups={rollups} />}

      <div className="border-b px-6 flex items-center gap-0 overflow-x-auto bg-background">
        {SUB_TABS.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`px-3 py-2.5 text-xs font-medium whitespace-nowrap transition-colors ${
              activeTab === t.key ? 'text-foreground border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'
            }`}>{t.label}</button>
        ))}
      </div>

      <div className="flex-1 overflow-auto">
        {activeTab === 'investment' && scenario && <InvestmentPlan model={model} scenario={scenario} onUpdate={handleModelUpdate} />}
        {activeTab === 'revenue' && scenario && <RevenueModel model={model} scenario={scenario} onUpdate={handleModelUpdate} />}
        {activeTab === 'forecast' && scenario && <ForecastVsActual model={model} scenario={scenario} onUpdate={handleModelUpdate} />}
        {activeTab === 'summary' && <ExecutiveSummary model={model} mode={mode} />}
      </div>
    </div>
  );
}
