import EditableField from '../EditableField';
import type { StrategyPortalData } from '../portalTypes';

interface Props {
  data: StrategyPortalData;
  editMode: boolean;
  onUpdate: <K extends keyof StrategyPortalData>(field: K, value: StrategyPortalData[K]) => void;
  onAiOpen: (context: string, value: string, onApply: (v: string) => void) => void;
}

export default function MessagingSection({ data, editMode, onUpdate, onAiOpen }: Props) {
  return (
    <div className="sp-section">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[hsl(210_30%_92%)]">Messaging Framework</h1>
        <p className="text-[hsl(215_14%_57%)] mt-1.5 text-sm">
          <EditableField value={data.messagingSubtitle} onSave={v => onUpdate('messagingSubtitle', v)} editMode={editMode} />
        </p>
      </div>

      <div className="grid grid-cols-2 gap-5">
        {data.messagingAngles.map((a, i) => (
          <div key={i} className="sp-angle-card">
            <div className="text-[32px] font-extrabold leading-none mb-2" style={{ color: 'hsl(217, 91%, 60%, 0.25)' }}>
              {a.num}
            </div>
            <h3 className="text-[15px] font-bold text-[hsl(210_30%_92%)] mb-2">
              <EditableField value={a.title} onSave={v => {
                const next = [...data.messagingAngles]; next[i] = { ...a, title: v }; onUpdate('messagingAngles', next);
              }} editMode={editMode} />
            </h3>
            <p className="text-[13px] text-[hsl(215_14%_57%)] leading-relaxed">
              <EditableField value={a.desc} onSave={v => {
                const next = [...data.messagingAngles]; next[i] = { ...a, desc: v }; onUpdate('messagingAngles', next);
              }} editMode={editMode} multiline onAiClick={() => onAiOpen(`Messaging: ${a.title}`, a.desc, v => {
                const next = [...data.messagingAngles]; next[i] = { ...a, desc: v }; onUpdate('messagingAngles', next);
              })} />
            </p>
          </div>
        ))}
      </div>
      {editMode && (
        <button onClick={() => {
          const num = String(data.messagingAngles.length + 1).padStart(2, '0');
          onUpdate('messagingAngles', [...data.messagingAngles, { num, title: 'New Angle', desc: 'Describe this messaging angle...' }]);
        }} className="mt-4 text-xs text-primary hover:text-primary/80 font-medium">+ Add Messaging Angle</button>
      )}
    </div>
  );
}
