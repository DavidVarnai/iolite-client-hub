/**
 * Seed data for Team Management & Unit Economics.
 */
import type {
  TeamMember,
  CompensationComponent,
  ClientTeamAssignment,
  ClientEconomics,
  EconomicsDefaults,
} from '@/types/economics';

/* ── Team Members ── */

export const seedTeamMembers: TeamMember[] = [
  { id: 'tm1', name: 'Sarah Chen', role: 'Agency Principal / Fractional CMO', workerType: 'full_time', status: 'active', notes: 'Agency founder, leads strategy for top accounts.' },
  { id: 'tm2', name: 'Marcus Webb', role: 'Project Manager', workerType: 'full_time', status: 'active', notes: 'Manages day-to-day client execution.' },
  { id: 'tm3', name: 'Priya Patel', role: 'Marketing Specialist', workerType: 'full_time', status: 'active', notes: 'Handles paid media execution and email marketing.' },
  { id: 'tm4', name: 'Kelly Nguyen', role: 'Designer', workerType: 'contractor', status: 'active', notes: 'Freelance designer allocated across clients.' },
  { id: 'tm5', name: 'Mike Reeves', role: 'Email Specialist', workerType: 'contractor', status: 'active', notes: 'Flat-fee email marketing contractor.' },
  { id: 'tm6', name: 'Seif Almadi', role: 'Campaign Manager', workerType: 'full_time', status: 'active', notes: 'Paid media account manager with base fee per client + threshold share on fees above base.' },
  { id: 'tm7', name: 'Michael Torres', role: 'Retention Lead', workerType: 'full_time', status: 'active', notes: 'Leads retention marketing with revenue share on fees.' },
];

/* ── Compensation Components ── */

export const seedCompensation: CompensationComponent[] = [
  // Sarah — salary
  { id: 'cc1', teamMemberId: 'tm1', componentType: 'salary_allocation', amount: 12000, isDefault: true },
  // Marcus — salary
  { id: 'cc2', teamMemberId: 'tm2', componentType: 'salary_allocation', amount: 7000, isDefault: true },
  // Priya — salary
  { id: 'cc3', teamMemberId: 'tm3', componentType: 'salary_allocation', amount: 5500, isDefault: true },
  // Kelly — salary (contractor, allocated by %)
  { id: 'cc4', teamMemberId: 'tm4', componentType: 'salary_allocation', amount: 6000, isDefault: true },
  // Mike — flat client fee
  { id: 'cc5', teamMemberId: 'tm5', componentType: 'flat_client_fee', amount: 2500, isDefault: true },
  // Seif — flat client fee (base per account) + threshold share above base on paid media mgmt fees
  { id: 'cc6', teamMemberId: 'tm6', componentType: 'flat_client_fee', amount: 2000, isDefault: true },
  { id: 'cc7', teamMemberId: 'tm6', componentType: 'threshold_share', amount: 0, sharePercent: 0.50, appliesToCategory: 'paid_media_management', thresholdAmount: 3000, isDefault: true },
  // Michael — base salary + revenue share
  { id: 'cc8', teamMemberId: 'tm7', componentType: 'salary_allocation', amount: 5000, isDefault: true },
  { id: 'cc9', teamMemberId: 'tm7', componentType: 'revenue_share', amount: 0, sharePercent: 0.10, appliesToCategory: 'retention_marketing', isDefault: true },
];

/* ── Client Assignments ── */

