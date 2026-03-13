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
import type { ServiceLine, ServicePackage, SalesBundle } from '@/types/services';
import type { Proposal } from '@/types/proposal';
import type { ProposalDefaults } from '@/types/proposal';

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

export interface ServiceLineRepository {
  getAll(): ServiceLine[];
  getById(id: string): ServiceLine | null;
  save(line: ServiceLine): void;
  delete(id: string): void;
}

export interface ServicePackageRepository {
  getAll(): ServicePackage[];
  getByServiceLine(serviceLineId: string): ServicePackage[];
  getById(id: string): ServicePackage | null;
  save(pkg: ServicePackage): void;
  delete(id: string): void;
}

export interface SalesBundleRepository {
  getAll(): SalesBundle[];
  getById(id: string): SalesBundle | null;
  save(bundle: SalesBundle): void;
  delete(id: string): void;
}

export interface ProposalRepository {
  getAll(): Proposal[];
  getById(id: string): Proposal | null;
  getByClient(clientId: string): Proposal[];
  save(proposal: Proposal): void;
  delete(id: string): void;
}

export interface ProposalDefaultsRepository {
  get(): ProposalDefaults;
  save(defaults: ProposalDefaults): void;
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
  serviceLines: ServiceLineRepository;
  servicePackages: ServicePackageRepository;
  salesBundles: SalesBundleRepository;
  proposals: ProposalRepository;
  proposalDefaults: ProposalDefaultsRepository;
}
