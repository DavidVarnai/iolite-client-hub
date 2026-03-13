import { Check, Circle } from 'lucide-react';
import { ProposalChecklistItem } from '@/types/onboarding';

interface Props {
  items: ProposalChecklistItem[];
  onMarkReady?: () => void;
  onEnterProposalMode?: () => void;
  isReady: boolean;
}

export default function ProposalReadinessChecklist({ items, onMarkReady, onEnterProposalMode, isReady }: Props) {
  const completedCount = items.filter(i => i.complete).length;

  return (
    <div className="panel p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Proposal Readiness</h3>
        <span className="text-xs text-muted-foreground">{completedCount}/{items.length} complete</span>
      </div>

      <div className="space-y-2">
        {items.map(item => (
          <div key={item.key} className="flex items-center gap-3 text-sm">
            {item.complete ? (
              <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <Check className="h-3 w-3 text-primary-foreground" />
              </div>
            ) : (
              <div className="w-5 h-5 rounded-full border-2 border-border flex items-center justify-center flex-shrink-0">
                <Circle className="h-2 w-2 text-muted-foreground/30" />
              </div>
            )}
            <span className={item.complete ? 'text-foreground' : 'text-muted-foreground'}>{item.label}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-2 pt-2">
        {onEnterProposalMode && (
          <button
            onClick={onEnterProposalMode}
            className="px-4 py-2 text-xs font-medium rounded-md bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            Preview Client View
          </button>
        )}
        {onMarkReady && !isReady && (
          <button
            onClick={onMarkReady}
            disabled={completedCount < items.length}
            className="px-4 py-2 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Mark Proposal Ready
          </button>
        )}
        {isReady && (
          <span className="status-badge bg-primary/10 text-primary text-xs">Proposal Ready ✓</span>
        )}
      </div>
    </div>
  );
}