export const seedAssignments: ClientTeamAssignment[] = [
  // Meridian Commerce (c1)
  { id: 'ca1', teamMemberId: 'tm1', clientId: 'c1', roleOnClient: 'Strategy Lead', allocationPercent: 20, isActive: true, notes: '' },
  { id: 'ca2', teamMemberId: 'tm2', clientId: 'c1', roleOnClient: 'Project Manager', allocationPercent: 40, isActive: true, notes: '' },
  { id: 'ca3', teamMemberId: 'tm3', clientId: 'c1', roleOnClient: 'Paid Media Specialist', allocationPercent: 50, isActive: true, notes: '' },
  { id: 'ca4', teamMemberId: 'tm4', clientId: 'c1', roleOnClient: 'Designer', allocationPercent: 40, isActive: true, notes: '' },
  { id: 'ca5', teamMemberId: 'tm5', clientId: 'c1', roleOnClient: 'Email Specialist', flatFeeOverride: 2500, isActive: true, notes: '' },
  { id: 'ca6', teamMemberId: 'tm6', clientId: 'c1', roleOnClient: 'Campaign Manager', flatFeeOverride: 2000, isActive: true, notes: '' },
  { id: 'ca7', teamMemberId: 'tm7', clientId: 'c1', roleOnClient: 'Retention Lead', allocationPercent: 40, isActive: true, notes: '' },

  // Atlas Legal (c2)
  { id: 'ca8', teamMemberId: 'tm1', clientId: 'c2', roleOnClient: 'Strategy Lead', allocationPercent: 30, isActive: true, notes: '' },
  { id: 'ca9', teamMemberId: 'tm2', clientId: 'c2', roleOnClient: 'Project Manager', allocationPercent: 30, isActive: true, notes: '' },
  { id: 'ca10', teamMemberId: 'tm4', clientId: 'c2', roleOnClient: 'Designer', allocationPercent: 30, isActive: true, notes: '' },
  { id: 'ca11', teamMemberId: 'tm5', clientId: 'c2', roleOnClient: 'Email Specialist', flatFeeOverride: 1500, isActive: true, notes: '' },

  // Pinnacle Academy (c3)
  { id: 'ca12', teamMemberId: 'tm2', clientId: 'c3', roleOnClient: 'Project Manager', allocationPercent: 30, isActive: true, notes: '' },
  { id: 'ca13', teamMemberId: 'tm3', clientId: 'c3', roleOnClient: 'Social Media Specialist', allocationPercent: 50, isActive: true, notes: '' },
  { id: 'ca14', teamMemberId: 'tm4', clientId: 'c3', roleOnClient: 'Designer', allocationPercent: 30, isActive: true, notes: '' },
  { id: 'ca15', teamMemberId: 'tm6', clientId: 'c3', roleOnClient: 'Campaign Manager', allocationPercent: 50, isActive: true, notes: '' },
];

/* ── Client Economics (Revenue + Other Costs) ── */

export const seedClientEconomics: ClientEconomics[] = [
  {
    clientId: 'c1',
    revenueEntries: [
      { category: 'fractional_cmo', monthlyAmount: 5000 },
      { category: 'paid_media_management', monthlyAmount: 8000 },
      { category: 'retention_marketing', monthlyAmount: 4000 },
      { category: 'web_design', monthlyAmount: 2000 },
      { category: 'creative', monthlyAmount: 1500 },
    ],
    otherCosts: [
      { id: 'oc1', label: 'Klaviyo Subscription', monthlyAmount: 150 },
      { id: 'oc2', label: 'Design Tools (Figma)', monthlyAmount: 45 },
    ],
  },
  {
    clientId: 'c2',
    revenueEntries: [
      { category: 'fractional_cmo', monthlyAmount: 7500 },
      { category: 'web_design', monthlyAmount: 3000 },
      { category: 'copywriting', monthlyAmount: 2000 },
    ],
    otherCosts: [],
  },
  {
    clientId: 'c3',
    revenueEntries: [
      { category: 'paid_media_management', monthlyAmount: 5000 },
      { category: 'social_media_management', monthlyAmount: 3500 },
      { category: 'creative', monthlyAmount: 1500 },
    ],
    otherCosts: [
      { id: 'oc3', label: 'Social Scheduling Tool', monthlyAmount: 80 },
    ],
  },
];

/* ── Economics Defaults ── */

export const seedEconomicsDefaults: EconomicsDefaults = {
  currency: 'USD',
  marginTarget: 50,
  defaultRevenueCategories: [
    'fractional_cmo', 'paid_media_management', 'social_media_management',
    'retention_marketing', 'web_design', 'creative', 'development', 'seo', 'copywriting', 'analytics',
  ],
  defaultCompensationCategories: [
    'salary_allocation', 'flat_client_fee', 'hourly', 'revenue_share', 'profit_share',
  ],
};
