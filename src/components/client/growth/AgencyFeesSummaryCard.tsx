/**
 * AgencyFeesSummaryCard — compact card in Growth Model.
 * Reads exclusively from ProposedAgencyServices (onboarding.proposedAgencyServices).
 */
import { useClientContext } from '@/contexts/ClientContext';
import { useMemo } from 'react';
import { Briefcase, ArrowRight } from 'lucide-react';
import { formatCurrency } from '@/lib/parsing';
import type { ProposedAgencyService, PaidMediaPricingConfig } from '@/types/commercialServices';
import { calcPaidMediaFee } from '@/types/commercialServices';

export default function AgencyFeesSummaryCard() {
  const { onboarding, growthModel } = useClientContext();

  const services: ProposedAgencyService[] = (onboarding as any).proposedAgencyServices || [];

  // Get total monthly media spend from growth model for Paid Media fee calculation
  const monthlyMediaSpend = useMemo(() => {
    if (!growthModel) return 0;
    const scenario = growthModel.scenarios.find(s => s.isDefault) || growthModel.scenarios[0];
    if (!scenario) return 0;
    const totalBudget = scenario.mediaChannelPlans.reduce(
      (sum, mp) => sum + mp.monthlyRecords.reduce((s, r) => s + r.plannedBudget, 0), 0
    );
    const monthCount = growthModel.monthCount || 1;
    return totalBudget / monthCount;
  }, [growthModel]);

  const summary = useMemo(() => {
    if (services.length === 0) return null;

    let monthlyFees = 0;
    let oneTimeFees = 0;

    for (const svc of services) {
      if (svc.serviceLine === 'Paid Media Management' && svc.paidMediaConfig) {
        const { fee } = calcPaidMediaFee(svc.paidMediaConfig, monthlyMediaSpend);
        monthlyFees += fee;
      } else {
        monthlyFees += svc.monthlyFee;
      }
      oneTimeFees += svc.setupFee;
    }

    return { serviceCount: services.length, monthlyFees, oneTimeFees };
  }, [services, monthlyMediaSpend]);

  if (!summary) {
    return (
      <div className="mx-6 mt-4 panel p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">Agency Services</h4>
            <p className="text-xs text-muted-foreground">No agency services configured yet</p>
          </div>
        </div>
        <button
          onClick={() => {
            const event = new CustomEvent('navigate-tab', { detail: { tab: 'proposal' } });
            window.dispatchEvent(event);
          }}
          className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
        >
          Set up in Proposal Ready <ArrowRight className="h-3 w-3" />
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
          <h4 className="text-sm font-semibold text-foreground">Agency Services</h4>
        </div>
        <button
          onClick={() => {
            const event = new CustomEvent('navigate-tab', { detail: { tab: 'proposal' } });
            window.dispatchEvent(event);
          }}
          className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
        >
          Manage in Proposal Ready <ArrowRight className="h-3 w-3" />
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
