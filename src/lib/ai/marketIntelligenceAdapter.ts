/**
 * Channel-aware Market Intelligence adapter.
 * Generates search-based outputs for Google/Bing, audience-based outputs for Meta/LinkedIn/Spotify.
 * All outputs are context-aware: industry, geography, audience, budget.
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

  onProgress?.(10, 'Analyzing industry landscape…');
  await delay(500);

  onProgress?.(20, 'Evaluating channel opportunities…');
  await delay(400);
  const channelRecommendations = generateChannelRecs(inputs, ctx);

  onProgress?.(30, 'Researching keyword themes…');
  await delay(500);
  const keywordThemes = generateKeywordThemes(inputs, ctx);

  onProgress?.(45, 'Building audience models…');
  await delay(600);
  const audienceModels = generateAudienceModels(inputs, ctx);

  onProgress?.(60, 'Profiling competitors…');
  await delay(500);
  const competitorProfiles = generateCompetitorProfiles(inputs, ctx);

  onProgress?.(75, 'Computing benchmark assumptions…');
  await delay(500);
  const benchmarkAssumptions = generateBenchmarks(inputs, ctx, channelRecommendations);

  onProgress?.(90, 'Synthesizing research summary…');
  await delay(400);
  const researchSummary = generateSummary(inputs, ctx, channelRecommendations, audienceModels);

  onProgress?.(100, 'Complete');

  return { keywordThemes, competitorProfiles, audienceModels, channelRecommendations, benchmarkAssumptions, researchSummary };
}

/* ── Context ── */

interface GenerationContext {
  area: string;
  product: string;
  audience: string;
  isB2B: boolean;
  isEcom: boolean;
  isLocal: boolean;
}

function buildContext(inputs: MarketIntelligenceInputs): GenerationContext {
  const industry = inputs.industry.toLowerCase();
  return {
    area: inputs.geography || inputs.serviceArea || 'target market',
    product: inputs.productsOrServices || inputs.industry,
    audience: inputs.targetAudience || 'target customers',
    isB2B: inputs.businessModel === 'lead_generation' || industry.includes('professional') || industry.includes('b2b'),
    isEcom: inputs.businessModel === 'ecommerce' || industry.includes('e-commerce') || industry.includes('ecommerce'),
    isLocal: !!(inputs.serviceArea || (inputs.geography && !inputs.geography.toLowerCase().includes('national') && !inputs.geography.toLowerCase().includes('united states'))),
  };
}

/* ═══════════════════════════════════════════════════════
   KEYWORD THEMES — only for search channels
   ═══════════════════════════════════════════════════════ */

