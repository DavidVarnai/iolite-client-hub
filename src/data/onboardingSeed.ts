import { OnboardingData, ClientDiscovery, EMPTY_DISCOVERY, DEFAULT_ONBOARDING, LifecycleStage } from '@/types/onboarding';

/* Seed onboarding data for each client */

// c1 — Meridian Commerce — Active Client (fully onboarded)
export const c1Onboarding: OnboardingData = {
  lifecycleStage: 'active_client',
  onboardingCompletedAt: '2025-08-20T10:00:00Z',
  proposalReadyAt: '2025-08-15T10:00:00Z',
  activatedAt: '2025-09-01T10:00:00Z',
  website: 'https://meridiancommerce.com',
  geography: 'United States',
  serviceArea: 'Nationwide (DTC)',
  businessModelType: 'ecommerce',
  primaryGrowthGoal: 'revenue_growth',
  stageProgress: [
    { stage: 'lead', status: 'complete', percentComplete: 100 },
    { stage: 'discovery', status: 'complete', percentComplete: 100 },
    { stage: 'strategy', status: 'complete', percentComplete: 100 },
    { stage: 'growth_model', status: 'complete', percentComplete: 100 },
    { stage: 'proposal_ready', status: 'complete', percentComplete: 100, completedAt: '2025-08-15T10:00:00Z' },
    { stage: 'active_client', status: 'complete', percentComplete: 100, completedAt: '2025-09-01T10:00:00Z' },
  ],
  discovery: {
    businessModel: 'ecommerce',
    primaryProducts: 'Premium home goods, kitchenware, sustainable living products',
    legacyRevenueStreamsText: 'DTC ecommerce (85%), wholesale (15%)',
    avgOrderValue: '$78',
    legacyRevenueModel: { revenueModelType: 'one_time', revenuePerConversion: 78, revenueUnit: 'per_deal' },
    revenueStreams: [
      { id: 'rs-c1-1', name: 'DTC Ecommerce', type: 'one_time', averageDealSize: 78, source: 'manual' },
    ],
    coreCustomerSegments: 'Women 25-45, HHI $75k+, urban/suburban, sustainability-conscious',
    revenueTarget: 12000000,
    newCustomersTarget: 35000,
    revenueTargets: '$12M annual revenue (up from $9.2M)',
    customerLeadTargets: '35,000 new customers, 55% repeat rate',
    timeHorizon: '12 months',
    primaryGrowthObjective: 'acquire_new_customers',
    primaryLeadType: 'New DTC customers',
    majorGrowthPriorities: 'Scale paid acquisition, reduce CAC, grow email revenue to 30%',
    funnelType: 'ecommerce',
    leadQualSaleStructure: 'Ad click → PDP → Add to Cart → Purchase',
    salesFunnelStages: [
      { name: 'Ad Click', category: 'traffic' },
      { name: 'Product Page', category: 'page_interaction' },
      { name: 'Add to Cart', category: 'page_interaction', isCustom: true },
      { name: 'Purchase', category: 'conversion' },
    ],
    closeRate: '2.8% site-wide conversion',
    salesCycleLength: 'Same session or within 7 days',
    paidMediaPlatforms: 'Meta Ads, Google Ads (Shopping + Search)',
    crm: 'Shopify customer database',
    emailPlatform: 'Klaviyo',
    analyticsStack: 'GA4, Triple Whale, Klaviyo analytics',
    websitePlatform: 'Shopify Plus',
    // Structured performance
    monthlyVisitors: '180000',
    monthlyLeads: '5040',
    monthlyCustomers: '5040',
    monthlyMarketingBudget: '220000',
    performanceConfidence: 'high',
    bottleneckTags: ['Low website conversion', 'Weak traffic volume'],
    bottleneckNotes: 'Landing page friction, high Meta retargeting frequency, limited prospecting',
    // Legacy (kept for compat)
    currentTraffic: '180,000 monthly sessions',
    currentLeadsOrders: '5,040 monthly orders',
    currentCpaCac: 'CAC $51, CPA $44',
    conversionRates: '2.8% overall, 4.1% returning visitors',
    knownBottlenecks: 'Landing page friction, high Meta retargeting frequency, limited prospecting',
    // Structured competitors
    competitors: [
      { name: 'Caraway Home', url: 'https://carawayhome.com' },
      { name: 'Our Place', url: 'https://fromourplace.com' },
      { name: 'Material Kitchen', url: 'https://materialkitchen.com' },
    ],
    topCompetitors: 'Caraway Home, Our Place, Material Kitchen',
    positioningNotes: 'Premium quality + sustainability story',
    differentiators: 'B-corp certified, lifetime warranty, US-based customer service',
  },
};

