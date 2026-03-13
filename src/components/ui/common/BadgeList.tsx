/**
 * BadgeList — renders a list of badges with consistent spacing.
 */
import { Badge } from '@/components/ui/badge';

interface BadgeItem {
  key: string;
  label: string;
  variant?: 'default' | 'secondary' | 'outline' | 'destructive';
}

interface Props {
  items: BadgeItem[];
  emptyText?: string;
}

export default function BadgeList({ items, emptyText = 'None' }: Props) {
  if (items.length === 0) {
    return <span className="text-xs text-muted-foreground italic">{emptyText}</span>;
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map(item => (
        <Badge key={item.key} variant={item.variant || 'outline'} className="text-xs font-normal">
          {item.label}
        </Badge>
      ))}
    </div>
  );
}
