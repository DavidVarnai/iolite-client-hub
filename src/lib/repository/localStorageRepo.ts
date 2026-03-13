/**
 * localStorage implementation of AppRepository.
 * Hydrates from seed data on first load, persists all writes.
 */
import type { Client } from '@/types';
import type { OnboardingData } from '@/types/onboarding';
import type { GrowthModel } from '@/types/growthModel';
import type { AiArtifact } from '@/types/ai';
import type {
  TeamMember,
  CompensationComponent,
  ClientTeamAssignment,
  ClientEconomics,
  EconomicsDefaults,
} from '@/types/economics';
import type { ServiceLine } from '@/types/services';
import type {
  AppRepository,
  ClientRepository,
  OnboardingRepository,
  GrowthModelRepository,
  AiArtifactRepository,
  TeamMemberRepository,
  CompensationRepository,
  ClientAssignmentRepository,
  ClientEconomicsRepository,
  EconomicsDefaultsRepository,
  ServiceLineRepository,
} from './types';
import { DEFAULT_ONBOARDING } from '@/types/onboarding';
import { seedClients } from '@/data/seed';
import { c1Onboarding, c2Onboarding, c3Onboarding } from '@/data/onboardingSeed';
import { seedGrowthModels } from '@/data/growthModelSeed';
import {
  seedTeamMembers,
  seedCompensation,
  seedAssignments,
  seedClientEconomics,
  seedEconomicsDefaults,
} from '@/data/economicsSeed';
import { seedServiceLines } from '@/data/servicesSeed';

// ─── Helpers ───

const KEYS = {
  clients: 'agencyos_clients',
  onboarding: 'agencyos_onboarding',
  growthModels: 'agencyos_growth_models',
  aiArtifacts: 'agencyos_ai_artifacts',
  teamMembers: 'agencyos_team_members',
  compensation: 'agencyos_compensation',
  clientAssignments: 'agencyos_client_assignments',
  clientEconomics: 'agencyos_client_economics',
  economicsDefaults: 'agencyos_economics_defaults',
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
  return { c1: { ...c1Onboarding }, c2: { ...c2Onboarding }, c3: { ...c3Onboarding } };
}

// ─── Client Repository ───

function createClientRepo(): ClientRepository {
  if (!localStorage.getItem(KEYS.clients)) save(KEYS.clients, seedClients);
  return {
    getAll: () => load<Client[]>(KEYS.clients) || [],
    getById(id) { return this.getAll().find(c => c.id === id) || null; },
    save(client) {
      const all = this.getAll();
      const idx = all.findIndex(c => c.id === client.id);
      idx >= 0 ? (all[idx] = client) : all.push(client);
      save(KEYS.clients, all);
    },
    delete(id) { save(KEYS.clients, this.getAll().filter(c => c.id !== id)); },
  };
}

// ─── Onboarding Repository ───

function createOnboardingRepo(): OnboardingRepository {
  if (!localStorage.getItem(KEYS.onboarding)) save(KEYS.onboarding, seedOnboardingMap());
  return {
    get(clientId) { return (load<Record<string, OnboardingData>>(KEYS.onboarding) || {})[clientId] || { ...DEFAULT_ONBOARDING }; },
    save(clientId, data) { const map = load<Record<string, OnboardingData>>(KEYS.onboarding) || {}; map[clientId] = data; save(KEYS.onboarding, map); },
    delete(clientId) { const map = load<Record<string, OnboardingData>>(KEYS.onboarding) || {}; delete map[clientId]; save(KEYS.onboarding, map); },
  };
}

// ─── Growth Model Repository ───

function createGrowthModelRepo(): GrowthModelRepository {
  if (!localStorage.getItem(KEYS.growthModels)) save(KEYS.growthModels, seedGrowthModels);
  return {
    get(clientId) { return (load<GrowthModel[]>(KEYS.growthModels) || []).find(m => m.clientId === clientId); },
    save(model) {
      const all = load<GrowthModel[]>(KEYS.growthModels) || [];
      const idx = all.findIndex(m => m.id === model.id);
      idx >= 0 ? (all[idx] = model) : all.push(model);
      save(KEYS.growthModels, all);
    },
    delete(modelId) { save(KEYS.growthModels, (load<GrowthModel[]>(KEYS.growthModels) || []).filter(m => m.id !== modelId)); },
  };
}

// ─── AI Artifact Repository ───

