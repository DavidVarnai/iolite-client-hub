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
  const area = req.serviceArea || req.geography || 'the US';
  const products = req.primaryProducts || 'products/services';
  const segments = req.coreCustomerSegments || 'target customers';

  // Industry-specific real competitor pools
  const competitorPools: Record<string, { name: string; url: string; notes: string }[]> = {
    'Education': [
      { name: 'Stratford School', url: 'https://www.stratfordschools.com', notes: `Private K-8 school competing for affluent families in ${area}. Strong STEM reputation and multiple campuses.` },
      { name: 'Kumon', url: 'https://www.kumon.com', notes: `Global tutoring franchise with strong local presence. Math and reading focused, targeting parents of K-12 students in ${area}.` },
      { name: 'Sylvan Learning', url: 'https://www.sylvanlearning.com', notes: `Established tutoring center chain offering personalized learning plans. Competes on trust and track record.` },
      { name: 'Khan Academy', url: 'https://www.khanacademy.org', notes: `Free online learning platform. Indirect competitor reducing willingness to pay for supplemental education.` },
    ],
    'Real Estate': [
      { name: 'Compass', url: 'https://www.compass.com', notes: `Tech-forward brokerage with strong digital presence in ${area}. Aggressive agent recruitment and marketing spend.` },
      { name: 'Redfin', url: 'https://www.redfin.com', notes: `Discount brokerage model with strong SEO and listing portal. Appeals to cost-conscious buyers in ${area}.` },
      { name: 'Keller Williams', url: 'https://www.kw.com', notes: `Large franchise network with deep local roots. Strong agent training programs and community involvement.` },
      { name: 'Zillow', url: 'https://www.zillow.com', notes: `Dominant listing platform capturing top-of-funnel home search traffic. Indirect competitor for lead generation.` },
    ],
    'Healthcare': [
      { name: 'One Medical', url: 'https://www.onemedical.com', notes: `Membership-based primary care with modern digital experience. Competing for health-conscious professionals in ${area}.` },
      { name: 'Carbon Health', url: 'https://carbonhealth.com', notes: `Tech-enabled urgent care and primary care clinics. Strong online booking and virtual care options.` },
      { name: 'ZocDoc', url: 'https://www.zocdoc.com', notes: `Doctor discovery and booking platform. Captures high-intent patient searches and referrals in ${area}.` },
      { name: 'MinuteClinic (CVS)', url: 'https://www.cvs.com/minuteclinic', notes: `Retail healthcare offering convenient walk-in appointments. Competes on accessibility and price.` },
    ],
  };

  // Fallback to generic but real-sounding competitors based on context
  const fallbackCompetitors = [
    { name: `${req.industry} Pro Services`, url: `https://www.${req.industry.toLowerCase().replace(/\s+/g, '')}pro.com`, notes: `Established ${req.industry.toLowerCase()} provider in ${area} with strong Google Ads presence and local SEO dominance.` },
    { name: `${area} ${req.industry} Group`, url: `https://www.${area.toLowerCase().replace(/\s+/g, '')}${req.industry.toLowerCase().replace(/\s+/g, '')}.com`, notes: `Regional competitor focused on ${segments}. Active on Meta and Google with review-driven strategy.` },
    { name: `Elite ${req.industry} Solutions`, url: `https://www.elite${req.industry.toLowerCase().replace(/\s+/g, '')}.com`, notes: `Premium-positioned competitor targeting high-value ${segments}. Strong referral network and content marketing.` },
    { name: `NextGen ${req.industry}`, url: `https://www.nextgen${req.industry.toLowerCase().replace(/\s+/g, '')}.com`, notes: `Digital-first challenger disrupting traditional ${req.industry.toLowerCase()} in ${area}. Heavy social media investment.` },
  ];

  const topCompetitors = competitorPools[req.industry] || fallbackCompetitors;

  return {
    marketOverview: `The ${req.industry} market in ${area} is experiencing steady growth. Businesses offering ${products} are competing for ${segments} through a mix of digital and traditional channels. Key trends include mobile-first experiences, local SEO dominance, and community-driven marketing. The competitive landscape in ${area} includes both established incumbents and emerging digital-first challengers.`,
    topCompetitors,
    acquisitionChannels: [
      `Google Ads (Search + Local) — primary for high-intent capture in ${area}`,
      `Meta Ads (Facebook + Instagram) — prospecting and awareness for ${segments}`,
      `Local SEO / Google Business Profile — critical for visibility in ${area}`,
      'Email/SMS — retention and lifecycle communication',
      'Referral / Community — word-of-mouth and local partnerships',
    ],
    positioningThemes: [
      `Local expertise and community presence in ${area}`,
      `Specialized ${products} tailored for ${segments}`,
      'Quality and trust-driven differentiation',
      'Digital-first convenience with local service',
    ],
    benchmarkNotes: [
      { metric: 'Customer Acquisition Cost', range: '$28 – $65', notes: `Typical for ${req.industry} in ${area}. Lower for branded search, higher for prospecting.` },
      { metric: 'Average CPC', range: '$0.80 – $2.50', notes: `Varies by platform and competition level in ${area}.` },
      { metric: 'Conversion Rate', range: '1.8% – 4.2%', notes: 'Desktop typically 2x mobile. Landing page quality is critical.' },
      { metric: 'Email Revenue Share', range: '20% – 35%', notes: 'Best-in-class programs with robust flows reach 30%+.' },
    ],
  };
}

