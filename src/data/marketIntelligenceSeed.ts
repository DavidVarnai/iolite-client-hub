/**
 * Seed data for Market Intelligence runs and admin defaults.
 * Updated with channel-specific audience models and typed benchmarks.
 */
import type {
  MarketIntelligenceRun,
  MarketIntelligenceDefaults,
} from '@/types/marketIntelligence';

/* ── Seed Runs ── */

export const seedMarketIntelligenceRuns: MarketIntelligenceRun[] = [
  {
    id: 'mi-1',
    clientId: 'c1', // Meridian Commerce
    status: 'complete',
    createdAt: '2025-08-20T10:00:00Z',
    updatedAt: '2025-08-22T14:00:00Z',
    generatedAt: '2025-08-22T14:00:00Z',
    inputs: {
      industry: 'E-commerce',
      serviceArea: 'DTC Home Goods',
      geography: 'United States',
      businessModel: 'ecommerce',
      website: 'https://meridiancommerce.com',
      productsOrServices: 'Premium sustainable home goods, kitchenware, décor',
      targetAudience: 'Women 25-45, household income $75k+, sustainability-conscious',
      knownCompetitors: ['Crate & Barrel', 'West Elm', 'Parachute Home'],
      primaryGoal: 'Scale paid acquisition while reducing CAC',
      budgetRange: '$80,000 - $120,000/month',
      selectedChannels: ['Google Ads', 'Meta Ads', 'Email', 'TikTok'],
    },
    outputs: {
      keywordThemes: [
        { id: 'kt1', theme: 'Sustainable home décor', intentType: 'commercial', keywordExamples: ['eco-friendly home décor', 'sustainable kitchen products', 'organic cotton bedding'], demandCaptureRationale: 'High-intent commercial queries from shoppers actively evaluating sustainable home goods.', notes: 'Strong search volume with moderate competition.' },
        { id: 'kt2', theme: 'Premium kitchenware pricing', intentType: 'transactional', keywordExamples: ['handmade ceramic bowls', 'artisan cutting boards price', 'premium cookware sets cost'], demandCaptureRationale: 'Bottom-of-funnel queries indicating purchase readiness.' },
        { id: 'kt3', theme: 'Home styling inspiration', intentType: 'informational', keywordExamples: ['modern kitchen styling ideas', 'minimalist home décor tips', 'sustainable living room ideas'], demandCaptureRationale: 'Top-of-funnel content opportunity. Drives organic authority and email list growth.' },
      ],
      competitorProfiles: [
        { id: 'cp1', name: 'Parachute Home', geography: 'US (National)', positioning: 'Premium essentials with California-modern aesthetic', channelObservations: 'Heavy Meta spend, strong email program, growing TikTok presence.', notes: 'Closest positioning overlap.' },
        { id: 'cp2', name: 'West Elm', geography: 'US + International', positioning: 'Modern furniture and décor at accessible luxury pricing', channelObservations: 'Dominant Google Shopping, large Pinterest presence, strong brand search.' },
      ],
      audienceModels: [
        { id: 'am1', channel: 'Meta Ads', channelType: 'audience', audienceDefinition: 'Sustainability-conscious women 25-45, interests in home décor and DTC brands', targetingCriteria: ['Interest: Sustainable living, home décor, DTC brands', 'Behavior: Engaged shoppers', 'Lookalike: 1-3% from customer list'], funnelStage: 'awareness', estimatedReachMin: 3_000_000, estimatedReachMax: 8_000_000, recommendedCPM: 11, recommendedCTR: 1.2, recommendedCVR: 1.8, reasoning: 'Meta prospecting reaches sustainability-conscious shoppers through interest and behavior targeting.' },
        { id: 'am2', channel: 'Meta Ads', channelType: 'audience', audienceDefinition: 'Retargeting: website visitors, cart abandoners, email subscribers', targetingCriteria: ['Website visitors (7/14/30-day)', 'Cart abandoners', 'Email list match'], funnelStage: 'conversion', estimatedReachMin: 10_000, estimatedReachMax: 50_000, recommendedCPM: 15, recommendedCTR: 2.0, recommendedCVR: 4.0, reasoning: 'Retargeting warm audiences at 2-4x prospecting conversion rates.' },
        { id: 'am3', channel: 'Google Ads', channelType: 'search', audienceDefinition: 'High-intent searchers for sustainable home goods', targetingCriteria: ['Keyword-driven intent targeting', 'National with bid adjustments', 'In-market: Home Décor'], funnelStage: 'conversion', estimatedReachMin: 50_000, estimatedReachMax: 200_000, reasoning: 'Search captures demand at the moment of highest purchase intent.' },
      ],
      channelRecommendations: [
        { channel: 'Google Ads', channelType: 'search', role: 'Intent capture & Shopping', rationale: 'High-intent traffic with strong ROAS potential after feed optimization.', priority: 'high' },
        { channel: 'Meta Ads', channelType: 'audience', role: 'Primary prospecting & retargeting', rationale: 'Largest addressable audience with proven creative formats for DTC.', priority: 'high' },
        { channel: 'Email', channelType: 'email', role: 'Lifecycle & retention', rationale: 'Underutilized channel with 18% revenue share vs 30% benchmark.', priority: 'high' },
        { channel: 'TikTok', channelType: 'audience', role: 'Awareness & content testing', rationale: 'Growing platform for DTC discovery. Low CPMs for awareness.', priority: 'medium' },
      ],
      benchmarkAssumptions: [
        { channel: 'Google Ads', channelType: 'search', metric: 'CPC', unit: '$', low: 0.8, high: 3.0, recommended: 1.8, rationale: 'E-commerce search CPC. Blended branded + non-branded.' },
        { channel: 'Google Ads', channelType: 'search', metric: 'CVR', unit: '%', low: 1.5, high: 4.0, recommended: 2.5, rationale: 'Shopping + search blended conversion rate.' },
        { channel: 'Meta Ads', channelType: 'audience', metric: 'CPM (Prospecting)', unit: '$', low: 6, high: 18, recommended: 11, rationale: 'DTC home goods prospecting CPM.' },
        { channel: 'Meta Ads', channelType: 'audience', metric: 'CPA', unit: '$', low: 25, high: 65, recommended: 38, rationale: 'Blended prospecting + retargeting CPA for DTC.' },
        { channel: 'Email', channelType: 'email', metric: 'Revenue Share', unit: '%', low: 20, high: 35, recommended: 28, rationale: 'Mature DTC email benchmark.' },
        { channel: 'TikTok', channelType: 'audience', metric: 'CPM', unit: '$', low: 3, high: 8, recommended: 4, rationale: 'Lowest-CPM major platform for awareness.' },
      ],
      researchSummary: 'E-commerce in United States benefits from a dual approach: search-based demand capture via Google Ads and audience-based prospecting via Meta Ads, TikTok. 3 audience models have been built across channels. High-priority channels: Google Ads, Meta Ads, Email. All benchmarks are modeled assumptions and should be validated against actual performance within the first 30-60 days.',
    },
  },
  {
    id: 'mi-2',
    clientId: 'c2', // Atlas Legal Group
    status: 'complete',
    createdAt: '2026-02-10T09:00:00Z',
    updatedAt: '2026-02-12T16:00:00Z',
    generatedAt: '2026-02-12T16:00:00Z',
    inputs: {
      industry: 'Professional Services',
      serviceArea: 'Corporate Law / M&A Advisory',
      geography: 'Northeast United States',
      businessModel: 'lead_generation',
      website: 'https://atlaslegal.com',
      productsOrServices: 'Corporate legal counsel, M&A advisory, IP protection',
      targetAudience: 'Mid-market companies $10M-$100M revenue seeking legal counsel',
      knownCompetitors: ['Fisher Phillips', 'Foley & Lardner'],
      primaryGoal: 'Increase qualified lead generation by 40%',
      budgetRange: '$15,000 - $25,000/month',
      selectedChannels: ['Google Ads', 'LinkedIn', 'Content/SEO'],
    },
    outputs: {
      keywordThemes: [
        { id: 'kt4', theme: 'Corporate legal advisory', intentType: 'commercial', keywordExamples: ['corporate attorney near me', 'M&A legal advisor', 'business law firm northeast'], demandCaptureRationale: 'High-intent queries from businesses actively seeking legal counsel.' },
        { id: 'kt5', theme: 'IP protection services', intentType: 'transactional', keywordExamples: ['intellectual property attorney', 'patent lawyer for startups', 'trademark registration law firm'], demandCaptureRationale: 'Bottom-of-funnel queries indicating ready-to-engage prospects.' },
        { id: 'kt6', theme: 'Business legal guidance', intentType: 'informational', keywordExamples: ['how to structure an acquisition', 'corporate governance best practices', 'LLC vs corporation'], demandCaptureRationale: 'Top-of-funnel thought leadership content. Drives organic authority.' },
      ],
      competitorProfiles: [
        { id: 'cp3', name: 'Fisher Phillips', geography: 'National', positioning: 'Labor & employment focus with strong digital presence', channelObservations: 'Active thought leadership blog, Google Ads on employment law terms, LinkedIn publishing.' },
        { id: 'cp4', name: 'Foley & Lardner', geography: 'National', positioning: 'Full-service with strong IP and corporate practice', channelObservations: 'Heavy content marketing, webinar series, minimal paid social.' },
      ],
      audienceModels: [
        { id: 'am4', channel: 'LinkedIn', channelType: 'audience', audienceDefinition: 'CEOs, CFOs, General Counsel at companies with 50-500 employees in Northeast US', targetingCriteria: ['Job titles: CEO, CFO, VP, General Counsel', 'Company size: 50-500 employees', 'Geography: Northeast US', 'Industries: Technology, Manufacturing, Healthcare'], funnelStage: 'consideration', estimatedReachMin: 120_000, estimatedReachMax: 280_000, recommendedCPM: 35, recommendedCTR: 0.5, recommendedCVR: 2.5, reasoning: 'LinkedIn provides the highest-quality B2B targeting by job title and company. Higher CPMs justified by lead quality.' },
        { id: 'am5', channel: 'LinkedIn', channelType: 'audience', audienceDefinition: 'Retargeting: LinkedIn page visitors and content engagers', targetingCriteria: ['Website visitors via Insight Tag', 'Company page followers', 'Video viewers', 'Lead gen form openers'], funnelStage: 'conversion', estimatedReachMin: 2_000, estimatedReachMax: 10_000, recommendedCPM: 45, recommendedCTR: 0.8, recommendedCVR: 6.0, reasoning: 'Small but high-intent professional audiences with strong conversion potential.' },
        { id: 'am6', channel: 'Google Ads', channelType: 'search', audienceDefinition: 'High-intent searchers for corporate legal and M&A advisory services', targetingCriteria: ['Keyword-driven intent', 'Geo: Northeast US', 'In-market: Business services'], funnelStage: 'conversion', estimatedReachMin: 15_000, estimatedReachMax: 40_000, reasoning: 'Search captures demand at the moment of highest purchase intent.' },
      ],
      channelRecommendations: [
        { channel: 'Google Ads', channelType: 'search', role: 'Intent capture', rationale: 'Targeted search campaigns for high-intent legal service queries.', priority: 'high' },
        { channel: 'LinkedIn', channelType: 'audience', role: 'Authority building & lead generation', rationale: 'Best B2B platform for reaching executive decision-makers by job title and company.', priority: 'high' },
        { channel: 'Content/SEO', channelType: 'content', role: 'Organic authority', rationale: 'Long-form content builds trust and captures informational queries.', priority: 'high' },
      ],
      benchmarkAssumptions: [
        { channel: 'Google Ads', channelType: 'search', metric: 'CPC', unit: '$', low: 3.0, high: 12.0, recommended: 5.5, rationale: 'Legal services search CPC in Northeast US. B2B terms command premium CPCs.' },
        { channel: 'Google Ads', channelType: 'search', metric: 'CPL', unit: '$', low: 80, high: 350, recommended: 180, rationale: 'Derived from CPC ÷ CVR. B2B CPL varies widely by service complexity.' },
        { channel: 'LinkedIn', channelType: 'audience', metric: 'CPM', unit: '$', low: 25, high: 55, recommended: 35, rationale: 'LinkedIn CPMs are premium but deliver precise B2B targeting.' },
        { channel: 'LinkedIn', channelType: 'audience', metric: 'CPL', unit: '$', low: 50, high: 250, recommended: 130, rationale: 'Cost per lead via sponsored content to gated thought leadership.' },
        { channel: 'Content/SEO', channelType: 'content', metric: 'Organic Traffic Growth', unit: '%/mo', low: 5, high: 20, recommended: 12, rationale: 'Monthly organic traffic growth after 3-month ramp.' },
      ],
      researchSummary: 'Professional Services in Northeast United States benefits from a dual approach: search-based demand capture via Google Ads and audience-based prospecting via LinkedIn. 3 audience models have been built across channels. LinkedIn provides the highest-quality B2B targeting for decision-makers. All benchmarks are modeled assumptions designed to feed directly into the Growth Model for planning.',
    },
    notes: 'Jennifer Walsh specifically emphasized the "thought leadership" framing.',
  },
];