function generateKeywordThemes(inputs: MarketIntelligenceInputs, ctx: GenerationContext): KeywordTheme[] {
  const hasSearch = inputs.selectedChannels.some(ch => getChannelType(ch) === 'search') || inputs.selectedChannels.length === 0;
  const hasSEO = inputs.selectedChannels.some(ch => getChannelType(ch) === 'content');
  if (!hasSearch && !hasSEO) return [];

  const themes: KeywordTheme[] = [];
  const { area, product, isLocal, isB2B } = ctx;

  themes.push({
    id: uid('kt'),
    theme: isB2B ? `${inputs.industry} professional services` : `${inputs.industry} solutions`,
    intentType: 'commercial',
    keywordExamples: [
      `best ${product.toLowerCase()} ${isLocal ? area : ''}`.trim(),
      `${inputs.industry.toLowerCase()} ${isB2B ? 'firm' : 'company'} near me`,
      `top ${product.toLowerCase()} provider`,
    ],
    demandCaptureRationale: `High-intent queries from prospects actively evaluating ${inputs.industry.toLowerCase()} options. These drive the highest conversion rates in search campaigns.`,
    notes: `Strong conversion potential. Expect competitive CPCs in ${area}.`,
  });

  themes.push({
    id: uid('kt'),
    theme: `${product} pricing and comparison`,
    intentType: 'transactional',
    keywordExamples: [
      `${product.toLowerCase()} cost`,
      `${product.toLowerCase()} pricing ${new Date().getFullYear()}`,
      `${product.toLowerCase()} quote`,
    ],
    demandCaptureRationale: 'Bottom-of-funnel queries indicating purchase readiness. Essential for capturing demand before competitors.',
  });

  themes.push({
    id: uid('kt'),
    theme: `${inputs.industry} guidance and education`,
    intentType: 'informational',
    keywordExamples: [
      `how to choose ${product.toLowerCase()}`,
      `${inputs.industry.toLowerCase()} guide ${new Date().getFullYear()}`,
      `${product.toLowerCase()} vs alternatives`,
    ],
    demandCaptureRationale: 'Top-of-funnel content. Drives organic authority and email list growth. Supports SEO strategy.',
    notes: 'Best suited for Content/SEO channel. Lower intent but high volume.',
  });

  if (isLocal) {
    themes.push({
      id: uid('kt'),
      theme: `Local ${inputs.industry.toLowerCase()} in ${area}`,
      intentType: 'navigational',
      keywordExamples: [
        `${inputs.industry.toLowerCase()} ${area}`,
        `${product.toLowerCase()} ${area} reviews`,
        `${area} ${inputs.industry.toLowerCase()}`,
      ],
      demandCaptureRationale: `Local search queries dominate mobile results. Google Business Profile optimization is critical for capturing ${area} traffic.`,
    });
  }

  return themes;
}

