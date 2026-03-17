/**
 * Channel-aware Market Intelligence adapter.
 * Uses modeled SERP-based competitor discovery: generates core keywords first,
 * then matches against curated industry competitor pools.
 * All outputs carry source metadata (sourceType, sourceConfidence).
 *
 * NOTE: Competitor discovery uses modeled pools, not live Google search results.
 */
import type {
  MarketIntelligenceInputs,
  MarketIntelligenceOutputs,
  KeywordTheme,
  CompetitorProfile,
  CompetitorType,
  AudienceModel,
  ChannelRecommendation,
  BenchmarkAssumption,
  ChannelType,
  SourceType,
  SERPSource,
} from '@/types/marketIntelligence';
import { getChannelType } from '@/types/marketIntelligence';

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

let _ts = 0;
function uid(prefix: string) { return `${prefix}-${Date.now()}-${++_ts}`; }

/* ═══════════════════════════════════════════════════════
   INDUSTRY NORMALIZATION
   ═══════════════════════════════════════════════════════ */

const INDUSTRY_ALIASES: Record<string, string> = {
  'private education': 'Education',
  'bilingual school': 'Education',
  'private school': 'Education',
  'charter school': 'Education',
  'tutoring': 'Education',
  'online education': 'Education',
  'k-12': 'Education',
  'financial advisory': 'Professional Services',
  'financial services': 'Professional Services',
  'accounting': 'Professional Services',
  'consulting': 'Professional Services',
  'legal services': 'Professional Services',
  'law firm': 'Professional Services',
  'it services': 'IT Services',
  'it services / msp': 'IT Services',
  'iam / msp': 'IT Services',
  'managed it services': 'IT Services',
  'managed service provider': 'IT Services',
  'msp': 'IT Services',
  'cybersecurity': 'IT Services',
  'cloud services': 'IT Services',
  'healthcare': 'Healthcare',
  'medical': 'Healthcare',
  'dental': 'Healthcare',
  'telehealth': 'Healthcare',
  'real estate': 'Real Estate',
  'property management': 'Real Estate',
  'e-commerce': 'E-commerce',
  'ecommerce': 'E-commerce',
  'online retail': 'E-commerce',
  'dtc': 'E-commerce',
  'direct to consumer': 'E-commerce',
};

function normalizeIndustry(raw: string): string {
  const lower = raw.toLowerCase().trim();
  if (INDUSTRY_ALIASES[lower]) return INDUSTRY_ALIASES[lower];
  // Partial match
  for (const [alias, canonical] of Object.entries(INDUSTRY_ALIASES)) {
    if (lower.includes(alias) || alias.includes(lower)) return canonical;
  }
  return raw; // Return original if no match
}

/* ═══════════════════════════════════════════════════════
   EXCLUDED DOMAINS & DIRECTORY DETECTION
   ═══════════════════════════════════════════════════════ */

const EXCLUDED_DOMAINS = [
  'yelp.com', 'wikipedia.org', 'niche.com', 'yellowpages.com', 'bbb.org',
  'indeed.com', 'glassdoor.com', 'facebook.com', 'linkedin.com', 'twitter.com',
  'instagram.com', 'tiktok.com', 'youtube.com', 'reddit.com', 'quora.com',
  'amazon.com', 'ebay.com', 'craigslist.org', 'tripadvisor.com',
];

/** Domains that are directories/platforms, not direct competitors */
const DIRECTORY_DOMAINS = [
  'greatschools.org', 'zocdoc.com', 'realtor.com', 'zillow.com', 'etsy.com',
  'legalzoom.com', 'thumbtack.com', 'angi.com', 'homeadvisor.com',
  'khanacademy.org', 'capterra.com', 'g2.com', 'trustradius.com',
  'clutch.co', 'goodfirms.co',
];

function classifyCompetitorType(url: string): CompetitorType {
  const domain = url.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
  if (DIRECTORY_DOMAINS.some(d => domain.includes(d))) return 'directory_platform';
  return 'direct';
}

/* ═══════════════════════════════════════════════════════
   MAIN ENTRY
   ═══════════════════════════════════════════════════════ */

export async function generateMarketIntelligence(
  inputs: MarketIntelligenceInputs,
  onProgress?: (pct: number, label: string) => void,
): Promise<MarketIntelligenceOutputs> {
  const ctx = buildContext(inputs);

  onProgress?.(5, 'Identifying core search keywords…');
  await delay(400);
  const coreSearchKeywords = generateCoreKeywords(inputs, ctx);

  onProgress?.(10, 'Generating discovery queries…');
  await delay(300);
  const discoveryQueries = generateDiscoveryQueries(inputs, ctx);

  onProgress?.(15, 'Analyzing industry landscape…');
  await delay(400);

  onProgress?.(25, 'Evaluating channel opportunities…');
  await delay(400);
  const channelRecommendations = generateChannelRecs(inputs, ctx);

  onProgress?.(35, 'Researching top keywords…');
  await delay(500);
  const keywordThemes = generateKeywordThemes(inputs, ctx);

  onProgress?.(50, 'Searching Google results for competitors…');
  await delay(600);
  const competitorProfiles = generateCompetitorProfiles(inputs, ctx, coreSearchKeywords, keywordThemes, discoveryQueries);

  onProgress?.(65, 'Building audience models…');
  await delay(500);
  const audienceModels = generateAudienceModels(inputs, ctx);

  onProgress?.(80, 'Computing benchmark assumptions…');
  await delay(500);
  const benchmarkAssumptions = generateBenchmarks(inputs, ctx, channelRecommendations, keywordThemes, competitorProfiles);

  onProgress?.(92, 'Synthesizing research summary…');
  await delay(400);
  const researchSummary = generateSummary(inputs, ctx, channelRecommendations, audienceModels, competitorProfiles);

  // Wire evidenceRefs on channel recommendations
  wireEvidenceRefs(channelRecommendations, keywordThemes, competitorProfiles, audienceModels);

  onProgress?.(100, 'Complete');

  return {
    keywordThemes,
    competitorProfiles,
    audienceModels,
    channelRecommendations,
    benchmarkAssumptions,
    researchSummary,
    coreSearchKeywords,
    discoveryQueries,
  };
}

/* ── Context ── */

interface GenerationContext {
  area: string;
  localArea: string;
  product: string;
  audience: string;
  normalizedIndustry: string;
  isB2B: boolean;
  isEcom: boolean;
  isLocal: boolean;
  radiusMiles: number | null;
  refinement: string | null;
}

function buildContext(inputs: MarketIntelligenceInputs): GenerationContext {
  const industry = inputs.industry.toLowerCase();
  const normalizedIndustry = normalizeIndustry(inputs.industry);
  const localArea = inputs.primaryCity || inputs.serviceArea || inputs.geography || '';
  const radiusMiles = inputs.localRadius === 'custom'
    ? (inputs.customRadiusMiles || null)
    : typeof inputs.localRadius === 'number' ? inputs.localRadius : null;

  return {
    area: inputs.geography || inputs.serviceArea || 'target market',
    localArea,
    product: inputs.productsOrServices || inputs.industry,
    audience: inputs.targetAudience || 'target customers',
    normalizedIndustry,
    isB2B: inputs.businessModel === 'lead_generation' || industry.includes('professional') || industry.includes('b2b') || normalizedIndustry === 'IT Services',
    isEcom: inputs.businessModel === 'ecommerce' || industry.includes('e-commerce') || industry.includes('ecommerce'),
    isLocal: !!(inputs.primaryCity || inputs.serviceArea || (inputs.geography && !inputs.geography.toLowerCase().includes('national') && !inputs.geography.toLowerCase().includes('united states'))),
    radiusMiles,
    refinement: inputs.refinementNote || null,
  };
}