// ─── Mock: Strategy Draft (channel-specific) ───

const CHANNEL_DRAFTS: Record<string, (req: StrategyDraftRequest, ctx: any) => StrategyDraftResult> = {
  paid_media: (req, ctx) => ({
    objectives: `Build a scalable paid media engine for ${ctx.primaryProducts || 'the product line'} that drives efficient customer acquisition. Target a blended ROAS of 4:1+ within 6 months through structured campaign architecture, audience segmentation, and creative testing across Google and Meta platforms.`,
    keyInitiatives: [
      'Audit existing ad accounts and restructure campaign architecture (branded, prospecting, retargeting)',
      `Build audience strategy: lookalikes from top customers, interest-based for ${ctx.coreCustomerSegments || 'core segments'}, and retargeting pools`,
      'Launch creative testing framework: 3-4 concepts per month with systematic winner identification',
      'Implement conversion tracking and attribution model (GA4 + platform pixels)',
      `Allocate budget with 60/30/10 split: prospecting / retargeting / branded search`,
    ],
    timelineIdeas: 'Month 1: Account audit, pixel/tracking setup, campaign architecture. Month 2-3: Launch prospecting and retargeting campaigns, begin creative testing. Month 4-6: Optimize based on data, scale winners, test new audiences and placements.',
    dependencies: [
      'Ad account access (Google Ads, Meta Business Manager)',
      'Creative assets: product photography, lifestyle imagery, video',
      'Landing pages optimized for conversion',
      'Clear definition of primary KPI (ROAS, CPA, or CPL target)',
    ],
    successMetrics: [
      `CPA within ${ctx.knownBottlenecks ? 'improved range addressing current bottlenecks' : 'industry benchmark range'}`,
      'ROAS improvement of 30%+ over baseline within 90 days',
      'Creative testing velocity: minimum 3 new concepts per month',
      'Incrementality measurement showing true channel contribution',
    ],
  }),

  email_marketing: (req, ctx) => ({
    objectives: `Architect a retention and lifecycle email program that captures 25-35% of total revenue through automated flows and strategic campaigns. Build a segmented, behavior-driven communication system for ${ctx.primaryProducts || 'the product portfolio'}.`,
    keyInitiatives: [
      'Audit and rebuild core automation flows: Welcome Series, Abandoned Cart/Browse, Post-Purchase, Win-Back',
      `Develop segmentation framework based on purchase behavior, engagement, and ${ctx.coreCustomerSegments || 'customer lifecycle stage'}`,
      'Design campaign calendar: 2-3 campaigns/week with mix of promotional, educational, and brand content',
      'Implement deliverability best practices: authentication (SPF, DKIM, DMARC), list hygiene, sunset policies',
      'Build SMS as complementary channel for time-sensitive and high-intent moments',
    ],
    timelineIdeas: 'Month 1: Platform audit, flow architecture, segmentation setup. Month 2-3: Launch core flows (Welcome, Cart, Post-Purchase), begin campaign cadence. Month 4-6: Add advanced flows (Win-Back, VIP, Browse Abandon), A/B test subject lines and content.',
    dependencies: [
      'ESP access (Klaviyo, Mailchimp, etc.) with clean subscriber list',
      'Product feed integration for dynamic content and recommendations',
      'Brand guidelines and email design templates',
      'Discount/promotion strategy alignment with broader marketing calendar',
    ],
    successMetrics: [
      'Email-attributed revenue reaching 25%+ of total revenue within 6 months',
      'Flow revenue as % of total email revenue: target 50%+',
      'List growth rate: 10-15% quarter-over-quarter',
      'Deliverability: inbox placement rate >95%, bounce rate <2%',
    ],
  }),

  content_development: (req, ctx) => ({
    objectives: `Build a content and SEO strategy that establishes organic authority and drives sustained traffic growth for ${ctx.primaryProducts || 'key product/service categories'}. Target 40%+ organic traffic growth within 12 months through strategic content creation and technical optimization.`,
    keyInitiatives: [
      'Conduct comprehensive keyword research: identify high-value head terms and long-tail opportunities',
      `Develop content pillars aligned to ${ctx.coreCustomerSegments || 'target audience'} pain points and search intent`,
      'Create editorial calendar: 8-12 pieces/month across blog, guides, comparison pages, and FAQ content',
      'Technical SEO audit and remediation: site speed, crawlability, schema markup, internal linking',
      'Build link acquisition strategy through guest posting, digital PR, and resource link building',
    ],
    timelineIdeas: 'Month 1: Keyword research, content audit, technical SEO assessment. Month 2-3: Begin content production, fix critical technical issues. Month 4-6: Scale content output, begin link building, track ranking improvements. Month 7-12: Optimize based on performance data, expand content depth.',
    dependencies: [
      'Access to Google Search Console and analytics platforms',
      'Subject matter expert availability for content review',
      'CMS access for content publishing and technical changes',
      'Competitive content landscape analysis',
    ],
    successMetrics: [
      'Organic traffic growth: 40%+ year-over-year',
      'Keyword rankings: top 10 positions for 50+ target keywords within 12 months',
      'Organic conversion rate maintained or improved vs. baseline',
      'Domain authority improvement through quality backlink acquisition',
    ],
  }),

  social_media: (req, ctx) => ({
    objectives: `Develop a social media presence that builds brand awareness, community engagement, and drives qualified traffic for ${ctx.primaryProducts || 'the brand'}. Focus on platform-specific content strategies that resonate with ${ctx.coreCustomerSegments || 'target demographics'}.`,
    keyInitiatives: [
      'Audit current social presence and define platform priorities (Instagram, TikTok, LinkedIn based on audience)',
      'Develop content pillar framework: educational, entertaining, promotional, UGC/community',
      'Build content production workflow: batch creation, scheduling, community management playbook',
      'Launch influencer/creator partnership program for authentic social proof',
      'Implement social listening and trend monitoring for real-time content opportunities',
    ],
    timelineIdeas: 'Month 1: Platform audit, content strategy development, tool setup. Month 2-3: Launch content calendar, begin community engagement protocols. Month 4-6: Scale content production, launch influencer partnerships, optimize based on engagement data.',
    dependencies: [
      'Social platform account access and admin roles',
      'Brand photography and video assets',
      'Approved brand voice guidelines and content approval workflow',
      'Influencer/creator budget allocation',
    ],
    successMetrics: [
      'Engagement rate improvement: 2x current baseline within 90 days',
      'Follower growth: 15-20% quarter-over-quarter on primary platforms',
      'Social-referred website traffic: 10%+ increase month-over-month',
      'UGC volume: establish consistent flow of customer content',
    ],
  }),

  website_development: (req, ctx) => ({
    objectives: `Optimize the website as a high-converting growth engine for ${ctx.primaryProducts || 'the business'}. Focus on conversion rate optimization, user experience, and performance to maximize ROI from all traffic sources.`,
    keyInitiatives: [
      'Conduct UX audit: heatmaps, session recordings, and user flow analysis on key conversion paths',
      'Develop A/B testing roadmap: prioritize high-impact pages (homepage, product/service pages, checkout)',
      'Optimize page speed: Core Web Vitals improvements targeting 90+ Lighthouse scores',
      'Improve mobile experience: responsive design audit and mobile-specific CTA optimization',
      `Address known bottlenecks: ${ctx.knownBottlenecks || 'conversion friction points identified in analytics'}`,
    ],
    timelineIdeas: 'Month 1: UX audit, analytics deep-dive, testing tool setup. Month 2-3: Launch first A/B tests, implement quick-win improvements. Month 4-6: Scale testing velocity, implement larger UX changes based on data.',
    dependencies: [
      'Website CMS/platform access with ability to edit templates',
      'Analytics access (GA4, heatmap tools)',
      'A/B testing platform (Optimizely, VWO, or native)',
      'Development resources for implementing winning variations',
    ],
    successMetrics: [
      'Conversion rate improvement: 20-30% within 6 months',
      'Page load time: under 3 seconds on mobile',
      'Bounce rate reduction on key landing pages',
      'Revenue per session improvement across all traffic sources',
    ],
  }),

  brand_strategy: (req, ctx) => ({
    objectives: `Develop a cohesive brand positioning and messaging framework that differentiates ${ctx.primaryProducts || 'the brand'} in a competitive market. Create a strategic foundation that aligns all marketing communications and drives premium perception.`,
    keyInitiatives: [
      'Conduct brand perception audit: customer surveys, competitor analysis, internal stakeholder interviews',
      `Define positioning framework: unique value proposition targeting ${ctx.coreCustomerSegments || 'core customer segments'}`,
      'Develop messaging hierarchy: brand narrative, tagline options, channel-specific copy frameworks',
      'Create visual identity system: updated guidelines for color, typography, imagery, and layout',
      'Build brand playbook for consistent execution across all touchpoints',
    ],
    timelineIdeas: 'Month 1: Research and discovery phase — brand audit, competitive analysis, stakeholder workshops. Month 2: Strategy development — positioning, messaging, visual direction. Month 3: Deliverable production — brand guidelines, templates, launch plan.',
    dependencies: [
      'Access to customer research data and feedback',
      'Stakeholder availability for brand workshops',
      'Competitive brand audit materials',
      'Current brand assets and historical creative',
    ],
    successMetrics: [
      'Brand consistency score: alignment across all channels and touchpoints',
      'Message recall: improved brand recognition in target audience surveys',
      'Premium positioning: ability to maintain or increase pricing',
      'Internal adoption: team alignment on brand voice and visual standards',
    ],
  }),

  analytics_tracking: (req, ctx) => ({
    objectives: `Implement a comprehensive analytics and tracking infrastructure for ${ctx.primaryProducts || 'the business'} that provides full-funnel visibility, accurate attribution, and actionable insights. Ensure all marketing channels are properly measured to enable data-driven optimization.`,
    keyInitiatives: [
      'GA4 setup and configuration: custom events, conversions, enhanced ecommerce/lead tracking, audience building',
      'Google Tag Manager implementation: centralized tag management, trigger-based event tracking, data layer architecture',
      'Conversion tracking: platform pixels (Meta CAPI, Google Ads, LinkedIn Insight), server-side tracking where supported',
      'Attribution modeling: define and implement attribution framework (data-driven or position-based) aligned to business model',
      'Reporting dashboards: build Looker Studio or equivalent dashboards for campaign performance, funnel analysis, and ROI tracking',
    ],
    timelineIdeas: 'Month 1: Audit existing tracking, fix critical gaps, implement GA4 and GTM foundations. Month 2: Deploy conversion tracking across all paid channels, set up server-side tracking. Month 3: Build reporting dashboards, train team, establish QA process for ongoing tracking accuracy.',
    dependencies: [
      'Website/CMS admin access for tag installation',
      'Google Analytics and GTM account access',
      'Ad platform admin access (Meta Business Manager, Google Ads, etc.)',
      'CRM/backend access for server-side event integration',
    ],
    successMetrics: [
      'Tracking accuracy: 95%+ match rate between platform-reported and analytics conversions',
      'Full-funnel visibility: all key events tracked from impression to conversion',
      'Dashboard adoption: stakeholders using dashboards for weekly decision-making',
      'Attribution clarity: clear understanding of channel contribution and incrementality',
    ],
  }),
};

