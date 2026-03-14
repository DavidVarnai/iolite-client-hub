/**
 * Market Intelligence localStorage repository.
 */
import type { MarketIntelligenceRun, MarketIntelligenceDefaults } from '@/types/marketIntelligence';
import { load, persist, STORAGE_KEYS } from './helpers';
import { seedMarketIntelligenceRuns, defaultMarketIntelligenceDefaults } from '@/data/marketIntelligenceSeed';

export interface MarketIntelligenceRepository {
  getAll(): MarketIntelligenceRun[];
  getByClient(clientId: string): MarketIntelligenceRun[];
  getLatestByClient(clientId: string): MarketIntelligenceRun | null;
  getById(id: string): MarketIntelligenceRun | null;
  save(run: MarketIntelligenceRun): void;
  archive(id: string): void;
  delete(id: string): void;
}

export interface MarketIntelligenceDefaultsRepository {
  get(): MarketIntelligenceDefaults;
  save(defaults: MarketIntelligenceDefaults): void;
}

export function createMarketIntelligenceRepo(): MarketIntelligenceRepository {
  const key = STORAGE_KEYS.marketIntelligence;
  const existing = load<MarketIntelligenceRun[]>(key) || [];
  const missing = seedMarketIntelligenceRuns.filter(s => !existing.find(e => e.id === s.id));
  if (missing.length || !existing.length) persist(key, [...existing, ...missing]);

  return {
    getAll() {
      return load<MarketIntelligenceRun[]>(key) || [];
    },
    getByClient(clientId) {
      return this.getAll().filter(r => r.clientId === clientId);
    },
    getLatestByClient(clientId) {
      const runs = this.getByClient(clientId)
        .filter(r => r.status !== 'archived')
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
      return runs[0] || null;
    },
    getById(id) {
      return this.getAll().find(r => r.id === id) || null;
    },
    save(run) {
      const all = this.getAll();
      const idx = all.findIndex(r => r.id === run.id);
      idx >= 0 ? (all[idx] = run) : all.push(run);
      persist(key, all);
    },
    archive(id) {
      const all = this.getAll();
      const idx = all.findIndex(r => r.id === id);
      if (idx >= 0) {
        all[idx] = { ...all[idx], status: 'archived', updatedAt: new Date().toISOString() };
        persist(key, all);
      }
    },
    delete(id) {
      persist(key, this.getAll().filter(r => r.id !== id));
    },
  };
}

export function createMarketIntelligenceDefaultsRepo(): MarketIntelligenceDefaultsRepository {
  const key = STORAGE_KEYS.marketIntelligenceDefaults;
  if (!localStorage.getItem(key)) persist(key, defaultMarketIntelligenceDefaults);

  return {
    get() {
      return load<MarketIntelligenceDefaults>(key) || defaultMarketIntelligenceDefaults;
    },
    save(defaults) {
      persist(key, defaults);
    },
  };
}
