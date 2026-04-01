import { useState, useRef, useEffect } from 'react';
import { Sparkles, Check, X } from 'lucide-react';

interface EditableFieldProps {
  value: string;
  onSave: (value: string) => void;
  onAiClick?: () => void;
  multiline?: boolean;
  className?: string;
  editMode: boolean;
  placeholder?: string;
}

export default function EditableField({
  value,
  onSave,
  onAiClick,
  multiline = false,
  className = '',
  editMode,
  placeholder = 'Click to edit...',
}: EditableFieldProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLTextAreaElement | HTMLInputElement>(null);

  useEffect(() => { setDraft(value); }, [value]);
  useEffect(() => {
    if (editing && ref.current) ref.current.focus();
  }, [editing]);

  const commit = () => {
    onSave(draft);
    setEditing(false);
  };
  const cancel = () => {
    setDraft(value);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="sp-editable-active">
        {multiline ? (
          <textarea
            ref={ref as any}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => { if (e.key === 'Escape') cancel(); }}
            className="sp-edit-input sp-edit-textarea"
            rows={3}
          />
        ) : (
          <input
            ref={ref as any}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') commit();
              if (e.key === 'Escape') cancel();
            }}
            className="sp-edit-input"
          />
        )}
        <div className="sp-edit-actions">
          <button onClick={commit} className="sp-edit-btn sp-edit-save"><Check size={14} /></button>
          <button onClick={cancel} className="sp-edit-btn sp-edit-cancel"><X size={14} /></button>
        </div>
      </div>
    );
  }

  return (
    <span className={`sp-editable-field group ${editMode ? 'sp-edit-enabled' : ''} ${className}`}>
      <span
        onClick={() => editMode && setEditing(true)}
        className={editMode ? 'cursor-pointer' : ''}
      >
        {value || <span className="sp-placeholder">{placeholder}</span>}
      </span>
      {editMode && onAiClick && (
        <button
          onClick={e => { e.stopPropagation(); onAiClick(); }}
          className="sp-ai-trigger"
          title="AI Assist"
        >
          <Sparkles size={13} />
        </button>
      )}
    </span>
  );
}

interface EditableListProps {
  items: string[];
  onSave: (items: string[]) => void;
  onAiClick?: () => void;
  editMode: boolean;
}

export function EditableList({ items, onSave, onAiClick, editMode }: EditableListProps) {
  return (
    <ul className="bullet-list">
      {items.map((item, i) => (
        <li key={i}>
          <EditableField
            value={item}
            onSave={val => {
              const next = [...items];
              next[i] = val;
              onSave(next);
            }}
            onAiClick={onAiClick}
            editMode={editMode}
          />
        </li>
      ))}
      {editMode && (
        <li>
          <button
            onClick={() => onSave([...items, ''])}
            className="text-[11px] text-primary hover:text-primary/80 font-medium"
          >
            + Add item
          </button>
        </li>
      )}
    </ul>
  );
}
