/**
 * CompensationPanel — expandable panel showing compensation components for a team member.
 */
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { repository } from '@/lib/repository';
import type { CompensationComponent } from '@/types/economics';
import CompensationCard from './CompensationCard';
import CompensationForm from './CompensationForm';

interface Props {
  memberId: string;
  compensation: CompensationComponent[];
  onChanged: () => void;
}

export default function CompensationPanel({ memberId, compensation, onChanged }: Props) {
  const [showAdd, setShowAdd] = useState(false);

  const handleDelete = (id: string) => {
    repository.compensation.delete(id);
    onChanged();
    toast.success('Compensation component removed');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Compensation Components</p>
        <Button size="sm" variant="outline" onClick={() => setShowAdd(true)}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Add Component
        </Button>
      </div>

      {showAdd && (
        <CompensationForm memberId={memberId} onClose={() => setShowAdd(false)} onSaved={() => { onChanged(); setShowAdd(false); }} />
      )}

      {compensation.length === 0 && !showAdd && (
        <p className="text-xs text-muted-foreground italic">No compensation components defined.</p>
      )}

      <div className="space-y-2">
        {compensation.map(c => (
          <CompensationCard key={c.id} comp={c} onDelete={() => handleDelete(c.id)} />
        ))}
      </div>
    </div>
  );
}