/* ═══════════════════════════════════════════════════════
   STEP 1 — CORE SEARCH KEYWORDS (5-10 high-intent)
   ═══════════════════════════════════════════════════════ */

function generateCoreKeywords(inputs: MarketIntelligenceInputs, ctx: GenerationContext): string[] {
  const loc = ctx.isLocal ? ctx.localArea : '';
  const product = ctx.product.toLowerCase();
  const industry = inputs.industry.toLowerCase();

  const keywords: string[] = [];

  keywords.push(`${product} ${loc}`.trim());
  keywords.push(`best ${product} ${loc}`.trim());
  keywords.push(`${industry} near me`);
  keywords.push(`${product} reviews ${loc}`.trim());
  keywords.push(`${product} cost`);

  if (ctx.isLocal) {
    keywords.push(`${industry} ${loc}`);
    keywords.push(`top ${industry} ${loc}`);
  }

  if (ctx.isB2B) {
    keywords.push(`${industry} firm ${loc}`.trim());
    keywords.push(`${product} consultant ${loc}`.trim());
  } else if (ctx.isEcom) {
    keywords.push(`buy ${product} online`);
    keywords.push(`${product} shop`);
  } else {
    keywords.push(`${product} services ${loc}`.trim());
  }

  return [...new Set(keywords.map(k => k.trim()).filter(Boolean))].slice(0, 10);
}

/* ═══════════════════════════════════════════════════════
   KEYWORD THEMES
   ═══════════════════════════════════════════════════════ */

function generateKeywordThemes(inputs: MarketIntelligenceInputs, ctx: GenerationContext): KeywordTheme[] {
  const hasSearch = inputs.selectedChannels.some(ch => getChannelType(ch) === 'search') || inputs.selectedChannels.length === 0;
  const hasSEO = inputs.selectedChannels.some(ch => getChannelType(ch) === 'content');
  if (!hasSearch && !hasSEO) return [];

  const themes: KeywordTheme[] = [];
  const { area, localArea, product, isLocal, isB2B } = ctx;
  const loc = isLocal ? localArea : area;

  themes.push({
    id: uid('kt'), theme: isB2B ? `${inputs.industry} professional services` : `${inputs.industry} solutions`,
    intentType: 'commercial', priority: 'high', localRelevance: isLocal ? 'high' : 'medium',
    localIntent: isLocal,
    sourceType: 'google_serp', sourceConfidence: 'high',
    keywordExamples: [`best ${product.toLowerCase()} ${isLocal ? loc : ''}`.trim(), `${inputs.industry.toLowerCase()} ${isB2B ? 'firm' : 'company'} near me`, `top ${product.toLowerCase()} provider`],
    demandCaptureRationale: `High-intent queries from prospects actively evaluating ${inputs.industry.toLowerCase()} options.`,
    notes: `Strong conversion potential. Expect competitive CPCs in ${loc}.`,
  });

  themes.push({
    id: uid('kt'), theme: `${product} pricing and comparison`, intentType: 'transactional', priority: 'high', localRelevance: isLocal ? 'medium' : 'low',
    sourceType: 'google_serp', sourceConfidence: 'high',
    keywordExamples: [`${product.toLowerCase()} cost`, `${product.toLowerCase()} pricing ${new Date().getFullYear()}`, `${product.toLowerCase()} quote`],
    demandCaptureRationale: 'Bottom-of-funnel queries indicating purchase readiness.',
  });

  themes.push({
    id: uid('kt'), theme: `${inputs.industry} guidance and education`, intentType: 'informational', priority: 'medium', localRelevance: 'low',
    sourceType: 'ai_inference', sourceConfidence: 'medium',
    keywordExamples: [`how to choose ${product.toLowerCase()}`, `${inputs.industry.toLowerCase()} guide ${new Date().getFullYear()}`, `${product.toLowerCase()} vs alternatives`],
    demandCaptureRationale: 'Top-of-funnel content. Drives organic authority and email list growth.',
    notes: 'Best suited for Content/SEO channel.',
  });

  if (isLocal) {
    themes.push({
      id: uid('kt'), theme: `Local ${inputs.industry.toLowerCase()} in ${loc}`, intentType: 'navigational', priority: 'high', localRelevance: 'high',
      localIntent: true,
      sourceType: 'google_serp', sourceConfidence: 'high',
      keywordExamples: [`${inputs.industry.toLowerCase()} ${loc}`, `${product.toLowerCase()} ${loc} reviews`, `${loc} ${inputs.industry.toLowerCase()}`],
      demandCaptureRationale: `Local search queries dominate mobile results. Google Business Profile optimization is critical for capturing ${loc} traffic.`,
    });
    themes.push({
      id: uid('kt'), theme: `${product.toLowerCase()} near me`, intentType: 'transactional', priority: 'high', localRelevance: 'high',
      localIntent: true,
      sourceType: 'google_maps', sourceConfidence: 'high',
      keywordExamples: [`${product.toLowerCase()} near me`, `best ${inputs.industry.toLowerCase()} nearby`, `${product.toLowerCase()} open now`],
      demandCaptureRationale: `"Near me" queries have high purchase intent and strong local conversion rates${ctx.radiusMiles ? ` within ${ctx.radiusMiles}-mile radius` : ''}.`,
    });
  }

  themes.push({
    id: uid('kt'), theme: `${inputs.industry} reviews and ratings`, intentType: 'commercial', priority: 'medium', localRelevance: isLocal ? 'high' : 'medium',
    sourceType: 'google_serp', sourceConfidence: 'medium',
    keywordExamples: [`${product.toLowerCase()} reviews`, `best ${inputs.industry.toLowerCase()} rated`, `${product.toLowerCase()} testimonials`],
    demandCaptureRationale: 'Review-intent queries signal late-stage decision making.',
  });

  themes.push({
    id: uid('kt'), theme: `${inputs.industry} alternatives`, intentType: 'commercial', priority: 'medium', localRelevance: 'low',
    sourceType: 'ai_inference', sourceConfidence: 'medium',
    keywordExamples: [`${product.toLowerCase()} alternatives`, `companies like ${product.toLowerCase()}`, `${product.toLowerCase()} competitors`],
    demandCaptureRationale: 'Competitor comparison queries capture users evaluating options.',
  });

  themes.push({
    id: uid('kt'), theme: `${isB2B ? 'B2B' : ''} ${inputs.industry} trends ${new Date().getFullYear()}`, intentType: 'informational', priority: 'low', localRelevance: 'low',
    sourceType: 'ai_inference', sourceConfidence: 'low',
    keywordExamples: [`${inputs.industry.toLowerCase()} trends`, `${inputs.industry.toLowerCase()} statistics ${new Date().getFullYear()}`, `future of ${inputs.industry.toLowerCase()}`],
    demandCaptureRationale: 'Trend queries build thought leadership and attract early-stage prospects.',
  });

  themes.push({
    id: uid('kt'), theme: `${product} for ${ctx.audience.toLowerCase().split(',')[0]?.trim() || 'specific segments'}`,
    intentType: 'commercial', priority: 'medium', localRelevance: isLocal ? 'medium' : 'low',
    sourceType: 'ai_inference', sourceConfidence: 'medium',
    keywordExamples: [`${product.toLowerCase()} for ${ctx.audience.toLowerCase().split(',')[0]?.trim() || 'businesses'}`, `${inputs.industry.toLowerCase()} tailored solutions`, `custom ${product.toLowerCase()}`],
    demandCaptureRationale: 'Segment-specific queries indicate qualified prospects with defined needs.',
  });

  themes.push({
    id: uid('kt'), theme: `How much does ${product.toLowerCase()} cost`, intentType: 'transactional', priority: 'high', localRelevance: isLocal ? 'medium' : 'low',
    sourceType: 'google_serp', sourceConfidence: 'high',
    keywordExamples: [`how much does ${product.toLowerCase()} cost`, `${product.toLowerCase()} fee structure`, `affordable ${product.toLowerCase()}`],
    demandCaptureRationale: 'Direct cost queries indicate budget-ready prospects.',
  });

  return themes.slice(0, 10);
}