/* ═══════════════════════════════════════════════════════
   AUDIENCE MODELS — per channel, with channel-specific logic
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
  const { area, audience, isB2B, isEcom, isLocal } = ctx;

  if (channel === 'Meta Ads' || channel === 'Facebook Ads' || channel === 'Instagram Ads') {
    return buildMetaAudiences(inputs, ctx);
  }

  if (channel === 'LinkedIn') {
    return buildLinkedInAudiences(inputs, ctx);
  }

  if (channel === 'Spotify') {
    return buildSpotifyAudiences(inputs, ctx);
  }

  if (channel === 'TikTok') {
    return [{
      id: uid('am'),
      channel: 'TikTok',
      channelType: 'audience',
      audienceDefinition: `${audience} — discovery-oriented content consumers on TikTok`,
      targetingCriteria: [
        `Interest categories: ${inputs.industry}`,
        isLocal ? `Location: ${area}` : 'National targeting',
        isEcom ? 'Shopping behaviors, product discovery' : 'Educational / how-to content consumers',
      ],
      funnelStage: 'awareness',
      estimatedReachMin: isLocal ? 100_000 : 1_000_000,
      estimatedReachMax: isLocal ? 400_000 : 5_000_000,
      recommendedCPM: isLocal ? 5 : 4,
      recommendedCTR: 0.8,
      reasoning: `TikTok provides low-CPM awareness reach for ${inputs.industry}. Best used for brand storytelling and viral content potential. Not a primary conversion channel.`,
    }];
  }

  // YouTube or other audience channels
  return [{
    id: uid('am'),
    channel,
    channelType: 'audience',
    audienceDefinition: `${audience} — reached through ${channel} targeting`,
    targetingCriteria: [`Industry: ${inputs.industry}`, isLocal ? `Geo: ${area}` : 'National'],
    funnelStage: 'awareness',
    estimatedReachMin: 200_000,
    estimatedReachMax: 1_000_000,
    reasoning: `${channel} provides additional reach for ${inputs.industry} audiences.`,
  }];
}

function buildMetaAudiences(inputs: MarketIntelligenceInputs, ctx: GenerationContext): AudienceModel[] {
  const { area, audience, isB2B, isEcom, isLocal } = ctx;
  const models: AudienceModel[] = [];

  // Prospecting audience
  const prospectingAudience = isEcom
    ? `Online shoppers interested in ${inputs.productsOrServices || inputs.industry}`
    : isB2B
      ? `Business decision-makers in ${inputs.industry.toLowerCase()}-adjacent industries`
      : isLocal
        ? `${audience} within ${area} metropolitan area`
        : `${audience} — broad interest-based targeting`;

  const prospectingTargeting = isEcom
    ? ['Interest: Online shopping, DTC brands', `Category: ${inputs.industry}`, 'Behavior: Engaged shoppers']
    : isB2B
      ? [`Job titles: Business owners, C-suite in ${area}`, `Industry: ${inputs.industry}`, 'Behavior: Professional page engagement']
      : isLocal
        ? [`Location: ${area} (15-25 mi radius)`, `Interest: ${inputs.industry}`, `Demographics: ${audience}`]
        : [`Interest: ${inputs.industry}`, `Demographics: ${audience}`, 'Lookalike: 1-3% from customer list'];

  models.push({
    id: uid('am'),
    channel: 'Meta Ads',
    channelType: 'audience',
    audienceDefinition: prospectingAudience,
    targetingCriteria: prospectingTargeting,
    funnelStage: 'awareness',
    estimatedReachMin: isLocal ? 150_000 : isB2B ? 500_000 : 2_000_000,
    estimatedReachMax: isLocal ? 600_000 : isB2B ? 2_000_000 : 8_000_000,
    recommendedCPM: isLocal ? 10 : isB2B ? 14 : isEcom ? 11 : 12,
    recommendedCTR: isB2B ? 0.7 : isEcom ? 1.2 : 0.9,
    recommendedCVR: isB2B ? 2.0 : isEcom ? 1.8 : 1.5,
    reasoning: `Meta prospecting reaches ${prospectingAudience.toLowerCase()} through interest and behavior targeting. ${isLocal ? `Geo-fenced to ${area} for local relevance.` : 'Lookalike audiences from customer data will improve efficiency over time.'} CPM modeled for ${inputs.industry.toLowerCase()} vertical in ${area}.`,
  });

  // Retargeting audience
  models.push({
    id: uid('am'),
    channel: 'Meta Ads',
    channelType: 'audience',
    audienceDefinition: `Retargeting: website visitors, engaged users, and ${isEcom ? 'cart abandoners' : 'form starters'}`,
    targetingCriteria: [
      'Website visitors (7/14/30-day windows)',
      'Social engagers (video viewers, page interactions)',
      isEcom ? 'Cart / checkout abandoners' : 'Lead form openers',
      'Email list match (exclusion + upsell)',
    ],
    funnelStage: 'conversion',
    estimatedReachMin: 5_000,
    estimatedReachMax: 50_000,
    recommendedCPM: isB2B ? 18 : isEcom ? 15 : 16,
    recommendedCTR: isB2B ? 1.2 : isEcom ? 2.0 : 1.5,
    recommendedCVR: isB2B ? 5.0 : isEcom ? 4.0 : 3.5,
    reasoning: `Retargeting converts warm audiences at 2-4x the rate of prospecting. Higher CPMs are offset by significantly higher conversion rates. Size depends on traffic volume.`,
  });

  return models;
}

function buildLinkedInAudiences(inputs: MarketIntelligenceInputs, ctx: GenerationContext): AudienceModel[] {
  const { area, audience, isLocal } = ctx;
  return [
    {
      id: uid('am'),
      channel: 'LinkedIn',
      channelType: 'audience',
      audienceDefinition: `Decision-makers and influencers in ${inputs.industry}-relevant industries`,
      targetingCriteria: [
        `Job titles: CEO, CFO, VP Marketing, Director, General Counsel`,
        `Company size: 50-5,000 employees`,
        `Industries: ${inputs.industry} and adjacent verticals`,
        isLocal ? `Geography: ${area}` : 'National / regional targeting',
        'Seniority: Senior, Director, VP, C-Suite',
      ],
      funnelStage: 'consideration',
      estimatedReachMin: isLocal ? 20_000 : 100_000,
      estimatedReachMax: isLocal ? 80_000 : 400_000,
      recommendedCPM: 35,
      recommendedCTR: 0.5,
      recommendedCVR: 2.5,
      reasoning: `LinkedIn provides the highest-quality B2B targeting by job title, company, and seniority. Higher CPMs are justified by audience precision and lead quality. Best for thought leadership content and gated asset promotion.`,
    },
    {
      id: uid('am'),
      channel: 'LinkedIn',
      channelType: 'audience',
      audienceDefinition: `Retargeting: LinkedIn page visitors and content engagers`,
      targetingCriteria: [
        'Website visitors via LinkedIn Insight Tag',
        'Company page followers',
        'Video viewers (50%+ completion)',
        'Lead gen form openers',
      ],
      funnelStage: 'conversion',
      estimatedReachMin: 2_000,
      estimatedReachMax: 15_000,
      recommendedCPM: 45,
      recommendedCTR: 0.8,
      recommendedCVR: 6.0,
      reasoning: `LinkedIn retargeting audiences are small but high-intent. The elevated CPM is offset by strong conversion rates among engaged professional audiences.`,
    },
  ];
}

function buildSpotifyAudiences(inputs: MarketIntelligenceInputs, ctx: GenerationContext): AudienceModel[] {
  const { area, audience, isLocal } = ctx;
  return [{
    id: uid('am'),
    channel: 'Spotify',
    channelType: 'audience',
    audienceDefinition: `${audience} — audio ad listeners matched by demographics, geography, and topical fit`,
    targetingCriteria: [
      `Demographics: aligned to ${audience}`,
      isLocal ? `Geography: ${area}` : 'National targeting',
      `Genre/Mood: contextual fit for ${inputs.industry}`,
      'Device: mobile + desktop streaming sessions',
      'Daypart: commute, workout, or focus listening sessions',
    ],
    funnelStage: 'awareness',
    estimatedReachMin: isLocal ? 50_000 : 500_000,
    estimatedReachMax: isLocal ? 200_000 : 2_000_000,
    recommendedCPM: 18,
    recommendedCTR: 0.3,
    reasoning: `Spotify audio ads reach audiences during high-attention listening moments. Best for brand awareness and frequency building. Limited direct-response capability but strong recall metrics. CPM modeled for ${inputs.industry.toLowerCase()} in ${area}.`,
  }];
}

function buildSearchAudienceModel(channel: string, inputs: MarketIntelligenceInputs, ctx: GenerationContext): AudienceModel {
  const { area, isLocal, isB2B } = ctx;
  return {
    id: uid('am'),
    channel,
    channelType: 'search',
    audienceDefinition: `High-intent searchers actively looking for ${inputs.productsOrServices || inputs.industry} solutions`,
    targetingCriteria: [
      'Keyword-driven intent targeting',
      isLocal ? `Geo-targeted: ${area}` : 'National with bid adjustments by region',
      isB2B ? 'In-market audiences: Business services' : `In-market audiences: ${inputs.industry}`,
    ],
    funnelStage: 'conversion',
    estimatedReachMin: isLocal ? 5_000 : 50_000,
    estimatedReachMax: isLocal ? 30_000 : 300_000,
    reasoning: `Search audiences are intent-defined, not demographic. Reach is determined by keyword volume and match types. ${channel} captures demand at the moment of highest purchase intent.`,
  };
}

/* ═══════════════════════════════════════════════════════
   COMPETITOR PROFILES
   ═══════════════════════════════════════════════════════ */

