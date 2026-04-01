import { useState, useCallback, useEffect } from 'react';
import type { StrategyPortalData } from './portalTypes';
import { DEFAULT_PORTAL_DATA } from './portalTypes';

const STORAGE_PREFIX = 'strategy-portal-';

export function usePortalData(clientId: string) {
  const key = `${STORAGE_PREFIX}${clientId}`;

  const [data, setData] = useState<StrategyPortalData>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? { ...DEFAULT_PORTAL_DATA, ...JSON.parse(stored) } : { ...DEFAULT_PORTAL_DATA };
    } catch {
      return { ...DEFAULT_PORTAL_DATA };
    }
  });

  // Persist on change
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(data));
  }, [key, data]);

  const updateField = useCallback(<K extends keyof StrategyPortalData>(field: K, value: StrategyPortalData[K]) => {
    setData(prev => ({ ...prev, [field]: value }));
  }, []);

  const updateData = useCallback((updater: Partial<StrategyPortalData> | ((prev: StrategyPortalData) => StrategyPortalData)) => {
    setData(prev => typeof updater === 'function' ? updater(prev) : { ...prev, ...updater });
  }, []);

  return { data, updateField, updateData };
}