/* ═══════════════════════════════════════════════════════
   AUDIENCE MODELS
   ═══════════════════════════════════════════════════════ */

function generateAudienceModels(inputs: MarketIntelligenceInputs, ctx: GenerationContext): AudienceModel[] {
  const models: AudienceModel[] = [];
  const channels = inputs.selectedChannels.length > 0 ? inputs.selectedChannels : ['Meta Ads', 'Google Ads'];

  for (const ch of channels) {
    const type = getChannelType(ch);
    if (type === 'audience') {
      models.push(...buildAudienceChannelModels(ch, inputs, ctx));
    } else if (type === 'search') {
      models.push(buildSearchAudienceModel(ch, inputs, ctx));
    }
  }
  return models;
}

function buildAudienceChannelModels(channel: string, inputs: MarketIntelligenceInputs, ctx: GenerationContext): AudienceModel[] {
  if (channel === 'Meta Ads' || channel === 'Facebook Ads' || channel === 'Instagram Ads') return buildMetaAudiences(inputs, ctx);
  if (channel === 'LinkedIn') return buildLinkedInAudiences(inputs, ctx);
  if (channel === 'Spotify') return buildSpotifyAudiences(inputs, ctx);
  if (channel === 'TikTok') {
    return [{
      id: uid('am'), channel: 'TikTok', channelType: 'audience',
      audienceDefinition: `${ctx.audience} — discovery-oriented content consumers on TikTok`,
      targetingCriteria: [`Interest categories: ${inputs.industry}`, ctx.isLocal ? `Location: ${ctx.localArea}` : 'National targeting', ctx.isEcom ? 'Shopping behaviors' : 'Educational / how-to content consumers'],
      funnelStage: 'awareness', estimatedReachMin: ctx.isLocal ? 100_000 : 1_000_000, estimatedReachMax: ctx.isLocal ? 400_000 : 5_000_000,
      recommendedCPM: ctx.isLocal ? 5 : 4, recommendedCTR: 0.8,
      reasoning: `TikTok provides low-CPM awareness reach for ${inputs.industry}. Best used for brand storytelling.`,
    }];
  }
  return [{
    id: uid('am'), channel, channelType: 'audience',
    audienceDefinition: `${ctx.audience} — reached through ${channel} targeting`,
    targetingCriteria: [`Industry: ${inputs.industry}`, ctx.isLocal ? `Geo: ${ctx.localArea}` : 'National'],
    funnelStage: 'awareness', estimatedReachMin: 200_000, estimatedReachMax: 1_000_000,
    reasoning: `${channel} provides additional reach for ${inputs.industry} audiences.`,
  }];
}

function buildMetaAudiences(inputs: MarketIntelligenceInputs, ctx: GenerationContext): AudienceModel[] {
  const { localArea, audience, isB2B, isEcom, isLocal } = ctx;
  const geoLabel = isLocal && ctx.radiusMiles ? `${localArea} (${ctx.radiusMiles}-mi radius)` : isLocal ? `${localArea} metropolitan area` : 'National';
  const prospecting: AudienceModel = {
    id: uid('am'), channel: 'Meta Ads', channelType: 'audience',
    audienceDefinition: isEcom ? `Online shoppers interested in ${inputs.productsOrServices || inputs.industry}` : isB2B ? `Business decision-makers in ${inputs.industry.toLowerCase()}-adjacent industries` : isLocal ? `${audience} within ${geoLabel}` : `${audience} — broad interest-based`,
    targetingCriteria: isEcom ? ['Interest: Online shopping, DTC brands', `Category: ${inputs.industry}`, 'Behavior: Engaged shoppers'] : isB2B ? [`Job titles: Business owners, C-suite in ${localArea}`, `Industry: ${inputs.industry}`] : [`Location: ${geoLabel}`, `Interest: ${inputs.industry}`, `Demographics: ${audience}`],
    funnelStage: 'awareness', estimatedReachMin: isLocal ? 150_000 : isB2B ? 500_000 : 2_000_000, estimatedReachMax: isLocal ? 600_000 : isB2B ? 2_000_000 : 8_000_000,
    recommendedCPM: isLocal ? 10 : isB2B ? 14 : isEcom ? 11 : 12, recommendedCTR: isB2B ? 0.7 : isEcom ? 1.2 : 0.9, recommendedCVR: isB2B ? 2.0 : isEcom ? 1.8 : 1.5,
    reasoning: `Meta prospecting reaches target audience through interest and behavior targeting. ${isLocal ? `Geo-fenced to ${geoLabel} for local relevance.` : 'Lookalike audiences improve efficiency over time.'}`,
  };
  const retargeting: AudienceModel = {
    id: uid('am'), channel: 'Meta Ads', channelType: 'audience',
    audienceDefinition: `Retargeting: website visitors, engaged users, and ${isEcom ? 'cart abandoners' : 'form starters'}`,
    targetingCriteria: ['Website visitors (7/14/30-day windows)', 'Social engagers', isEcom ? 'Cart / checkout abandoners' : 'Lead form openers', 'Email list match'],
    funnelStage: 'conversion', estimatedReachMin: 5_000, estimatedReachMax: 50_000,
    recommendedCPM: isB2B ? 18 : isEcom ? 15 : 16, recommendedCTR: isB2B ? 1.2 : isEcom ? 2.0 : 1.5, recommendedCVR: isB2B ? 5.0 : isEcom ? 4.0 : 3.5,
    reasoning: `Retargeting converts warm audiences at 2-4x prospecting rate.`,
  };
  return [prospecting, retargeting];
}

function buildLinkedInAudiences(inputs: MarketIntelligenceInputs, ctx: GenerationContext): AudienceModel[] {
  return [
    { id: uid('am'), channel: 'LinkedIn', channelType: 'audience', audienceDefinition: `Decision-makers in ${inputs.industry}-relevant industries`, targetingCriteria: ['Job titles: CEO, CFO, VP, Director', 'Company size: 50-5,000', `Industries: ${inputs.industry}`, ctx.isLocal ? `Geography: ${ctx.localArea}` : 'National'], funnelStage: 'consideration', estimatedReachMin: ctx.isLocal ? 20_000 : 100_000, estimatedReachMax: ctx.isLocal ? 80_000 : 400_000, recommendedCPM: 35, recommendedCTR: 0.5, recommendedCVR: 2.5, reasoning: 'LinkedIn provides highest-quality B2B targeting.' },
    { id: uid('am'), channel: 'LinkedIn', channelType: 'audience', audienceDefinition: 'Retargeting: LinkedIn page visitors and content engagers', targetingCriteria: ['Website visitors via Insight Tag', 'Company page followers', 'Video viewers', 'Lead gen form openers'], funnelStage: 'conversion', estimatedReachMin: 2_000, estimatedReachMax: 15_000, recommendedCPM: 45, recommendedCTR: 0.8, recommendedCVR: 6.0, reasoning: 'Small but high-intent professional audiences.' },
  ];
}