// c2 — Atlas Legal Group — Proposal stage (discovery complete, building proposal)
export const c2Onboarding: OnboardingData = {
  lifecycleStage: 'proposal_ready',
  proposalReadyAt: '2026-03-10T10:00:00Z',
  website: 'https://atlaslegal.com',
  geography: 'Northeast US',
  serviceArea: 'Northeast US — Boston, NYC, Philadelphia',
  businessModelType: 'lead_generation',
  primaryGrowthGoal: 'lead_volume',
  stageProgress: [
    { stage: 'lead', status: 'complete', percentComplete: 100 },
    { stage: 'discovery', status: 'complete', percentComplete: 100 },
    { stage: 'strategy', status: 'complete', percentComplete: 100 },
    { stage: 'growth_model', status: 'in_progress', percentComplete: 60 },
    { stage: 'proposal_ready', status: 'in_progress', percentComplete: 70 },
    { stage: 'active_client', status: 'not_started', percentComplete: 0 },
  ],
  discovery: {
    businessModel: 'lead_generation',
    primaryProducts: 'Corporate law, M&A advisory, IP protection',
    legacyRevenueStreamsText: 'Retainer fees (60%), project-based (40%)',
    avgOrderValue: '$25,000 avg engagement',
    legacyRevenueModel: { revenueModelType: 'one_time', revenuePerConversion: 25000, revenueUnit: 'per_deal' },
    revenueStreams: [
      { id: 'rs-c2-1', name: 'Retainer Fees', type: 'recurring', monthlyValue: 5000, contractLengthMonths: 12, source: 'manual' },
      { id: 'rs-c2-2', name: 'Project-Based Engagements', type: 'one_time', averageDealSize: 25000, source: 'manual' },
    ],
    coreCustomerSegments: 'Mid-market companies $10M-$100M revenue, C-suite decision makers',
    revenueTarget: 0,
    newCustomersTarget: 50,
    revenueTargets: '40% increase in qualified leads',
    customerLeadTargets: '50 qualified leads/month (up from 30)',
    timeHorizon: '6 months',
    primaryGrowthObjective: 'acquire_new_customers',
    primaryLeadType: 'Qualified leads',
    majorGrowthPriorities: 'Digital thought leadership, website modernization, content pipeline',
    funnelType: 'lead_gen',
    leadQualSaleStructure: 'Content → Consultation request → Qualified call → Engagement',
    salesFunnelStages: [
      { name: 'Content Page', category: 'page_interaction' },
      { name: 'Consultation', category: 'qualification' },
      { name: 'Discovery Call', category: 'qualification' },
      { name: 'Closed Deal', category: 'conversion' },
    ],
    closeRate: '18% from qualified lead to engagement',
    salesCycleLength: '45-90 days',
    paidMediaPlatforms: 'None currently',
    crm: 'Clio (legal practice management)',
    emailPlatform: 'Mailchimp (basic)',
    analyticsStack: 'GA4 (basic setup)',
    websitePlatform: 'WordPress (outdated theme)',
    // Structured performance
    monthlyVisitors: '8500',
    monthlyLeads: '30',
    monthlyCustomers: '5',
    monthlyMarketingBudget: '0',
    performanceConfidence: 'medium',
    bottleneckTags: ['Low website conversion', 'Weak traffic volume', 'Low brand awareness'],
    bottleneckNotes: 'Outdated website, no content strategy, reliance on referrals',
    // Legacy
    currentTraffic: '8,500 monthly sessions',
    currentLeadsOrders: '30 consultation requests/month',
    currentCpaCac: 'Unknown — no paid channels active',
    conversionRates: '0.35% visitor to consultation request',
    knownBottlenecks: 'Outdated website, no content strategy, reliance on referrals',
    // Structured competitors
    competitors: [
      { name: 'Baker McKenzie', url: '' },
      { name: 'Morrison & Foerster', url: '' },
    ],
    topCompetitors: 'Baker McKenzie (regional), Morrison & Foerster, local boutique firms',
    positioningNotes: 'Trusted advisors with deep industry expertise',
    differentiators: 'Senior partner involvement on every engagement, industry specialization',
  },
};

