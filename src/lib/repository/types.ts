/**
 * Repository interfaces — abstract data access layer.
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

export interface ClientRepository {
  getAll(): Client[];
  getById(id: string): Client | null;
  save(client: Client): void;
  delete(id: string): void;
}

export interface OnboardingRepository {
  get(clientId: string): OnboardingData;
  save(clientId: string, data: OnboardingData): void;
  delete(clientId: string): void;
}

export interface GrowthModelRepository {
  get(clientId: string): GrowthModel | undefined;
  save(model: GrowthModel): void;
  delete(modelId: string): void;
}

export interface AiArtifactRepository {
  getByClient(clientId: string): AiArtifact[];
  getByClientAndType(clientId: string, type: AiArtifact['type']): AiArtifact[];
  save(artifact: AiArtifact): void;
  update(id: string, patch: Partial<AiArtifact>): void;
}

/* ── Economics Repositories ── */

export interface TeamMemberRepository {
  getAll(): TeamMember[];
  getById(id: string): TeamMember | null;
  save(member: TeamMember): void;
  delete(id: string): void;
}

export interface CompensationRepository {
  getAll(): CompensationComponent[];
  getByMember(memberId: string): CompensationComponent[];
  save(comp: CompensationComponent): void;
  delete(id: string): void;
}

export interface ClientAssignmentRepository {
  getAll(): ClientTeamAssignment[];
  getByClient(clientId: string): ClientTeamAssignment[];
  getByMember(memberId: string): ClientTeamAssignment[];
  save(assignment: ClientTeamAssignment): void;
  delete(id: string): void;
}

export interface ClientEconomicsRepository {
  get(clientId: string): ClientEconomics;
  save(economics: ClientEconomics): void;
}

export interface EconomicsDefaultsRepository {
  get(): EconomicsDefaults;
  save(defaults: EconomicsDefaults): void;
}

export interface AppRepository {
  clients: ClientRepository;
  onboarding: OnboardingRepository;
  growthModels: GrowthModelRepository;
  aiArtifacts: AiArtifactRepository;
  teamMembers: TeamMemberRepository;
  compensation: CompensationRepository;
  clientAssignments: ClientAssignmentRepository;
  clientEconomics: ClientEconomicsRepository;
  economicsDefaults: EconomicsDefaultsRepository;
}