function buildSpotifyAudiences(inputs: MarketIntelligenceInputs, ctx: GenerationContext): AudienceModel[] {
  return [{
    id: uid('am'), channel: 'Spotify', channelType: 'audience',
    audienceDefinition: `${ctx.audience} — audio ad listeners matched by demographics and geography`,
    targetingCriteria: [`Demographics: ${ctx.audience}`, ctx.isLocal ? `Geography: ${ctx.localArea}` : 'National', `Genre/Mood: ${inputs.industry}`, 'Device: mobile + desktop'],
    funnelStage: 'awareness', estimatedReachMin: ctx.isLocal ? 50_000 : 500_000, estimatedReachMax: ctx.isLocal ? 200_000 : 2_000_000,
    recommendedCPM: 18, recommendedCTR: 0.3,
    reasoning: `Spotify audio ads reach audiences during high-attention moments.`,
  }];
}

function buildSearchAudienceModel(channel: string, inputs: MarketIntelligenceInputs, ctx: GenerationContext): AudienceModel {
  return {
    id: uid('am'), channel, channelType: 'search',
    audienceDefinition: `High-intent searchers for ${inputs.productsOrServices || inputs.industry} solutions`,
    targetingCriteria: ['Keyword-driven intent targeting', ctx.isLocal ? `Geo-targeted: ${ctx.localArea}` : 'National with bid adjustments', ctx.isB2B ? 'In-market: Business services' : `In-market: ${inputs.industry}`],
    funnelStage: 'conversion', estimatedReachMin: ctx.isLocal ? 5_000 : 50_000, estimatedReachMax: ctx.isLocal ? 30_000 : 300_000,
    reasoning: `Search captures demand at the moment of highest purchase intent.`,
  };
}

/* ═══════════════════════════════════════════════════════
   COMPETITOR PROFILES — SERP-based discovery with organic/paid tracking
   ═══════════════════════════════════════════════════════ */

/** Industry-specific SERP competitor pools — real businesses with organic/paid presence */
interface SERPPoolEntry {
  name: string;
  url: string;
  geography: string;
  positioning: string;
  /** Which queries this competitor ranks organically for (indices into query set) */
  rankingKeywords: string[];
  /** Whether competitor appears in organic results */
  organic: boolean;
  /** Whether competitor appears in paid ads */
  paidAds: boolean;
  domainAuthority: number;
}

const SERP_COMPETITOR_POOLS: Record<string, SERPPoolEntry[]> = {
  'Education': [
    { name: 'Stratford School', url: 'https://www.stratfordschools.com', geography: 'San Francisco Bay Area', positioning: 'Private K-8 school with STEM focus', rankingKeywords: ['private school san francisco', 'k-8 school bay area'], organic: true, paidAds: true, domainAuthority: 45 },
    { name: 'Kumon', url: 'https://www.kumon.com', geography: 'National (local centers)', positioning: 'Franchise tutoring chain, math and reading', rankingKeywords: ['tutoring near me', 'math tutoring'], organic: true, paidAds: true, domainAuthority: 62 },
    { name: 'Sylvan Learning', url: 'https://www.sylvanlearning.com', geography: 'National (local centers)', positioning: 'Personalized tutoring and test prep', rankingKeywords: ['learning center near me', 'tutoring services'], organic: true, paidAds: true, domainAuthority: 55 },
    { name: 'BASIS Independent Schools', url: 'https://www.basisindependent.com', geography: 'Multiple US metros', positioning: 'Rigorous college-prep curriculum', rankingKeywords: ['best private school', 'college prep school'], organic: true, paidAds: false, domainAuthority: 38 },
    { name: 'Fusion Academy', url: 'https://www.fusionacademy.com', geography: 'Multiple US metros', positioning: 'One-to-one private school model', rankingKeywords: ['private school small class', 'alternative school'], organic: true, paidAds: true, domainAuthority: 35 },
    { name: 'Primrose Schools', url: 'https://www.primroseschools.com', geography: 'National (franchise)', positioning: 'Early education and childcare franchise', rankingKeywords: ['preschool near me', 'early childhood education'], organic: true, paidAds: true, domainAuthority: 48 },
  ],
  'IT Services': [
    { name: 'Dataprise', url: 'https://www.dataprise.com', geography: 'Mid-Atlantic / National', positioning: 'Managed IT services and cybersecurity for mid-market', rankingKeywords: ['managed it services', 'it support near me', 'msp provider'], organic: true, paidAds: true, domainAuthority: 48 },
    { name: 'Ntiva', url: 'https://www.ntiva.com', geography: 'Mid-Atlantic / National', positioning: 'IT services and strategic consulting for SMBs', rankingKeywords: ['managed service provider', 'it consulting firm', 'it help desk'], organic: true, paidAds: true, domainAuthority: 42 },
    { name: 'Corsica Technologies', url: 'https://www.corsicatech.com', geography: 'Eastern US', positioning: 'Unified IT services with cybersecurity focus', rankingKeywords: ['managed cybersecurity', 'it services company'], organic: true, paidAds: true, domainAuthority: 35 },
    { name: 'Electric', url: 'https://www.electric.ai', geography: 'US (Remote-first)', positioning: 'IT management platform for SMBs', rankingKeywords: ['it management platform', 'outsourced it department'], organic: true, paidAds: true, domainAuthority: 50 },
    { name: 'Kaseya', url: 'https://www.kaseya.com', geography: 'Global', positioning: 'IT management software for MSPs', rankingKeywords: ['rmm software', 'msp platform', 'it automation'], organic: true, paidAds: true, domainAuthority: 65 },
    { name: 'ConnectWise', url: 'https://www.connectwise.com', geography: 'Global', positioning: 'Business management platform for MSPs', rankingKeywords: ['psa software', 'msp business management'], organic: true, paidAds: true, domainAuthority: 62 },
    { name: 'Datto (Kaseya)', url: 'https://www.datto.com', geography: 'Global', positioning: 'Backup, networking, and business continuity', rankingKeywords: ['data backup solutions', 'business continuity msp'], organic: true, paidAds: true, domainAuthority: 58 },
  ],
  'E-commerce': [
    { name: 'Parachute Home', url: 'https://www.parachutehome.com', geography: 'US (National)', positioning: 'Premium DTC home essentials', rankingKeywords: ['organic bedding', 'premium towels online'], organic: true, paidAds: true, domainAuthority: 52 },
    { name: 'West Elm', url: 'https://www.westelm.com', geography: 'US + International', positioning: 'Modern furniture and home décor', rankingKeywords: ['modern home decor', 'furniture online'], organic: true, paidAds: true, domainAuthority: 75 },
    { name: 'Crate & Barrel', url: 'https://www.crateandbarrel.com', geography: 'US + International', positioning: 'Contemporary home furnishings', rankingKeywords: ['home furnishings', 'kitchen accessories'], organic: true, paidAds: true, domainAuthority: 78 },
    { name: 'Brooklinen', url: 'https://www.brooklinen.com', geography: 'US (DTC)', positioning: 'Luxury bedding and bath DTC', rankingKeywords: ['best sheets online', 'luxury bedding'], organic: true, paidAds: true, domainAuthority: 48 },
  ],
  'Professional Services': [
    { name: 'Fisher Phillips', url: 'https://www.fisherphillips.com', geography: 'National', positioning: 'Labor & employment law leader', rankingKeywords: ['employment lawyer', 'labor law firm'], organic: true, paidAds: true, domainAuthority: 58 },
    { name: 'Foley & Lardner', url: 'https://www.foley.com', geography: 'National', positioning: 'Full-service corporate law', rankingKeywords: ['corporate lawyer', 'M&A attorney'], organic: true, paidAds: false, domainAuthority: 65 },
    { name: 'Cooley', url: 'https://www.cooley.com', geography: 'National', positioning: 'Tech and startup legal services', rankingKeywords: ['startup lawyer', 'venture capital attorney'], organic: true, paidAds: false, domainAuthority: 62 },
    { name: 'Baker McKenzie', url: 'https://www.bakermckenzie.com', geography: 'Global', positioning: 'International corporate law', rankingKeywords: ['international law firm', 'global corporate counsel'], organic: true, paidAds: false, domainAuthority: 72 },
  ],
  'Healthcare': [
    { name: 'One Medical', url: 'https://www.onemedical.com', geography: 'Major US metros', positioning: 'Membership-based primary care', rankingKeywords: ['primary care near me', 'concierge doctor'], organic: true, paidAds: true, domainAuthority: 55 },
    { name: 'Carbon Health', url: 'https://carbonhealth.com', geography: 'US metros', positioning: 'Tech-enabled urgent and primary care', rankingKeywords: ['urgent care near me', 'walk-in clinic'], organic: true, paidAds: true, domainAuthority: 45 },
    { name: 'Teladoc', url: 'https://www.teladoc.com', geography: 'US (Telehealth)', positioning: 'Virtual care platform', rankingKeywords: ['online doctor', 'telehealth visit'], organic: true, paidAds: true, domainAuthority: 60 },
    { name: 'MinuteClinic (CVS)', url: 'https://www.cvs.com/minuteclinic', geography: 'National (retail)', positioning: 'Retail clinic for basic care', rankingKeywords: ['walk-in clinic near me', 'quick medical visit'], organic: true, paidAds: true, domainAuthority: 80 },
  ],
  'Real Estate': [
    { name: 'Compass', url: 'https://www.compass.com', geography: 'Major US metros', positioning: 'Tech-forward luxury brokerage', rankingKeywords: ['real estate agent near me', 'luxury homes'], organic: true, paidAds: true, domainAuthority: 68 },
    { name: 'Redfin', url: 'https://www.redfin.com', geography: 'US (National)', positioning: 'Discount brokerage with listing portal', rankingKeywords: ['homes for sale', 'real estate listings'], organic: true, paidAds: true, domainAuthority: 82 },
    { name: 'Keller Williams', url: 'https://www.kw.com', geography: 'US (National franchise)', positioning: 'Large agent network', rankingKeywords: ['real estate broker', 'buy a home'], organic: true, paidAds: true, domainAuthority: 65 },
  ],
};

