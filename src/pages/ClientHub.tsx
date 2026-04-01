import { useParams, useNavigate } from 'react-router-dom';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ClientProvider, useOptionalClientContext } from '@/contexts/ClientContext';
import { LIFECYCLE_STAGES } from '@/types/onboarding';
import type { OnboardingContinuation } from '@/types/onboarding';
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
import ProposalView from '@/components/client/proposal/ProposalView';
import ServicesConfig from '@/components/client/ServicesConfig';
import MarketIntelligenceTab from '@/components/client/marketIntelligence/MarketIntelligenceTab';
import StrategyPortalTab from '@/components/client/strategyPortal/StrategyPortalTab';

const TABS = [
  'overview', 'intelligence', 'strategy', 'services-config', 'growth-model', 'proposal', 'strategy-portal', 'campaigns', 'performance', 'meetings',
  'comments', 'tasks', 'communications', 'documents', 'unit-economics', 'settings',
] as const;

type WizardStep = 'setup' | 'discovery' | 'services_config' | 'growth_model' | 'proposal';
type ResolvedClientContext = NonNullable<ReturnType<typeof useOptionalClientContext>>;

const WIZARD_STEP_ORDER: WizardStep[] = ['setup', 'discovery', 'services_config', 'growth_model', 'proposal'];

/** Map wizard steps to their next step */
function getNextWizardStep(step: string): string | null {
  const idx = WIZARD_STEP_ORDER.indexOf(step as WizardStep);
  return idx >= 0 && idx < WIZARD_STEP_ORDER.length - 1 ? WIZARD_STEP_ORDER[idx + 1] : null;
}

/** Map wizard steps to tab names */
const STEP_TO_TAB: Record<string, string> = {
  services_config: 'services-config',
  growth_model: 'growth-model',
};

const TAB_TO_STEP: Record<string, string> = {
  'services-config': 'services_config',
  'growth-model': 'growth_model',
};

function ClientHubContent({ clientId, tab }: { clientId: string; tab?: string }) {
  const clientContext = useOptionalClientContext();

  if (!clientContext) {
    return (
      <ClientProvider clientId={clientId}>
        <ClientHubContent clientId={clientId} tab={tab} />
      </ClientProvider>
    );
  }

  return <ClientHubContentInner clientId={clientId} tab={tab} clientContext={clientContext} />;
}