export async function fetchStrategyDraft(req: StrategyDraftRequest): Promise<StrategyDraftResult> {
  await delay(1500);

  // Parse discovery context if provided
  let ctx: any = {};
  if (req.discoveryContext) {
    try { ctx = JSON.parse(req.discoveryContext); } catch {}
  }

  // Use channel-specific draft if available
  const channelDraft = CHANNEL_DRAFTS[req.channel];
  if (channelDraft) {
    return channelDraft(req, ctx);
  }

  // Fallback for channels without specific drafts (strategic_consulting, app_development)
  const channelLabel = req.channel.replace(/_/g, ' ');
  return {
    objectives: `Establish a high-performing ${channelLabel} program for ${ctx.primaryProducts || 'the business'} that drives measurable growth in customer acquisition and revenue, aligned with ${req.growthGoals || 'sustainable growth targets'}. Focus on efficiency, scalability, and clear attribution across all activities.`,
    keyInitiatives: [
      `Audit current ${channelLabel} performance and identify optimization opportunities`,
      `Develop strategy framework aligned to ${ctx.coreCustomerSegments || 'target audience segments'}`,
      'Build measurement infrastructure and reporting dashboards',
      'Implement phased execution plan with clear milestones and KPIs',
      `Address known challenges: ${ctx.knownBottlenecks || 'identified growth bottlenecks'}`,
    ],
    timelineIdeas: 'Month 1: Audit, research, and strategic planning. Month 2-3: Foundation build and initial execution. Month 4-6: Optimization, scaling, and performance review.',
    dependencies: [
      'Access to relevant platforms, tools, and historical data',
      'Creative and content assets aligned to brand guidelines',
      'Cross-functional alignment on priorities and resource allocation',
      'Clear KPI targets and reporting cadence agreement',
    ],
    successMetrics: [
      'Primary KPI improvement within target range',
      'Efficiency gains quarter-over-quarter',
      'Clear attribution of channel contribution to overall growth',
      `Measurable progress against ${req.growthGoals || 'defined growth objectives'}`,
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
