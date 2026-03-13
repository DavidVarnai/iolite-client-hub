import { useParams, useNavigate } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ClientProvider, useClientContext } from '@/contexts/ClientContext';
import { LIFECYCLE_STAGES } from '@/types/onboarding';
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
import UnitEconomics from '@/components/client/UnitEconomics';
import ProposalView from '@/components/client/ProposalView';

const TABS = [
  'overview', 'strategy', 'growth-model', 'proposal', 'campaigns', 'performance', 'meetings',
  'comments', 'tasks', 'communications', 'documents', 'unit-economics', 'settings',
] as const;

type WizardStep = 'setup' | 'discovery' | 'strategy' | 'growth_model' | 'proposal';

const WIZARD_STEP_ORDER: WizardStep[] = ['setup', 'discovery', 'strategy', 'growth_model', 'proposal'];

function ClientHubInner() {
  const { clientId, tab } = useParams();
  const navigate = useNavigate();
  const { client, onboarding, stageProgress, nextStep, updateOnboarding } = useClientContext();
  const [proposalMode, setProposalMode] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const activeTab = (tab && TABS.includes(tab as any)) ? tab : 'overview';

  const setTab = (t: string) => navigate(`/clients/${clientId}/${t}`);

  // Compute the first incomplete wizard step from stageProgress
  const resumeStep = useMemo((): WizardStep => {
    const stageToStep: Record<string, WizardStep> = {
      lead: 'setup',
      discovery: 'discovery',
      strategy: 'strategy',
      growth_model: 'growth_model',
      proposal_ready: 'proposal',
    };

    for (const sp of stageProgress) {
      if (sp.status !== 'complete' && stageToStep[sp.stage]) {
        return stageToStep[sp.stage];
      }
    }
    return 'proposal'; // all complete, show final step
  }, [stageProgress]);

  const handleActivateClient = () => {
    updateOnboarding(prev => ({
      ...prev,
      lifecycleStage: 'active_client',
      activatedAt: new Date().toISOString(),
    }));
  };

  const lifecycleLabel = LIFECYCLE_STAGES.find(s => s.key === onboarding.lifecycleStage)?.label || 'Lead';

  const renderTab = () => {
    switch (activeTab) {
      case 'overview': return (
        <ClientOverview
          onNavigateTab={setTab}
          onOpenWizard={() => setShowWizard(true)}
          onActivateClient={handleActivateClient}
          onSetProposalMode={() => setProposalMode(true)}
        />
      );
      case 'strategy': return <ClientStrategy proposalMode={proposalMode} />;
      case 'growth-model': return <GrowthModelView />;
      case 'campaigns': return <Campaigns client={client} />;
      case 'performance': return <ClientPerformance />;
      case 'meetings': return <MeetingHub />;
      case 'comments': return <ClientComments />;
      case 'tasks': return <ClientTasks />;
      case 'communications': return <ClientCommunications />;
      case 'documents': return <ClientDocuments />;
      case 'unit-economics': return <UnitEconomics />;
      case 'settings': return <ClientSettings onDeleteClient={() => navigate('/clients')} />;
      default: return (
        <ClientOverview
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
          <span className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">{lifecycleLabel}</span>
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
            {t === 'growth-model' ? 'Growth Model' : t === 'unit-economics' ? 'Unit Economics' : t}
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

      {/* Onboarding wizard — opens at first incomplete step */}
      {showWizard && (
        <ClientOnboardingWizard
          onClose={() => setShowWizard(false)}
          onNavigateTab={setTab}
          initialStep={resumeStep}
        />
      )}
    </div>
  );
}

export default function ClientHub() {
  const { clientId } = useParams();

  if (!clientId) {
    return <div className="p-6"><p className="text-muted-foreground">Client not found.</p></div>;
  }

  return (
    <ClientProvider clientId={clientId}>
      <ClientHubInner />
    </ClientProvider>
  );
}
