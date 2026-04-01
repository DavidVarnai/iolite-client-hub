import EditableField from '../EditableField';
import type { StrategyPortalData } from '../portalTypes';

interface Props {
  data: StrategyPortalData;
  editMode: boolean;
  onUpdate: <K extends keyof StrategyPortalData>(field: K, value: StrategyPortalData[K]) => void;
  onAiOpen: (context: string, value: string, onApply: (v: string) => void) => void;
}

export default function ChannelStrategySection({ data, editMode, onUpdate, onAiOpen }: Props) {
  return (
    <div className="sp-section">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[hsl(210_30%_92%)]">Channel Strategy</h1>
        <p className="text-[hsl(215_14%_57%)] mt-1.5 text-sm">
          <EditableField value={data.channelsSubtitle} onSave={v => onUpdate('channelsSubtitle', v)} editMode={editMode} />
        </p>
      </div>

      <div className="grid grid-cols-2 gap-5">
        {data.channels.map((ch, i) => (
          <div key={i} className="sp-channel-card">
            <h4 className="text-sm font-bold text-[hsl(210_30%_92%)] mb-1">
              {ch.icon} <EditableField value={ch.title} onSave={v => {
                const next = [...data.channels]; next[i] = { ...ch, title: v }; onUpdate('channels', next);
              }} editMode={editMode} />
            </h4>
            <div className="text-[11px] uppercase tracking-wider font-bold text-primary mb-2.5">
              <EditableField value={ch.role} onSave={v => {
                const next = [...data.channels]; next[i] = { ...ch, role: v }; onUpdate('channels', next);
              }} editMode={editMode} />
            </div>
            <p className="text-[13px] text-[hsl(215_14%_57%)] leading-relaxed">
              <EditableField value={ch.desc} onSave={v => {
                const next = [...data.channels]; next[i] = { ...ch, desc: v }; onUpdate('channels', next);
              }} editMode={editMode} multiline onAiClick={() => onAiOpen(`Channel: ${ch.title}`, ch.desc, v => {
                const next = [...data.channels]; next[i] = { ...ch, desc: v }; onUpdate('channels', next);
              })} />
            </p>
          </div>
        ))}
      </div>
      {editMode && (
        <button onClick={() => onUpdate('channels', [...data.channels, { icon: '📌', title: 'New Channel', role: 'Channel Role', desc: 'Describe channel...' }])}
          className="mt-4 text-xs text-primary hover:text-primary/80 font-medium">+ Add Channel</button>
      )}
    </div>
  );
}
