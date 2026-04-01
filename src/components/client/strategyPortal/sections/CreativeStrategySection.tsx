import EditableField, { EditableList } from '../EditableField';
import type { StrategyPortalData } from '../portalTypes';

interface Props {
  data: StrategyPortalData;
  editMode: boolean;
  onUpdate: <K extends keyof StrategyPortalData>(field: K, value: StrategyPortalData[K]) => void;
  onAiOpen: (context: string, value: string, onApply: (v: string) => void) => void;
}

export default function CreativeStrategySection({ data, editMode, onUpdate, onAiOpen }: Props) {
  return (
    <div className="sp-section">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[hsl(210_30%_92%)]">Creative Strategy</h1>
        <p className="text-[hsl(215_14%_57%)] mt-1.5 text-sm">
          <EditableField value={data.creativeSubtitle} onSave={v => onUpdate('creativeSubtitle', v)} editMode={editMode} />
        </p>
      </div>

      <div className="rounded-xl border border-[hsl(215_14%_25%)] bg-[hsl(220_16%_9%)] p-6 mb-5">
        <h3 className="text-[15px] font-bold mb-4 text-[hsl(210_30%_92%)]">🎬 Creative Direction</h3>
        <div className="grid grid-cols-2 gap-5">
          <div className="sp-icp-card">
            <div className="text-sm font-bold mb-2 text-[hsl(210_30%_92%)]">Visual Tone</div>
            <EditableList items={data.visualTone} onSave={v => onUpdate('visualTone', v)} editMode={editMode} />
          </div>
          <div className="sp-icp-card">
            <div className="text-sm font-bold mb-2 text-[hsl(210_30%_92%)]">Content Formats</div>
            <EditableList items={data.contentFormats} onSave={v => onUpdate('contentFormats', v)} editMode={editMode} />
          </div>
        </div>
      </div>

      <div className="sp-insight-box">
        <div className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: 'hsl(235, 90%, 80%)' }}>
          Creative Principle
        </div>
        <p className="text-[15px] text-[hsl(210_30%_92%)] leading-relaxed">
          <EditableField value={data.creativePrinciple} onSave={v => onUpdate('creativePrinciple', v)} editMode={editMode} multiline
            onAiClick={() => onAiOpen('Creative Principle', data.creativePrinciple, v => onUpdate('creativePrinciple', v))} />
        </p>
      </div>
    </div>
  );
}
