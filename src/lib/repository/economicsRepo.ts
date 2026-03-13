/**
 * Economics domain localStorage repos: team members, compensation, assignments, client economics, defaults.
 */
import type {
  TeamMember,
  CompensationComponent,
  ClientTeamAssignment,
  ClientEconomics,
  EconomicsDefaults,
} from '@/types/economics';
import type {
  TeamMemberRepository,
  CompensationRepository,
  ClientAssignmentRepository,
  ClientEconomicsRepository,
  EconomicsDefaultsRepository,
} from './types';
import { load, persist, STORAGE_KEYS } from './helpers';
import {
  seedTeamMembers,
  seedCompensation,
  seedAssignments,
  seedClientEconomics,
  seedEconomicsDefaults,
} from '@/data/economicsSeed';

export function createTeamMemberRepo(): TeamMemberRepository {
  if (!localStorage.getItem(STORAGE_KEYS.teamMembers)) persist(STORAGE_KEYS.teamMembers, seedTeamMembers);
  return {
    getAll: () => load<TeamMember[]>(STORAGE_KEYS.teamMembers) || [],
    getById(id) { return this.getAll().find(m => m.id === id) || null; },
    save(member) {
      const all = this.getAll();
      const idx = all.findIndex(m => m.id === member.id);
      idx >= 0 ? (all[idx] = member) : all.push(member);
      persist(STORAGE_KEYS.teamMembers, all);
    },
    delete(id) { persist(STORAGE_KEYS.teamMembers, this.getAll().filter(m => m.id !== id)); },
  };
}

export function createCompensationRepo(): CompensationRepository {
  if (!localStorage.getItem(STORAGE_KEYS.compensation)) persist(STORAGE_KEYS.compensation, seedCompensation);
  return {
    getAll: () => load<CompensationComponent[]>(STORAGE_KEYS.compensation) || [],
    getByMember(memberId) { return this.getAll().filter(c => c.teamMemberId === memberId); },
    save(comp) {
      const all = this.getAll();
      const idx = all.findIndex(c => c.id === comp.id);
      idx >= 0 ? (all[idx] = comp) : all.push(comp);
      persist(STORAGE_KEYS.compensation, all);
    },
    delete(id) { persist(STORAGE_KEYS.compensation, this.getAll().filter(c => c.id !== id)); },
  };
}

export function createClientAssignmentRepo(): ClientAssignmentRepository {
  if (!localStorage.getItem(STORAGE_KEYS.clientAssignments)) persist(STORAGE_KEYS.clientAssignments, seedAssignments);
  return {
    getAll: () => load<ClientTeamAssignment[]>(STORAGE_KEYS.clientAssignments) || [],
    getByClient(clientId) { return this.getAll().filter(a => a.clientId === clientId); },
    getByMember(memberId) { return this.getAll().filter(a => a.teamMemberId === memberId); },
    save(assignment) {
      const all = this.getAll();
      const idx = all.findIndex(a => a.id === assignment.id);
      idx >= 0 ? (all[idx] = assignment) : all.push(assignment);
      persist(STORAGE_KEYS.clientAssignments, all);
    },
    delete(id) { persist(STORAGE_KEYS.clientAssignments, this.getAll().filter(a => a.id !== id)); },
  };
}

export function createClientEconomicsRepo(): ClientEconomicsRepository {
  if (!localStorage.getItem(STORAGE_KEYS.clientEconomics)) persist(STORAGE_KEYS.clientEconomics, seedClientEconomics);
  return {
    get(clientId) {
      const all = load<ClientEconomics[]>(STORAGE_KEYS.clientEconomics) || [];
      return all.find(e => e.clientId === clientId) || { clientId, revenueEntries: [], otherCosts: [] };
    },
    save(economics) {
      const all = load<ClientEconomics[]>(STORAGE_KEYS.clientEconomics) || [];
      const idx = all.findIndex(e => e.clientId === economics.clientId);
      idx >= 0 ? (all[idx] = economics) : all.push(economics);
      persist(STORAGE_KEYS.clientEconomics, all);
    },
  };
}

export function createEconomicsDefaultsRepo(): EconomicsDefaultsRepository {
  if (!localStorage.getItem(STORAGE_KEYS.economicsDefaults)) persist(STORAGE_KEYS.economicsDefaults, seedEconomicsDefaults);
  return {
    get: () => load<EconomicsDefaults>(STORAGE_KEYS.economicsDefaults) || seedEconomicsDefaults,
    save: (defaults) => persist(STORAGE_KEYS.economicsDefaults, defaults),
  };
}
