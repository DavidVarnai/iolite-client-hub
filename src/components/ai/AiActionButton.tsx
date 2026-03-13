import { Sparkles, Loader2 } from 'lucide-react';
import type { AiActionStatus } from '@/types/ai';

interface Props {
  label: string;
  status: AiActionStatus;
  onClick: () => void;
  variant?: 'default' | 'compact';
  className?: string;
}

export default function AiActionButton({ label, status, onClick, variant = 'default', className = '' }: Props) {
  const isLoading = status === 'loading';

  if (variant === 'compact') {
    return (
      <button
        onClick={onClick}
        disabled={isLoading}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all
          text-primary/80 hover:text-primary hover:bg-primary/5 border border-transparent hover:border-primary/20
          disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
        {label}
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-xs font-medium transition-all
        bg-primary/5 text-primary border border-primary/15 hover:bg-primary/10 hover:border-primary/30
        disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
      {label}
    </button>
  );
}
