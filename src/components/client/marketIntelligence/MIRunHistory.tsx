/**
 * MIRunHistory — list of past Market Intelligence runs for a client.
 */
import { useState } from 'react';
import { Clock, ChevronDown, ChevronUp, Archive } from 'lucide-react';
import { format } from 'date-fns';
import { repository } from '@/lib/repository';
import type { MarketIntelligenceRun } from '@/types/marketIntelligence';
import MIResultsView from './MIResultsView';

interface Props {
  clientId: string;
  onRerun: () => void;
}

export default function MIRunHistory({ clientId, onRerun }: Props) {
  const [runs, setRuns] = useState<MarketIntelligenceRun[]>(() =>
    repository.marketIntelligence.getByClient(clientId)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleArchive = (id: string) => {
    repository.marketIntelligence.archive(id);
    setRuns(prev => prev.map(r => r.id === id ? { ...r, status: 'archived' } : r));
  };

  const activeRuns = runs.filter(r => r.status !== 'archived');
  const archivedRuns = runs.filter(r => r.status === 'archived');

  if (runs.length === 0) {
    return (
      <div className="panel p-6 text-center">
        <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">No intelligence runs yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activeRuns.map(run => (
        <RunCard
          key={run.id}
          run={run}
          expanded={expandedId === run.id}
          onToggle={() => setExpandedId(expandedId === run.id ? null : run.id)}
          onArchive={() => handleArchive(run.id)}
          onRerun={onRerun}
        />
      ))}

      {archivedRuns.length > 0 && (
        <details className="mt-4">
          <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
            {archivedRuns.length} archived run{archivedRuns.length > 1 ? 's' : ''}
          </summary>
          <div className="mt-2 space-y-2 opacity-60">
            {archivedRuns.map(run => (
              <RunCard
                key={run.id}
                run={run}
                expanded={expandedId === run.id}
                onToggle={() => setExpandedId(expandedId === run.id ? null : run.id)}
                onRerun={onRerun}
              />
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

function RunCard({
  run,
  expanded,
  onToggle,
  onArchive,
  onRerun,
}: {
  run: MarketIntelligenceRun;
  expanded: boolean;
  onToggle: () => void;
  onArchive?: () => void;
  onRerun: () => void;
}) {
  return (
    <div className="panel overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
            run.status === 'complete' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            : run.status === 'archived' ? 'bg-muted text-muted-foreground'
            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
          }`}>
            {run.status}
          </span>
          <span className="text-sm font-medium">
            {run.generatedAt
              ? format(new Date(run.generatedAt), 'MMM d, yyyy · h:mm a')
              : format(new Date(run.createdAt), 'MMM d, yyyy')}
          </span>
          <span className="text-[11px] text-muted-foreground">
            {run.outputs.keywordThemes.length} themes · {run.outputs.competitorProfiles.length} competitors · {run.outputs.channelRecommendations.length} channels
          </span>
        </div>
        <div className="flex items-center gap-2">
          {onArchive && run.status !== 'archived' && (
            <button
              onClick={e => { e.stopPropagation(); onArchive(); }}
              className="p-1 rounded hover:bg-muted transition-colors"
              title="Archive"
            >
              <Archive className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          )}
          {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t p-5">
          <MIResultsView
            outputs={run.outputs}
            run={run}
            onRerun={onRerun}
            onRefine={() => {}}
            onApprove={() => {}}
            onClose={() => {}}
          />
        </div>
      )}
    </div>
  );
}
