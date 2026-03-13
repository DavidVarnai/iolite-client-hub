import { Lightbulb, ArrowRight } from 'lucide-react';

interface Props {
  message: string;
  action: string;
  onAction: () => void;
}

export default function NextStepCard({ message, action, onAction }: Props) {
  return (
    <div className="panel border-primary/20 bg-primary/5 p-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Lightbulb className="h-4 w-4 text-primary" />
        </div>
        <p className="text-sm text-foreground">{message}</p>
      </div>
      <button
        onClick={onAction}
        className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-xs font-medium rounded-md hover:opacity-90 transition-opacity whitespace-nowrap"
      >
        {action}
        <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