// c3 — Pinnacle Academy — In Discovery
export const c3Onboarding: OnboardingData = {
  lifecycleStage: 'discovery',
  website: 'https://pinnacleacademy.edu',
  geography: 'Metro area, US',
  serviceArea: 'Metro Area, Phoenix AZ',
  businessAddress: '4521 E Camelback Rd, Phoenix, AZ 85018',
  businessModelType: 'lead_generation',
  primaryGrowthGoal: 'lead_volume',
  stageProgress: [
    { stage: 'lead', status: 'complete', percentComplete: 100 },
    { stage: 'discovery', status: 'in_progress', percentComplete: 65 },
    { stage: 'strategy', status: 'in_progress', percentComplete: 40 },
    { stage: 'growth_model', status: 'not_started', percentComplete: 0 },
    { stage: 'proposal_ready', status: 'not_started', percentComplete: 0 },
    { stage: 'active_client', status: 'not_started', percentComplete: 0 },
  ],
  discovery: {
    ...EMPTY_DISCOVERY,
    businessModel: 'lead_generation',
    primaryProducts: 'K-12 private education, enrichment programs',
    legacyRevenueStreamsText: 'Tuition (90%), summer programs (10%)',
    avgOrderValue: '$28,000 annual tuition',
    legacyRevenueModel: { revenueModelType: 'annual_contract', revenuePerConversion: 28000, revenueUnit: 'per_year', avgContractLengthMonths: 12 },
    revenueStreams: [
      { id: 'rs-c3-1', name: 'Annual Tuition', type: 'recurring', monthlyValue: 2333, contractLengthMonths: 12, source: 'manual' },
    ],
    coreCustomerSegments: 'Parents 30-50, HHI $120k+, metro area',
    revenueTarget: 0,
    newCustomersTarget: 200,
    revenueTargets: '15% enrollment increase',
    customerLeadTargets: '200 qualified inquiries per enrollment cycle',
    timeHorizon: '12 months',
    primaryGrowthObjective: 'acquire_new_customers',
    primaryLeadType: 'Qualified inquiries',
    majorGrowthPriorities: 'Digital enrollment funnel, social proof, community engagement',
    funnelType: 'lead_gen',
    paidMediaPlatforms: 'Facebook Ads (minimal)',
    monthlyVisitors: '12000',
    monthlyLeads: '45',
    performanceConfidence: 'estimated',
  },
};

