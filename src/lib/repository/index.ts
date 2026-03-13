/**
 * Repository singleton.
 * Swap this import to change the persistence backend.
 */
import { createLocalStorageRepository } from './localStorageRepo';
import type { AppRepository } from './types';

export const repository: AppRepository = createLocalStorageRepository();

export type { AppRepository } from './types';
