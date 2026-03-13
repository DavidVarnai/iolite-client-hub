/**
 * PanelSection — reusable admin panel container with title and description.
 */
import { cn } from '@/lib/utils';

interface Props {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}

export default function PanelSection({ title, description, children, className, actions }: Props) {
  return (
    <div className={cn('panel p-5 space-y-4', className)}>
      {(title || actions) && (
        <div className="flex items-start justify-between">
          <div>
            {title && <h4 className="text-sm font-medium">{title}</h4>}
            {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
          </div>
          {actions}
        </div>
      )}
      {children}
    </div>
  );
}
