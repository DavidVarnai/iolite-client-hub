import EditableField from '../EditableField';
import type { StrategyPortalData } from '../portalTypes';

interface Props {
  data: StrategyPortalData;
  editMode: boolean;
  onUpdate: <K extends keyof StrategyPortalData>(field: K, value: StrategyPortalData[K]) => void;
  onAiOpen: (context: string, value: string, onApply: (v: string) => void) => void;
}

export default function NextStepsSection({ data, editMode, onUpdate }: Props) {
  const toggle = (id: number) => {
    onUpdate('checkItems', data.checkItems.map(item =>
      item.id === id ? { ...item, done: !item.done } : item
    ));
  };

  return (
    <div className="sp-section">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[hsl(210_30%_92%)]">Next Steps</h1>
        <p className="text-[hsl(215_14%_57%)] mt-1.5 text-sm">
          <EditableField value={data.nextStepsSubtitle} onSave={v => onUpdate('nextStepsSubtitle', v)} editMode={editMode} />
        </p>
      </div>

      <div className="rounded-xl border border-[hsl(215_14%_25%)] bg-[hsl(220_16%_9%)] p-6">
        <h3 className="text-[15px] font-bold mb-4 text-[hsl(210_30%_92%)]">✅ Action Checklist</h3>
        <div className="flex flex-col gap-2.5">
          {data.checkItems.map(item => (
            <div key={item.id} className={`sp-check-item ${item.done ? 'done' : ''}`} onClick={() => toggle(item.id)}>
              <div className={`sp-check-box ${item.done ? 'checked' : ''}`}>{item.done ? '✓' : ''}</div>
              <div>
                <div className={`text-[13.5px] ${item.done ? 'line-through' : ''}`}>
                  <EditableField value={item.label} onSave={v => {
                    onUpdate('checkItems', data.checkItems.map(ci => ci.id === item.id ? { ...ci, label: v } : ci));
                  }} editMode={editMode} />
                </div>
                <div className="text-[11.5px] text-[hsl(215_14%_57%)] mt-0.5">
                  <EditableField value={item.sub} onSave={v => {
                    onUpdate('checkItems', data.checkItems.map(ci => ci.id === item.id ? { ...ci, sub: v } : ci));
                  }} editMode={editMode} />
                </div>
              </div>
            </div>
          ))}
        </div>
        {editMode && (
          <button onClick={() => {
            const maxId = Math.max(0, ...data.checkItems.map(i => i.id));
            onUpdate('checkItems', [...data.checkItems, { id: maxId + 1, label: 'New action item', sub: 'Assignee', done: false }]);
          }} className="mt-3 text-xs text-primary hover:text-primary/80 font-medium">+ Add Action Item</button>
        )}
      </div>
    </div>
  );
}
