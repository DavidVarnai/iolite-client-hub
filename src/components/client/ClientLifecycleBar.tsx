import { Check, Circle, ChevronRight } from 'lucide-react';
import { ClientLifecycleProgress, LIFECYCLE_STAGES, StageStatus } from '@/types/onboarding';
import { cn } from '@/lib/utils';

interface Props {
  progress: ClientLifecycleProgress[];
  currentStage: string;
  onStageClick: (tabMapping: string) => void;
}

function StageIcon({ status }: { status: StageStatus }) {
  if (status === 'complete') {
    return (
      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
        <Check className="h-3.5 w-3.5 text-primary-foreground" />
      </div>
    );
  }
  if (status === 'in_progress') {
    return (
      <div className="w-6 h-6 rounded-full border-2 border-primary flex items-center justify-center">
        <Circle className="h-2.5 w-2.5 fill-primary text-primary" />
      </div>
    );
  }
  return (
    <div className="w-6 h-6 rounded-full border-2 border-border flex items-center justify-center">
      <Circle className="h-2.5 w-2.5 text-muted-foreground/30" />
    </div>
  );
}

export default function ClientLifecycleBar({ progress, currentStage, onStageClick }: Props) {
  return (
    <div className="border-b px-6 py-3 bg-card/50">
      <div className="flex items-center gap-1">
        {LIFECYCLE_STAGES.map((stage, idx) => {
          const stageProgress = progress.find(p => p.stage === stage.key);
          const status = stageProgress?.status ?? 'not_started';
          const isCurrent = stage.key === currentStage;

          return (
            <div key={stage.key} className="flex items-center">
              <button
                onClick={() => stage.tabMapping && onStageClick(stage.tabMapping)}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                  isCurrent && 'bg-primary/10 text-primary',
                  !isCurrent && status === 'complete' && 'text-foreground hover:bg-muted',
                  !isCurrent && status !== 'complete' && 'text-muted-foreground hover:bg-muted',
                )}
              >
                <StageIcon status={status} />
                <span>{stage.label}</span>
                {stageProgress && stageProgress.percentComplete > 0 && stageProgress.percentComplete < 100 && (
                  <span className="text-[10px] text-muted-foreground ml-0.5">{stageProgress.percentComplete}%</span>
                )}
              </button>
              {idx < LIFECYCLE_STAGES.length - 1 && (
                <ChevronRight className="h-3.5 w-3.5 text-border mx-0.5 flex-shrink-0" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
