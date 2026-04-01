import EditableField from '../EditableField';
import type { StrategyPortalData } from '../portalTypes';

interface Props {
  data: StrategyPortalData;
  editMode: boolean;
  onUpdate: <K extends keyof StrategyPortalData>(field: K, value: StrategyPortalData[K]) => void;
  onAiOpen: (context: string, value: string, onApply: (v: string) => void) => void;
}

export default function ExecutionOptionsSection({ data, editMode, onUpdate }: Props) {
  return (
    <div className="sp-section">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[hsl(210_30%_92%)]">Execution Options</h1>
        <p className="text-[hsl(215_14%_57%)] mt-1.5 text-sm">
          <EditableField value={data.executionSubtitle} onSave={v => onUpdate('executionSubtitle', v)} editMode={editMode} />
        </p>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="sp-budget-card">
          <h3 className="text-[17px] font-bold mb-1 text-[hsl(210_30%_92%)]">Foundation Package</h3>
          <div className="flex flex-col gap-0">
            {data.foundationLines.map((line, i) => (
              <div key={i} className="flex justify-between items-center py-2.5 border-b border-[hsl(215_14%_25%)] text-[13px] last:border-b-0">
                <span className="text-[hsl(215_14%_57%)]">
                  <EditableField value={line.label} onSave={v => {
                    const next = [...data.foundationLines]; next[i] = { ...line, label: v }; onUpdate('foundationLines', next);
                  }} editMode={editMode} />
                </span>
                <span className="text-[hsl(210_30%_92%)] font-semibold">
                  <EditableField value={line.value} onSave={v => {
                    const next = [...data.foundationLines]; next[i] = { ...line, value: v }; onUpdate('foundationLines', next);
                  }} editMode={editMode} />
                </span>
              </div>
            ))}
          </div>
          {editMode && (
            <button onClick={() => onUpdate('foundationLines', [...data.foundationLines, { label: 'New Service', value: '$0' }])}
              className="mt-2 text-xs text-primary hover:text-primary/80 font-medium">+ Add Line</button>
          )}
          <div className="flex justify-between items-center pt-3.5 border-t-2 border-[hsl(215_14%_25%)] mt-1">
            <span className="text-sm font-semibold text-[hsl(210_30%_92%)]">Total Investment</span>
            <span className="text-xl font-extrabold text-primary">
              <EditableField value={data.foundationTotal} onSave={v => onUpdate('foundationTotal', v)} editMode={editMode} />
            </span>
          </div>
        </div>

        <div className="sp-budget-card sp-budget-featured">
          <span className="absolute top-3.5 right-3.5 bg-primary text-primary-foreground text-[10px] font-bold px-2.5 py-0.5 rounded-full tracking-wide">RECOMMENDED</span>
          <h3 className="text-[17px] font-bold mb-1 text-[hsl(210_30%_92%)]">Growth Package</h3>
          <div className="flex flex-col gap-0">
            {data.growthLines.map((line, i) => (
              <div key={i} className="flex justify-between items-center py-2.5 border-b border-[hsl(215_14%_25%)] text-[13px] last:border-b-0">
                <span className="text-[hsl(215_14%_57%)]">
                  <EditableField value={line.label} onSave={v => {
                    const next = [...data.growthLines]; next[i] = { ...line, label: v }; onUpdate('growthLines', next);
                  }} editMode={editMode} />
                </span>
                <span className="text-[hsl(210_30%_92%)] font-semibold">
                  <EditableField value={line.value} onSave={v => {
                    const next = [...data.growthLines]; next[i] = { ...line, value: v }; onUpdate('growthLines', next);
                  }} editMode={editMode} />
                </span>
              </div>
            ))}
          </div>
          {editMode && (
            <button onClick={() => onUpdate('growthLines', [...data.growthLines, { label: 'New Service', value: '$0' }])}
              className="mt-2 text-xs text-primary hover:text-primary/80 font-medium">+ Add Line</button>
          )}
          <div className="flex justify-between items-center pt-3.5 border-t-2 border-[hsl(215_14%_25%)] mt-1">
            <span className="text-sm font-semibold text-[hsl(210_30%_92%)]">Total Investment</span>
            <span className="text-xl font-extrabold text-primary">
              <EditableField value={data.growthTotal} onSave={v => onUpdate('growthTotal', v)} editMode={editMode} />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
