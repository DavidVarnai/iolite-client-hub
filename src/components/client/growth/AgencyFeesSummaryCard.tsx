/**
 * AgencyFeesSummaryCard — compact card in Growth Model.
 * Reads from ProposedAgencyServices + resolves fees via packages.
 */
import { useClientContext } from '@/contexts/ClientContext';
import { useMemo } from 'react';
import { Briefcase, ArrowRight } from 'lucide-react';
import { formatCurrency } from '@/lib/parsing';
import { repository } from '@/lib/repository';
import type { ProposedAgencyService } from '@/types/commercialServices';
import { resolveServiceFee, resolveSetupFee } from '@/types/commercialServices';

export default function AgencyFeesSummaryCard() {
  const { onboarding, growthModel } = useClientContext();
  const services: ProposedAgencyService[] = (onboarding as any).proposedAgencyServices || [];
  const allPackages = useMemo(() => repository.servicePackages.getAll(), []);

  const monthlyMediaSpend = useMemo(() => {
    if (!growthModel) return 0;
    const scenario = growthModel.scenarios.find(s => s.isDefault) || growthModel.scenarios[0];
    if (!scenario) return 0;
    const totalBudget = scenario.mediaChannelPlans.reduce(
      (sum, mp) => sum + mp.monthlyRecords.reduce((s, r) => s + r.plannedBudget, 0), 0
    );
    return totalBudget / (growthModel.monthCount || 1);
  }, [growthModel]);

  const summary = useMemo(() => {
    if (services.length === 0) return null;
    let monthlyFees = 0;
    let oneTimeFees = 0;
    for (const svc of services) {
      const pkg = allPackages.find(p => p.id === svc.selectedPackageId);
      monthlyFees += resolveServiceFee(svc, pkg?.basePrice ?? 0, monthlyMediaSpend, pkg?.pricingModel);
      oneTimeFees += resolveSetupFee(svc);
    }
    return { serviceCount: services.length, monthlyFees, oneTimeFees };
  }, [services, allPackages, monthlyMediaSpend]);

  const navigateToConfig = () =>
    window.dispatchEvent(new CustomEvent('navigate-tab', { detail: { tab: 'services-config' } }));

  if (!summary) {
    return (
      <div className="mx-6 mt-4 panel p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">Agency Fees (from Services Config)</h4>
            <p className="text-xs text-muted-foreground">No agency services configured yet</p>
          </div>
        </div>
        <button onClick={navigateToConfig} className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline">
          Set up in Services Config <ArrowRight className="h-3 w-3" />
        </button>
      </div>
    );
  }

  return (
    <div className="mx-6 mt-4 panel p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Briefcase className="h-4 w-4 text-primary" />
          </div>
          <h4 className="text-sm font-semibold text-foreground">Agency Fees (from Services Config)</h4>
        </div>
        <button onClick={navigateToConfig} className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline">
          Manage in Services Config <ArrowRight className="h-3 w-3" />
        </button>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-0.5">Proposed Services</p>
          <p className="text-lg font-semibold tabular-nums text-foreground">{summary.serviceCount}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-0.5">Est. Monthly Fees</p>
          <p className="text-lg font-semibold tabular-nums text-foreground">{formatCurrency(summary.monthlyFees)}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-0.5">Est. One-Time Fees</p>
          <p className="text-lg font-semibold tabular-nums text-foreground">{formatCurrency(summary.oneTimeFees)}</p>
        </div>
      </div>
    </div>
  );
}
