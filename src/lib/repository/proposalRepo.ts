/**
 * Proposal localStorage repository.
 */
import type { Proposal } from '@/types/proposal';
import type { ProposalDefaults } from '@/types/proposal';
import type { ProposalRepository, ProposalDefaultsRepository } from './types';
import { load, persist, STORAGE_KEYS } from './helpers';
import { seedProposals, seedProposalDefaults } from '@/data/proposalSeed';

export function createProposalRepo(): ProposalRepository {
  if (!localStorage.getItem(STORAGE_KEYS.proposals)) persist(STORAGE_KEYS.proposals, seedProposals);
  return {
    getAll: () => load<Proposal[]>(STORAGE_KEYS.proposals) || [],
    getById(id) { return this.getAll().find(p => p.id === id) || null; },
    getByClient(clientId) { return this.getAll().filter(p => p.clientId === clientId); },
    save(proposal) {
      const all = this.getAll();
      const idx = all.findIndex(p => p.id === proposal.id);
      if (idx >= 0) {
        all[idx] = proposal;
      } else {
        all.push(proposal);
      }
      persist(STORAGE_KEYS.proposals, all);
    },
    delete(id) { persist(STORAGE_KEYS.proposals, this.getAll().filter(p => p.id !== id)); },
  };
}

export function createProposalDefaultsRepo(): ProposalDefaultsRepository {
  if (!localStorage.getItem(STORAGE_KEYS.proposalDefaults)) persist(STORAGE_KEYS.proposalDefaults, seedProposalDefaults);
  return {
    get: () => load<ProposalDefaults>(STORAGE_KEYS.proposalDefaults) || seedProposalDefaults,
    save: (defaults) => persist(STORAGE_KEYS.proposalDefaults, defaults),
  };
}