function createAiArtifactRepo(): AiArtifactRepository {
  if (!localStorage.getItem(KEYS.aiArtifacts)) save(KEYS.aiArtifacts, [] as AiArtifact[]);
  return {
    getByClient(clientId) { return (load<AiArtifact[]>(KEYS.aiArtifacts) || []).filter(a => a.clientId === clientId); },
    getByClientAndType(clientId, type) { return this.getByClient(clientId).filter(a => a.type === type); },
    save(artifact) { const all = load<AiArtifact[]>(KEYS.aiArtifacts) || []; all.push(artifact); save(KEYS.aiArtifacts, all); },
    update(id, patch) {
      const all = load<AiArtifact[]>(KEYS.aiArtifacts) || [];
      const idx = all.findIndex(a => a.id === id);
      if (idx >= 0) { all[idx] = { ...all[idx], ...patch }; save(KEYS.aiArtifacts, all); }
    },
  };
}

// ─── Team Member Repository ───

function createTeamMemberRepo(): TeamMemberRepository {
  if (!localStorage.getItem(KEYS.teamMembers)) save(KEYS.teamMembers, seedTeamMembers);
  return {
    getAll: () => load<TeamMember[]>(KEYS.teamMembers) || [],
    getById(id) { return this.getAll().find(m => m.id === id) || null; },
    save(member) {
      const all = this.getAll();
      const idx = all.findIndex(m => m.id === member.id);
      idx >= 0 ? (all[idx] = member) : all.push(member);
      save(KEYS.teamMembers, all);
    },
    delete(id) { save(KEYS.teamMembers, this.getAll().filter(m => m.id !== id)); },
  };
}

// ─── Compensation Repository ───

function createCompensationRepo(): CompensationRepository {
  if (!localStorage.getItem(KEYS.compensation)) save(KEYS.compensation, seedCompensation);
  return {
    getAll: () => load<CompensationComponent[]>(KEYS.compensation) || [],
    getByMember(memberId) { return this.getAll().filter(c => c.teamMemberId === memberId); },
    save(comp) {
      const all = this.getAll();
      const idx = all.findIndex(c => c.id === comp.id);
      idx >= 0 ? (all[idx] = comp) : all.push(comp);
      save(KEYS.compensation, all);
    },
    delete(id) { save(KEYS.compensation, this.getAll().filter(c => c.id !== id)); },
  };
}

// ─── Client Assignment Repository ───

function createClientAssignmentRepo(): ClientAssignmentRepository {
  if (!localStorage.getItem(KEYS.clientAssignments)) save(KEYS.clientAssignments, seedAssignments);
  return {
    getAll: () => load<ClientTeamAssignment[]>(KEYS.clientAssignments) || [],
    getByClient(clientId) { return this.getAll().filter(a => a.clientId === clientId); },
    getByMember(memberId) { return this.getAll().filter(a => a.teamMemberId === memberId); },
    save(assignment) {
      const all = this.getAll();
      const idx = all.findIndex(a => a.id === assignment.id);
      idx >= 0 ? (all[idx] = assignment) : all.push(assignment);
      save(KEYS.clientAssignments, all);
    },
    delete(id) { save(KEYS.clientAssignments, this.getAll().filter(a => a.id !== id)); },
  };
}

// ─── Client Economics Repository ───

function createClientEconomicsRepo(): ClientEconomicsRepository {
  if (!localStorage.getItem(KEYS.clientEconomics)) save(KEYS.clientEconomics, seedClientEconomics);
  return {
    get(clientId) {
      const all = load<ClientEconomics[]>(KEYS.clientEconomics) || [];
      return all.find(e => e.clientId === clientId) || { clientId, revenueEntries: [], otherCosts: [] };
    },
    save(economics) {
      const all = load<ClientEconomics[]>(KEYS.clientEconomics) || [];
      const idx = all.findIndex(e => e.clientId === economics.clientId);
      idx >= 0 ? (all[idx] = economics) : all.push(economics);
      save(KEYS.clientEconomics, all);
    },
  };
}

// ─── Economics Defaults Repository ───

function createEconomicsDefaultsRepo(): EconomicsDefaultsRepository {
  if (!localStorage.getItem(KEYS.economicsDefaults)) save(KEYS.economicsDefaults, seedEconomicsDefaults);
  return {
    get: () => load<EconomicsDefaults>(KEYS.economicsDefaults) || seedEconomicsDefaults,
    save: (defaults) => save(KEYS.economicsDefaults, defaults),
  };
}

// ─── Compose ───

export function createLocalStorageRepository(): AppRepository {
  return {
    clients: createClientRepo(),
    onboarding: createOnboardingRepo(),
    growthModels: createGrowthModelRepo(),
    aiArtifacts: createAiArtifactRepo(),
    teamMembers: createTeamMemberRepo(),
    compensation: createCompensationRepo(),
    clientAssignments: createClientAssignmentRepo(),
    clientEconomics: createClientEconomicsRepo(),
    economicsDefaults: createEconomicsDefaultsRepo(),
  };
}
