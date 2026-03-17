/**
 * Client & Onboarding localStorage repos.
 */
import type { Client } from '@/types';
import type { OnboardingData } from '@/types/onboarding';
import type { ClientRepository, OnboardingRepository } from './types';
import { load, persist, STORAGE_KEYS, isSeedStale, markSeedCurrent } from './helpers';
import { DEFAULT_ONBOARDING, EMPTY_DISCOVERY } from '@/types/onboarding';
import { seedClients } from '@/data/seed';
import { c1Onboarding, c2Onboarding, c3Onboarding, c4Onboarding, c5Onboarding, c6Onboarding } from '@/data/onboardingSeed';

function seedOnboardingMap(): Record<string, OnboardingData> {
  return {
    c1: { ...c1Onboarding }, c2: { ...c2Onboarding }, c3: { ...c3Onboarding },
    c4: { ...c4Onboarding }, c5: { ...c5Onboarding }, c6: { ...c6Onboarding },
  };
}

/** Ensure new structured fields exist on legacy discovery data */
function migrateDiscovery(raw: OnboardingData): OnboardingData {
  const d = raw.discovery;
  if (!d) {
    raw.discovery = { ...EMPTY_DISCOVERY };
    return raw;
  }
  // salesFunnelStages
  if (!Array.isArray(d.salesFunnelStages)) d.salesFunnelStages = [];
  // Migrate string[] to FunnelStage[]
  if (d.salesFunnelStages.length > 0 && typeof d.salesFunnelStages[0] === 'string') {
    d.salesFunnelStages = (d.salesFunnelStages as unknown as string[]).map(name => ({
      name,
      category: 'qualification' as const,
      isCustom: true,
    }));
  }
  // Structured performance fields
  if (d.monthlyVisitors === undefined) d.monthlyVisitors = '';
  if (d.monthlyLeads === undefined) d.monthlyLeads = '';
  if (d.monthlyCustomers === undefined) d.monthlyCustomers = '';
  if (d.monthlyMarketingBudget === undefined) d.monthlyMarketingBudget = '';
  if (!d.performanceConfidence) d.performanceConfidence = 'unknown';
  if (!Array.isArray(d.bottleneckTags)) d.bottleneckTags = [];
  if (d.bottleneckNotes === undefined) d.bottleneckNotes = '';
  // Structured competitors
  if (!Array.isArray(d.competitors)) d.competitors = [];
  // Revenue model migration: infer from legacy avgOrderValue
  if (!d.revenueModel) {
    const raw = d.avgOrderValue || '';
    const parsed = parseFloat(raw.replace(/[^0-9.]/g, ''));
    const value = isNaN(parsed) ? 0 : parsed;
    const isMonthly = /month|\/mo/i.test(raw);
    const isAnnual = /annual|year|\/yr/i.test(raw);
    d.revenueModel = {
      revenueModelType: isMonthly ? 'monthly_recurring' : isAnnual ? 'annual_contract' : 'one_time',
      revenuePerConversion: value,
      revenueUnit: isMonthly ? 'per_month' : isAnnual ? 'per_year' : 'per_deal', // kept for compat; derived from type
    };
  }
  return raw;
}

export function createClientRepo(): ClientRepository {
  const stale = isSeedStale();
  const existing = load<Client[]>(STORAGE_KEYS.clients) || [];
  if (stale) {
    const merged = seedClients.map(s => {
      const ex = existing.find(e => e.id === s.id);
      return ex ? { ...s, ...ex } : s;
    });
    const custom = existing.filter(e => !seedClients.find(s => s.id === e.id));
    persist(STORAGE_KEYS.clients, [...merged, ...custom]);
  } else {
    const missing = seedClients.filter(s => !existing.find(e => e.id === s.id));
    if (missing.length || !existing.length) persist(STORAGE_KEYS.clients, [...existing, ...missing]);
  }
  return {
    getAll: () => load<Client[]>(STORAGE_KEYS.clients) || [],
    getById(id) { return this.getAll().find(c => c.id === id) || null; },
    save(client) {
      const all = this.getAll();
      const idx = all.findIndex(c => c.id === client.id);
      if (idx >= 0) {
        all[idx] = client;
      } else {
        all.push(client);
      }
      persist(STORAGE_KEYS.clients, all);
    },
    delete(id) { persist(STORAGE_KEYS.clients, this.getAll().filter(c => c.id !== id)); },
  };
}

export function createOnboardingRepo(): OnboardingRepository {
  const stale = isSeedStale();
  const existing = load<Record<string, OnboardingData>>(STORAGE_KEYS.onboarding) || {};
  const seed = seedOnboardingMap();
  if (stale) {
    const merged: Record<string, OnboardingData> = { ...existing };
    for (const [id, seedData] of Object.entries(seed)) {
      merged[id] = existing[id] ? { ...seedData, ...existing[id] } : seedData;
    }
    persist(STORAGE_KEYS.onboarding, merged);
  } else {
    const merged = { ...seed, ...existing };
    if (Object.keys(merged).length !== Object.keys(existing).length) persist(STORAGE_KEYS.onboarding, merged);
  }
  return {
    get(clientId) {
      const raw = (load<Record<string, OnboardingData>>(STORAGE_KEYS.onboarding) || {})[clientId] || { ...DEFAULT_ONBOARDING };
      return migrateDiscovery(raw);
    },
    save(clientId, data) { const map = load<Record<string, OnboardingData>>(STORAGE_KEYS.onboarding) || {}; map[clientId] = data; persist(STORAGE_KEYS.onboarding, map); },
    delete(clientId) { const map = load<Record<string, OnboardingData>>(STORAGE_KEYS.onboarding) || {}; delete map[clientId]; persist(STORAGE_KEYS.onboarding, map); },
  };
}
