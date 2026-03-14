/**
 * EditableText — inline editable text component with save/cancel controls.
 */
import { useState } from 'react';
import { Pencil, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

interface EditableTextProps {
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  className?: string;
}

export default function EditableText({ value, onChange, multiline = false, className = '' }: EditableTextProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  if (editing) {
    return (
      <div className="space-y-2">
        {multiline ? (
          <Textarea value={draft} onChange={e => setDraft(e.target.value)} rows={4} className="text-sm" />
        ) : (
          <Input value={draft} onChange={e => setDraft(e.target.value)} className="text-sm" />
        )}
        <div className="flex gap-1.5">
          <Button size="sm" variant="default" onClick={() => { onChange(draft); setEditing(false); }}>
            <Check className="h-3.5 w-3.5 mr-1" /> Save
          </Button>
          <Button size="sm" variant="ghost" onClick={() => { setDraft(value); setEditing(false); }}>
            <X className="h-3.5 w-3.5 mr-1" /> Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`group relative ${className}`}>
      <div className="whitespace-pre-wrap">{value}</div>
      <button
        onClick={() => { setDraft(value); setEditing(true); }}
        className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-background border rounded-md p-1.5 shadow-sm"
      >
        <Pencil className="h-3 w-3 text-muted-foreground" />
      </button>
    </div>
  );
}