function generateCompetitorProfiles(inputs: MarketIntelligenceInputs, ctx: GenerationContext): CompetitorProfile[] {
  const { area, isLocal, isB2B } = ctx;
  const names = inputs.knownCompetitors?.length
    ? inputs.knownCompetitors
    : [
        `${inputs.industry} Market Leader${isLocal ? ` — ${area}` : ''}`,
        `Digital-First ${inputs.industry} Challenger`,
        `${isB2B ? 'Established' : 'Legacy'} ${inputs.industry} Provider`,
      ];

  return names.slice(0, 4).map((name, i) => ({
    id: uid('cp'),
    name,
    geography: area,
    positioning: i === 0
      ? `Established market leader with broad ${inputs.industry.toLowerCase()} offering${isLocal ? ` and strong local presence in ${area}` : ''}`
      : i === 1
        ? `Digital-native competitor with aggressive online acquisition strategy`
        : `Traditional provider with loyal customer base and referral-driven growth`,
    channelObservations: i === 0
      ? `Strong Google Ads presence, well-established SEO.${isB2B ? ' Active LinkedIn thought leadership.' : ' Growing social media following.'}`
      : i === 1
        ? `Heavy Meta/Instagram spend, strong social proof strategy.${isB2B ? ' LinkedIn Sponsored Content campaigns.' : ' Emerging TikTok presence.'}`
        : 'Minimal digital footprint. Primarily referral and offline marketing. Opportunity to outpace digitally.',
    notes: i === 0 ? 'Closest positioning overlap — monitor creative and messaging closely.' : undefined,
  }));
}