/* ── Admin Defaults ── */

export const defaultMarketIntelligenceDefaults: MarketIntelligenceDefaults = {
  defaultChannels: ['Google Ads', 'Meta Ads', 'LinkedIn', 'Email', 'Content/SEO', 'TikTok', 'Spotify'],
  defaultBenchmarkProfiles: [
    { channel: 'Google Ads', channelType: 'search', metric: 'CPC', unit: '$', low: 1.0, high: 8.0, recommended: 3.0, rationale: 'Cross-vertical median for search campaigns.' },
    { channel: 'Google Ads', channelType: 'search', metric: 'CTR', unit: '%', low: 2.0, high: 6.0, recommended: 3.5, rationale: 'Blended search CTR benchmark.' },
    { channel: 'Meta Ads', channelType: 'audience', metric: 'CPM', unit: '$', low: 6, high: 20, recommended: 12, rationale: 'Blended prospecting CPM benchmark.' },
    { channel: 'Meta Ads', channelType: 'audience', metric: 'CPA', unit: '$', low: 20, high: 80, recommended: 45, rationale: 'DTC and lead-gen blended benchmark.' },
    { channel: 'LinkedIn', channelType: 'audience', metric: 'CPL', unit: '$', low: 50, high: 250, recommended: 120, rationale: 'B2B sponsored content benchmark.' },
    { channel: 'Email', channelType: 'email', metric: 'Open Rate', unit: '%', low: 18, high: 35, recommended: 24, rationale: 'Cross-industry email open rate.' },
  ],
  researchPromptSettings: {
    tone: 'professional',
    depth: 'standard',
    includeKeywords: true,
    includeCompetitors: true,
    includeAudiences: true,
  },
  outputVisibility: {
    keywordThemes: true,
    competitorProfiles: true,
    audienceModels: true,
    channelRecommendations: true,
    benchmarkAssumptions: true,
    researchSummary: true,
  },
};
