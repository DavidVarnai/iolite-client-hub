import EditableField from '../EditableField';
import type { StrategyPortalData } from '../portalTypes';

interface Props {
  data: StrategyPortalData;
  editMode: boolean;
  onUpdate: <K extends keyof StrategyPortalData>(field: K, value: StrategyPortalData[K]) => void;
  onAiOpen: (context: string, value: string, onApply: (v: string) => void) => void;
}

export default function CoreInsightSection({ data, editMode, onUpdate, onAiOpen }: Props) {
  return (
    <div className="sp-section">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[hsl(210_30%_92%)]">Core Insight</h1>
        <p className="text-[hsl(215_14%_57%)] mt-1.5 text-sm">
          <EditableField value={data.insightSubtitle} onSave={v => onUpdate('insightSubtitle', v)} editMode={editMode} />
        </p>
      </div>

      <div className="sp-insight-box">
        <div className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: 'hsl(235, 90%, 80%)' }}>
          Strategic Insight
        </div>
        <p className="text-[15px] text-[hsl(210_30%_92%)] leading-relaxed">
          <EditableField value={data.strategicInsight} onSave={v => onUpdate('strategicInsight', v)} editMode={editMode} multiline
            onAiClick={() => onAiOpen('Strategic Insight', data.strategicInsight, v => onUpdate('strategicInsight', v))} />
        </p>
      </div>

      <div className="rounded-xl border border-[hsl(215_14%_25%)] bg-[hsl(220_16%_9%)] p-6">
        <h3 className="text-[15px] font-bold mb-4 text-[hsl(210_30%_92%)]">💡 Why This Insight Matters</h3>
        <div className="grid grid-cols-2 gap-5">
          <div className="sp-icp-card">
            <div className="text-sm font-bold mb-2 text-[hsl(210_30%_92%)]">For the Prospect</div>
            <p className="text-[13px] text-[hsl(215_14%_57%)] leading-relaxed">
              <EditableField value={data.insightForProspect} onSave={v => onUpdate('insightForProspect', v)} editMode={editMode} multiline
                onAiClick={() => onAiOpen('Insight for Prospect', data.insightForProspect, v => onUpdate('insightForProspect', v))} />
            </p>
          </div>
          <div className="sp-icp-card">
            <div className="text-sm font-bold mb-2 text-[hsl(210_30%_92%)]">For Your Company</div>
            <p className="text-[13px] text-[hsl(215_14%_57%)] leading-relaxed">
              <EditableField value={data.insightForCompany} onSave={v => onUpdate('insightForCompany', v)} editMode={editMode} multiline
                onAiClick={() => onAiOpen('Insight for Company', data.insightForCompany, v => onUpdate('insightForCompany', v))} />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
