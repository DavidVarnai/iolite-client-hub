/**
 * AI Adapter layer — V1 uses mock responses.
 * Future: swap to real AI/n8n endpoints without touching UI.
 */
import type {
  MarketResearchRequest, MarketResearchResult,
  StrategyDraftRequest, StrategyDraftResult,
  BenchmarkRequest, BenchmarkResult,
  PerformanceAnalysisRequest, PerformanceAnalysisResult,
  SummaryWriterRequest, SummaryWriterResult,
} from '@/types/ai';

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

// ─── Mock: Market Research ───

export async function fetchMarketResearch(req: MarketResearchRequest): Promise<MarketResearchResult> {
  await delay(1800);
  return {
    marketOverview: `The ${req.industry} market in ${req.geography || 'the US'} is experiencing steady growth driven by digital transformation and evolving consumer expectations. Key trends include mobile-first commerce, personalization at scale, and sustainability-driven purchasing. The competitive landscape is moderately concentrated with established incumbents facing pressure from digitally-native challengers.`,
    topCompetitors: [
      { name: 'Industry Leader Co.', url: 'https://example.com', notes: 'Market leader with ~25% share. Strong brand, aggressive paid media, mature email program.' },
      { name: 'Digital Challenger Inc.', notes: 'Fast-growing DTC brand. Heavy Meta/TikTok investment. Known for creative excellence.' },
      { name: 'Legacy Brand Group', notes: 'Traditional player pivoting to digital. Large budget but slow execution.' },
      { name: 'Niche Specialist Ltd.', notes: 'Focused on a premium segment. High AOV, lower volume, strong organic presence.' },
    ],
    acquisitionChannels: [
      'Paid Search (Google Ads) — dominant for high-intent capture',
      'Paid Social (Meta, TikTok) — primary for prospecting and awareness',
      'Email/SMS — critical retention and lifecycle channel',
      'Organic Search (SEO) — long-term authority play',
      'Affiliate / Influencer — growing channel for social proof',
    ],
    positioningThemes: [
      'Quality and craftsmanship differentiation',
      'Customer-centric experience and support',
      'Sustainability and ethical sourcing',
      'Community-driven brand advocacy',
    ],
    benchmarkNotes: [
      { metric: 'Customer Acquisition Cost', range: '$28 – $65', notes: `Typical for ${req.industry}. Lower end for branded search, higher for prospecting.` },
      { metric: 'Average CPC', range: '$0.80 – $2.50', notes: 'Varies by platform. Google Search higher than Meta.' },
      { metric: 'Conversion Rate', range: '1.8% – 4.2%', notes: 'Desktop typically 2x mobile. Depends heavily on landing page quality.' },
      { metric: 'Email Revenue Share', range: '20% – 35%', notes: 'Best-in-class programs with robust flows reach 30%+.' },
    ],
  };
}

// ─── Mock: Strategy Draft ───

export async function fetchStrategyDraft(req: StrategyDraftRequest): Promise<StrategyDraftResult> {
  await delay(1500);
  const channelLabel = req.channel.replace(/_/g, ' ');
  return {
    objectives: `Establish a high-performing ${channelLabel} program that drives measurable growth in customer acquisition and revenue, aligned with the overall business goal of ${req.growthGoals || 'sustainable growth'}. Focus on efficiency, scalability, and clear attribution.`,
    keyInitiatives: [
      `Audit current ${channelLabel} performance and identify optimization opportunities`,
      'Develop audience segmentation and targeting framework',
      'Build creative testing and iteration process',
      'Implement measurement and attribution infrastructure',
      `Launch phased campaign structure optimized for ${req.businessModel || 'the business model'}`,
    ],
    timelineIdeas: 'Month 1: Audit and planning. Month 2–3: Foundation build and initial launch. Month 4–6: Optimization and scaling. Quarterly reviews thereafter.',
    dependencies: [
      'Access to analytics platforms and historical data',
      'Creative assets and brand guidelines',
      'Landing page development support',
      'Alignment on KPIs and reporting cadence',
    ],
    successMetrics: [
      'Cost per acquisition within target range',
      'Return on ad spend (ROAS) improvement over baseline',
      'Conversion rate improvement quarter-over-quarter',
      'Incremental revenue attributable to channel',
    ],
  };
}

// ─── Mock: Benchmark Suggestions ───

export async function fetchBenchmarks(req: BenchmarkRequest): Promise<BenchmarkResult> {
  await delay(1200);

  const channelBenchmarks: Record<string, { metric: string; low: number; mid: number; high: number; unit: string; notes: string }[]> = {
    default: [
      { metric: 'CPM', low: 5, mid: 12, high: 25, unit: '$', notes: `Industry avg for ${req.industry}` },
      { metric: 'CTR', low: 0.8, mid: 1.5, high: 3.0, unit: '%', notes: 'Varies by creative quality and targeting' },
      { metric: 'CPC', low: 0.6, mid: 1.8, high: 4.5, unit: '$', notes: 'Lower for social, higher for search' },
      { metric: 'LP Conv Rate', low: 1.5, mid: 3.2, high: 6.0, unit: '%', notes: 'Highly dependent on landing page quality' },
      { metric: 'CPL / CPA', low: 15, mid: 38, high: 75, unit: '$', notes: `Based on ${req.businessModel || 'general'} benchmarks` },
      { metric: 'AOV / Deal Size', low: 45, mid: 85, high: 200, unit: '$', notes: 'Depends on product mix and segment' },
    ],
  };

  return {
    channel: req.channel,
    benchmarks: channelBenchmarks.default,
  };
}