/* ═══════════════════════════════════════════════════════
   CHANNEL RECOMMENDATIONS
   ═══════════════════════════════════════════════════════ */

function generateChannelRecs(inputs: MarketIntelligenceInputs, ctx: GenerationContext): ChannelRecommendation[] {
  const { isB2B, isEcom, isLocal } = ctx;
  const recs: ChannelRecommendation[] = [];

  // Google is nearly always recommended
  recs.push({
    channel: 'Google Ads',
    channelType: 'search',
    role: 'Demand capture and high-intent conversion',
    rationale: `Captures searchers actively looking for ${inputs.industry.toLowerCase()} solutions. ${isLocal ? `Local search modifiers drive highly qualified traffic from ${ctx.area}.` : 'Foundation of any performance marketing mix.'}`,
    priority: 'high',
  });

  if (isB2B) {
    recs.push(
      { channel: 'LinkedIn', channelType: 'audience', role: 'Authority building and lead generation', rationale: `Best B2B platform for reaching decision-makers by job title and company. Ideal for thought leadership and gated content promotion for ${inputs.industry}.`, priority: 'high' },
      { channel: 'Content/SEO', channelType: 'content', role: 'Organic authority and lead capture', rationale: 'Long-form content builds domain authority and captures informational queries that feed the sales pipeline.', priority: 'high' },
      { channel: 'Meta Ads', channelType: 'audience', role: 'Retargeting and awareness', rationale: `Meta retargeting recaptures website visitors. Prospecting can work for B2B with careful audience selection and thought leadership creative.`, priority: 'medium' },
      { channel: 'Email', channelType: 'email', role: 'Lead nurture and retention', rationale: 'Automated drip sequences convert MQLs to SQLs. Critical for long sales cycles.', priority: 'medium' },
    );
  } else if (isEcom) {
    recs.push(
      { channel: 'Meta Ads', channelType: 'audience', role: 'Primary prospecting and retargeting engine', rationale: `Largest addressable audience for DTC with proven creative formats. Audience-based targeting reaches ${ctx.audience} through interests and behaviors.`, priority: 'high' },
      { channel: 'Email/SMS', channelType: 'email', role: 'Lifecycle, retention, and revenue', rationale: 'Highest-leverage owned channel. 25-35% revenue contribution at maturity through automated flows.', priority: 'high' },
      { channel: 'TikTok', channelType: 'audience', role: 'Awareness and product discovery', rationale: 'Low CPMs and strong DTC storytelling potential. Viral content can drive outsized awareness at low cost.', priority: 'medium' },
    );
  } else {
    recs.push(
      { channel: 'Meta Ads', channelType: 'audience', role: 'Awareness, prospecting, and retargeting', rationale: `Meta provides broad reach for ${inputs.industry.toLowerCase()} targeting ${ctx.audience}. ${isLocal ? `Geo-fenced to ${ctx.area} for local efficiency.` : 'Interest and behavior targeting for qualified prospecting.'}`, priority: 'high' },
      { channel: 'Email', channelType: 'email', role: 'Retention and lifecycle communication', rationale: 'Cost-effective channel for nurturing leads and retaining customers.', priority: 'medium' },
      { channel: 'Content/SEO', channelType: 'content', role: 'Organic traffic and authority', rationale: 'Builds sustainable traffic and brand authority over time.', priority: 'medium' },
    );
  }

  // Check if Spotify or LinkedIn was selected but not yet recommended
  for (const ch of inputs.selectedChannels) {
    if (!recs.find(r => r.channel === ch)) {
      if (ch === 'Spotify') {
        recs.push({ channel: 'Spotify', channelType: 'audience', role: 'Audio awareness and brand recall', rationale: `Audio ads reach ${ctx.audience} during high-attention moments. Best for frequency building and local awareness in ${ctx.area}.`, priority: 'low' });
      }
    }
  }

  return recs;
}

