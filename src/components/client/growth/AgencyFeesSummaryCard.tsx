/**
 * AgencyFeesSummaryCard — compact card replacing the detailed agency services grid
 * in Growth Model. Reads from proposal/commercial data when available.
 */
import { useClientContext } from '@/contexts/ClientContext';
import { repository } from '@/lib/repository';
import { useMemo } from 'react';
import { Briefcase, ArrowRight } from 'lucide-react';
import { formatCurrency } from '@/lib/parsing';

export default function AgencyFeesSummaryCard() {
  const { client } = useClientContext();

  const proposalData = useMemo(() => {
    const proposals = repository.proposals.getByClient(client.id);
    // Use the most recent non-archived proposal
    const active = proposals.find(p => p.status !== 'archived') || proposals[0];
    if (!active) return null;

    const lines = active.pricingData.lines;
    const monthlyFees = lines.reduce((s, l) => s + (l.monthlyPrice || 0), 0);
    const oneTimeFees = lines.reduce((s, l) => s + (l.setupFee || 0), 0);

    return {
      serviceCount: lines.length,
      monthlyFees,
      oneTimeFees,
    };
  }, [client.id]);

  if (!proposalData) {
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
            // Navigate to Proposal Ready tab
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
          <p className="text-lg font-semibold tabular-nums text-foreground">{proposalData.serviceCount}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-0.5">Est. Monthly Fees</p>
          <p className="text-lg font-semibold tabular-nums text-foreground">{formatCurrency(proposalData.monthlyFees)}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-0.5">Est. One-Time Fees</p>
          <p className="text-lg font-semibold tabular-nums text-foreground">{formatCurrency(proposalData.oneTimeFees)}</p>
        </div>
      </div>
    </div>
  );
}
