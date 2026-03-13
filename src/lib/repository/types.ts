/**
 * Repository interfaces — abstract data access layer.
 * V1: localStorage. Future: Supabase, REST API, etc.
 */
import type { Client } from '@/types';
import type { OnboardingData } from '@/types/onboarding';
import type { GrowthModel } from '@/types/growthModel';
import type { AiArtifact } from '@/types/ai';

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

export interface AppRepository {
  clients: ClientRepository;
  onboarding: OnboardingRepository;
  growthModels: GrowthModelRepository;
  aiArtifacts: AiArtifactRepository;
}
