import { useParams, useNavigate } from 'react-router-dom';
import { getClients } from '@/data/seed';
import { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { getOnboardingForClient } from '@/data/onboardingSeed';
import { getGrowthModelForClient } from '@/data/growthModelSeed';
import { computeStageReadiness, getNextStepPrompt, OnboardingData } from '@/types/onboarding';
import ClientLifecycleBar from '@/components/client/ClientLifecycleBar';
import NextStepCard from '@/components/client/NextStepCard';
import ClientOnboardingWizard from '@/components/client/ClientOnboardingWizard';
import ClientOverview from '@/components/client/Overview';
import ClientStrategy from '@/components/client/Strategy';
import MeetingHub from '@/components/client/MeetingHub';
import ClientComments from '@/components/client/Comments';
import ClientPerformance from '@/components/client/Performance';
import ClientTasks from '@/components/client/Tasks';
import ClientCommunications from '@/components/client/Communications';
import ClientDocuments from '@/components/client/Documents';
import ClientSettings from '@/components/client/ClientSettings';
import Campaigns from '@/components/client/Campaigns';
import GrowthModelView from '@/components/client/GrowthModel';
import { Client } from '@/types';

const TABS = [
  'overview', 'strategy', 'growth-model', 'campaigns', 'performance', 'meetings',
  'comments', 'tasks', 'communications', 'documents', 'settings',
] as const;

const stageClass: Record<string, string> = {
  lead: 'status-lead',
  proposal: 'status-proposal',
  active: 'status-active',
  paused: 'status-paused',
  completed: 'status-completed',
};

export default function ClientHub() {
  const { clientId, tab } = useParams();
  const navigate = useNavigate();
  const seedClient = seedClients.find(c => c.id === clientId);
  const [client, setClient] = useState<Client | null>(seedClient || null);
  const [proposalMode, setProposalMode] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [onboarding, setOnboarding] = useState<OnboardingData>(() => getOnboardingForClient(clientId || ''));
  const activeTab = (tab && TABS.includes(tab as any)) ? tab : 'overview';

  const hasGrowthModel = !!getGrowthModelForClient(clientId || '');

  const stageProgress = useMemo(() =>
    client ? computeStageReadiness(onboarding, client, hasGrowthModel) : [],
    [onboarding, client, hasGrowthModel]
  );

  const nextStep = useMemo(() =>
    getNextStepPrompt(onboarding, stageProgress),
    [onboarding, stageProgress]
  );

  if (!client) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Client not found.</p>
      </div>
    );
  }

  const setTab = (t: string) => navigate(`/clients/${clientId}/${t}`);

  const handleActivateClient = () => {
    setOnboarding(prev => ({
      ...prev,
      lifecycleStage: 'active_client',
      activatedAt: new Date().toISOString(),
    }));
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'overview': return (
        <ClientOverview
          client={client}
          onboarding={onboarding}
          stageProgress={stageProgress}
          nextStep={nextStep}
          hasGrowthModel={hasGrowthModel}
          onNavigateTab={setTab}
          onOpenWizard={() => setShowWizard(true)}
          onActivateClient={handleActivateClient}
          onSetProposalMode={() => setProposalMode(true)}
        />
      );
      case 'strategy': return <ClientStrategy client={client} proposalMode={proposalMode} />;
      case 'growth-model': return <GrowthModelView client={client} />;
      case 'campaigns': return <Campaigns client={client} />;
      case 'performance': return <ClientPerformance client={client} />;
      case 'meetings': return <MeetingHub client={client} />;
      case 'comments': return <ClientComments client={client} />;
      case 'tasks': return <ClientTasks client={client} />;
      case 'communications': return <ClientCommunications />;
      case 'documents': return <ClientDocuments client={client} />;
      case 'settings': return <ClientSettings client={client} />;
      default: return (
        <ClientOverview
          client={client}
          onboarding={onboarding}
          stageProgress={stageProgress}
          nextStep={nextStep}
          hasGrowthModel={hasGrowthModel}
          onNavigateTab={setTab}
          onOpenWizard={() => setShowWizard(true)}
          onActivateClient={handleActivateClient}
          onSetProposalMode={() => setProposalMode(true)}
        />
      );
    }
  };

  return (
    <div className={`proposal-transition ${proposalMode ? 'bg-background' : ''}`}>
      {/* Client context bar */}
      <div className="border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
            {client.logoInitials}
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">{client.name}</h1>
            <p className="text-xs text-muted-foreground">{client.company} · {client.industry}</p>
          </div>
          <span className={stageClass[client.stage]}>{client.stage}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowWizard(true)}
            className="px-4 py-2 rounded-md text-sm font-medium bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            Onboarding
          </button>
          <button
            onClick={() => setProposalMode(!proposalMode)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              proposalMode
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            {proposalMode ? 'Exit Proposal Mode' : 'Present to Client'}
          </button>
        </div>
      </div>

      {/* Lifecycle bar */}
      {!proposalMode && (
        <ClientLifecycleBar
          progress={stageProgress}
          currentStage={onboarding.lifecycleStage}
          onStageClick={setTab}
        />
      )}

      {/* Next step prompt */}
      {!proposalMode && nextStep && activeTab === 'overview' && (
        <div className="px-6 pt-4">
          <NextStepCard
            message={nextStep.message}
            action={nextStep.action}
            onAction={() => nextStep.targetTab && setTab(nextStep.targetTab)}
          />
        </div>
      )}

      {/* Tabs */}
      <div className="border-b px-6 flex gap-0 overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-3 text-sm capitalize whitespace-nowrap transition-colors ${
              activeTab === t ? 'tab-active' : 'tab-inactive'
            }`}
          >
            {t === 'growth-model' ? 'Growth Model' : t}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
        >
          {renderTab()}
        </motion.div>
      </AnimatePresence>

      {/* Onboarding wizard */}
      {showWizard && (
        <ClientOnboardingWizard
          client={client}
          onboarding={onboarding}
          onUpdateOnboarding={setOnboarding}
          onUpdateClient={setClient}
          onClose={() => setShowWizard(false)}
          onNavigateTab={setTab}
        />
      )}
    </div>
  );
}
