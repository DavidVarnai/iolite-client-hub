/**
 * Mock Market Intelligence adapter.
 * Generates structured MI output from client inputs.
 * Future: swap to real AI/edge function.
 */
import type {
  MarketIntelligenceInputs,
  MarketIntelligenceOutputs,
  KeywordTheme,
  CompetitorProfile,
  AudienceModel,
  ChannelRecommendation,
  BenchmarkAssumption,
} from '@/types/marketIntelligence';

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

export async function generateMarketIntelligence(
  inputs: MarketIntelligenceInputs,
  onProgress?: (pct: number, label: string) => void,
): Promise<MarketIntelligenceOutputs> {
  onProgress?.(10, 'Analyzing industry landscape…');
  await delay(600);

  onProgress?.(25, 'Researching keyword themes…');
  await delay(500);
  const keywordThemes = generateKeywordThemes(inputs);

  onProgress?.(40, 'Profiling competitors…');
  await delay(500);
  const competitorProfiles = generateCompetitorProfiles(inputs);

  onProgress?.(55, 'Building audience models…');
  await delay(500);
  const audienceModels = generateAudienceModels(inputs);

  onProgress?.(70, 'Evaluating channel opportunities…');
  await delay(400);
  const channelRecommendations = generateChannelRecs(inputs);

  onProgress?.(85, 'Computing benchmark assumptions…');
  await delay(400);
  const benchmarkAssumptions = generateBenchmarks(inputs);

  onProgress?.(95, 'Synthesizing research summary…');
  await delay(300);
  const researchSummary = generateSummary(inputs, keywordThemes, competitorProfiles, channelRecommendations);

  onProgress?.(100, 'Complete');

  return {
    keywordThemes,
    competitorProfiles,
    audienceModels,
    channelRecommendations,
    benchmarkAssumptions,
    researchSummary,
  };
}

/* ── Generators ── */

function generateKeywordThemes(inputs: MarketIntelligenceInputs): KeywordTheme[] {
  const { industry, productsOrServices, geography } = inputs;
  const area = geography || 'target market';
  const product = productsOrServices || industry;

  return [
    {
      id: `kt-${Date.now()}-1`,
      theme: `${industry} services`,
      intentType: 'commercial',
      keywordExamples: [
        `best ${product.toLowerCase()} ${area}`,
        `${industry.toLowerCase()} near me`,
        `top ${industry.toLowerCase()} companies`,
      ],
      notes: 'High-intent commercial queries with strong conversion potential.',
    },
    {
      id: `kt-${Date.now()}-2`,
      theme: `${product} solutions`,
      intentType: 'transactional',
      keywordExamples: [
        `buy ${product.toLowerCase()}`,
        `${product.toLowerCase()} pricing`,
        `${product.toLowerCase()} quote`,
      ],
    },
    {
      id: `kt-${Date.now()}-3`,
      theme: `${industry} education`,
      intentType: 'informational',
      keywordExamples: [
        `how to choose ${product.toLowerCase()}`,
        `${industry.toLowerCase()} guide ${new Date().getFullYear()}`,
        `${product.toLowerCase()} vs comparison`,
      ],
      notes: 'Top-of-funnel content opportunity for SEO authority building.',
    },
    {
      id: `kt-${Date.now()}-4`,
      theme: `Local ${industry.toLowerCase()}`,
      intentType: 'navigational',
      keywordExamples: [
        `${industry.toLowerCase()} ${area}`,
        `${product.toLowerCase()} ${area} reviews`,
        `${area} ${industry.toLowerCase()} directory`,
      ],
    },
  ];
}

function generateCompetitorProfiles(inputs: MarketIntelligenceInputs): CompetitorProfile[] {
  const { industry, geography, knownCompetitors } = inputs;
  const area = geography || 'regional';

  const names = knownCompetitors?.length
    ? knownCompetitors
    : [`${industry} Market Leader`, `Digital-First ${industry} Challenger`, `Legacy ${industry} Provider`];

  return names.slice(0, 4).map((name, i) => ({
    id: `cp-${Date.now()}-${i}`,
    name,
    geography: area,
    positioning: i === 0
      ? `Established market leader with broad ${industry.toLowerCase()} offering`
      : i === 1
        ? `Digital-native competitor with aggressive online acquisition`
        : `Traditional provider with loyal customer base`,
    channelObservations: i === 0
      ? 'Strong Google Ads presence, well-established SEO, active LinkedIn content program.'
      : i === 1
        ? 'Heavy Meta/Instagram spend, strong social proof strategy, emerging TikTok presence.'
        : 'Minimal digital footprint. Primarily referral and offline marketing. Opportunity to outpace digitally.',
    notes: i === 0 ? 'Closest positioning overlap — monitor creative and messaging closely.' : undefined,
  }));
}

