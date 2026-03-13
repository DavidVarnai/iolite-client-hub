/**
 * Pricing domain localStorage repos: service lines, packages, bundles.
 */
import type { ServiceLine, ServicePackage, SalesBundle } from '@/types/services';
import type {
  ServiceLineRepository,
  ServicePackageRepository,
  SalesBundleRepository,
} from './types';
import { load, persist, STORAGE_KEYS } from './helpers';
import { seedServiceLines } from '@/data/servicesSeed';
import { seedServicePackages } from '@/data/servicePackagesSeed';
import { seedSalesBundles } from '@/data/salesBundlesSeed';

export function createServiceLineRepo(): ServiceLineRepository {
  if (!localStorage.getItem(STORAGE_KEYS.serviceLines)) persist(STORAGE_KEYS.serviceLines, seedServiceLines);
  return {
    getAll: () => load<ServiceLine[]>(STORAGE_KEYS.serviceLines) || [],
    getById(id) { return this.getAll().find(s => s.id === id) || null; },
    save(line) {
      const all = this.getAll();
      const idx = all.findIndex(s => s.id === line.id);
      idx >= 0 ? (all[idx] = line) : all.push(line);
      persist(STORAGE_KEYS.serviceLines, all);
    },
    delete(id) { persist(STORAGE_KEYS.serviceLines, this.getAll().filter(s => s.id !== id)); },
  };
}

export function createServicePackageRepo(): ServicePackageRepository {
  if (!localStorage.getItem(STORAGE_KEYS.servicePackages)) persist(STORAGE_KEYS.servicePackages, seedServicePackages);
  return {
    getAll: () => load<ServicePackage[]>(STORAGE_KEYS.servicePackages) || [],
    getByServiceLine(serviceLineId) { return this.getAll().filter(p => p.serviceLineId === serviceLineId); },
    getById(id) { return this.getAll().find(p => p.id === id) || null; },
    save(pkg) {
      const all = this.getAll();
      const idx = all.findIndex(p => p.id === pkg.id);
      idx >= 0 ? (all[idx] = pkg) : all.push(pkg);
      persist(STORAGE_KEYS.servicePackages, all);
    },
    delete(id) { persist(STORAGE_KEYS.servicePackages, this.getAll().filter(p => p.id !== id)); },
  };
}

export function createSalesBundleRepo(): SalesBundleRepository {
  if (!localStorage.getItem(STORAGE_KEYS.salesBundles)) persist(STORAGE_KEYS.salesBundles, seedSalesBundles);
  return {
    getAll: () => load<SalesBundle[]>(STORAGE_KEYS.salesBundles) || [],
    getById(id) { return this.getAll().find(b => b.id === id) || null; },
    save(bundle) {
      const all = this.getAll();
      const idx = all.findIndex(b => b.id === bundle.id);
      idx >= 0 ? (all[idx] = bundle) : all.push(bundle);
      persist(STORAGE_KEYS.salesBundles, all);
    },
    delete(id) { persist(STORAGE_KEYS.salesBundles, this.getAll().filter(b => b.id !== id)); },
  };
}