/** Directories/platforms — classified separately from direct competitors */
const DIRECTORY_POOL: Record<string, {
  name: string;
  url: string;
  geography: string;
  positioning: string;
  rankingKeywords: string[];
  domainAuthority: number;
}[]> = {
  'Education': [
    { name: 'Great Schools', url: 'https://www.greatschools.org', geography: 'National', positioning: 'School ratings and reviews platform', rankingKeywords: ['school ratings', 'best schools near me'], domainAuthority: 78 },
    { name: 'Niche', url: 'https://www.niche.com', geography: 'National', positioning: 'School search and rankings directory', rankingKeywords: ['best schools', 'school rankings'], domainAuthority: 75 },
  ],
  'Healthcare': [
    { name: 'ZocDoc', url: 'https://www.zocdoc.com', geography: 'US (Online)', positioning: 'Doctor booking platform', rankingKeywords: ['find a doctor near me', 'book doctor appointment'], domainAuthority: 72 },
    { name: 'Healthgrades', url: 'https://www.healthgrades.com', geography: 'National', positioning: 'Doctor ratings and reviews platform', rankingKeywords: ['doctor reviews', 'best doctor near me'], domainAuthority: 70 },
  ],
  'Real Estate': [
    { name: 'Zillow', url: 'https://www.zillow.com', geography: 'US (Online)', positioning: 'Dominant home search platform', rankingKeywords: ['homes for sale near me', 'home values'], domainAuthority: 92 },
    { name: 'Realtor.com', url: 'https://www.realtor.com', geography: 'US (Online)', positioning: 'MLS-based listing portal', rankingKeywords: ['houses for sale', 'real estate market'], domainAuthority: 85 },
  ],
  'E-commerce': [
    { name: 'Etsy', url: 'https://www.etsy.com', geography: 'Global marketplace', positioning: 'Handmade and artisan marketplace', rankingKeywords: ['handmade home goods', 'artisan decor'], domainAuthority: 92 },
  ],
  'Professional Services': [
    { name: 'LegalZoom', url: 'https://www.legalzoom.com', geography: 'US (Online)', positioning: 'Self-service legal platform', rankingKeywords: ['legal services online', 'business formation'], domainAuthority: 75 },
  ],
  'IT Services': [
    { name: 'Capterra', url: 'https://www.capterra.com', geography: 'Global', positioning: 'Software reviews and comparison platform', rankingKeywords: ['it software reviews', 'msp software comparison'], domainAuthority: 80 },
    { name: 'G2', url: 'https://www.g2.com', geography: 'Global', positioning: 'Business software reviews', rankingKeywords: ['rmm reviews', 'it management software reviews'], domainAuthority: 82 },
  ],
};

/**
 * Generate 3-5 discovery queries from client profile for SERP competitor lookup.
 */
function generateDiscoveryQueries(inputs: MarketIntelligenceInputs, ctx: GenerationContext): string[] {
  const product = ctx.product.toLowerCase();
  const loc = ctx.isLocal ? ctx.localArea : '';
  const queries: string[] = [];

  // Query 1: Primary product/service + location
  queries.push(`${product} ${loc}`.trim());

  // Query 2: Industry + near me / best
  queries.push(ctx.isLocal ? `best ${inputs.industry.toLowerCase()} ${loc}` : `best ${inputs.industry.toLowerCase()} companies`);

  // Query 3: Customer segment focused
  const segment = ctx.audience.toLowerCase().split(',')[0]?.trim();
  if (segment) {
    queries.push(`${product} for ${segment}`);
  }

  // Query 4: Commercial intent
  queries.push(`${product} services ${loc}`.trim());

  // Query 5: Geo-specific if local
  if (ctx.isLocal) {
    queries.push(`${inputs.industry.toLowerCase()} ${loc} reviews`);
  }

  return [...new Set(queries.map(q => q.trim()).filter(Boolean))].slice(0, 5);
}

/**
 * Simulate SERP-based competitor discovery using modeled pools.
 * Each competitor is scored by frequency across queries + organic/paid presence.
 */