function generateAudienceModels(inputs: MarketIntelligenceInputs): AudienceModel[] {
  const { targetAudience, selectedChannels } = inputs;
  const channels = selectedChannels.length > 0
    ? selectedChannels.filter(c => ['Paid Media', 'Social Media', 'Email Marketing', 'Content/SEO'].includes(c))
    : ['Paid Media', 'Social Media'];

  if (channels.length === 0) channels.push('Paid Media');

  return channels.map((ch, i) => ({
    id: `am-${Date.now()}-${i}`,
    channel: ch,
    audienceDefinition: `${targetAudience || 'Target customers'} — reached via ${ch.toLowerCase()} channels`,
    estimatedReachMin: ch === 'Paid Media' ? 500_000 : ch === 'Social Media' ? 200_000 : 50_000,
    estimatedReachMax: ch === 'Paid Media' ? 2_000_000 : ch === 'Social Media' ? 800_000 : 200_000,
    reasoning: `${ch} provides ${ch === 'Paid Media' ? 'high-intent reach through targeted campaigns' : ch === 'Social Media' ? 'brand awareness and community building' : 'organic discovery and nurture'} for this audience segment.`,
  }));
}

function generateChannelRecs(inputs: MarketIntelligenceInputs): ChannelRecommendation[] {
  const isB2B = inputs.businessModel === 'lead_generation' || inputs.industry.toLowerCase().includes('professional');
  const isEcom = inputs.businessModel === 'ecommerce';

  const recs: ChannelRecommendation[] = [
    {
      channel: 'Google Ads',
      role: 'Intent capture and conversion',
      rationale: 'Captures high-intent searchers actively looking for solutions. Foundation of any performance marketing mix.',
      priority: 'high',
    },
  ];

  if (isB2B) {
    recs.push(
      { channel: 'LinkedIn', role: 'Authority and lead nurture', rationale: 'Best B2B platform for decision-maker targeting and thought leadership.', priority: 'high' },
      { channel: 'Content/SEO', role: 'Organic authority', rationale: 'Long-form content builds trust and captures informational queries.', priority: 'high' },
      { channel: 'Email', role: 'Lead nurture and retention', rationale: 'Automated drip sequences convert MQLs to SQLs.', priority: 'medium' },
    );
  } else if (isEcom) {
    recs.push(
      { channel: 'Meta Ads', role: 'Prospecting and retargeting', rationale: 'Largest addressable audience for DTC with proven creative formats.', priority: 'high' },
      { channel: 'Email/SMS', role: 'Lifecycle and retention', rationale: 'Highest-leverage owned channel. 25-35% revenue contribution at maturity.', priority: 'high' },
      { channel: 'TikTok', role: 'Awareness and discovery', rationale: 'Low CPMs, strong for DTC brand storytelling and viral potential.', priority: 'medium' },
    );
  } else {
    recs.push(
      { channel: 'Meta Ads', role: 'Awareness and prospecting', rationale: 'Broad reach for brand awareness and lead generation.', priority: 'high' },
      { channel: 'Email', role: 'Retention and lifecycle', rationale: 'Cost-effective retention channel with strong ROI.', priority: 'medium' },
      { channel: 'Content/SEO', role: 'Organic growth', rationale: 'Builds sustainable traffic and authority over time.', priority: 'medium' },
    );
  }

  return recs;
}

function generateBenchmarks(inputs: MarketIntelligenceInputs): BenchmarkAssumption[] {
  const isB2B = inputs.businessModel === 'lead_generation';

  return [
    { channel: 'Google Ads', metric: 'CPC', low: isB2B ? 2.5 : 0.8, high: isB2B ? 8.0 : 3.0, recommended: isB2B ? 4.5 : 1.8, rationale: `${inputs.industry} vertical average for search campaigns.` },
    { channel: 'Google Ads', metric: 'CTR', low: 2.0, high: 5.5, recommended: 3.5, rationale: 'Blended search campaign benchmark.' },
    { channel: 'Google Ads', metric: 'CVR', low: 1.5, high: 5.0, recommended: 3.0, rationale: 'Landing page dependent. Assumes optimized experience.' },
    { channel: 'Meta Ads', metric: 'CPM', low: 6, high: 18, recommended: 11, rationale: 'Prospecting + retargeting blended CPM.' },
    { channel: 'Meta Ads', metric: 'CPA', low: isB2B ? 50 : 25, high: isB2B ? 200 : 70, recommended: isB2B ? 100 : 42, rationale: `Based on ${inputs.industry} vertical benchmarks.` },
    { channel: 'Email', metric: 'Open Rate (%)', low: 18, high: 35, recommended: 24, rationale: 'Cross-industry email open rate benchmark.' },
    { channel: 'Email', metric: 'Revenue Share (%)', low: 15, high: 35, recommended: 25, rationale: 'Percentage of total revenue from email channel.' },
  ];
}

function generateSummary(
  inputs: MarketIntelligenceInputs,
  keywords: KeywordTheme[],
  competitors: CompetitorProfile[],
  channels: ChannelRecommendation[],
): string {
  const area = inputs.geography || inputs.serviceArea || 'the target market';
  const highPriority = channels.filter(c => c.priority === 'high').map(c => c.channel).join(', ');

  return `${inputs.industry} in ${area} presents a competitive landscape with ${competitors.length} identified competitors. ` +
    `The primary keyword themes span ${keywords.length} intent categories, indicating opportunities across the full funnel. ` +
    `Recommended high-priority channels include ${highPriority}. ` +
    `${inputs.productsOrServices ? `The core offering — ${inputs.productsOrServices} — ` : 'The business '}` +
    `should focus on differentiation through ${inputs.businessModel === 'lead_generation' ? 'thought leadership and authority building' : 'creative excellence and customer experience'}. ` +
    `Key benchmarks have been calibrated to the ${inputs.industry.toLowerCase()} vertical and should serve as starting assumptions for the Growth Model.`;
}
