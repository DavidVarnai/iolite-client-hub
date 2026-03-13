import { useState } from 'react';
import { Check, X, Pencil, Sparkles } from 'lucide-react';
import type { AiActionStatus } from '@/types/ai';

interface Section {
  heading: string;
  body: string | string[];
}

interface Props {
  title: string;
  status: AiActionStatus;
  sections: Section[];
  onApprove?: () => void;
  onDiscard?: () => void;
  approveLabel?: string;
  className?: string;
}

export default function AiResultPanel({ title, status, sections, onApprove, onDiscard, approveLabel = 'Insert', className = '' }: Props) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || status === 'idle') return null;

  if (status === 'loading') {
    return (
      <div className={`panel border-primary/20 bg-primary/[0.02] p-5 ${className}`}>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
          <span className="text-xs font-medium text-primary">Generating…</span>
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-3 bg-muted rounded animate-pulse" style={{ width: `${70 + i * 10}%` }} />
          ))}
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className={`panel border-destructive/20 bg-destructive/5 p-4 ${className}`}>
        <p className="text-xs text-destructive">Something went wrong. Please try again.</p>
        <button onClick={() => setDismissed(true)} className="text-[10px] text-muted-foreground mt-1 hover:underline">Dismiss</button>
      </div>
    );
  }

  return (
    <div className={`panel border-primary/20 bg-primary/[0.02] ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-primary/10">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-semibold text-foreground">{title}</span>
          <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">AI Suggestion</span>
        </div>
        <div className="flex items-center gap-1.5">
          {onApprove && (
            <button
              onClick={onApprove}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Check className="h-3 w-3" />
              {approveLabel}
            </button>
          )}
          {onDiscard && (
            <button
              onClick={() => { onDiscard(); setDismissed(true); }}
              className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X className="h-3 w-3" />
              Discard
            </button>
          )}
        </div>
      </div>

      {/* Content sections */}
      <div className="px-5 py-4 space-y-4">
        {sections.map((section, idx) => (
          <div key={idx}>
            <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">{section.heading}</h4>
            {Array.isArray(section.body) ? (
              <ul className="space-y-1">
                {section.body.map((item, i) => (
                  <li key={i} className="text-sm text-foreground flex items-start gap-2">
                    <span className="mt-1.5 w-1 h-1 rounded-full bg-primary flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-foreground leading-relaxed">{section.body}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
