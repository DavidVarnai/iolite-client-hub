/**
 * Growth model & AI artifact localStorage repos.
 */
import type { GrowthModel } from '@/types/growthModel';
import type { AiArtifact } from '@/types/ai';
import type { GrowthModelRepository, AiArtifactRepository } from './types';
import { load, persist, STORAGE_KEYS } from './helpers';
import { seedGrowthModels } from '@/data/growthModelSeed';

export function createGrowthModelRepo(): GrowthModelRepository {
  if (!localStorage.getItem(STORAGE_KEYS.growthModels)) persist(STORAGE_KEYS.growthModels, seedGrowthModels);
  return {
    get(clientId) { return (load<GrowthModel[]>(STORAGE_KEYS.growthModels) || []).find(m => m.clientId === clientId); },
    save(model) {
      const all = load<GrowthModel[]>(STORAGE_KEYS.growthModels) || [];
      const idx = all.findIndex(m => m.id === model.id);
      idx >= 0 ? (all[idx] = model) : all.push(model);
      persist(STORAGE_KEYS.growthModels, all);
    },
    delete(modelId) { persist(STORAGE_KEYS.growthModels, (load<GrowthModel[]>(STORAGE_KEYS.growthModels) || []).filter(m => m.id !== modelId)); },
  };
}

export function createAiArtifactRepo(): AiArtifactRepository {
  if (!localStorage.getItem(STORAGE_KEYS.aiArtifacts)) persist(STORAGE_KEYS.aiArtifacts, [] as AiArtifact[]);
  return {
    getByClient(clientId) { return (load<AiArtifact[]>(STORAGE_KEYS.aiArtifacts) || []).filter(a => a.clientId === clientId); },
    getByClientAndType(clientId, type) { return this.getByClient(clientId).filter(a => a.type === type); },
    save(artifact) { const all = load<AiArtifact[]>(STORAGE_KEYS.aiArtifacts) || []; all.push(artifact); persist(STORAGE_KEYS.aiArtifacts, all); },
    update(id, patch) {
      const all = load<AiArtifact[]>(STORAGE_KEYS.aiArtifacts) || [];
      const idx = all.findIndex(a => a.id === id);
      if (idx >= 0) { all[idx] = { ...all[idx], ...patch }; persist(STORAGE_KEYS.aiArtifacts, all); }
    },
  };
}
