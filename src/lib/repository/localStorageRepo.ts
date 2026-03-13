/**
 * localStorage implementation of AppRepository.
 * Hydrates from seed data on first load, persists all writes.
 */
import type { Client } from '@/types';
import type { OnboardingData } from '@/types/onboarding';
import type { GrowthModel } from '@/types/growthModel';
import type { AiArtifact } from '@/types/ai';
import type { AppRepository, ClientRepository, OnboardingRepository, GrowthModelRepository, AiArtifactRepository } from './types';
import { DEFAULT_ONBOARDING } from '@/types/onboarding';
import { seedClients } from '@/data/seed';
import { c1Onboarding, c2Onboarding, c3Onboarding } from '@/data/onboardingSeed';
import { seedGrowthModels } from '@/data/growthModelSeed';

// ─── Helpers ───

const KEYS = {
  clients: 'agencyos_clients',
  onboarding: 'agencyos_onboarding',
  growthModels: 'agencyos_growth_models',
  aiArtifacts: 'agencyos_ai_artifacts',
} as const;

function load<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function save<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// ─── Seed defaults ───

function seedOnboardingMap(): Record<string, OnboardingData> {
  return {
    c1: { ...c1Onboarding },
    c2: { ...c2Onboarding },
    c3: { ...c3Onboarding },
  };
}

// ─── Client Repository ───

function createClientRepo(): ClientRepository {
  // Hydrate from seed if not yet persisted
  if (!localStorage.getItem(KEYS.clients)) {
    save(KEYS.clients, seedClients);
  }

  return {
    getAll(): Client[] {
      return load<Client[]>(KEYS.clients) || [];
    },
    getById(id: string): Client | null {
      const all = this.getAll();
      return all.find(c => c.id === id) || null;
    },
    save(client: Client): void {
      const all = this.getAll();
      const idx = all.findIndex(c => c.id === client.id);
      if (idx >= 0) {
        all[idx] = client;
      } else {
        all.push(client);
      }
      save(KEYS.clients, all);
    },
    delete(id: string): void {
      const all = this.getAll().filter(c => c.id !== id);
      save(KEYS.clients, all);
    },
  };
}

// ─── Onboarding Repository ───

function createOnboardingRepo(): OnboardingRepository {
  if (!localStorage.getItem(KEYS.onboarding)) {
    save(KEYS.onboarding, seedOnboardingMap());
  }

  return {
    get(clientId: string): OnboardingData {
      const map = load<Record<string, OnboardingData>>(KEYS.onboarding) || {};
      return map[clientId] || { ...DEFAULT_ONBOARDING };
    },
    save(clientId: string, data: OnboardingData): void {
      const map = load<Record<string, OnboardingData>>(KEYS.onboarding) || {};
      map[clientId] = data;
      save(KEYS.onboarding, map);
    },
    delete(clientId: string): void {
      const map = load<Record<string, OnboardingData>>(KEYS.onboarding) || {};
      delete map[clientId];
      save(KEYS.onboarding, map);
    },
  };
}

// ─── Growth Model Repository ───

function createGrowthModelRepo(): GrowthModelRepository {
  if (!localStorage.getItem(KEYS.growthModels)) {
    save(KEYS.growthModels, seedGrowthModels);
  }

  return {
    get(clientId: string): GrowthModel | undefined {
      const all = load<GrowthModel[]>(KEYS.growthModels) || [];
      return all.find(m => m.clientId === clientId);
    },
    save(model: GrowthModel): void {
      const all = load<GrowthModel[]>(KEYS.growthModels) || [];
      const idx = all.findIndex(m => m.id === model.id);
      if (idx >= 0) {
        all[idx] = model;
      } else {
        all.push(model);
      }
      save(KEYS.growthModels, all);
    },
    delete(modelId: string): void {
      const all = (load<GrowthModel[]>(KEYS.growthModels) || []).filter(m => m.id !== modelId);
      save(KEYS.growthModels, all);
    },
  };
}

// ─── AI Artifact Repository ───

function createAiArtifactRepo(): AiArtifactRepository {
  if (!localStorage.getItem(KEYS.aiArtifacts)) {
    save(KEYS.aiArtifacts, [] as AiArtifact[]);
  }

  return {
    getByClient(clientId: string): AiArtifact[] {
      const all = load<AiArtifact[]>(KEYS.aiArtifacts) || [];
      return all.filter(a => a.clientId === clientId);
    },
    getByClientAndType(clientId: string, type: AiArtifact['type']): AiArtifact[] {
      return this.getByClient(clientId).filter(a => a.type === type);
    },
    save(artifact: AiArtifact): void {
      const all = load<AiArtifact[]>(KEYS.aiArtifacts) || [];
      all.push(artifact);
      save(KEYS.aiArtifacts, all);
    },
    update(id: string, patch: Partial<AiArtifact>): void {
      const all = load<AiArtifact[]>(KEYS.aiArtifacts) || [];
      const idx = all.findIndex(a => a.id === id);
      if (idx >= 0) {
        all[idx] = { ...all[idx], ...patch };
        save(KEYS.aiArtifacts, all);
      }
    },
  };
}

// ─── Compose ───

export function createLocalStorageRepository(): AppRepository {
  return {
    clients: createClientRepo(),
    onboarding: createOnboardingRepo(),
    growthModels: createGrowthModelRepo(),
    aiArtifacts: createAiArtifactRepo(),
  };
}
