/**
 * Channel-aware Market Intelligence adapter.
 * SERP-based competitor discovery: generates core keywords first,
 * then simulates Google SERP/Maps results to find real competitors.
 * All outputs carry source metadata (sourceType, sourceConfidence).
 */
import type {
  MarketIntelligenceInputs,
  MarketIntelligenceOutputs,
  KeywordTheme,
  CompetitorProfile,
  AudienceModel,
  ChannelRecommendation,
  BenchmarkAssumption,
  ChannelType,
  SourceType,
} from '@/types/marketIntelligence';
import { getChannelType } from '@/types/marketIntelligence';

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

let _ts = 0;
function uid(prefix: string) { return `${prefix}-${Date.now()}-${++_ts}`; }

export async function generateMarketIntelligence(
  inputs: MarketIntelligenceInputs,
  onProgress?: (pct: number, label: string) => void,
): Promise<MarketIntelligenceOutputs> {
  const ctx = buildContext(inputs);

  onProgress?.(5, 'Identifying core search keywords…');
  await delay(400);
  const coreSearchKeywords = generateCoreKeywords(inputs, ctx);

  onProgress?.(15, 'Analyzing industry landscape…');
  await delay(400);

  onProgress?.(25, 'Evaluating channel opportunities…');
  await delay(400);
  const channelRecommendations = generateChannelRecs(inputs, ctx);

  onProgress?.(35, 'Researching top keywords…');
  await delay(500);
  const keywordThemes = generateKeywordThemes(inputs, ctx);

  onProgress?.(50, 'Simulating Google SERP analysis…');
  await delay(600);
  const competitorProfiles = generateCompetitorProfiles(inputs, ctx, coreSearchKeywords);

  onProgress?.(65, 'Building audience models…');
  await delay(500);
  const audienceModels = generateAudienceModels(inputs, ctx);

  onProgress?.(80, 'Computing benchmark assumptions…');
  await delay(500);
  const benchmarkAssumptions = generateBenchmarks(inputs, ctx, channelRecommendations);

  onProgress?.(92, 'Synthesizing research summary…');
  await delay(400);
  const researchSummary = generateSummary(inputs, ctx, channelRecommendations, audienceModels);

  onProgress?.(100, 'Complete');

  return {
    keywordThemes,
    competitorProfiles,
    audienceModels,
    channelRecommendations,
    benchmarkAssumptions,
    researchSummary,
    coreSearchKeywords,
  };
}

/* ── Context ── */

interface GenerationContext {
  area: string;
  localArea: string;
  product: string;
  audience: string;
  isB2B: boolean;
  isEcom: boolean;
  isLocal: boolean;
  radiusMiles: number | null;
  refinement: string | null;
}