function generateCompetitorProfiles(
  inputs: MarketIntelligenceInputs,
  ctx: GenerationContext,
  coreKeywords: string[],
  keywordThemes: KeywordTheme[],
  discoveryQueries: string[],
): CompetitorProfile[] {
  const { area, localArea, isLocal, normalizedIndustry } = ctx;
  const loc = isLocal ? localArea : area;
  const profiles: CompetitorProfile[] = [];
  const totalQueries = discoveryQueries.length;

  // 1. Manual competitors — highest trust, never overwritten
  const known = inputs.knownCompetitors?.filter(Boolean) || [];
  for (const name of known.slice(0, 5)) {
    profiles.push({
      id: uid('cp'), name, geography: loc,
      positioning: `Known competitor in the ${inputs.industry.toLowerCase()} space`,
      channelObservations: 'Monitor creative and messaging closely.',
      competitorType: 'direct',
      relevance: 'high',
      localRelevance: isLocal ? 'high' : 'medium',
      notes: 'User-provided competitor — authoritative.',
      sourceType: 'manual',
      sourceConfidence: 'high',
      manuallyAdded: true,
      approved: true,
      serpSource: 'both',
      queryFrequency: totalQueries,
      totalQueries,
      confidenceScore: 100,
    });
  }

  // 2. Pull from SERP pool using normalized industry, score by query frequency
  const serpPool = SERP_COMPETITOR_POOLS[normalizedIndustry] || [];
  const knownNames = new Set(known.map(n => n.toLowerCase()));

  const scored = serpPool
    .filter(c => !knownNames.has(c.name.toLowerCase()))
    .filter(c => !EXCLUDED_DOMAINS.some(d => c.url.includes(d)))
    .map(c => {
      // Simulate frequency: count how many discovery queries match this competitor's keywords
      let queryMatchCount = 0;
      for (const query of discoveryQueries) {
        const queryWords = query.toLowerCase().split(/\s+/);
        const matches = c.rankingKeywords.some(rk =>
          queryWords.some(qw => rk.toLowerCase().includes(qw) || qw.includes(rk.toLowerCase().split(' ')[0] || ''))
        );
        if (matches) queryMatchCount++;
      }
      // Also count core keyword matches
      const coreMatches = coreKeywords.filter(kw =>
        c.rankingKeywords.some(rk => rk.toLowerCase().includes(kw.split(' ')[0]?.toLowerCase() || ''))
      );
      queryMatchCount = Math.max(queryMatchCount, Math.min(coreMatches.length, totalQueries));

      // Score: frequency-weighted with paid/organic bonuses
      let score = queryMatchCount * 5; // frequency is primary signal
      if (c.organic && c.paidAds) score += 10; // both = highest priority
      else if (c.paidAds) score += 7; // paid = higher weight
      else if (c.organic) score += 3;
      if (isLocal && c.geography.toLowerCase().includes(localArea.toLowerCase().split(',')[0] || '')) score += 5;
      if (c.geography.toLowerCase().includes('national') || c.geography.toLowerCase().includes('us')) score += 1;
      score += Math.floor(c.domainAuthority / 20);

      // Determine SERP source
      const serpSource: SERPSource = (c.organic && c.paidAds) ? 'both' : c.paidAds ? 'paid' : 'organic';

      // Confidence score (0-100)
      const freqRatio = queryMatchCount / Math.max(totalQueries, 1);
      const sourceBonus = serpSource === 'both' ? 20 : serpSource === 'paid' ? 10 : 0;
      const confidenceScore = Math.min(100, Math.round(freqRatio * 60 + sourceBonus + Math.min(c.domainAuthority / 5, 20)));

      return { ...c, score, queryMatchCount, serpSource, confidenceScore, coreMatches };
    })
    .sort((a, b) => b.score - a.score);

  // Take top direct competitors
  const slotsRemaining = 8 - profiles.length;
  for (const comp of scored.slice(0, Math.max(slotsRemaining, 0))) {
    const isMapResult = isLocal && comp.geography.toLowerCase().includes(localArea.toLowerCase().split(',')[0] || '');
    const sourceType: SourceType = isMapResult ? 'google_maps' : 'google_serp';

    // Gather evidence refs from matching keyword theme IDs
    const matchingThemeIds = keywordThemes
      .filter(kt => comp.coreMatches.some(mk => kt.keywordExamples.some(ke => ke.toLowerCase().includes(mk.split(' ')[0]?.toLowerCase() || ''))))
      .map(kt => kt.id);

    profiles.push({
      id: uid('cp'),
      name: comp.name,
      geography: comp.geography,
      positioning: comp.positioning,
      channelObservations: `${comp.paidAds ? 'Active Google Ads presence. ' : ''}${comp.organic ? 'Ranks organically. ' : ''}DA ~${comp.domainAuthority}. Found in ${comp.queryMatchCount}/${totalQueries} queries.`,
      websiteUrl: comp.url,
      competitorType: 'direct',
      relevance: comp.score >= 8 ? 'high' : comp.score >= 4 ? 'medium' : 'low',
      localRelevance: isMapResult ? 'high' : isLocal ? 'medium' : 'low',
      rankingKeywords: comp.rankingKeywords,
      estimatedDomainAuthority: comp.domainAuthority,
      paidAdsPresence: comp.paidAds,
      serpSource: comp.serpSource,
      queryFrequency: comp.queryMatchCount,
      totalQueries,
      confidenceScore: comp.confidenceScore,
      sourceType,
      sourceConfidence: comp.confidenceScore >= 60 ? 'high' : comp.confidenceScore >= 30 ? 'medium' : 'low',
      sourceKeyword: comp.coreMatches[0] || coreKeywords[0],
      evidenceRefs: matchingThemeIds.length > 0 ? matchingThemeIds : undefined,
    });
  }

  // 3. Add directory/platform competitors as indirect (clearly labeled, shown separately)
  const directoryPool = DIRECTORY_POOL[normalizedIndustry] || [];
  for (const dir of directoryPool.slice(0, 3)) {
    if (knownNames.has(dir.name.toLowerCase())) continue;
    if (profiles.find(p => p.name === dir.name)) continue;
    profiles.push({
      id: uid('cp'),
      name: dir.name,
      geography: dir.geography,
      positioning: dir.positioning,
      channelObservations: `High-DA directory (DA ~${dir.domainAuthority}) capturing organic traffic. Monitor for competitive listings.`,
      websiteUrl: dir.url,
      competitorType: 'directory_platform',
      relevance: 'medium',
      localRelevance: 'medium',
      rankingKeywords: dir.rankingKeywords,
      estimatedDomainAuthority: dir.domainAuthority,
      paidAdsPresence: false,
      serpSource: 'organic',
      sourceType: 'google_serp',
      sourceConfidence: 'high',
      sourceKeyword: coreKeywords[0],
      notes: 'Directory/platform — not a direct competitor but captures search traffic.',
    });
  }

  // 4. If insufficient verified competitors, return gap state instead of fabricating
  if (profiles.filter(p => p.competitorType === 'direct' && p.sourceType !== 'manual').length < 3) {
    profiles.push({
      id: uid('cp'),
      name: '⚠ Insufficient verified competitors',
      geography: loc,
      positioning: `The modeled competitor pool for "${normalizedIndustry}" in ${loc} returned fewer than 3 verified direct competitors.`,
      channelObservations: 'Consider: refining keywords, widening geographic radius, or adding known competitors manually.',
      competitorType: 'direct',
      relevance: 'low',
      localRelevance: 'low',
      sourceType: 'ai_inference',
      sourceConfidence: 'low',
      notes: 'Gap indicator — not a real competitor. Expand search parameters for better results.',
    });
  }

  return profiles;
}

