/**
 * localStorage helpers shared across all domain repos.
 */

export function load<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function persist<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
}

export const SEED_VERSION = '2026-03-16-v5';

export const STORAGE_KEYS = {
  clients: 'agencyos_clients',
  onboarding: 'agencyos_onboarding',
  growthModels: 'agencyos_growth_models',
  aiArtifacts: 'agencyos_ai_artifacts',
  teamMembers: 'agencyos_team_members',
  compensation: 'agencyos_compensation',
  clientAssignments: 'agencyos_client_assignments',
  clientEconomics: 'agencyos_client_economics',
  economicsDefaults: 'agencyos_economics_defaults',
  serviceLines: 'agencyos_service_lines',
  servicePackages: 'agencyos_service_packages',
  salesBundles: 'agencyos_sales_bundles',
  proposals: 'agencyos_proposals',
  proposalDefaults: 'agencyos_proposal_defaults',
  marketIntelligence: 'agencyos_market_intelligence',
  marketIntelligenceDefaults: 'agencyos_market_intelligence_defaults',
  seedVersion: 'agencyos_seed_version',
} as const;

export function isSeedStale(): boolean {
  return load<string>(STORAGE_KEYS.seedVersion) !== SEED_VERSION;
}

export function markSeedCurrent(): void {
  persist(STORAGE_KEYS.seedVersion, SEED_VERSION);
}
