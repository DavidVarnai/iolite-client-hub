import EditableField, { EditableList } from '../EditableField';
import type { StrategyPortalData } from '../portalTypes';

interface Props {
  data: StrategyPortalData;
  editMode: boolean;
  onUpdate: <K extends keyof StrategyPortalData>(field: K, value: StrategyPortalData[K]) => void;
  onAiOpen: (context: string, value: string, onApply: (v: string) => void) => void;
}

export default function ICPProfilesSection({ data, editMode, onUpdate, onAiOpen }: Props) {
  return (
    <div className="sp-section">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[hsl(210_30%_92%)]">ICP Profiles</h1>
        <p className="text-[hsl(215_14%_57%)] mt-1.5 text-sm">
          <EditableField value={data.icpSubtitle} onSave={v => onUpdate('icpSubtitle', v)} editMode={editMode} />
        </p>
      </div>

      <div className="rounded-xl border border-[hsl(215_14%_25%)] bg-[hsl(220_16%_9%)] p-6 mb-5">
        <h3 className="text-[15px] font-bold mb-4 flex items-center gap-2 text-[hsl(210_30%_92%)]">
          <span>🎯</span> ICP #1 — Primary <span className="sp-ptag">Primary Focus</span>
        </h3>
        <div className="grid grid-cols-2 gap-5">
          <div>
            <div className="sp-icp-section-label">Who They Are</div>
            <EditableList items={data.icp4WhoTheyAre} onSave={v => onUpdate('icp4WhoTheyAre', v)} editMode={editMode} />
            <div className="sp-icp-section-label">Core Challenges</div>
            <EditableList items={data.icp4Challenges} onSave={v => onUpdate('icp4Challenges', v)} editMode={editMode} />
          </div>
          <div>
            <div className="sp-icp-section-label">What They Want</div>
            <EditableList items={data.icp4WhatTheyWant} onSave={v => onUpdate('icp4WhatTheyWant', v)} editMode={editMode} />
            <div className="sp-icp-section-label">Positioning Statement</div>
            <div className="sp-positioning-box">
              <EditableField value={data.icp4Positioning} onSave={v => onUpdate('icp4Positioning', v)} editMode={editMode} multiline
                onAiClick={() => onAiOpen('ICP #1 Positioning', data.icp4Positioning, v => onUpdate('icp4Positioning', v))} />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-[hsl(215_14%_25%)] bg-[hsl(220_16%_9%)] p-6">
        <h3 className="text-[15px] font-bold mb-4 flex items-center gap-2 text-[hsl(210_30%_92%)]">
          <span>🌱</span> ICP #2 — Secondary <span className="sp-ptag green">Secondary</span>
        </h3>
        <div className="grid grid-cols-2 gap-5">
          <div>
            <div className="sp-icp-section-label">Who They Are</div>
            <EditableList items={data.icp3WhoTheyAre} onSave={v => onUpdate('icp3WhoTheyAre', v)} editMode={editMode} />
            <div className="sp-icp-section-label">Core Challenges</div>
            <EditableList items={data.icp3Challenges} onSave={v => onUpdate('icp3Challenges', v)} editMode={editMode} />
          </div>
          <div>
            <div className="sp-icp-section-label">What They Want</div>
            <EditableList items={data.icp3WhatTheyWant} onSave={v => onUpdate('icp3WhatTheyWant', v)} editMode={editMode} />
            <div className="sp-icp-section-label">Positioning Statement</div>
            <div className="sp-positioning-box">
              <EditableField value={data.icp3Positioning} onSave={v => onUpdate('icp3Positioning', v)} editMode={editMode} multiline
                onAiClick={() => onAiOpen('ICP #2 Positioning', data.icp3Positioning, v => onUpdate('icp3Positioning', v))} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
