/**
 * localStorage implementation of AppRepository.
 * Composes domain-specific repos into the unified AppRepository interface.
 */
import type { AppRepository } from './types';
import { createClientRepo, createOnboardingRepo } from './clientsRepo';
import { createGrowthModelRepo, createAiArtifactRepo } from './settingsRepo';
import {
  createTeamMemberRepo,
  createCompensationRepo,
  createClientAssignmentRepo,
  createClientEconomicsRepo,
  createEconomicsDefaultsRepo,
} from './economicsRepo';
import {
  createServiceLineRepo,
  createServicePackageRepo,
  createSalesBundleRepo,
} from './pricingRepo';

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
    serviceLines: createServiceLineRepo(),
    servicePackages: createServicePackageRepo(),
    salesBundles: createSalesBundleRepo(),
  };
}