function ClientHubContentInner({
  clientId,
  tab,
  clientContext,
}: {
  clientId: string;
  tab?: string;
  clientContext: ResolvedClientContext;
}) {
  const navigate = useNavigate();
  const { client, onboarding, stageProgress, nextStep, updateOnboarding } = clientContext;
  const [proposalMode, setProposalMode] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [wizardInitialStep, setWizardInitialStep] = useState<WizardStep | undefined>();
  const [onboardingContinuation, setOnboardingContinuation] = useState<OnboardingContinuation | null>(null);
  const activeTab = (tab && (TABS as readonly string[]).includes(tab)) ? tab : 'overview';

  const setTab = useCallback((t: string) => {
    // If manually navigating to a tab that isn't the current onboarding tab, clear continuation
    if (onboardingContinuation && t !== STEP_TO_TAB[onboardingContinuation.currentStep]) {
      setOnboardingContinuation(null);
    }
    navigate(`/clients/${clientId}/${t}`);
  }, [clientId, navigate, onboardingContinuation]);

  // Listen for navigate-tab custom events from child components (e.g. AgencyFeesSummaryCard CTAs)
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.tab) setTab(detail.tab);
    };
    window.addEventListener('navigate-tab', handler);
    return () => window.removeEventListener('navigate-tab', handler);
  }, [setTab]);

  // Compute the first incomplete wizard step from stageProgress
  const resumeStep = useMemo((): WizardStep => {
    const stageToStep: Record<string, WizardStep> = {
      lead: 'setup',
      discovery: 'discovery',
      growth_model: 'growth_model',
      services_config: 'services_config',
      proposal_ready: 'proposal',
    };

    for (const sp of stageProgress) {
      if (sp.status !== 'complete' && stageToStep[sp.stage]) {
        return stageToStep[sp.stage];
      }
    }
    return 'proposal';
  }, [stageProgress]);

  /** Called by wizard when it sends the user to a tab (strategy / growth-model) */
  const handleWizardNavigateTab = useCallback((tab: string) => {
    const step = TAB_TO_STEP[tab];
    if (step) {
      setOnboardingContinuation({
        sourceStep: step,
        currentStep: step,
        nextStep: getNextWizardStep(step),
        returnStep: step,
      });
    }
    setShowWizard(false);
    navigate(`/clients/${clientId}/${tab}`);
  }, [clientId, navigate]);

  /** Return to wizard from continuity panel */
  const handleReturnToWizard = useCallback(() => {
    const step = onboardingContinuation?.returnStep as WizardStep | undefined;
    setWizardInitialStep(step || resumeStep);
    setOnboardingContinuation(null);
    setShowWizard(true);
  }, [onboardingContinuation, resumeStep]);

  /** Pause onboarding — clears continuation, keeps progress */
  const handlePauseOnboarding = useCallback(() => {
    setOnboardingContinuation(null);
  }, []);

  /** Continue to next onboarding step from continuity panel */
  const handleContinueToNextStep = useCallback(() => {
    if (!onboardingContinuation?.nextStep) return;
    const nextTab = STEP_TO_TAB[onboardingContinuation.nextStep];
    if (nextTab) {
      // Navigate to next tab, update continuation
      setOnboardingContinuation({
        sourceStep: onboardingContinuation.currentStep,
        currentStep: onboardingContinuation.nextStep,
        nextStep: getNextWizardStep(onboardingContinuation.nextStep),
        returnStep: onboardingContinuation.nextStep,
      });
      navigate(`/clients/${clientId}/${nextTab}`);
    } else {
      // Next step is handled in wizard (proposal)
      setWizardInitialStep(onboardingContinuation.nextStep as WizardStep);
      setOnboardingContinuation(null);
      setShowWizard(true);
    }
  }, [onboardingContinuation, clientId, navigate]);

  /** Open wizard fresh or resume */
  const handleOpenWizard = useCallback(() => {
    setWizardInitialStep(resumeStep);
    setShowWizard(true);
  }, [resumeStep]);

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
          onOpenWizard={handleOpenWizard}
          onActivateClient={handleActivateClient}
          onSetProposalMode={() => setProposalMode(true)}
        />
      );
      case 'intelligence': return <MarketIntelligenceTab />;
      case 'strategy': return (
        <ClientStrategy
          proposalMode={proposalMode}
          onboardingContinuation={onboardingContinuation}
          onReturnToWizard={handleReturnToWizard}
          onPauseOnboarding={handlePauseOnboarding}
          onContinueToNext={handleContinueToNextStep}
        />
      );
      case 'growth-model': return (
        <GrowthModelView
          onboardingContinuation={onboardingContinuation}
          onReturnToWizard={handleReturnToWizard}
          onPauseOnboarding={handlePauseOnboarding}
          onContinueToNext={handleContinueToNextStep}
        />
      );
      case 'proposal': return <ProposalView proposalMode={proposalMode} />;
      case 'strategy-portal': return <StrategyPortalTab />;
      case 'services-config': return <ServicesConfig />;
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
          onOpenWizard={handleOpenWizard}
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
            onClick={handleOpenWizard}
            className="px-4 py-2 rounded-md text-sm font-medium bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            {onboardingContinuation ? 'Resume Onboarding' : 'Onboarding'}
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
      {!proposalMode && nextStep && activeTab === 'overview' && !onboardingContinuation && (
        <div className="px-6 pt-4">
          <NextStepCard
            message={nextStep.message}
            action={nextStep.action}
            onAction={() => {
              if (nextStep.openWizard) handleOpenWizard();
              else if (nextStep.targetTab) setTab(nextStep.targetTab);
            }}
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
            {t === 'growth-model' ? 'Growth Model' : t === 'unit-economics' ? 'Unit Economics' : t === 'proposal' ? 'Proposal' : t === 'intelligence' ? 'Intelligence' : t === 'services-config' ? 'Services Config' : t === 'strategy-portal' ? 'Strategy Portal' : t}
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
          onClose={() => setShowWizard(false)}
          onNavigateTab={handleWizardNavigateTab}
          initialStep={wizardInitialStep || resumeStep}
        />
      )}
    </div>
  );
}

function ClientHubInner() {
  const { clientId, tab } = useParams();

  if (!clientId) {
    return <div className="p-6"><p className="text-muted-foreground">Client not found.</p></div>;
  }

  return (
    <ClientProvider clientId={clientId}>
      <ClientHubContent clientId={clientId} tab={tab} />
    </ClientProvider>
  );
}

export default function ClientHub() {
  return <ClientHubInner />;
}