/* ═══════════════════════════════════════════════════════
   EVIDENCE REFS WIRING
   ═══════════════════════════════════════════════════════ */

function wireEvidenceRefs(
  recs: ChannelRecommendation[],
  keywords: KeywordTheme[],
  competitors: CompetitorProfile[],
  audiences: AudienceModel[],
) {
  for (const rec of recs) {
    const refs: string[] = [];

    // Link keywords that match this channel's type
    const relatedKeywords = keywords.filter(kt => {
      if (rec.channelType === 'search') return kt.intentType === 'transactional' || kt.intentType === 'commercial';
      if (rec.channelType === 'content') return kt.intentType === 'informational' || kt.intentType === 'navigational';
      return kt.priority === 'high';
    });
    refs.push(...relatedKeywords.slice(0, 3).map(k => k.id));

    // Link relevant competitors (direct only)
    const directCompetitors = competitors.filter(c => c.competitorType === 'direct' && c.sourceType !== 'ai_inference');
    refs.push(...directCompetitors.slice(0, 2).map(c => c.id));

    // Link relevant audience models
    const channelAudiences = audiences.filter(a => a.channel === rec.channel);
    refs.push(...channelAudiences.map(a => a.id));

    if (refs.length > 0) {
      rec.evidenceRefs = refs;
    }
  }
}

/* ═══════════════════════════════════════════════════════
   CHANNEL RECOMMENDATIONS — with evidence refs
   ═══════════════════════════════════════════════════════ */

function generateChannelRecs(inputs: MarketIntelligenceInputs, ctx: GenerationContext): ChannelRecommendation[] {
  const { isB2B, isEcom, isLocal } = ctx;
  const recs: ChannelRecommendation[] = [];

  recs.push({
    channel: 'Google Ads', channelType: 'search',
    role: 'Demand capture and high-intent conversion',
    rationale: `Captures searchers actively looking for ${inputs.industry.toLowerCase()} solutions. ${isLocal ? `Local search modifiers drive qualified traffic from ${ctx.localArea}.` : 'Foundation of performance marketing.'}`,
    priority: 'high',
    sourceType: 'google_serp', sourceConfidence: 'high',
  });

  if (isB2B) {
    recs.push(
      { channel: 'LinkedIn', channelType: 'audience', role: 'Authority building & lead generation', rationale: `Best B2B platform for decision-makers by job title.`, priority: 'high', sourceType: 'ai_inference', sourceConfidence: 'high' },
      { channel: 'Content/SEO', channelType: 'content', role: 'Organic authority & lead capture', rationale: 'Long-form content builds trust and captures informational queries.', priority: 'high', sourceType: 'ai_inference', sourceConfidence: 'high' },
      { channel: 'Meta Ads', channelType: 'audience', role: 'Retargeting & awareness', rationale: 'Meta retargeting recaptures website visitors.', priority: 'medium', sourceType: 'ai_inference', sourceConfidence: 'medium' },
      { channel: 'Email', channelType: 'email', role: 'Lead nurture & retention', rationale: 'Automated drip sequences convert MQLs to SQLs.', priority: 'medium', sourceType: 'ai_inference', sourceConfidence: 'medium' },
    );
  } else if (isEcom) {
    recs.push(
      { channel: 'Meta Ads', channelType: 'audience', role: 'Primary prospecting & retargeting', rationale: 'Largest addressable audience for DTC.', priority: 'high', sourceType: 'ai_inference', sourceConfidence: 'high' },
      { channel: 'Email/SMS', channelType: 'email', role: 'Lifecycle & retention', rationale: 'Highest-leverage owned channel.', priority: 'high', sourceType: 'internal_benchmark', sourceConfidence: 'high' },
      { channel: 'TikTok', channelType: 'audience', role: 'Awareness & product discovery', rationale: 'Low CPMs and strong storytelling potential.', priority: 'medium', sourceType: 'ai_inference', sourceConfidence: 'medium' },
    );
  } else {
    recs.push(
      { channel: 'Meta Ads', channelType: 'audience', role: 'Awareness & retargeting', rationale: `Broad reach for ${inputs.industry.toLowerCase()}. ${isLocal ? `Geo-fenced to ${ctx.localArea}.` : ''}`, priority: 'high', sourceType: 'ai_inference', sourceConfidence: 'high' },
      { channel: 'Email', channelType: 'email', role: 'Retention & lifecycle', rationale: 'Cost-effective nurturing.', priority: 'medium', sourceType: 'ai_inference', sourceConfidence: 'medium' },
      { channel: 'Content/SEO', channelType: 'content', role: 'Organic traffic & authority', rationale: 'Sustainable traffic over time.', priority: 'medium', sourceType: 'ai_inference', sourceConfidence: 'medium' },
    );
  }

  for (const ch of inputs.selectedChannels) {
    if (!recs.find(r => r.channel === ch) && ch === 'Spotify') {
      recs.push({ channel: 'Spotify', channelType: 'audience', role: 'Audio awareness', rationale: `Audio ads during high-attention moments in ${ctx.localArea}.`, priority: 'low', sourceType: 'ai_inference', sourceConfidence: 'low' });
    }
  }

  return recs;
}

/* ═══════════════════════════════════════════════════════
   BENCHMARK ASSUMPTIONS — with source metadata & evidence refs
   ═══════════════════════════════════════════════════════ */

