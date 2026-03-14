/**
 * Seed data for Market Intelligence runs and admin defaults.
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
      businessModel: 'Direct-to-Consumer',
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
        { id: 'kt1', theme: 'Sustainable home décor', intentType: 'commercial', keywordExamples: ['eco-friendly home décor', 'sustainable kitchen products', 'organic cotton bedding'], notes: 'Strong search volume with moderate competition.' },
        { id: 'kt2', theme: 'Premium kitchenware', intentType: 'transactional', keywordExamples: ['handmade ceramic bowls', 'artisan cutting boards', 'premium cookware sets'] },
        { id: 'kt3', theme: 'Home styling inspiration', intentType: 'informational', keywordExamples: ['modern kitchen styling ideas', 'minimalist home décor tips', 'sustainable living room ideas'] },
      ],
      competitorProfiles: [
        { id: 'cp1', name: 'Parachute Home', geography: 'US (National)', positioning: 'Premium essentials with California-modern aesthetic', channelObservations: 'Heavy Meta spend, strong email program, growing TikTok presence.', notes: 'Closest positioning overlap.' },
        { id: 'cp2', name: 'West Elm', geography: 'US + International', positioning: 'Modern furniture and décor at accessible luxury pricing', channelObservations: 'Dominant Google Shopping, large Pinterest presence, strong brand search.' },
      ],
      audienceModels: [
        { id: 'am1', channel: 'Meta Ads', audienceDefinition: 'Women 25-45, interests: sustainable living, home décor, Magnolia, West Elm', estimatedReachMin: 8_000_000, estimatedReachMax: 12_000_000, reasoning: 'Core buyer demo with strong engagement signals on lifestyle content.' },
        { id: 'am2', channel: 'Google Ads', audienceDefinition: 'In-market: Home Décor, Custom intent: sustainable + premium keywords', estimatedReachMin: 2_000_000, estimatedReachMax: 5_000_000, reasoning: 'High-intent searchers ready to purchase.' },
      ],
      channelRecommendations: [
        { channel: 'Meta Ads', role: 'Primary prospecting & retargeting', rationale: 'Largest addressable audience with proven creative formats for DTC.', priority: 'high' },
        { channel: 'Google Ads', role: 'Intent capture & Shopping', rationale: 'High-intent traffic with strong ROAS potential after feed optimization.', priority: 'high' },
        { channel: 'Email', role: 'Lifecycle & retention', rationale: 'Underutilized channel with 18% revenue share vs 30% benchmark.', priority: 'high' },
        { channel: 'TikTok', role: 'Awareness & content testing', rationale: 'Growing platform for DTC discovery. Low CPMs for awareness.', priority: 'medium' },
      ],
      benchmarkAssumptions: [
        { channel: 'Meta Ads', metric: 'CPA', low: 35, high: 55, recommended: 42, rationale: 'Based on DTC home goods vertical averages.' },
        { channel: 'Meta Ads', metric: 'ROAS', low: 3.0, high: 5.5, recommended: 4.2, rationale: 'Blended prospecting + retargeting target.' },
        { channel: 'Google Ads', metric: 'ROAS', low: 3.5, high: 7.0, recommended: 5.0, rationale: 'Shopping + brand search blended.' },
        { channel: 'Email', metric: 'Revenue Share', low: 20, high: 35, recommended: 28, rationale: 'Mature DTC email benchmark.' },
      ],
      researchSummary: 'Meridian Commerce operates in a competitive DTC home goods space with strong differentiation on sustainability. The primary opportunity is shifting paid budget from over-indexed Meta retargeting toward balanced prospecting. Google Shopping is underleveraged due to feed quality issues. Email lifecycle automation represents the highest-leverage quick win. TikTok offers a cost-effective awareness channel with potential for viral content around sustainability storytelling.',
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
      businessModel: 'B2B Services',
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
        { id: 'kt4', theme: 'Corporate legal advisory', intentType: 'commercial', keywordExamples: ['corporate attorney near me', 'M&A legal advisor', 'business law firm northeast'] },
        { id: 'kt5', theme: 'IP protection services', intentType: 'transactional', keywordExamples: ['intellectual property attorney', 'patent lawyer for startups', 'trademark registration law firm'] },
        { id: 'kt6', theme: 'Business legal guidance', intentType: 'informational', keywordExamples: ['how to structure an acquisition', 'corporate governance best practices', 'LLC vs corporation pros cons'] },
      ],
      competitorProfiles: [
        { id: 'cp3', name: 'Fisher Phillips', geography: 'National', positioning: 'Labor & employment focus with strong digital presence', channelObservations: 'Active thought leadership blog, Google Ads on employment law terms, LinkedIn publishing.' },
        { id: 'cp4', name: 'Foley & Lardner', geography: 'National', positioning: 'Full-service with strong IP and corporate practice', channelObservations: 'Heavy content marketing, webinar series, minimal paid social.' },
      ],
      audienceModels: [
        { id: 'am3', channel: 'LinkedIn', audienceDefinition: 'CEOs, CFOs, General Counsel at companies with 50-500 employees in Northeast US', estimatedReachMin: 120_000, estimatedReachMax: 280_000, reasoning: 'Decision-makers most likely to engage with thought leadership content.' },
        { id: 'am4', channel: 'Google Ads', audienceDefinition: 'Search intent: corporate attorney, M&A advisor, business law firm + geo modifiers', estimatedReachMin: 15_000, estimatedReachMax: 40_000, reasoning: 'High-intent searches with strong conversion potential.' },
      ],
      channelRecommendations: [
        { channel: 'Content/SEO', role: 'Thought leadership & organic authority', rationale: 'Long-form content builds trust and captures informational queries.', priority: 'high' },
        { channel: 'Google Ads', role: 'Intent capture', rationale: 'Targeted search campaigns for high-intent legal service queries.', priority: 'high' },
        { channel: 'LinkedIn', role: 'Authority building & lead nurture', rationale: 'Best B2B platform for reaching executive decision-makers.', priority: 'medium' },
      ],
      benchmarkAssumptions: [
        { channel: 'Google Ads', metric: 'CPA', low: 150, high: 350, recommended: 220, rationale: 'Legal services vertical has high CPCs but strong LTV.' },
        { channel: 'Google Ads', metric: 'CTR', low: 2.5, high: 5.0, recommended: 3.5, rationale: 'Professional services search benchmark.' },
        { channel: 'LinkedIn', metric: 'CPL', low: 80, high: 200, recommended: 130, rationale: 'Sponsored content to gated whitepapers.' },
        { channel: 'Content/SEO', metric: 'Organic Traffic Growth', low: 15, high: 40, recommended: 25, rationale: 'Monthly % growth after 3-month ramp.' },
      ],
      researchSummary: 'Atlas Legal Group has strong expertise but minimal digital presence. The primary opportunity is establishing thought leadership through content marketing to capture informational search traffic, supported by targeted Google Ads for high-intent queries. LinkedIn provides an ideal platform for authority building among the target executive audience. The firm should position digital efforts as "thought leadership" rather than "marketing" to maintain partner buy-in.',
    },
    notes: 'Jennifer Walsh specifically emphasized the "thought leadership" framing. Align all research outputs with this positioning.',
  },
];

/* ── Admin Defaults ── */

export const defaultMarketIntelligenceDefaults: MarketIntelligenceDefaults = {
  defaultChannels: ['Google Ads', 'Meta Ads', 'LinkedIn', 'Email', 'Content/SEO', 'TikTok'],
  defaultBenchmarkProfiles: [
    { channel: 'Google Ads', metric: 'CPA', low: 30, high: 200, recommended: 80, rationale: 'Cross-vertical median for search campaigns.' },
    { channel: 'Google Ads', metric: 'ROAS', low: 2.0, high: 8.0, recommended: 4.0, rationale: 'Blended search + shopping benchmark.' },
    { channel: 'Meta Ads', metric: 'CPA', low: 20, high: 80, recommended: 45, rationale: 'DTC and lead-gen blended benchmark.' },
    { channel: 'Meta Ads', metric: 'ROAS', low: 2.5, high: 6.0, recommended: 3.8, rationale: 'Prospecting + retargeting blended.' },
    { channel: 'LinkedIn', metric: 'CPL', low: 50, high: 250, recommended: 120, rationale: 'B2B sponsored content benchmark.' },
    { channel: 'Email', metric: 'Open Rate', low: 18, high: 35, recommended: 24, rationale: 'Cross-industry email open rate.' },
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
