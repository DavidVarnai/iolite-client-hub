import EditableField, { EditableList } from '../EditableField';
import type { StrategyPortalData } from '../portalTypes';

interface Props {
  data: StrategyPortalData;
  editMode: boolean;
  onUpdate: <K extends keyof StrategyPortalData>(field: K, value: StrategyPortalData[K]) => void;
  onAiOpen: (context: string, value: string, onApply: (v: string) => void) => void;
}

export default function BDOutreachSection({ data, editMode, onUpdate }: Props) {
  return (
    <div className="sp-section">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[hsl(210_30%_92%)]">BD Outreach Add-On</h1>
        <p className="text-[hsl(215_14%_57%)] mt-1.5 text-sm">
          <EditableField value={data.bdSubtitle} onSave={v => onUpdate('bdSubtitle', v)} editMode={editMode} />
        </p>
      </div>

      <div className="rounded-xl border border-[hsl(215_14%_25%)] bg-[hsl(220_16%_9%)] p-6 mb-5">
        <h3 className="text-[15px] font-bold mb-4 text-[hsl(210_30%_92%)]">📤 Outreach Program Structure</h3>
        <div className="grid grid-cols-2 gap-5">
          <div className="sp-icp-card">
            <div className="text-sm font-bold mb-2 text-[hsl(210_30%_92%)]">What's Included</div>
            <EditableList items={data.bdIncluded} onSave={v => onUpdate('bdIncluded', v)} editMode={editMode} />
          </div>
          <div className="sp-icp-card">
            <div className="text-sm font-bold mb-2 text-[hsl(210_30%_92%)]">Expected Outcomes</div>
            <EditableList items={data.bdOutcomes} onSave={v => onUpdate('bdOutcomes', v)} editMode={editMode} />
          </div>
        </div>
      </div>

      <div className="sp-budget-card">
        <h3 className="text-[17px] font-bold mb-1 text-[hsl(210_30%_92%)]">BD Outreach Investment</h3>
        <div className="flex flex-col gap-0">
          {data.bdLines.map((line, i) => (
            <div key={i} className="flex justify-between items-center py-2.5 border-b border-[hsl(215_14%_25%)] text-[13px] last:border-b-0">
              <span className="text-[hsl(215_14%_57%)]">
                <EditableField value={line.label} onSave={v => {
                  const next = [...data.bdLines]; next[i] = { ...line, label: v }; onUpdate('bdLines', next);
                }} editMode={editMode} />
              </span>
              <span className="text-[hsl(210_30%_92%)] font-semibold">
                <EditableField value={line.value} onSave={v => {
                  const next = [...data.bdLines]; next[i] = { ...line, value: v }; onUpdate('bdLines', next);
                }} editMode={editMode} />
              </span>
            </div>
          ))}
        </div>
        {editMode && (
          <button onClick={() => onUpdate('bdLines', [...data.bdLines, { label: 'New Service', value: '$0/mo' }])}
            className="mt-2 text-xs text-primary hover:text-primary/80 font-medium">+ Add Line</button>
        )}
        <div className="flex justify-between items-center pt-3.5 border-t-2 border-[hsl(215_14%_25%)] mt-1">
          <span className="text-sm font-semibold text-[hsl(210_30%_92%)]">Monthly Investment</span>
          <span className="text-xl font-extrabold text-primary">
            <EditableField value={data.bdTotal} onSave={v => onUpdate('bdTotal', v)} editMode={editMode} />
          </span>
        </div>
      </div>
    </div>
  );
}
