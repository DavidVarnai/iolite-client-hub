/**
 * Proposal display & formatting helpers.
 */
import type { ProposalStatus } from '@/types/proposal';
import { formatCurrency } from '@/lib/parsing';

export const fmt = formatCurrency;

export const STATUS_COLORS: Record<ProposalStatus, string> = {
  draft: 'bg-muted text-muted-foreground',
  ready: 'bg-primary/10 text-primary',
  presented: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  approved: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  archived: 'bg-muted text-muted-foreground',
};
