/**
 * FormRow — labeled form field layout for admin forms.
 */
import { Label } from '@/components/ui/label';

interface Props {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}

export default function FormRow({ label, hint, children, className }: Props) {
  return (
    <div className={className}>
      <Label className="text-xs">
        {label}
        {hint && <span className="text-muted-foreground font-normal ml-1">{hint}</span>}
      </Label>
      {children}
    </div>
  );
}