function buildContext(inputs: MarketIntelligenceInputs): GenerationContext {
  const industry = inputs.industry.toLowerCase();
  const localArea = inputs.primaryCity || inputs.serviceArea || inputs.geography || '';
  const radiusMiles = inputs.localRadius === 'custom'
    ? (inputs.customRadiusMiles || null)
    : typeof inputs.localRadius === 'number' ? inputs.localRadius : null;

  return {
    area: inputs.geography || inputs.serviceArea || 'target market',
    localArea,
    product: inputs.productsOrServices || inputs.industry,
    audience: inputs.targetAudience || 'target customers',
    isB2B: inputs.businessModel === 'lead_generation' || industry.includes('professional') || industry.includes('b2b'),
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

  // High-intent commercial keywords
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

  // Deduplicate and clean
  return [...new Set(keywords.map(k => k.trim()).filter(Boolean))].slice(0, 10);
}

/* ═══════════════════════════════════════════════════════
   KEYWORD THEMES — Top 10 with priority, local relevance, & source metadata
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
   COMPETITOR PROFILES — SERP-based discovery with source metadata
   ═══════════════════════════════════════════════════════ */

/** Industry-specific SERP competitor pools — real businesses that would rank for core keywords */
const SERP_COMPETITOR_POOLS: Record<string, {
  name: string;
  url: string;
  geography: string;
  positioning: string;
  rankingKeywords: string[];
  paidAds: boolean;
  domainAuthority: number;
}[]> = {
  'Education': [
    { name: 'Stratford School', url: 'https://www.stratfordschools.com', geography: 'San Francisco Bay Area', positioning: 'Private K-8 school with STEM focus', rankingKeywords: ['private school san francisco', 'k-8 school bay area'], paidAds: true, domainAuthority: 45 },
    { name: 'Kumon', url: 'https://www.kumon.com', geography: 'National (local centers)', positioning: 'Franchise tutoring chain, math and reading', rankingKeywords: ['tutoring near me', 'math tutoring'], paidAds: true, domainAuthority: 62 },
    { name: 'Sylvan Learning', url: 'https://www.sylvanlearning.com', geography: 'National (local centers)', positioning: 'Personalized tutoring and test prep', rankingKeywords: ['learning center near me', 'tutoring services'], paidAds: true, domainAuthority: 55 },
    { name: 'BASIS Independent Schools', url: 'https://www.basisindependent.com', geography: 'Multiple US metros', positioning: 'Rigorous college-prep curriculum', rankingKeywords: ['best private school', 'college prep school'], paidAds: false, domainAuthority: 38 },
    { name: 'Khan Academy', url: 'https://www.khanacademy.org', geography: 'Online / National', positioning: 'Free online learning platform', rankingKeywords: ['free online school', 'learn math online'], paidAds: false, domainAuthority: 88 },
    { name: 'Great Schools', url: 'https://www.greatschools.org', geography: 'National', positioning: 'School ratings and reviews platform', rankingKeywords: ['school ratings', 'best schools near me'], paidAds: false, domainAuthority: 78 },
    { name: 'Fusion Academy', url: 'https://www.fusionacademy.com', geography: 'Multiple US metros', positioning: 'One-to-one private school model', rankingKeywords: ['private school small class', 'alternative school'], paidAds: true, domainAuthority: 35 },
  ],
  'E-commerce': [
    { name: 'Parachute Home', url: 'https://www.parachutehome.com', geography: 'US (National)', positioning: 'Premium DTC home essentials', rankingKeywords: ['organic bedding', 'premium towels online'], paidAds: true, domainAuthority: 52 },
    { name: 'West Elm', url: 'https://www.westelm.com', geography: 'US + International', positioning: 'Modern furniture and home décor', rankingKeywords: ['modern home decor', 'furniture online'], paidAds: true, domainAuthority: 75 },
    { name: 'Crate & Barrel', url: 'https://www.crateandbarrel.com', geography: 'US + International', positioning: 'Contemporary home furnishings', rankingKeywords: ['home furnishings', 'kitchen accessories'], paidAds: true, domainAuthority: 78 },
    { name: 'Brooklinen', url: 'https://www.brooklinen.com', geography: 'US (DTC)', positioning: 'Luxury bedding and bath DTC', rankingKeywords: ['best sheets online', 'luxury bedding'], paidAds: true, domainAuthority: 48 },
    { name: 'Etsy', url: 'https://www.etsy.com', geography: 'Global marketplace', positioning: 'Handmade and artisan marketplace', rankingKeywords: ['handmade home goods', 'artisan decor'], paidAds: true, domainAuthority: 92 },
  ],
  'Professional Services': [
    { name: 'Fisher Phillips', url: 'https://www.fisherphillips.com', geography: 'National', positioning: 'Labor & employment law leader', rankingKeywords: ['employment lawyer', 'labor law firm'], paidAds: true, domainAuthority: 58 },
    { name: 'Foley & Lardner', url: 'https://www.foley.com', geography: 'National', positioning: 'Full-service corporate law', rankingKeywords: ['corporate lawyer', 'M&A attorney'], paidAds: false, domainAuthority: 65 },
    { name: 'Cooley', url: 'https://www.cooley.com', geography: 'National', positioning: 'Tech and startup legal services', rankingKeywords: ['startup lawyer', 'venture capital attorney'], paidAds: false, domainAuthority: 62 },
    { name: 'Baker McKenzie', url: 'https://www.bakermckenzie.com', geography: 'Global', positioning: 'International corporate law', rankingKeywords: ['international law firm', 'global corporate counsel'], paidAds: false, domainAuthority: 72 },
    { name: 'LegalZoom', url: 'https://www.legalzoom.com', geography: 'US (Online)', positioning: 'Self-service legal platform', rankingKeywords: ['legal services online', 'business formation'], paidAds: true, domainAuthority: 75 },
  ],
  'Healthcare': [
    { name: 'One Medical', url: 'https://www.onemedical.com', geography: 'Major US metros', positioning: 'Membership-based primary care', rankingKeywords: ['primary care near me', 'concierge doctor'], paidAds: true, domainAuthority: 55 },
    { name: 'Carbon Health', url: 'https://carbonhealth.com', geography: 'US metros', positioning: 'Tech-enabled urgent and primary care', rankingKeywords: ['urgent care near me', 'walk-in clinic'], paidAds: true, domainAuthority: 45 },
    { name: 'ZocDoc', url: 'https://www.zocdoc.com', geography: 'US (Online)', positioning: 'Doctor booking platform', rankingKeywords: ['find a doctor near me', 'book doctor appointment'], paidAds: true, domainAuthority: 72 },
    { name: 'MinuteClinic (CVS)', url: 'https://www.cvs.com/minuteclinic', geography: 'National (retail)', positioning: 'Retail clinic for basic care', rankingKeywords: ['walk-in clinic near me', 'quick medical visit'], paidAds: true, domainAuthority: 80 },
    { name: 'Teladoc', url: 'https://www.teladoc.com', geography: 'US (Telehealth)', positioning: 'Virtual care platform', rankingKeywords: ['online doctor', 'telehealth visit'], paidAds: true, domainAuthority: 60 },
  ],
  'Real Estate': [
    { name: 'Compass', url: 'https://www.compass.com', geography: 'Major US metros', positioning: 'Tech-forward luxury brokerage', rankingKeywords: ['real estate agent near me', 'luxury homes'], paidAds: true, domainAuthority: 68 },
    { name: 'Redfin', url: 'https://www.redfin.com', geography: 'US (National)', positioning: 'Discount brokerage with listing portal', rankingKeywords: ['homes for sale', 'real estate listings'], paidAds: true, domainAuthority: 82 },
    { name: 'Keller Williams', url: 'https://www.kw.com', geography: 'US (National franchise)', positioning: 'Large agent network', rankingKeywords: ['real estate broker', 'buy a home'], paidAds: true, domainAuthority: 65 },
    { name: 'Zillow', url: 'https://www.zillow.com', geography: 'US (Online)', positioning: 'Dominant home search platform', rankingKeywords: ['homes for sale near me', 'home values'], paidAds: true, domainAuthority: 92 },
    { name: 'Realtor.com', url: 'https://www.realtor.com', geography: 'US (Online)', positioning: 'MLS-based listing portal', rankingKeywords: ['houses for sale', 'real estate market'], paidAds: true, domainAuthority: 85 },
  ],
};

/** Excluded domains — directories, aggregators, etc. */
const EXCLUDED_DOMAINS = ['yelp.com', 'wikipedia.org', 'niche.com', 'yellowpages.com', 'bbb.org', 'indeed.com', 'glassdoor.com'];

function generateCompetitorProfiles(
  inputs: MarketIntelligenceInputs,
  ctx: GenerationContext,
  coreKeywords: string[],
): CompetitorProfile[] {
  const { area, localArea, isLocal } = ctx;
  const loc = isLocal ? localArea : area;
  const profiles: CompetitorProfile[] = [];

  // 1. Add known competitors as manual/high-trust entries
  const known = inputs.knownCompetitors?.filter(Boolean) || [];
  for (const name of known.slice(0, 5)) {
    profiles.push({
      id: uid('cp'), name, geography: loc,
      positioning: `Known competitor in the ${inputs.industry.toLowerCase()} space`,
      channelObservations: 'Monitor creative and messaging closely.',
      relevance: 'high',
      localRelevance: isLocal ? 'high' : 'medium',
      notes: 'User-provided competitor.',
      sourceType: 'manual',
      sourceConfidence: 'high',
      manuallyAdded: true,
      approved: true,
    });
  }

  // 2. Pull from SERP pool — simulates Google organic + Maps results
  const serpPool = SERP_COMPETITOR_POOLS[inputs.industry] || [];
  const knownNames = new Set(known.map(n => n.toLowerCase()));

  // Score by keyword overlap and geography match
  const scored = serpPool
    .filter(c => !knownNames.has(c.name.toLowerCase()))
    .filter(c => !EXCLUDED_DOMAINS.some(d => c.url.includes(d)))
    .map(c => {
      let score = 0;
      // Keyword overlap score
      const matchingKeywords = coreKeywords.filter(kw =>
        c.rankingKeywords.some(rk => rk.toLowerCase().includes(kw.split(' ')[0]?.toLowerCase() || ''))
      );
      score += matchingKeywords.length * 3;
      // Geography proximity
      if (isLocal && c.geography.toLowerCase().includes(localArea.toLowerCase().split(',')[0] || '')) score += 5;
      if (c.geography.toLowerCase().includes('national') || c.geography.toLowerCase().includes('us')) score += 1;
      // Domain authority bonus
      score += Math.floor(c.domainAuthority / 20);
      // Paid ads presence
      if (c.paidAds) score += 2;
      return { ...c, score, matchingKeywords };
    })
    .sort((a, b) => b.score - a.score);

  // Take top results to fill up to 10 total
  const slotsRemaining = 10 - profiles.length;
  for (const comp of scored.slice(0, slotsRemaining)) {
    // Determine source type: if geography matches local area, it's google_maps; otherwise google_serp
    const isMapResult = isLocal && comp.geography.toLowerCase().includes(localArea.toLowerCase().split(',')[0] || '');
    const sourceType: SourceType = isMapResult ? 'google_maps' : 'google_serp';

    profiles.push({
      id: uid('cp'),
      name: comp.name,
      geography: comp.geography,
      positioning: comp.positioning,
      channelObservations: `${comp.paidAds ? 'Active Google Ads presence. ' : ''}DA ~${comp.domainAuthority}. Ranks for: ${comp.rankingKeywords.slice(0, 3).join(', ')}.`,
      websiteUrl: comp.url,
      relevance: comp.score >= 8 ? 'high' : comp.score >= 4 ? 'medium' : 'low',
      localRelevance: isMapResult ? 'high' : isLocal ? 'medium' : 'low',
      rankingKeywords: comp.rankingKeywords,
      estimatedDomainAuthority: comp.domainAuthority,
      paidAdsPresence: comp.paidAds,
      sourceType,
      sourceConfidence: comp.score >= 6 ? 'high' : 'medium',
      sourceKeyword: comp.matchingKeywords[0] || coreKeywords[0],
    });
  }

  // 3. If still under 10, fill with ai_inference (low confidence) — but use contextual names not archetypes
  if (profiles.length < 8) {
    const fillerNames = [
      `${localArea} ${inputs.industry} Group`,
      `Premier ${inputs.industry} ${isLocal ? localArea : 'Services'}`,
      `${inputs.industry} Partners ${isLocal ? `of ${localArea}` : 'Network'}`,
    ];
    for (const name of fillerNames) {
      if (profiles.length >= 10) break;
      if (profiles.find(p => p.name === name)) continue;
      profiles.push({
        id: uid('cp'), name, geography: loc,
        positioning: `Likely competitor based on industry and geography analysis`,
        channelObservations: 'Requires validation — inferred from market patterns.',
        relevance: 'low',
        localRelevance: isLocal ? 'medium' : 'low',
        sourceType: 'ai_inference',
        sourceConfidence: 'low',
        notes: 'AI-inferred competitor. Validate with actual SERP data.',
      });
    }
  }

  return profiles.slice(0, 10);
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
   BENCHMARK ASSUMPTIONS — with source metadata
   ═══════════════════════════════════════════════════════ */

function generateBenchmarks(inputs: MarketIntelligenceInputs, ctx: GenerationContext, recs: ChannelRecommendation[]): BenchmarkAssumption[] {
  const benchmarks: BenchmarkAssumption[] = [];
  const { isB2B, isEcom, isLocal, area, localArea } = ctx;
  const loc = isLocal ? localArea : area;

  for (const rec of recs) {
    const baseMeta = { sourceType: 'internal_benchmark' as SourceType, sourceConfidence: 'medium' as const };
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

function generateSummary(inputs: MarketIntelligenceInputs, ctx: GenerationContext, recs: ChannelRecommendation[], audiences: AudienceModel[]): string {
  const searchChannels = recs.filter(r => r.channelType === 'search');
  const audienceChannels = recs.filter(r => r.channelType === 'audience');
  const highPriority = recs.filter(r => r.priority === 'high').map(r => r.channel).join(', ');

  let summary = `${inputs.industry} in ${ctx.isLocal ? ctx.localArea : ctx.area} `;
  if (searchChannels.length > 0 && audienceChannels.length > 0) {
    summary += `benefits from a dual approach: search-based demand capture via ${searchChannels.map(s => s.channel).join(', ')} and audience-based prospecting via ${audienceChannels.map(a => a.channel).join(', ')}. `;
  } else if (searchChannels.length > 0) {
    summary += `is best served by search-driven demand capture. `;
  } else {
    summary += `should prioritize audience-based prospecting. `;
  }

  summary += `High-priority channels: ${highPriority}. `;

  if (ctx.isLocal && ctx.radiusMiles) {
    summary += `Research is localized to a ${ctx.radiusMiles}-mile radius around ${ctx.localArea}. `;
  } else if (ctx.isLocal) {
    summary += `Research is localized to ${ctx.localArea}. `;
  }

  if (ctx.refinement) {
    summary += `Refinement applied: "${ctx.refinement}". `;
  }

  summary += `Competitor discovery is based on simulated Google SERP analysis across core keywords. All benchmarks are modeled assumptions and should be validated within 30-60 days.`;
  return summary;
}