// ─── Mock: Performance Analysis ───

export async function fetchPerformanceAnalysis(req: PerformanceAnalysisRequest): Promise<PerformanceAnalysisResult> {
  await delay(1600);

  const totalForecastSpend = req.months.reduce((s, m) => s + m.forecastSpend, 0);
  const totalActualSpend = req.months.reduce((s, m) => s + m.actualSpend, 0);
  const spendDelta = ((totalActualSpend - totalForecastSpend) / (totalForecastSpend || 1) * 100).toFixed(1);

  return {
    summary: `Overall spend is ${Number(spendDelta) > 0 ? 'over' : 'under'} forecast by ${Math.abs(Number(spendDelta))}%. Results volume is tracking ${Number(spendDelta) > 0 ? 'above' : 'below'} plan, but efficiency metrics show some divergence from targets that warrant attention.`,
    keyDrivers: [
      'Paid search CPCs have increased due to competitive pressure in core keywords',
      'Meta prospecting audiences are performing better than expected, driving incremental volume',
      'Email automation flows are contributing to improved blended efficiency',
      'Seasonal demand patterns are creating expected monthly variance',
    ],
    risks: [
      'CPA trending above target on Google Search — may need keyword pruning',
      'Meta frequency increasing on retargeting audiences — creative fatigue risk',
      'Landing page conversion rate flat despite traffic growth — potential UX friction',
    ],
    recommendedActions: [
      'Reallocate 10–15% of Google Search budget from broad match to exact match high-performers',
      'Refresh Meta retargeting creatives to address frequency fatigue',
      'Run landing page A/B test on top 5 product pages',
      'Increase Meta prospecting budget by 20% given strong early performance',
    ],
  };
}

// ─── Mock: Summary Writer ───

export async function fetchSummary(req: SummaryWriterRequest): Promise<SummaryWriterResult> {
  await delay(1400);

  const typeLabels: Record<string, string> = {
    proposal: 'Proposal Summary',
    investment: 'Investment Summary',
    monthly_performance: 'Monthly Performance Summary',
    quarterly_review: 'Quarterly Strategic Review',
  };

  const title = `${req.clientName} — ${typeLabels[req.summaryType] || 'Summary'}`;

  if (req.summaryType === 'proposal') {
    return {
      title,
      content: `We are pleased to present a comprehensive growth strategy for ${req.clientName}, designed to drive measurable results across key digital channels.`,
      sections: [
        { heading: 'Strategic Overview', body: `Our approach for ${req.clientName} focuses on building a scalable, data-driven marketing engine. ${req.strategySummaries?.map(s => `In ${s.channel.replace(/_/g, ' ')}, we will ${s.objective.toLowerCase()}`).join('. ') || 'We will address key growth opportunities across the selected channels.'}` },
        { heading: 'Investment Overview', body: `The recommended total investment is ${req.investmentTotal ? `$${req.investmentTotal.toLocaleString()}` : 'to be determined'}, allocated across agency services${req.mediaTotal ? ` and $${req.mediaTotal.toLocaleString()} in media spend` : ''}. This investment is designed to deliver a clear return within the engagement period.` },
        { heading: 'Expected Outcomes', body: `Based on our modeling and industry benchmarks, we project ${req.projectedRevenue ? `$${req.projectedRevenue.toLocaleString()} in attributable revenue` : 'significant growth in key performance metrics'}. Our phased approach allows for continuous optimization and budget efficiency improvements over time.` },
        { heading: 'Next Steps', body: 'Upon approval, we will begin the onboarding process and launch Phase 1 activities within the first two weeks. A detailed implementation timeline and milestone schedule will be provided at kickoff.' },
      ],
    };
  }

  return {
    title,
    content: `Performance summary for ${req.clientName} covering the review period.`,
    sections: [
      { heading: 'Overview', body: req.additionalContext || `${req.clientName} continues to make progress against growth targets. Key metrics are tracking within acceptable ranges with notable wins in efficiency and volume.` },
      { heading: 'Key Highlights', body: 'Channel performance is generally on track. Paid media efficiency has improved quarter-over-quarter, and retention programs are contributing an increasing share of revenue.' },
      { heading: 'Areas of Focus', body: 'Conversion rate optimization remains a priority. We recommend continued investment in landing page testing and creative refresh cycles to maintain momentum.' },
    ],
  };
}
