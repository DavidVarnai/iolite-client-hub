import EditableField from '../EditableField';
import type { StrategyPortalData } from '../portalTypes';

interface Props {
  data: StrategyPortalData;
  editMode: boolean;
  onUpdate: <K extends keyof StrategyPortalData>(field: K, value: StrategyPortalData[K]) => void;
  onAiOpen: (context: string, value: string, onApply: (v: string) => void) => void;
}

export default function OverviewSection({ data, editMode, onUpdate, onAiOpen }: Props) {
  return (
    <div className="sp-section">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[hsl(210_30%_92%)]">
          <EditableField value={data.overviewTitle} onSave={v => onUpdate('overviewTitle', v)} editMode={editMode}
            onAiClick={() => onAiOpen('Overview Title', data.overviewTitle, v => onUpdate('overviewTitle', v))} />
        </h1>
        <p className="text-[hsl(215_14%_57%)] mt-1.5 text-sm">
          <EditableField value={data.overviewSubtitle} onSave={v => onUpdate('overviewSubtitle', v)} editMode={editMode}
            onAiClick={() => onAiOpen('Overview Subtitle', data.overviewSubtitle, v => onUpdate('overviewSubtitle', v))} />
        </p>
      </div>

      <div className="sp-summary-banner">
        <span className="text-[32px]">🚀</span>
        <div className="flex-1">
          <h2 className="text-base font-bold text-[hsl(210_30%_92%)]">Campaign Context</h2>
          <p className="text-[13px] text-[hsl(215_14%_57%)] mt-1 leading-relaxed">
            <EditableField value={data.campaignContext} onSave={v => onUpdate('campaignContext', v)} editMode={editMode} multiline
              onAiClick={() => onAiOpen('Campaign Context', data.campaignContext, v => onUpdate('campaignContext', v))} />
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {data.overviewStats.map((s, i) => (
          <div key={i} className="sp-stat-box">
            <div className="text-[22px] font-extrabold text-primary">
              <EditableField value={s.val} onSave={val => {
                const next = [...data.overviewStats]; next[i] = { ...s, val }; onUpdate('overviewStats', next);
              }} editMode={editMode} />
            </div>
            <div className="text-xs text-[hsl(215_14%_57%)] mt-1">
              <EditableField value={s.label} onSave={label => {
                const next = [...data.overviewStats]; next[i] = { ...s, label }; onUpdate('overviewStats', next);
              }} editMode={editMode} />
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-[hsl(215_14%_25%)] bg-[hsl(220_16%_9%)] p-6 mb-5">
        <div className="grid grid-cols-2 gap-5">
          <div className="sp-icp-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold">🎯 <EditableField value={data.primaryFocus.label} editMode={editMode}
                onSave={v => onUpdate('primaryFocus', { ...data.primaryFocus, label: v })} /></span>
              <span className="sp-ptag">{data.primaryFocus.tag}</span>
            </div>
            <p className="text-[13px] text-[hsl(215_14%_57%)] leading-relaxed">
              <EditableField value={data.primaryFocus.desc} onSave={v => onUpdate('primaryFocus', { ...data.primaryFocus, desc: v })}
                editMode={editMode} multiline onAiClick={() => onAiOpen('Primary Focus Description', data.primaryFocus.desc, v => onUpdate('primaryFocus', { ...data.primaryFocus, desc: v }))} />
            </p>
            <div className="sp-positioning-box">
              <EditableField value={data.primaryFocus.positioning} onSave={v => onUpdate('primaryFocus', { ...data.primaryFocus, positioning: v })}
                editMode={editMode} multiline onAiClick={() => onAiOpen('Primary Positioning Statement', data.primaryFocus.positioning, v => onUpdate('primaryFocus', { ...data.primaryFocus, positioning: v }))} />
            </div>
          </div>
          <div className="sp-icp-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold">🌱 <EditableField value={data.secondaryFocus.label} editMode={editMode}
                onSave={v => onUpdate('secondaryFocus', { ...data.secondaryFocus, label: v })} /></span>
              <span className="sp-ptag green">{data.secondaryFocus.tag}</span>
            </div>
            <p className="text-[13px] text-[hsl(215_14%_57%)] leading-relaxed">
              <EditableField value={data.secondaryFocus.desc} onSave={v => onUpdate('secondaryFocus', { ...data.secondaryFocus, desc: v })}
                editMode={editMode} multiline onAiClick={() => onAiOpen('Secondary Focus Description', data.secondaryFocus.desc, v => onUpdate('secondaryFocus', { ...data.secondaryFocus, desc: v }))} />
            </p>
            <div className="sp-positioning-box">
              <EditableField value={data.secondaryFocus.positioning} onSave={v => onUpdate('secondaryFocus', { ...data.secondaryFocus, positioning: v })}
                editMode={editMode} multiline onAiClick={() => onAiOpen('Secondary Positioning Statement', data.secondaryFocus.positioning, v => onUpdate('secondaryFocus', { ...data.secondaryFocus, positioning: v }))} />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-[hsl(215_14%_25%)] bg-[hsl(220_16%_9%)] p-6">
        <h3 className="text-[15px] font-bold mb-4 text-[hsl(210_30%_92%)]">⚠️ Key Requirements</h3>
        <div className="grid grid-cols-3 gap-4">
          {data.notTraditionalPoints.map((item, i) => (
            <div key={i} className="sp-icp-card">
              <div className="text-sm font-bold text-[hsl(210_30%_92%)] mb-2">
                <EditableField value={item.title} onSave={v => {
                  const next = [...data.notTraditionalPoints]; next[i] = { ...item, title: v }; onUpdate('notTraditionalPoints', next);
                }} editMode={editMode} />
              </div>
              <p className="text-[13px] text-[hsl(215_14%_57%)] leading-relaxed">
                <EditableField value={item.desc} onSave={v => {
                  const next = [...data.notTraditionalPoints]; next[i] = { ...item, desc: v }; onUpdate('notTraditionalPoints', next);
                }} editMode={editMode} multiline onAiClick={() => onAiOpen(`Key Requirement: ${item.title}`, item.desc, v => {
                  const next = [...data.notTraditionalPoints]; next[i] = { ...item, desc: v }; onUpdate('notTraditionalPoints', next);
                })} />
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
