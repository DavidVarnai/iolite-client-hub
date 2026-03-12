// Snapshot/versioning utilities for Growth Model

import type { GrowthModel, ModelSnapshot } from '@/types/growthModel';

export function createSnapshot(
  model: GrowthModel,
  name: string,
  createdBy: string,
): ModelSnapshot {
  const { snapshots, ...modelData } = model;
  return {
    id: `snap-${Date.now()}`,
    modelId: model.id,
    name,
    snapshotData: JSON.stringify(modelData),
    createdBy,
    createdAt: new Date().toISOString(),
  };
}

export function restoreSnapshot(snapshot: ModelSnapshot): Omit<GrowthModel, 'snapshots'> {
  return JSON.parse(snapshot.snapshotData);
}

export function listSnapshots(model: GrowthModel): Pick<ModelSnapshot, 'id' | 'name' | 'createdBy' | 'createdAt'>[] {
  return model.snapshots.map(({ id, name, createdBy, createdAt }) => ({ id, name, createdBy, createdAt }));
}