function generateBenchmarks(
  inputs: MarketIntelligenceInputs,
  ctx: GenerationContext,
  recs: ChannelRecommendation[],
  keywords: KeywordTheme[],
  competitors: CompetitorProfile[],
): BenchmarkAssumption[] {
  const benchmarks: BenchmarkAssumption[] = [];
  const { isB2B, isEcom, isLocal, area, localArea } = ctx;
  const loc = isLocal ? localArea : area;

  // Gather IDs for evidence refs
  const highPriorityKeywordIds = keywords.filter(k => k.priority === 'high').map(k => k.id).slice(0, 3);
  const directCompetitorIds = competitors.filter(c => c.competitorType === 'direct' && c.sourceType !== 'ai_inference').map(c => c.id).slice(0, 3);
  const baseEvidence = [...highPriorityKeywordIds, ...directCompetitorIds];

  for (const rec of recs) {
    const baseMeta = {
      sourceType: 'internal_benchmark' as SourceType,
      sourceConfidence: 'medium' as const,
      evidenceRefs: baseEvidence.length > 0 ? baseEvidence : undefined,
    };
    switch (rec.channel) {
      case 'Google Ads':
        benchmarks.push(
          { ...baseMeta, channel: 'Google Ads', channelType: 'search', metric: 'CPC', unit: '$', low: isB2B ? 3.0 : isLocal ? 1.2 : 0.8, high: isB2B ? 12.0 : isLocal ? 4.0 : 3.5, recommended: isB2B ? 5.5 : isLocal ? 2.2 : 1.8, rationale: `${inputs.industry} search CPC in ${loc}.` },
          { ...baseMeta, channel: 'Google Ads', channelType: 'search', metric: 'CTR', unit: '%', low: 2.0, high: 6.0, recommended: isB2B ? 3.2 : 4.0, rationale: `Search CTR for ${inputs.industry.toLowerCase()}.` },
          { ...baseMeta, channel: 'Google Ads', channelType: 'search', metric: 'CVR', unit: '%', low: 1.5, high: 6.0, recommended: isB2B ? 3.0 : isEcom ? 2.5 : 3.5, rationale: `Landing page conversion rate.` },
          { ...baseMeta, channel: 'Google Ads', channelType: 'search', metric: isB2B ? 'CPL' : 'CPA', unit: '$', low: isB2B ? 40 : isEcom ? 15 : 20, high: isB2B ? 250 : isEcom ? 60 : 100, recommended: isB2B ? 120 : isEcom ? 35 : 50, rationale: `Derived from CPC ÷ CVR.` },
        );
        break;
      case 'Meta Ads':
        benchmarks.push(
          { ...baseMeta, channel: 'Meta Ads', channelType: 'audience', metric: 'CPM (Prospecting)', unit: '$', low: isLocal ? 7 : 6, high: isLocal ? 16 : 20, recommended: isLocal ? 10 : isB2B ? 14 : isEcom ? 11 : 12, rationale: `Prospecting CPM in ${loc}.` },
          { ...baseMeta, channel: 'Meta Ads', channelType: 'audience', metric: 'CPM (Retargeting)', unit: '$', low: 12, high: 25, recommended: isB2B ? 18 : 15, rationale: 'Higher due to smaller, warmer audiences.' },
          { ...baseMeta, channel: 'Meta Ads', channelType: 'audience', metric: 'CTR', unit: '%', low: 0.5, high: 2.0, recommended: isEcom ? 1.2 : isB2B ? 0.7 : 0.9, rationale: 'Blended prospecting + retargeting.' },
          { ...baseMeta, channel: 'Meta Ads', channelType: 'audience', metric: isB2B ? 'CPL' : 'CPA', unit: '$', low: isB2B ? 35 : isEcom ? 20 : 25, high: isB2B ? 180 : isEcom ? 65 : 90, recommended: isB2B ? 85 : isEcom ? 38 : 50, rationale: `Blended acquisition cost.` },
        );
        break;
      case 'LinkedIn':
        benchmarks.push(
          { ...baseMeta, channel: 'LinkedIn', channelType: 'audience', metric: 'CPM', unit: '$', low: 25, high: 55, recommended: 35, rationale: 'Premium but precise B2B targeting.' },
          { ...baseMeta, channel: 'LinkedIn', channelType: 'audience', metric: 'CPC', unit: '$', low: 5, high: 15, recommended: 8.5, rationale: 'Sponsored content CPC.' },
          { ...baseMeta, channel: 'LinkedIn', channelType: 'audience', metric: 'CPL', unit: '$', low: 50, high: 250, recommended: 130, rationale: 'Cost per lead via gated content.' },
        );
        break;
      case 'Spotify':
        benchmarks.push(
          { ...baseMeta, channel: 'Spotify', channelType: 'audience', metric: 'CPM', unit: '$', low: 12, high: 25, recommended: 18, rationale: 'Audio ad CPM.' },
          { ...baseMeta, channel: 'Spotify', channelType: 'audience', metric: 'Listen-Through Rate', unit: '%', low: 85, high: 97, recommended: 92, rationale: 'Non-skippable format.' },
        );
        break;
      case 'TikTok':
        benchmarks.push(
          { ...baseMeta, channel: 'TikTok', channelType: 'audience', metric: 'CPM', unit: '$', low: 3, high: 10, recommended: isLocal ? 5 : 4, rationale: 'Lowest-CPM major platform.' },
          { ...baseMeta, channel: 'TikTok', channelType: 'audience', metric: 'CTR', unit: '%', low: 0.5, high: 1.5, recommended: 0.8, rationale: 'Short-form video CTR.' },
        );
        break;
      case 'Email':
      case 'Email/SMS':
        benchmarks.push(
          { ...baseMeta, channel: rec.channel, channelType: 'email', metric: 'Open Rate', unit: '%', low: 18, high: 35, recommended: 24, rationale: 'Cross-industry benchmark.' },
          { ...baseMeta, channel: rec.channel, channelType: 'email', metric: 'Click Rate', unit: '%', low: 1.5, high: 5.0, recommended: 3.2, rationale: 'Flow emails outperform campaigns.' },
          { ...baseMeta, channel: rec.channel, channelType: 'email', metric: 'Revenue Share', unit: '%', low: 15, high: 35, recommended: isEcom ? 28 : 20, rationale: isEcom ? 'Best-in-class DTC reach 30%+.' : 'B2B pipeline influence.' },
        );
        break;
      case 'Content/SEO':
        benchmarks.push(
          { ...baseMeta, channel: 'Content/SEO', channelType: 'content', metric: 'Organic Traffic Growth', unit: '%/mo', low: 5, high: 20, recommended: 12, rationale: 'After 3-month ramp.' },
          { ...baseMeta, channel: 'Content/SEO', channelType: 'content', metric: 'Organic CVR', unit: '%', low: 1.0, high: 4.0, recommended: 2.5, rationale: 'Varies by content type.' },
        );
        break;
    }
  }
  return benchmarks;
}

/* ═══════════════════════════════════════════════════════
   RESEARCH SUMMARY
   ═══════════════════════════════════════════════════════ */

function generateSummary(
  inputs: MarketIntelligenceInputs,
  ctx: GenerationContext,
  recs: ChannelRecommendation[],
  audiences: AudienceModel[],
  competitors: CompetitorProfile[],
): string {
  const searchChannels = recs.filter(r => r.channelType === 'search');
  const audienceChannels = recs.filter(r => r.channelType === 'audience');
  const highPriority = recs.filter(r => r.priority === 'high').map(r => r.channel).join(', ');
  const directCount = competitors.filter(c => c.competitorType === 'direct' && !c.name.startsWith('⚠')).length;
  const directoryCount = competitors.filter(c => c.competitorType === 'directory_platform').length;

  let summary = `${inputs.industry} (normalized: ${ctx.normalizedIndustry}) in ${ctx.isLocal ? ctx.localArea : ctx.area} `;
  if (searchChannels.length > 0 && audienceChannels.length > 0) {
    summary += `benefits from a dual approach: search-based demand capture via ${searchChannels.map(s => s.channel).join(', ')} and audience-based prospecting via ${audienceChannels.map(a => a.channel).join(', ')}. `;
  } else if (searchChannels.length > 0) {
    summary += `is best served by search-driven demand capture. `;
  } else {
    summary += `should prioritize audience-based prospecting. `;
  }

  summary += `High-priority channels: ${highPriority}. `;
  summary += `Identified ${directCount} direct competitor${directCount !== 1 ? 's' : ''} and ${directoryCount} directory/platform${directoryCount !== 1 ? 's' : ''} via modeled SERP analysis. `;

  if (ctx.isLocal && ctx.radiusMiles) {
    summary += `Research is localized to a ${ctx.radiusMiles}-mile radius around ${ctx.localArea}. `;
  } else if (ctx.isLocal) {
    summary += `Research is localized to ${ctx.localArea}. `;
  }

  if (ctx.refinement) {
    summary += `Refinement applied: "${ctx.refinement}". `;
  }

  summary += `Note: Competitor discovery uses modeled SERP-based pools, not live Google search results. All benchmarks are modeled assumptions and should be validated within 30-60 days.`;
  return summary;
}
