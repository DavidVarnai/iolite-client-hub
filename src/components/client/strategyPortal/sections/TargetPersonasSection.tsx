import EditableField from '../EditableField';
import type { StrategyPortalData } from '../portalTypes';

interface Props {
  data: StrategyPortalData;
  editMode: boolean;
  onUpdate: <K extends keyof StrategyPortalData>(field: K, value: StrategyPortalData[K]) => void;
  onAiOpen: (context: string, value: string, onApply: (v: string) => void) => void;
}

export default function TargetPersonasSection({ data, editMode, onUpdate }: Props) {
  return (
    <div className="sp-section">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[hsl(210_30%_92%)]">Target Personas</h1>
        <p className="text-[hsl(215_14%_57%)] mt-1.5 text-sm">
          <EditableField value={data.personasSubtitle} onSave={v => onUpdate('personasSubtitle', v)} editMode={editMode} />
        </p>
      </div>

      <div className="rounded-xl border border-[hsl(215_14%_25%)] bg-[hsl(220_16%_9%)] p-6">
        <h3 className="text-[15px] font-bold mb-4 text-[hsl(210_30%_92%)]">👥 Key Personas</h3>
        <div className="flex flex-wrap gap-2.5">
          {data.personas.map((p, i) => (
            <div key={i} className="sp-persona-chip">
              <div className="w-[26px] h-[26px] rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground flex-shrink-0">
                <EditableField value={p.initials} onSave={v => {
                  const next = [...data.personas]; next[i] = { ...p, initials: v }; onUpdate('personas', next);
                }} editMode={editMode} />
              </div>
              <div>
                <div className="font-semibold text-[13px]">
                  <EditableField value={p.title} onSave={v => {
                    const next = [...data.personas]; next[i] = { ...p, title: v }; onUpdate('personas', next);
                  }} editMode={editMode} />
                </div>
                <div className="text-[11px] text-[hsl(215_14%_57%)]">
                  <EditableField value={p.role} onSave={v => {
                    const next = [...data.personas]; next[i] = { ...p, role: v }; onUpdate('personas', next);
                  }} editMode={editMode} />
                </div>
              </div>
              {p.primary && (
                <span className="text-[10px] bg-primary/15 text-primary px-1.5 py-0.5 rounded font-bold">PRIMARY</span>
              )}
            </div>
          ))}
        </div>
        {editMode && (
          <button onClick={() => onUpdate('personas', [...data.personas, { initials: 'XX', title: 'New Persona', role: 'Role', primary: false }])}
            className="mt-3 text-xs text-primary hover:text-primary/80 font-medium">+ Add Persona</button>
        )}
      </div>
    </div>
  );
}
