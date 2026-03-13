/**
 * Seed data for Sales Bundles.
 */
import type { SalesBundle } from '@/types/services';

export const seedSalesBundles: SalesBundle[] = [
  {
    id: 'bnd-ecom-growth',
    name: 'Ecommerce Growth',
    description: 'Full-funnel growth package for ecommerce brands combining paid media, creative, and email.',
    targetClientType: 'Ecommerce',
    includedServices: [
      { serviceLineId: 'sl3', packageId: 'pkg-pm-growth', label: 'Paid Media Management → Growth' },
      { serviceLineId: 'sl4', packageId: 'pkg-cr-standard', label: 'Creative Production → Standard' },
      { serviceLineId: 'sl7', packageId: 'pkg-em-growth', label: 'Email Marketing → Growth' },
      { serviceLineId: '', label: 'Analytics Setup' },
    ],
    optionalAddOns: [
      { serviceLineId: '', label: 'SMS Automation' },
      { serviceLineId: 'sl6', packageId: 'pkg-seo-growth', label: 'SEO → Growth' },
      { serviceLineId: 'sl5', label: 'Landing Page Development' },
    ],
    estimatedMonthlyPrice: 7200,
    active: true,
  },
  {
    id: 'bnd-leadgen',
    name: 'Lead Generation Accelerator',
    description: 'Rapid lead generation setup with paid media, landing pages, and email nurture.',
    targetClientType: 'B2B / Lead Gen',
    includedServices: [
      { serviceLineId: 'sl3', packageId: 'pkg-pm-starter', label: 'Paid Media Management → Starter' },
      { serviceLineId: 'sl5', label: 'Landing Page Development' },
      { serviceLineId: 'sl7', packageId: 'pkg-em-starter', label: 'Email Marketing → Starter' },
      { serviceLineId: '', label: 'CRM Setup' },
    ],
    optionalAddOns: [
      { serviceLineId: 'sl6', packageId: 'pkg-seo-starter', label: 'SEO → Starter' },
      { serviceLineId: 'sl4', label: 'Creative Production' },
    ],
    estimatedMonthlyPrice: 4500,
    active: true,
  },
  {
    id: 'bnd-seo-growth',
    name: 'SEO Growth Program',
    description: 'Comprehensive organic growth through SEO, content, and technical optimization.',
    targetClientType: 'Content / SaaS',
    includedServices: [
      { serviceLineId: 'sl6', packageId: 'pkg-seo-growth', label: 'SEO → Growth' },
      { serviceLineId: '', label: 'Content Strategy' },
      { serviceLineId: '', label: 'Technical SEO' },
    ],
    optionalAddOns: [
      { serviceLineId: '', label: 'PR Outreach' },
      { serviceLineId: '', label: 'Link Building' },
    ],
    estimatedMonthlyPrice: 5000,
    active: true,
  },
  {
    id: 'bnd-full-funnel',
    name: 'Full Funnel Growth',
    description: 'Enterprise-grade full-funnel engagement spanning paid, creative, email, and organic.',
    targetClientType: 'Enterprise / DTC',
    includedServices: [
      { serviceLineId: 'sl3', packageId: 'pkg-pm-scale', label: 'Paid Media Management → Scale' },
      { serviceLineId: 'sl4', packageId: 'pkg-cr-advanced', label: 'Creative Production → Advanced' },
      { serviceLineId: 'sl7', packageId: 'pkg-em-scale', label: 'Email Marketing → Scale' },
      { serviceLineId: 'sl6', packageId: 'pkg-seo-growth', label: 'SEO → Growth' },
      { serviceLineId: '', label: 'Analytics Implementation' },
    ],
    optionalAddOns: [],
    estimatedMonthlyPrice: 20000,
    active: true,
  },
];
