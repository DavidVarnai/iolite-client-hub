/**
 * ProposalConfigPanel — generates a proposal from Services Config data.
 * Services Config is the single source of truth; this panel is read-only for services.
 */
import { useMemo } from 'react';
import {
  FileText, Sparkles, Check, AlertCircle, BarChart3,
  ArrowRight, Package, Wrench,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useClientContext } from '@/contexts/ClientContext';
import { repository } from '@/lib/repository';
import { formatCurrency } from '@/lib/parsing';
import type { ProposedAgencyService } from '@/types/commercialServices';
import { resolveServiceFee, resolveSetupFee, FLEX_PRICING_MODE_LABELS } from '@/types/commercialServices';
import type { GenerationConfig } from './proposalGeneration';

interface ProposalConfigPanelProps {
  clientId: string;
  onGenerate: (config: GenerationConfig) => void;
}

export default function ProposalConfigPanel({ clientId, onGenerate }: ProposalConfigPanelProps) {
  const { onboarding, growthModel: contextGrowthModel } = useClientContext();

  const allPackages = useMemo(() => repository.servicePackages.getAll(), []);
  const growthModel = contextGrowthModel;

  const proposedServices: ProposedAgencyService[] = (onboarding as any).proposedAgencyServices || [];

  const monthlyMediaSpend = useMemo(() => {
    if (!growthModel) return 0;
    const scenario = growthModel.scenarios.find(s => s.isDefault) || growthModel.scenarios[0];
    if (!scenario) return 0;
    const totalBudget = scenario.mediaChannelPlans.reduce(
      (sum, mp) => sum + mp.monthlyRecords.reduce((s, r) => s + r.plannedBudget, 0), 0
    );
    return totalBudget / (growthModel.monthCount || 1);
  }, [growthModel]);

  const serviceSummary = useMemo(() => {
    let totalMonthly = 0;
    let totalSetup = 0;
    const lines = proposedServices.map(svc => {
      const pkg = allPackages.find(p => p.id === svc.selectedPackageId);
      const monthly = resolveServiceFee(svc, pkg?.basePrice ?? 0, monthlyMediaSpend, pkg?.pricingModel);
      const setup = resolveSetupFee(svc);
      totalMonthly += monthly;
      totalSetup += setup;
      return { svc, pkg, monthly, setup };
    });
    return { lines, totalMonthly, totalSetup };
  }, [proposedServices, allPackages, monthlyMediaSpend]);

  const navigateToServicesConfig = () => {
    window.dispatchEvent(new CustomEvent('navigate-tab', { detail: { tab: 'services-config' } }));
  };

  const handleGenerate = () => {
    onGenerate({ services: proposedServices });
  };

  const canGenerate = proposedServices.length > 0;

  // Empty state — no services configured
  if (!canGenerate) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">
        <div className="text-center space-y-2">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <FileText className="h-7 w-7 text-primary" />
          </div>
          <h2 className="text-2xl font-serif font-semibold">Generate Proposal</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Configure your agency services first, then generate a proposal directly from that data.
          </p>
        </div>

        <div className="bg-card border rounded-xl p-8 text-center space-y-4">
          <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mx-auto">
            <Wrench className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-sm mb-1">No Services Configured</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Set up your agency services, packages, and pricing in Services Config. The proposal will be generated automatically from that data.
            </p>
          </div>
          <Button onClick={navigateToServicesConfig} className="gap-2">
            Go to Services Config <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <FileText className="h-7 w-7 text-primary" />
        </div>
        <h2 className="text-2xl font-serif font-semibold">Generate Proposal</h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Review your configured services below and generate a proposal. All pricing comes from Services Config.
        </p>
      </div>

      {/* Services summary (read-only) */}
      <div className="bg-card border rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Package className="h-4.5 w-4.5 text-primary" />
            <h3 className="font-semibold text-sm">Configured Services</h3>
            <span className="text-xs text-muted-foreground">({proposedServices.length})</span>
          </div>
          <button
            onClick={navigateToServicesConfig}
            className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
          >
            Edit in Services Config <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Service</th>
                <th className="text-left px-3 py-2.5 font-medium text-muted-foreground">Package / Pricing</th>
                <th className="text-left px-3 py-2.5 font-medium text-muted-foreground">Duration</th>
                <th className="text-right px-3 py-2.5 font-medium text-muted-foreground">Monthly</th>
                <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Setup</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {serviceSummary.lines.map(({ svc, pkg, monthly, setup }) => (
                <tr key={svc.id}>
                  <td className="px-4 py-2.5 font-medium text-foreground">{svc.serviceLine}</td>
                  <td className="px-3 py-2.5 text-muted-foreground">
                    {pkg ? pkg.name : svc.flexPricing ? FLEX_PRICING_MODE_LABELS[svc.flexPricing.mode] : '—'}
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground">{svc.durationMonths} mo</td>
                  <td className="px-3 py-2.5 text-right tabular-nums font-medium text-foreground">{formatCurrency(monthly)}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">{setup > 0 ? formatCurrency(setup) : '—'}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t bg-muted/30 font-semibold">
                <td className="px-4 py-2.5 text-foreground" colSpan={3}>Total</td>
                <td className="px-3 py-2.5 text-right tabular-nums text-primary">{formatCurrency(serviceSummary.totalMonthly)}</td>
                <td className="px-4 py-2.5 text-right tabular-nums text-foreground">
                  {serviceSummary.totalSetup > 0 ? formatCurrency(serviceSummary.totalSetup) : '—'}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <p className="text-[10px] text-muted-foreground italic">
          Pricing is read-only here. To change services or pricing, edit in Services Config.
        </p>
      </div>

      {/* Growth Model status */}
      <div className="bg-card border rounded-xl p-6">
        <div className="flex items-center gap-2.5 mb-3">
          <BarChart3 className="h-4.5 w-4.5 text-primary" />
          <h3 className="font-semibold text-sm">Growth Model</h3>
        </div>
        {growthModel ? (
          <div className="flex items-center gap-2 text-sm">
            <Check className="h-4 w-4 text-emerald-500" />
            <span className="text-foreground/80">
              <span className="font-medium">{growthModel.name}</span> — projections will be included in the proposal.
            </span>
          </div>
        ) : (
          <div className="flex items-start gap-2 text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/20 rounded-md px-3 py-2.5">
            <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <span>No Growth Model found. Projections will use placeholder values. Create a Growth Model to auto-populate forecasts.</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between bg-card border rounded-xl px-6 py-4">
        <div>
          <div className="text-xs text-muted-foreground">Monthly Total (from Services Config)</div>
          <div className="text-xl font-bold tabular-nums">{formatCurrency(serviceSummary.totalMonthly)}</div>
        </div>
        <Button size="lg" onClick={handleGenerate} className="gap-2">
          <Sparkles className="h-4 w-4" /> Generate Proposal
        </Button>
      </div>
    </div>
  );
}
