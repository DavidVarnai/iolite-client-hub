/**
 * ProposalPricingTable — pricing breakdown table for proposals.
 */
import type { Proposal } from '@/types/proposal';
import { fmt } from './proposalHelpers';

interface PricingTableProps {
  pricing: Proposal['pricingData'];
  proposalMode: boolean;
}

export default function ProposalPricingTable({ pricing, proposalMode }: PricingTableProps) {
  const hasSetupFees = pricing.lines.some(l => l.setupFee);

  return (
    <div className="overflow-hidden rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted/50">
            <th className="text-left px-5 py-3 font-medium text-muted-foreground">Service</th>
            <th className="text-right px-5 py-3 font-medium text-muted-foreground">Monthly</th>
            {hasSetupFees && <th className="text-right px-5 py-3 font-medium text-muted-foreground">Setup</th>}
          </tr>
        </thead>
        <tbody>
          {pricing.lines.map(line => (
            <tr key={line.id} className="border-t">
              <td className="px-5 py-4">
                <div className="font-medium">{line.label}</div>
                {line.description && <div className="text-xs text-muted-foreground mt-0.5">{line.description}</div>}
                {line.notes && !proposalMode && <div className="text-xs text-amber-600 mt-0.5 italic">{line.notes}</div>}
              </td>
              <td className="text-right px-5 py-4 font-medium tabular-nums">
                {line.monthlyPrice > 0 ? fmt(line.monthlyPrice) : '—'}
              </td>
              {hasSetupFees && (
                <td className="text-right px-5 py-4 tabular-nums text-muted-foreground">
                  {line.setupFee ? fmt(line.setupFee) : '—'}
                </td>
              )}
            </tr>
          ))}
        </tbody>
        <tfoot>
          {pricing.discountAmount && (
            <tr className="border-t">
              <td className="px-5 py-3 text-sm text-muted-foreground">{pricing.discountLabel || 'Discount'}</td>
              <td className="text-right px-5 py-3 text-sm text-emerald-600 font-medium tabular-nums">
                −{fmt(pricing.discountAmount)}
              </td>
              {hasSetupFees && <td />}
            </tr>
          )}
          <tr className="border-t bg-muted/30">
            <td className="px-5 py-4 font-semibold">Total Monthly Investment</td>
            <td className="text-right px-5 py-4 font-bold text-lg tabular-nums">{fmt(pricing.total)}</td>
            {hasSetupFees && (
              <td className="text-right px-5 py-4 font-medium tabular-nums text-muted-foreground">
                {fmt(pricing.lines.reduce((s, l) => s + (l.setupFee || 0), 0))}
              </td>
            )}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
