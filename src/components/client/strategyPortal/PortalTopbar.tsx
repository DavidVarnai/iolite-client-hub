import { Edit3, Eye } from 'lucide-react';

interface PortalTopbarProps {
  sectionLabel: string;
  status: string;
  onStatusChange: (status: string) => void;
  editMode: boolean;
  onToggleEdit: () => void;
}

export default function PortalTopbar({ sectionLabel, status, onStatusChange, editMode, onToggleEdit }: PortalTopbarProps) {
  return (
    <div className="sp-topbar">
      <div className="text-[15px] font-semibold text-[hsl(210_30%_92%)]">{sectionLabel}</div>
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleEdit}
          className={`sp-edit-mode-btn ${editMode ? 'active' : ''}`}
        >
          {editMode ? <><Edit3 size={13} /> Editing</> : <><Eye size={13} /> View</>}
        </button>
        <div className="flex gap-2">
          {[
            { id: 'draft', label: '⚠ Draft' },
            { id: 'review', label: '👁 In Review' },
            { id: 'approved', label: '✓ Approved' },
          ].map(s => (
            <button
              key={s.id}
              className={`sp-status-btn ${s.id} ${status === s.id ? 'active-status' : ''}`}
              onClick={() => onStatusChange(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
