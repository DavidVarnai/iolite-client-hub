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
  { id: 'tm8', name: 'David Khalil', role: 'Fractional CMO / COO', workerType: 'contractor', status: 'active', notes: 'Strategic marketing and operational leadership. $200/hr. Leads HIBA, CIS, and Venturity engagements.' },
  { id: 'tm9', name: 'Veronica Ruiz', role: 'Project Manager', workerType: 'contractor', status: 'active', notes: 'PM support for David\'s client portfolio.' },
  { id: 'tm10', name: 'Mark Rivera', role: 'Social Media Specialist', workerType: 'contractor', status: 'active', notes: 'Social media content and community management.' },
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
  // David — hourly ($200/hr)
  { id: 'cc10', teamMemberId: 'tm8', componentType: 'hourly', amount: 200, isDefault: true },
  // Veronica — flat client fee
  { id: 'cc11', teamMemberId: 'tm9', componentType: 'flat_client_fee', amount: 1500, isDefault: true },
  // Mark — flat client fee
  { id: 'cc12', teamMemberId: 'tm10', componentType: 'flat_client_fee', amount: 1200, isDefault: true },
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
  { id: 'ca15', teamMemberId: 'tm6', clientId: 'c3', roleOnClient: 'Campaign Manager', flatFeeOverride: 2000, isActive: true, notes: '' },

  // HIBA Academy (c4)
  { id: 'ca16', teamMemberId: 'tm8', clientId: 'c4', roleOnClient: 'Strategy Lead', hourlyRateOverride: 200, isActive: true, notes: 'Strategic oversight, ~10 hrs/month' },
  { id: 'ca17', teamMemberId: 'tm6', clientId: 'c4', roleOnClient: 'Paid Media Specialist', flatFeeOverride: 1500, isActive: true, notes: '' },
  { id: 'ca18', teamMemberId: 'tm10', clientId: 'c4', roleOnClient: 'Social Media Manager', flatFeeOverride: 1200, isActive: true, notes: '' },
  { id: 'ca19', teamMemberId: 'tm4', clientId: 'c4', roleOnClient: 'Production Designer', allocationPercent: 20, isActive: true, notes: '' },
  { id: 'ca20', teamMemberId: 'tm5', clientId: 'c4', roleOnClient: 'Email Specialist', flatFeeOverride: 800, isActive: true, notes: '' },

  // CIS US (c5)
  { id: 'ca21', teamMemberId: 'tm8', clientId: 'c5', roleOnClient: 'Fractional CMO + COO', hourlyRateOverride: 200, isActive: true, notes: '$10,000/month total (~50 hrs). Covers FCMO + operational transition.' },
  { id: 'ca22', teamMemberId: 'tm9', clientId: 'c5', roleOnClient: 'Project Manager', flatFeeOverride: 1500, isActive: true, notes: '' },
  { id: 'ca23', teamMemberId: 'tm6', clientId: 'c5', roleOnClient: 'Paid Media Specialist', flatFeeOverride: 1500, isActive: true, notes: '' },
  { id: 'ca24', teamMemberId: 'tm10', clientId: 'c5', roleOnClient: 'Social Media Manager', flatFeeOverride: 800, isActive: true, notes: '' },
  { id: 'ca25', teamMemberId: 'tm5', clientId: 'c5', roleOnClient: 'Email Specialist', flatFeeOverride: 600, isActive: true, notes: '' },

  // Venturity (c6)
  { id: 'ca26', teamMemberId: 'tm8', clientId: 'c6', roleOnClient: 'Fractional CMO', hourlyRateOverride: 200, isActive: true, notes: 'Strategic marketing leadership, ~25 hrs/month' },
  { id: 'ca27', teamMemberId: 'tm9', clientId: 'c6', roleOnClient: 'Project Manager', flatFeeOverride: 1500, isActive: true, notes: '' },
  { id: 'ca28', teamMemberId: 'tm6', clientId: 'c6', roleOnClient: 'Paid Media Specialist', flatFeeOverride: 2500, isActive: true, notes: '' },
  { id: 'ca29', teamMemberId: 'tm10', clientId: 'c6', roleOnClient: 'Social Media Manager', flatFeeOverride: 1500, isActive: true, notes: '' },
  { id: 'ca30', teamMemberId: 'tm4', clientId: 'c6', roleOnClient: 'Production Designer', allocationPercent: 25, isActive: true, notes: 'Website + social creative' },
  { id: 'ca31', teamMemberId: 'tm5', clientId: 'c6', roleOnClient: 'Email Specialist', flatFeeOverride: 1500, isActive: true, notes: '' },
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
  // HIBA Academy (c4)
  {
    clientId: 'c4',
    revenueEntries: [
      { category: 'paid_media_management', monthlyAmount: 1500 },
      { category: 'social_media_management', monthlyAmount: 1500 },
      { category: 'creative', monthlyAmount: 1000 },
      { category: 'retention_marketing', monthlyAmount: 800 },
      { category: 'analytics', monthlyAmount: 500 },
    ],
    otherCosts: [],
  },
  // CIS US (c5) — David's $10,000/month split across FCMO + operational
  {
    clientId: 'c5',
    revenueEntries: [
      { category: 'fractional_cmo', monthlyAmount: 6000 },
      { category: 'paid_media_management', monthlyAmount: 1500 },
      { category: 'social_media_management', monthlyAmount: 800 },
      { category: 'retention_marketing', monthlyAmount: 600 },
      { category: 'analytics', monthlyAmount: 500 },
    ],
    otherCosts: [
      { id: 'oc4', label: 'Operational Transition Support (FCOO)', monthlyAmount: 4000 },
      { id: 'oc5', label: 'CallRail', monthlyAmount: 150 },
    ],
  },
  // Venturity (c6)
  {
    clientId: 'c6',
    revenueEntries: [
      { category: 'fractional_cmo', monthlyAmount: 5000 },
      { category: 'paid_media_management', monthlyAmount: 2500 },
      { category: 'social_media_management', monthlyAmount: 2000 },
      { category: 'retention_marketing', monthlyAmount: 1500 },
      { category: 'web_design', monthlyAmount: 3000 },
      { category: 'analytics', monthlyAmount: 500 },
    ],
    otherCosts: [
      { id: 'oc6', label: 'HubSpot License', monthlyAmount: 200 },
      { id: 'oc7', label: 'CallRail', monthlyAmount: 150 },
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
    'salary_allocation', 'flat_client_fee', 'hourly', 'revenue_share', 'profit_share', 'threshold_share',
  ],
};