// c4 — HIBA Academy — Active (enrollment-focused)
export const c4Onboarding: OnboardingData = {
  lifecycleStage: 'discovery',
  website: '',
  geography: 'San Francisco, CA',
  serviceArea: 'San Francisco Bay Area',
  businessModelType: 'lead_generation',
  primaryGrowthGoal: 'brand_awareness',
  discovery: {
    ...EMPTY_DISCOVERY,
    businessModel: 'lead_generation',
    primaryProducts: 'Private bilingual K-8 education',
    legacyRevenueStreamsText: 'Annual tuition',
    avgOrderValue: 'Annual tuition',
    legacyRevenueModel: { revenueModelType: 'annual_contract', revenuePerConversion: 0, revenueUnit: 'per_year' },
    revenueStreams: [],
    coreCustomerSegments: 'Parents with children ages 4-14 seeking bilingual private education',
    revenueTarget: 0,
    newCustomersTarget: 0,
    revenueTargets: 'Enrollment growth for school opening',
    customerLeadTargets: 'Student enrollment',
    timeHorizon: '12 months',
    primaryGrowthObjective: 'acquire_new_customers',
    primaryLeadType: 'Student enrollment',
    majorGrowthPriorities: 'Enrollment growth and brand awareness prior to school opening',
    funnelType: 'lead_gen',
  },
};

// c5 — CIS — Active (MSP lead gen)
export const c5Onboarding: OnboardingData = {
  lifecycleStage: 'discovery',
  website: '',
  geography: 'United States',
  serviceArea: 'National',
  businessModelType: 'lead_generation',
  primaryGrowthGoal: 'lead_volume',
  discovery: {
    ...EMPTY_DISCOVERY,
    businessModel: 'lead_generation',
    primaryProducts: 'IT Services, IAM, Managed Service Provider',
    legacyRevenueStreamsText: 'Managed IT service contracts',
    avgOrderValue: '$5,000/month managed service contract',
    legacyRevenueModel: { revenueModelType: 'monthly_recurring', revenuePerConversion: 5000, revenueUnit: 'per_month', avgContractLengthMonths: 12 },
    revenueStreams: [
      { id: 'rs-c5-1', name: 'Managed IT Service Contract', type: 'recurring', monthlyValue: 5000, contractLengthMonths: 12, source: 'manual' },
    ],
    coreCustomerSegments: 'Mid-market companies, 20-500 employees, $2M-$100M revenue. Industries: healthcare, manufacturing, professional services.',
    revenueTarget: 0,
    newCustomersTarget: 0,
    revenueTargets: 'New MSP client acquisition',
    customerLeadTargets: 'Qualified MSP leads',
    timeHorizon: '12 months',
    primaryGrowthObjective: 'acquire_new_customers',
    primaryLeadType: 'Qualified MSP leads',
    majorGrowthPriorities: 'New MSP client acquisition',
    funnelType: 'lead_gen',
  },
};

// c6 — Venturity — Active (financial services, NOT MSP/IT)
export const c6Onboarding: OnboardingData = {
  lifecycleStage: 'discovery',
  website: '',
  geography: 'United States',
  serviceArea: 'National',
  businessModelType: 'lead_generation',
  primaryGrowthGoal: 'lead_volume',
  discovery: {
    ...EMPTY_DISCOVERY,
    businessModel: 'lead_generation',
    primaryProducts: 'Financial advisory and services',
    revenueStreams: 'Financial services engagements',
    avgOrderValue: 'Financial services engagement',
    revenueModel: { revenueModelType: 'one_time', revenuePerConversion: 0, revenueUnit: 'per_deal' },
    revenueStreamsList: [],
    coreCustomerSegments: 'Businesses and individuals requiring financial advisory services',
    revenueTarget: 0,
    newCustomersTarget: 0,
    revenueTargets: 'Client acquisition',
    customerLeadTargets: 'Qualified financial advisory leads',
    timeHorizon: '12 months',
    primaryGrowthObjective: 'acquire_new_customers',
    primaryLeadType: 'Qualified financial advisory leads',
    majorGrowthPriorities: 'Client acquisition',
    funnelType: 'lead_gen',
  },
};

export function getOnboardingForClient(clientId: string): OnboardingData {
  switch (clientId) {
    case 'c1': return { ...c1Onboarding };
    case 'c2': return { ...c2Onboarding };
    case 'c3': return { ...c3Onboarding };
    case 'c4': return { ...c4Onboarding };
    case 'c5': return { ...c5Onboarding };
    case 'c6': return { ...c6Onboarding };
    default: return { ...DEFAULT_ONBOARDING };
  }
}
