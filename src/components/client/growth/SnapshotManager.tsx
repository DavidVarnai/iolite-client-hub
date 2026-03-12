import { useState } from 'react';
import type { GrowthModel, ModelSnapshot } from '@/types/growthModel';
import { createSnapshot, listSnapshots } from '@/lib/growthModelSnapshots';
import { Camera, History } from 'lucide-react';
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';

interface Props {
  model: GrowthModel;
  onSave: (snapshot: ModelSnapshot) => void;
}

export default function SnapshotManager({ model, onSave }: Props) {
  const [name, setName] = useState('');
  const [open, setOpen] = useState(false);
  const snapshots = listSnapshots(model);

  const handleSave = () => {
    if (!name.trim()) return;
    const snap = createSnapshot(model, name.trim(), 'Current User');
    onSave(snap);
    setName('');
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
          <History className="h-3.5 w-3.5" />
          Versions ({snapshots.length})
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72">
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-foreground">Save Version</h4>
          <div className="flex gap-2">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Approved Plan"
              className="h-8 text-xs"
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
            <button
              onClick={handleSave}
              className="px-3 py-1 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors flex items-center gap-1"
            >
              <Camera className="h-3 w-3" />
              Save
            </button>
          </div>
          {snapshots.length > 0 && (
            <div className="border-t pt-3">
              <h4 className="text-xs font-medium text-muted-foreground mb-2">History</h4>
              <div className="space-y-1.5">
                {snapshots.map(s => (
                  <div key={s.id} className="flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground">{s.name}</span>
                    <span className="text-muted-foreground">
                      {new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
