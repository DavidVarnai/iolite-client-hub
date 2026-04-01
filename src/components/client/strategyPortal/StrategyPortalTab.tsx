import { useState, useCallback } from 'react';
import { useClientContext } from '@/contexts/ClientContext';
import { usePortalData } from './usePortalData';
import PortalSidebar from './PortalSidebar';
import PortalTopbar from './PortalTopbar';
import PortalAIPanel from './PortalAIPanel';
import type { StrategyPortalData } from './portalTypes';

import OverviewSection from './sections/OverviewSection';
import ICPProfilesSection from './sections/ICPProfilesSection';
import TargetPersonasSection from './sections/TargetPersonasSection';
import CoreInsightSection from './sections/CoreInsightSection';
import MessagingSection from './sections/MessagingSection';
import CampaignStructureSection from './sections/CampaignStructureSection';
import ChannelStrategySection from './sections/ChannelStrategySection';
import CreativeStrategySection from './sections/CreativeStrategySection';
import ExecutionOptionsSection from './sections/ExecutionOptionsSection';
import BDOutreachSection from './sections/BDOutreachSection';
import NextStepsSection from './sections/NextStepsSection';
import NotesSection from './sections/NotesSection';

const SECTION_LABELS: Record<string, string> = {
  overview: 'Overview',
  icp: 'ICP Profiles',
  personas: 'Target Personas',
  insight: 'Core Insight',
  messaging: 'Messaging Framework',
  structure: 'Campaign Structure',
  channels: 'Channel Strategy',
  creative: 'Creative Strategy',
  execution: 'Execution Options',
  bdoutreach: 'BD Outreach Add-On',
  nextsteps: 'Next Steps',
  notes: 'Notes & Feedback',
};

interface AIPanelState {
  open: boolean;
  context: string;
  value: string;
  onApply: (v: string) => void;
}

export default function StrategyPortalTab() {
  const { client } = useClientContext();
  const { data, updateField } = usePortalData(client.id);
  const [activeSection, setActiveSection] = useState('overview');
  const [editMode, setEditMode] = useState(false);
  const [aiPanel, setAiPanel] = useState<AIPanelState>({ open: false, context: '', value: '', onApply: () => {} });

  const onUpdate = useCallback(<K extends keyof StrategyPortalData>(field: K, value: StrategyPortalData[K]) => {
    updateField(field, value);
  }, [updateField]);

  const onAiOpen = useCallback((context: string, value: string, onApply: (v: string) => void) => {
    setAiPanel({ open: true, context, value, onApply });
  }, []);

  const sectionProps = { data, editMode, onUpdate, onAiOpen };

  const renderSection = () => {
    switch (activeSection) {
      case 'overview': return <OverviewSection {...sectionProps} />;
      case 'icp': return <ICPProfilesSection {...sectionProps} />;
      case 'personas': return <TargetPersonasSection {...sectionProps} />;
      case 'insight': return <CoreInsightSection {...sectionProps} />;
      case 'messaging': return <MessagingSection {...sectionProps} />;
      case 'structure': return <CampaignStructureSection {...sectionProps} />;
      case 'channels': return <ChannelStrategySection {...sectionProps} />;
      case 'creative': return <CreativeStrategySection {...sectionProps} />;
      case 'execution': return <ExecutionOptionsSection {...sectionProps} />;
      case 'bdoutreach': return <BDOutreachSection {...sectionProps} />;
      case 'nextsteps': return <NextStepsSection {...sectionProps} />;
      case 'notes': return <NotesSection {...sectionProps} />;
      default: return <OverviewSection {...sectionProps} />;
    }
  };

  return (
    <div className="sp-root">
      <PortalSidebar
        activeSection={activeSection}
        onNavigate={setActiveSection}
        clientName={client.name}
        status={data.status}
      />
      <div className="sp-main">
        <PortalTopbar
          sectionLabel={SECTION_LABELS[activeSection] || 'Overview'}
          status={data.status}
          onStatusChange={s => updateField('status', s as any)}
          editMode={editMode}
          onToggleEdit={() => setEditMode(!editMode)}
        />
        <div className={`sp-content ${aiPanel.open ? 'sp-content-with-ai' : ''}`}>
          {renderSection()}
        </div>
      </div>

      {aiPanel.open && (
        <PortalAIPanel
          fieldContext={aiPanel.context}
          currentValue={aiPanel.value}
          onApply={v => {
            aiPanel.onApply(v);
            setAiPanel(prev => ({ ...prev, open: false }));
          }}
          onClose={() => setAiPanel(prev => ({ ...prev, open: false }))}
        />
      )}
    </div>
  );
}
