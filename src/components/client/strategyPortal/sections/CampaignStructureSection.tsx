import EditableField from '../EditableField';
import type { StrategyPortalData } from '../portalTypes';

interface Props {
  data: StrategyPortalData;
  editMode: boolean;
  onUpdate: <K extends keyof StrategyPortalData>(field: K, value: StrategyPortalData[K]) => void;
  onAiOpen: (context: string, value: string, onApply: (v: string) => void) => void;
}

export default function CampaignStructureSection({ data, editMode, onUpdate, onAiOpen }: Props) {
  const dotClass = ['p1', 'p2', 'p3'];

  return (
    <div className="sp-section">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[hsl(210_30%_92%)]">Campaign Structure</h1>
        <p className="text-[hsl(215_14%_57%)] mt-1.5 text-sm">
          <EditableField value={data.structureSubtitle} onSave={v => onUpdate('structureSubtitle', v)} editMode={editMode} />
        </p>
      </div>

      <div className="rounded-xl border border-[hsl(215_14%_25%)] bg-[hsl(220_16%_9%)] p-6">
        <div className="flex flex-col gap-0">
          {data.phases.map((phase, i) => (
            <div key={i} className="flex gap-5 pb-7 last:pb-0">
              <div className="flex flex-col items-center flex-shrink-0 w-9">
                <div className={`sp-phase-dot ${dotClass[i % 3]}`}>{phase.num}</div>
                {i < data.phases.length - 1 && <div className="flex-1 w-0.5 bg-[hsl(215_14%_25%)] mt-1" />}
              </div>
              <div className="flex-1 pt-1">
                <h3 className="text-[15px] font-bold text-[hsl(210_30%_92%)] mb-1.5">
                  <EditableField value={phase.title} onSave={v => {
                    const next = [...data.phases]; next[i] = { ...phase, title: v }; onUpdate('phases', next);
                  }} editMode={editMode} />
                </h3>
                <p className="text-[13px] text-[hsl(215_14%_57%)] mb-2.5">
                  <EditableField value={phase.desc} onSave={v => {
                    const next = [...data.phases]; next[i] = { ...phase, desc: v }; onUpdate('phases', next);
                  }} editMode={editMode} multiline onAiClick={() => onAiOpen(`Phase: ${phase.title}`, phase.desc, v => {
                    const next = [...data.phases]; next[i] = { ...phase, desc: v }; onUpdate('phases', next);
                  })} />
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {phase.tags.map((tag, ti) => (
                    <span key={ti} className="sp-ptag">
                      <EditableField value={tag} onSave={v => {
                        const nextTags = [...phase.tags]; nextTags[ti] = v;
                        const next = [...data.phases]; next[i] = { ...phase, tags: nextTags }; onUpdate('phases', next);
                      }} editMode={editMode} />
                    </span>
                  ))}
                  {editMode && (
                    <button onClick={() => {
                      const nextTags = [...phase.tags, 'New Tag'];
                      const next = [...data.phases]; next[i] = { ...phase, tags: nextTags }; onUpdate('phases', next);
                    }} className="text-[10px] text-primary font-medium">+ tag</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
