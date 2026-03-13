/**
 * Proposal seed data — realistic sample proposals for testing.
 */
import type { Proposal } from '@/types/proposal';
import type { ProposalDefaults } from '@/types/proposal';

export const seedProposalDefaults: ProposalDefaults = {
  titleFormat: '{clientName} — Growth Partnership Proposal',
  defaultExecutiveIntro:
    'Thank you for the opportunity to partner with your team. This proposal outlines a strategic engagement designed to accelerate your growth through data-driven marketing, creative excellence, and operational efficiency.',
  defaultTimelineLabels: {
    first30: 'Onboarding & Foundation',
    first60: 'Optimization & Scaling',
    first90: 'Growth Acceleration',
  },
  defaultCtaText:
    "We're excited to get started. To move forward, simply approve this proposal and we'll schedule your kickoff session within 48 hours.",
  defaultAssumptionsNote:
    'This proposal assumes standard engagement terms, monthly reporting cadence, and a minimum 6-month commitment. All pricing is based on current scope and may be adjusted if scope changes significantly.',
  showPricingBreakdown: true,
  showProjections: true,
  showTimeline: true,
};

export const seedProposals: Proposal[] = [
  {
    id: 'prop-1',
    clientId: 'c1',
    name: 'Meridian Commerce — Growth Partnership Proposal',
    status: 'approved',
    version: 2,
    createdAt: '2025-08-15T10:00:00Z',
    updatedAt: '2025-08-28T14:30:00Z',
    generatedAt: '2025-08-28T14:30:00Z',
    selectedBundleId: 'bundle-ecom',
    selectedServiceLineIds: ['sl3', 'sl7', 'sl4'],
    selectedPackageIds: ['pkg-pm-growth', 'pkg-em-growth', 'pkg-cr-standard'],
    selectedAddOnIds: ['pkg-seo-starter'],
    summaryData: {
      executiveSummary:
        'Thank you for the opportunity to partner with Meridian Commerce. This proposal outlines a comprehensive growth engagement spanning paid media management, email marketing automation, creative production, and foundational SEO — designed to reduce CAC by 15% and grow revenue by 25% within 12 months.',
      strategySummary:
        'Our strategy centers on diversifying paid acquisition channels beyond Meta, building lifecycle email automation to increase retention revenue, and producing high-converting creative assets at scale. A foundational SEO program ensures long-term organic growth.',
      scopeSummary:
        'Paid Media Management (Growth tier), Email Marketing (Growth tier), Creative Production (Standard tier), and SEO (Starter tier). Includes monthly reporting, bi-weekly strategy calls, and quarterly business reviews.',
      expectedOutcomesSummary:
        'We project a 15% reduction in blended CAC, 25% revenue growth from paid channels, email revenue contribution reaching 30%, and a 3x improvement in creative output velocity.',
    },
    pricingData: {
      lines: [
        { id: 'pl-1', label: 'Paid Media Management — Growth', type: 'package', serviceLineId: 'sl3', packageId: 'pkg-pm-growth', monthlyPrice: 4500, description: 'Full-service paid media across Meta, Google, and TikTok' },
        { id: 'pl-2', label: 'Email Marketing — Growth', type: 'package', serviceLineId: 'sl7', packageId: 'pkg-em-growth', monthlyPrice: 3000, description: '8 campaigns/month, advanced segmentation, 2 new flows/quarter' },
        { id: 'pl-3', label: 'Creative Production — Standard', type: 'package', serviceLineId: 'sl4', packageId: 'pkg-cr-standard', monthlyPrice: 1200, description: 'Full creative package with animation' },
        { id: 'pl-4', label: 'SEO — Starter', type: 'add_on', serviceLineId: 'sl6', packageId: 'pkg-seo-starter', monthlyPrice: 1400, description: 'Technical SEO audit, keyword research, and foundational optimization' },
      ],
      subtotal: 10100,
      total: 10100,
    },
    projectionData: {
      projectedMonthlyInvestment: 10100,
      projectedOutcomes: [
        '15% CAC reduction within 6 months',
        '25% revenue growth from paid channels',
        'Email revenue contribution reaching 30%',
        'Diversified channel mix reducing platform risk',
      ],
      projectedRevenueImpact: '$420K incremental annual revenue (projected)',
      kpiHighlights: [
        { label: 'Blended CAC', target: '< $42' },
        { label: 'Paid ROAS', target: '> 4.2x' },
        { label: 'Email Revenue Share', target: '> 28%' },
        { label: 'New Customer Acquisition', target: '+30%' },
      ],
    },
    timelineData: {
      kickoffDate: '2025-09-01',
      first30: 'Account audits, tracking setup, Meta audience restructure, Klaviyo list cleanup, creative asset inventory.',
      first60: 'Google PMax launch, post-purchase email flow live, first creative packages delivered, SEO audit complete.',
      first90: 'Full channel optimization in progress, browse abandonment flow live, TikTok test campaigns, quarterly business review.',
      implementationNotes: 'Kickoff session within 48 hours of approval. Dedicated Slack channel for real-time communication.',
    },
    notes: 'Approved after second revision. Client requested SEO starter be added as supplemental service.',
  },
  {
    id: 'prop-2',
    clientId: 'c2',
    name: 'Atlas Legal Group — Digital Growth Strategy Proposal',
    status: 'ready',
    version: 1,
    createdAt: '2026-03-08T09:00:00Z',
    updatedAt: '2026-03-12T16:00:00Z',
    generatedAt: '2026-03-12T16:00:00Z',
    selectedServiceLineIds: ['sl1', 'sl6'],
    selectedPackageIds: [],
    selectedAddOnIds: ['sl4'],
    summaryData: {
      executiveSummary:
        'Thank you for the opportunity to partner with Atlas Legal Group. This proposal outlines a phased digital growth engagement focused on establishing your firm as a thought leader in the corporate legal space, modernizing your digital presence, and building a sustainable lead generation engine.',
      strategySummary:
        'Our approach positions Atlas Legal as the go-to authority for mid-market corporate legal services through strategic content, a modernized web presence, and targeted digital campaigns. We lead with thought leadership to build trust before driving direct acquisition.',
      scopeSummary:
        'Strategic Consulting engagement (3-month discovery-to-roadmap), Website Redesign & Development, and optional SEO Growth program. Includes weekly check-ins during strategy phase and monthly reviews during implementation.',
      expectedOutcomesSummary:
        'We project a 40% increase in qualified inbound leads within 12 months, a 25% improvement in website engagement metrics, and establishment of 3 recurring content series positioning the firm as a market authority.',
    },
    pricingData: {
      lines: [
        { id: 'pl-5', label: 'Strategic Consulting — Discovery & Roadmap', type: 'service', serviceLineId: 'sl1', monthlyPrice: 8000, description: '3-month strategic engagement: audit, strategy development, implementation roadmap', setupFee: 2500 },
        { id: 'pl-6', label: 'Website Redesign & Development', type: 'service', serviceLineId: 'sl6', monthlyPrice: 0, description: 'Full website redesign with CMS, optimized for lead generation', setupFee: 35000, notes: 'One-time project fee, 8-10 week timeline' },
        { id: 'pl-7', label: 'SEO Growth (optional)', type: 'add_on', serviceLineId: 'sl4', monthlyPrice: 4000, description: 'Ongoing SEO program starting after website launch' },
      ],
      subtotal: 12000,
      discountLabel: 'Bundled engagement discount',
      discountAmount: 1000,
      total: 11000,
    },
    projectionData: {
      projectedMonthlyInvestment: 11000,
      projectedOutcomes: [
        '40% increase in qualified inbound leads',
        '25% improvement in website engagement',
        '3 recurring thought leadership content series',
        'Measurable brand authority in corporate legal space',
      ],
      projectedRevenueImpact: 'Estimated $180K in new client revenue within first 12 months',
      kpiHighlights: [
        { label: 'Qualified Leads', target: '+40%' },
        { label: 'Website Engagement', target: '+25%' },
        { label: 'Content Series', target: '3 active' },
        { label: 'Organic Traffic', target: '+60% (with SEO)' },
      ],
    },
    timelineData: {
      kickoffDate: '2026-04-01',
      first30: 'Discovery interviews with partners, digital audit, competitive analysis, stakeholder alignment workshop.',
      first60: 'Strategy document delivery, content framework development, website wireframes and design concepts.',
      first90: 'Implementation roadmap finalized, website in development, first content pieces published.',
      implementationNotes: 'Strategy phase runs April–June. Website development July–August. SEO program begins post-launch if approved.',
    },
    notes: 'Emphasis on "thought leadership" positioning per client preference. Website project priced as one-time fee.',
  },
];
