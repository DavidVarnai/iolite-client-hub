/**
 * Client & Onboarding localStorage repos.
 */
import type { Client } from '@/types';
import type { OnboardingData } from '@/types/onboarding';
import type { ClientRepository, OnboardingRepository } from './types';
import { load, persist, STORAGE_KEYS } from './helpers';
import { DEFAULT_ONBOARDING } from '@/types/onboarding';
import { seedClients } from '@/data/seed';
import { c1Onboarding, c2Onboarding, c3Onboarding } from '@/data/onboardingSeed';

function seedOnboardingMap(): Record<string, OnboardingData> {
  return { c1: { ...c1Onboarding }, c2: { ...c2Onboarding }, c3: { ...c3Onboarding } };
}

export function createClientRepo(): ClientRepository {
  const existing = load<Client[]>(STORAGE_KEYS.clients) || [];
  const missing = seedClients.filter(s => !existing.find(e => e.id === s.id));
  if (missing.length || !existing.length) persist(STORAGE_KEYS.clients, [...existing, ...missing]);
  return {
    getAll: () => load<Client[]>(STORAGE_KEYS.clients) || [],
    getById(id) { return this.getAll().find(c => c.id === id) || null; },
    save(client) {
      const all = this.getAll();
      const idx = all.findIndex(c => c.id === client.id);
      idx >= 0 ? (all[idx] = client) : all.push(client);
      persist(STORAGE_KEYS.clients, all);
    },
    delete(id) { persist(STORAGE_KEYS.clients, this.getAll().filter(c => c.id !== id)); },
  };
}

export function createOnboardingRepo(): OnboardingRepository {
  if (!localStorage.getItem(STORAGE_KEYS.onboarding)) persist(STORAGE_KEYS.onboarding, seedOnboardingMap());
  return {
    get(clientId) { return (load<Record<string, OnboardingData>>(STORAGE_KEYS.onboarding) || {})[clientId] || { ...DEFAULT_ONBOARDING }; },
    save(clientId, data) { const map = load<Record<string, OnboardingData>>(STORAGE_KEYS.onboarding) || {}; map[clientId] = data; persist(STORAGE_KEYS.onboarding, map); },
    delete(clientId) { const map = load<Record<string, OnboardingData>>(STORAGE_KEYS.onboarding) || {}; delete map[clientId]; persist(STORAGE_KEYS.onboarding, map); },
  };
}
