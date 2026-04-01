import EditableField from '../EditableField';
import type { StrategyPortalData } from '../portalTypes';

interface Props {
  data: StrategyPortalData;
  editMode: boolean;
  onUpdate: <K extends keyof StrategyPortalData>(field: K, value: StrategyPortalData[K]) => void;
  onAiOpen: (context: string, value: string, onApply: (v: string) => void) => void;
}

export default function NotesSection({ data, editMode, onUpdate, onAiOpen }: Props) {
  return (
    <div className="sp-section">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[hsl(210_30%_92%)]">Notes & Feedback</h1>
        <p className="text-[hsl(215_14%_57%)] mt-1.5 text-sm">
          Add your notes, questions, and feedback for the working session.
        </p>
      </div>

      <div className="rounded-xl border border-[hsl(215_14%_25%)] bg-[hsl(220_16%_9%)] p-6 mb-5">
        <h3 className="text-[15px] font-bold mb-4 text-[hsl(210_30%_92%)]">📝 Strategy Notes</h3>
        <textarea
          className="sp-notes-area"
          placeholder="Type your notes, questions, or feedback here..."
          value={data.notes}
          onChange={e => onUpdate('notes', e.target.value)}
        />
      </div>

      <div className="rounded-xl border border-[hsl(215_14%_25%)] bg-[hsl(220_16%_9%)] p-6">
        <h3 className="text-[15px] font-bold mb-4 text-[hsl(210_30%_92%)]">💬 Discussion Topics</h3>
        <div className="grid grid-cols-2 gap-5">
          {data.discussionTopics.map((topic, i) => (
            <div key={i} className="sp-icp-card">
              <div className="text-sm font-bold mb-2 text-[hsl(210_30%_92%)]">
                <EditableField value={topic.title} onSave={v => {
                  const next = [...data.discussionTopics]; next[i] = { ...topic, title: v }; onUpdate('discussionTopics', next);
                }} editMode={editMode} />
              </div>
              <p className="text-[13px] text-[hsl(215_14%_57%)] leading-relaxed">
                <EditableField value={topic.desc} onSave={v => {
                  const next = [...data.discussionTopics]; next[i] = { ...topic, desc: v }; onUpdate('discussionTopics', next);
                }} editMode={editMode} multiline onAiClick={() => onAiOpen(`Discussion: ${topic.title}`, topic.desc, v => {
                  const next = [...data.discussionTopics]; next[i] = { ...topic, desc: v }; onUpdate('discussionTopics', next);
                })} />
              </p>
            </div>
          ))}
        </div>
        {editMode && (
          <button onClick={() => onUpdate('discussionTopics', [...data.discussionTopics, { title: 'New Topic', desc: 'Discussion question...' }])}
            className="mt-4 text-xs text-primary hover:text-primary/80 font-medium">+ Add Topic</button>
        )}
      </div>
    </div>
  );
}
