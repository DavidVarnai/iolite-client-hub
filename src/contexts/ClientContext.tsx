/**
 * ClientContext — shared state for the active client hub.
 * Wraps client, onboarding, growth model, and AI artifacts.
 * All writes persist through the repository layer.
 */
import { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import type { Client } from '@/types';
import type { OnboardingData, ClientLifecycleProgress } from '@/types/onboarding';
import type { GrowthModel } from '@/types/growthModel';
import type { AiArtifact } from '@/types/ai';
import { computeStageReadiness, getNextStepPrompt, DEFAULT_ONBOARDING } from '@/types/onboarding';
import { repository } from '@/lib/repository';

interface ClientContextValue {
  client: Client;
  updateClient: (updater: Client | ((prev: Client) => Client)) => void;
  onboarding: OnboardingData;
  updateOnboarding: (updater: OnboardingData | ((prev: OnboardingData) => OnboardingData)) => void;
  growthModel: GrowthModel | null;
  updateGrowthModel: (model: GrowthModel | null) => void;
  stageProgress: ClientLifecycleProgress[];
  nextStep: { message: string; action: string; targetTab?: string; openWizard?: boolean } | null;
  hasGrowthModel: boolean;
  aiArtifacts: AiArtifact[];
  saveAiArtifact: (artifact: AiArtifact) => void;
}

const ClientContext = createContext<ClientContextValue | null>(null);

export function useClientContext(): ClientContextValue {
  const ctx = useContext(ClientContext);
  if (!ctx) throw new Error('useClientContext must be used within a ClientProvider');
  return ctx;
}

export function useOptionalClientContext(): ClientContextValue | null {
  return useContext(ClientContext);
}

interface ProviderProps {
  clientId: string;
  children: ReactNode;
}

export function ClientProvider({ clientId, children }: ProviderProps) {
  const [client, setClientState] = useState<Client | null>(() => repository.clients.getById(clientId));
  const [onboarding, setOnboardingState] = useState<OnboardingData>(() => repository.onboarding.get(clientId));
  const [growthModel, setGrowthModelState] = useState<GrowthModel | null>(() => repository.growthModels.get(clientId) || null);
  const [aiArtifacts, setAiArtifacts] = useState<AiArtifact[]>(() => repository.aiArtifacts.getByClient(clientId));

  const updateClient = useCallback((updater: Client | ((prev: Client) => Client)) => {
    setClientState(prev => {
      if (!prev) return prev;
      const next = typeof updater === 'function' ? updater(prev) : updater;
      repository.clients.save(next);
      return next;
    });
  }, []);

  const updateOnboarding = useCallback((updater: OnboardingData | ((prev: OnboardingData) => OnboardingData)) => {
    setOnboardingState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      repository.onboarding.save(clientId, next);
      return next;
    });
  }, [clientId]);

  const updateGrowthModel = useCallback((model: GrowthModel | null) => {
    if (model) {
      repository.growthModels.save(model);
    }
    setGrowthModelState(model);
  }, []);

  const saveAiArtifact = useCallback((artifact: AiArtifact) => {
    repository.aiArtifacts.save(artifact);
    setAiArtifacts(prev => [...prev, artifact]);
  }, []);

  const hasGrowthModel = !!growthModel;

  const stageProgress = useMemo(() =>
    client ? computeStageReadiness(onboarding, client, hasGrowthModel) : [],
    [onboarding, client, hasGrowthModel]
  );

  const nextStep = useMemo(() =>
    getNextStepPrompt(onboarding, stageProgress),
    [onboarding, stageProgress]
  );

  if (!client) {
    return <div className="p-6"><p className="text-muted-foreground">Client not found.</p></div>;
  }

  const value: ClientContextValue = {
    client,
    updateClient,
    onboarding,
    updateOnboarding,
    growthModel,
    updateGrowthModel,
    stageProgress,
    nextStep,
    hasGrowthModel,
    aiArtifacts,
    saveAiArtifact,
  };

  return (
    <ClientContext.Provider value={value}>
      {children}
    </ClientContext.Provider>
  );
}