/* ═══════════════════════════════════════════════════════
   BENCHMARK ASSUMPTIONS — channel-type-aware
   ═══════════════════════════════════════════════════════ */

function generateBenchmarks(
  inputs: MarketIntelligenceInputs,
  ctx: GenerationContext,
  recs: ChannelRecommendation[],
): BenchmarkAssumption[] {
  const benchmarks: BenchmarkAssumption[] = [];
  const { isB2B, isEcom, isLocal, area } = ctx;

  for (const rec of recs) {
    switch (rec.channel) {
      case 'Google Ads':
        benchmarks.push(
          { channel: 'Google Ads', channelType: 'search', metric: 'CPC', unit: '$', low: isB2B ? 3.0 : isLocal ? 1.2 : 0.8, high: isB2B ? 12.0 : isLocal ? 4.0 : 3.5, recommended: isB2B ? 5.5 : isLocal ? 2.2 : 1.8, rationale: `${inputs.industry} search CPC in ${area}. ${isB2B ? 'B2B terms command premium CPCs due to high LTV.' : isLocal ? 'Local modifiers reduce competition vs. national terms.' : 'Blended branded + non-branded estimate.'}` },
          { channel: 'Google Ads', channelType: 'search', metric: 'CTR', unit: '%', low: 2.0, high: 6.0, recommended: isB2B ? 3.2 : 4.0, rationale: `Search CTR for ${inputs.industry.toLowerCase()}. ${isLocal ? 'Local intent ads typically achieve higher CTR.' : 'Assumes optimized ad copy and extensions.'}` },
          { channel: 'Google Ads', channelType: 'search', metric: 'CVR', unit: '%', low: 1.5, high: 6.0, recommended: isB2B ? 3.0 : isEcom ? 2.5 : 3.5, rationale: `${isB2B ? 'Lead form conversion rate.' : isEcom ? 'Shopping + search blended conversion.' : 'Landing page conversion rate.'} Assumes optimized experience.` },
          { channel: 'Google Ads', channelType: 'search', metric: isB2B ? 'CPL' : 'CPA', unit: '$', low: isB2B ? 40 : isEcom ? 15 : 20, high: isB2B ? 250 : isEcom ? 60 : 100, recommended: isB2B ? 120 : isEcom ? 35 : 50, rationale: `Derived from CPC ÷ CVR. ${isB2B ? 'B2B CPL varies widely by service complexity.' : `${inputs.industry} acquisition cost benchmark.`}` },
        );
        break;

      case 'Meta Ads':
        benchmarks.push(
          { channel: 'Meta Ads', channelType: 'audience', metric: 'CPM (Prospecting)', unit: '$', low: isLocal ? 7 : 6, high: isLocal ? 16 : 20, recommended: isLocal ? 10 : isB2B ? 14 : isEcom ? 11 : 12, rationale: `Prospecting CPM for ${inputs.industry.toLowerCase()} in ${area}. ${isLocal ? 'Local geo-targeting moderates competition.' : 'Varies by audience size and creative quality.'}` },
          { channel: 'Meta Ads', channelType: 'audience', metric: 'CPM (Retargeting)', unit: '$', low: 12, high: 25, recommended: isB2B ? 18 : 15, rationale: 'Retargeting CPMs are higher due to smaller, warmer audiences. Justified by higher conversion rates.' },
          { channel: 'Meta Ads', channelType: 'audience', metric: 'CTR', unit: '%', low: 0.5, high: 2.0, recommended: isEcom ? 1.2 : isB2B ? 0.7 : 0.9, rationale: `${isEcom ? 'Product-focused creative typically drives higher CTR.' : isB2B ? 'B2B CTR tends lower but traffic is more qualified.' : 'Blended prospecting + retargeting estimate.'}` },
          { channel: 'Meta Ads', channelType: 'audience', metric: 'CVR', unit: '%', low: 0.8, high: 5.0, recommended: isEcom ? 1.8 : isB2B ? 2.0 : 1.5, rationale: `Landing page conversion rate from Meta traffic. ${isEcom ? 'Retargeting can reach 4-5% for cart abandoners.' : 'Varies by offer quality and landing page relevance.'}` },
          { channel: 'Meta Ads', channelType: 'audience', metric: isB2B ? 'CPL' : 'CPA', unit: '$', low: isB2B ? 35 : isEcom ? 20 : 25, high: isB2B ? 180 : isEcom ? 65 : 90, recommended: isB2B ? 85 : isEcom ? 38 : 50, rationale: `Blended prospecting + retargeting ${isB2B ? 'cost per lead' : 'cost per acquisition'} for ${inputs.industry.toLowerCase()}.` },
        );
        break;

      case 'LinkedIn':
        benchmarks.push(
          { channel: 'LinkedIn', channelType: 'audience', metric: 'CPM', unit: '$', low: 25, high: 55, recommended: 35, rationale: `LinkedIn CPMs are premium but deliver precise B2B targeting. Justified by lead quality for ${inputs.industry}.` },
          { channel: 'LinkedIn', channelType: 'audience', metric: 'CPC', unit: '$', low: 5, high: 15, recommended: 8.5, rationale: 'Sponsored content CPC. Higher than Meta but reaches verified professionals.' },
          { channel: 'LinkedIn', channelType: 'audience', metric: 'CTR', unit: '%', low: 0.3, high: 0.8, recommended: 0.5, rationale: 'Professional feed environment. Thought leadership content outperforms promotional.' },
          { channel: 'LinkedIn', channelType: 'audience', metric: 'CPL', unit: '$', low: 50, high: 250, recommended: 130, rationale: `Cost per lead via sponsored content to gated assets. ${inputs.industry} B2B lead value typically justifies this range.` },
        );
        break;

      case 'Spotify':
        benchmarks.push(
          { channel: 'Spotify', channelType: 'audience', metric: 'CPM', unit: '$', low: 12, high: 25, recommended: 18, rationale: `Audio ad CPM for ${area}. Premium inventory with high attention scores.` },
          { channel: 'Spotify', channelType: 'audience', metric: 'Listen-Through Rate', unit: '%', low: 85, high: 97, recommended: 92, rationale: 'Non-skippable audio format drives high completion. Industry average 90%+.' },
          { channel: 'Spotify', channelType: 'audience', metric: 'CTR (Companion)', unit: '%', low: 0.1, high: 0.5, recommended: 0.3, rationale: 'Companion display banner CTR. Audio is primarily an awareness channel.' },
        );
        break;

      case 'TikTok':
        benchmarks.push(
          { channel: 'TikTok', channelType: 'audience', metric: 'CPM', unit: '$', low: 3, high: 10, recommended: isLocal ? 5 : 4, rationale: `Lowest-CPM major platform. Excellent for awareness in ${inputs.industry.toLowerCase()}.` },
          { channel: 'TikTok', channelType: 'audience', metric: 'CTR', unit: '%', low: 0.5, high: 1.5, recommended: 0.8, rationale: 'Short-form video CTR. Spark Ads (boosted organic) typically outperform traditional formats.' },
          { channel: 'TikTok', channelType: 'audience', metric: 'CVR', unit: '%', low: 0.3, high: 1.5, recommended: 0.6, rationale: 'Lower conversion intent than search. Best paired with retargeting on other platforms.' },
        );
        break;

      case 'Email':
      case 'Email/SMS':
        benchmarks.push(
          { channel: rec.channel, channelType: 'email', metric: 'Open Rate', unit: '%', low: 18, high: 35, recommended: 24, rationale: `${inputs.industry} email open rate. List hygiene and segmentation are primary drivers.` },
          { channel: rec.channel, channelType: 'email', metric: 'Click Rate', unit: '%', low: 1.5, high: 5.0, recommended: 3.2, rationale: 'Click-through rate. Flow emails typically outperform campaigns.' },
          { channel: rec.channel, channelType: 'email', metric: 'Revenue Share', unit: '%', low: 15, high: 35, recommended: isEcom ? 28 : 20, rationale: `Percentage of total revenue from email. ${isEcom ? 'Best-in-class DTC programs reach 30%+.' : 'B2B attribution focuses on pipeline influence.'}` },
        );
        break;

      case 'Content/SEO':
        benchmarks.push(
          { channel: 'Content/SEO', channelType: 'content', metric: 'Organic Traffic Growth', unit: '%/mo', low: 5, high: 20, recommended: 12, rationale: `Monthly organic traffic growth after 3-month ramp. ${inputs.industry} content competition is ${isB2B ? 'moderate' : 'competitive'}.` },
          { channel: 'Content/SEO', channelType: 'content', metric: 'Organic CVR', unit: '%', low: 1.0, high: 4.0, recommended: 2.5, rationale: 'Organic visitor conversion rate. Higher for bottom-of-funnel content, lower for educational.' },
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
): string {
  const searchChannels = recs.filter(r => r.channelType === 'search');
  const audienceChannels = recs.filter(r => r.channelType === 'audience');
  const highPriority = recs.filter(r => r.priority === 'high').map(r => r.channel).join(', ');
  const audienceCount = audiences.filter(a => a.channelType === 'audience').length;

  let summary = `${inputs.industry} in ${ctx.area} `;

  if (searchChannels.length > 0 && audienceChannels.length > 0) {
    summary += `benefits from a dual approach: search-based demand capture via ${searchChannels.map(s => s.channel).join(', ')} and audience-based prospecting via ${audienceChannels.map(a => a.channel).join(', ')}. `;
  } else if (searchChannels.length > 0) {
    summary += `is best served by search-driven demand capture. `;
  } else {
    summary += `should prioritize audience-based prospecting and awareness. `;
  }

  summary += `${audienceCount} audience model${audienceCount !== 1 ? 's' : ''} have been built across channels, each with platform-specific targeting criteria and benchmark assumptions. `;
  summary += `High-priority channels: ${highPriority}. `;

  if (ctx.isLocal) {
    summary += `Local targeting in ${ctx.area} provides geographic efficiency and reduces competition on key terms. `;
  }

  summary += `All benchmarks are modeled assumptions based on ${inputs.industry.toLowerCase()} vertical data and should be validated against actual performance within the first 30-60 days. These assumptions are designed to feed directly into the Growth Model for planning.`;

  return summary;
}
