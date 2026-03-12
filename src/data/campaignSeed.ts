import { Campaign, ClientAsset, CreativeLearning, CreativePerformance, NamingRules } from '@/types/campaigns';

// ── Meridian Commerce (c1) ────────────────────────────
export const meridianCampaigns: Campaign[] = [
  {
    id: 'camp1',
    clientId: 'c1',
    strategySectionId: 's1',
    name: 'Spring Collection Launch',
    objective: 'sales',
    offer: 'New Spring Collection — premium home goods with sustainable materials',
    audience: 'Women 25-45, HHI $75k+, interested in premium home goods',
    painPoint: 'Customers want elevated home décor but struggle to find products that are both stylish and sustainable',
    desiredOutcome: 'Drive 500+ purchases in the first 2 weeks of launch at a ROAS of 4x+',
    cta: 'Shop the Spring Collection',
    angle: 'benefit_led',
    landingPageUrl: 'https://meridiancommerce.com/spring-2026',
    notes: 'Coordinating with email blast on launch day. Influencer partnerships also going live.',
    status: 'concept_review',
    platformFocus: 'meta',
    startDate: '2026-03-15',
    endDate: '2026-04-15',
    createdAt: '2026-03-01T09:00:00Z',
    updatedAt: '2026-03-10T14:00:00Z',
    concepts: [
      {
        id: 'con1',
        campaignId: 'camp1',
        name: 'Elevated Everyday',
        audience: 'Women 28-40, metro areas, design-conscious',
        channel: 'paid_media',
        hook: 'Your home deserves better than mass-produced basics',
        coreMessage: 'Premium sustainable home goods that elevate everyday living without compromising on style or values.',
        visualDirection: 'Clean lifestyle shots, bright natural light, products in styled home settings. Warm palette.',
        suggestedPlatform: 'Meta',
        suggestedFormats: ['static_image', 'carousel'],
        reasonToPerform: 'Benefit-led messaging around quality + sustainability resonates with target demo. Lifestyle imagery outperforms product-only shots by 2.3x in prior tests.',
        requiredAssetTypes: ['lifestyle_image', 'product_image'],
        status: 'approved',
        modelUsed: 'gpt-4o',
        notes: 'Strong concept — aligns with brand positioning.',
        outputs: [
          {
            id: 'out1',
            conceptId: 'con1',
            platform: 'meta',
            formatType: 'static_image',
            copyPrimary: 'Your home tells a story. Make it one worth sharing.\n\nOur Spring Collection brings together sustainably-sourced materials and timeless design — because everyday moments deserve elevated spaces.\n\n→ Handcrafted with care\n→ Sustainable materials\n→ Free shipping over $75',
            copyHeadline: 'Elevate Your Everyday',
            copyDescription: 'Shop the new Spring Collection. Premium home goods, sustainably made.',
            visualBrief: '1:1 and 4:5 lifestyle hero — styled living room with spring collection centerpiece, natural light from left, warm earth tones. Product focus: ceramic vase set on reclaimed wood table.',
            outputStatus: 'approved',
            createdAt: '2026-03-08T10:00:00Z',
            updatedAt: '2026-03-09T15:00:00Z',
          },
          {
            id: 'out2',
            conceptId: 'con1',
            platform: 'meta',
            formatType: 'carousel',
            copyPrimary: 'Spring starts at home.\n\nSwipe through our new collection — every piece designed for real life, made with materials that matter.',
            copyHeadline: 'The Spring Edit',
            copyDescription: 'Discover 40+ new pieces. Sustainably crafted, beautifully designed.',
            visualBrief: '4-card carousel: (1) Hero lifestyle shot (2) Product closeup with material detail (3) Before/after room styling (4) Collection grid with CTA overlay. All 1:1.',
            outputStatus: 'draft',
            createdAt: '2026-03-08T10:30:00Z',
            updatedAt: '2026-03-08T10:30:00Z',
          },
        ],
        createdAt: '2026-03-05T09:00:00Z',
        updatedAt: '2026-03-09T15:00:00Z',
      },
      {
        id: 'con2',
        campaignId: 'camp1',
        name: 'Guilt-Free Upgrade',
        audience: 'Women 30-45, environmentally conscious, values-driven shoppers',
        channel: 'paid_media',
        hook: 'Beautiful design shouldn\'t cost the earth',
        coreMessage: 'Upgrade your home with pieces you can feel good about. Every item in the Spring Collection is made from responsibly sourced materials.',
        visualDirection: 'Split-screen: raw materials on one side, finished products on the other. Earth tones, clean typography.',
        suggestedPlatform: 'Meta',
        suggestedFormats: ['static_image', 'short_form_video'],
        reasonToPerform: 'Sustainability messaging tested well in Q4 email campaigns with 22% higher CTR vs. standard product messaging.',
        requiredAssetTypes: ['product_image', 'brand_photo'],
        status: 'pending',
        outputs: [],
        createdAt: '2026-03-05T09:00:00Z',
        updatedAt: '2026-03-05T09:00:00Z',
      },
      {
        id: 'con3',
        campaignId: 'camp1',
        name: 'The Curator\'s Pick',
        audience: 'Women 25-35, design-forward, social-media-savvy',
        channel: 'paid_media',
        hook: 'Our design team\'s top picks for spring — and the stories behind them',
        coreMessage: 'Go behind the design process. See what our creative director chose as must-haves for the season and why.',
        visualDirection: 'Behind-the-scenes aesthetic. Founder/designer on camera, studio setting, raw and authentic. UGC-feel.',
        suggestedPlatform: 'Meta',
        suggestedFormats: ['reel_story', 'short_form_video'],
        reasonToPerform: 'Founder-led content has 1.8x higher engagement in the home goods category. Authenticity drives trust.',
        requiredAssetTypes: ['ugc_video', 'product_image'],
        status: 'pending',
        outputs: [],
        createdAt: '2026-03-05T09:00:00Z',
        updatedAt: '2026-03-05T09:00:00Z',
      },
    ],
    trackingLinks: [
      {
        id: 'tl1',
        campaignId: 'camp1',
        conceptId: 'con1',
        outputId: 'out1',
        destinationUrl: 'https://meridiancommerce.com/spring-2026',
        finalUrl: 'https://meridiancommerce.com/spring-2026?utm_source=meta&utm_medium=paid_social&utm_campaign=spring_collection_launch&utm_id=camp1&utm_content=elevated_everyday_static',
        utmSource: 'meta',
        utmMedium: 'paid_social',
        utmCampaign: 'spring_collection_launch',
        utmId: 'camp1',
        utmContent: 'elevated_everyday_static',
        createdAt: '2026-03-09T12:00:00Z',
      },
    ],
  },
];

// ── Atlas Legal (c2) ────────────────────────────────
export const atlasCampaigns: Campaign[] = [
  {
    id: 'camp2',
    clientId: 'c2',
    strategySectionId: 's3',
    name: 'Thought Leadership Authority',
    objective: 'leads',
    offer: 'Free corporate legal compliance guide for mid-market companies',
    audience: 'GCs and CEOs at mid-market companies ($10M-$100M revenue)',
    painPoint: 'Mid-market companies face complex legal compliance challenges but can\'t afford dedicated in-house counsel teams',
    desiredOutcome: 'Generate 50+ qualified leads for consultation calls over 60 days',
    cta: 'Download the Guide',
    angle: 'educational',
    landingPageUrl: 'https://atlaslegal.com/compliance-guide',
    status: 'draft',
    platformFocus: 'google_search',
    startDate: '2026-04-01',
    endDate: '2026-05-31',
    createdAt: '2026-03-08T11:00:00Z',
    updatedAt: '2026-03-08T11:00:00Z',
    concepts: [
      {
        id: 'con4',
        campaignId: 'camp2',
        name: 'Compliance Confidence',
        audience: 'GCs at $20M-$80M companies, regulatory industries',
        channel: 'content_development',
        hook: 'The 2026 compliance landscape changed. Is your company ready?',
        coreMessage: 'A practical guide to navigating corporate compliance without the overhead of a full legal department.',
        visualDirection: 'Clean, professional. Navy and white palette. Authority imagery — conference rooms, legal documents, professional headshots.',
        suggestedPlatform: 'Google Search',
        suggestedFormats: ['search_copy'],
        reasonToPerform: 'Educational content converts at 3.2x the rate of direct service pitches in professional services.',
        requiredAssetTypes: ['brand_photo'],
        status: 'pending',
        outputs: [
          {
            id: 'out3',
            conceptId: 'con4',
            platform: 'google_search',
            formatType: 'search_copy',
            headlines: [
              'Corporate Compliance Guide 2026', 'Navigate Legal Compliance', 'Free Compliance Framework',
              'Mid-Market Legal Solutions', 'Reduce Compliance Risk Today', 'Expert Legal Compliance Guide',
              'Your 2026 Compliance Roadmap', 'Compliance Without the Overhead', 'Trusted Legal Advisors',
              'Download Free Legal Guide', 'Corporate Legal Best Practices', 'Compliance Simplified',
              'Atlas Legal Group Guide', 'Protect Your Business Today', 'Legal Risk Assessment Free',
            ],
            descriptions: [
              'Download our free 2026 Corporate Compliance Guide. Practical frameworks for mid-market companies. No legal jargon.',
              'Navigate complex regulations with confidence. Atlas Legal Group helps mid-market companies build compliance programs that scale.',
              'Is your compliance program keeping up? Get our free guide with actionable steps to protect your business in 2026.',
              'Expert legal guidance without the overhead. Download the guide trusted by 200+ mid-market companies.',
            ],
            searchIntentNotes: 'Target high-intent commercial keywords around corporate compliance, legal risk management, and mid-market legal services.',
            extensionIdeas: ['Sitelink: About Our Firm', 'Sitelink: Client Success Stories', 'Callout: 25+ Years Experience', 'Structured Snippet: Services'],
            outputStatus: 'draft',
            createdAt: '2026-03-09T10:00:00Z',
            updatedAt: '2026-03-09T10:00:00Z',
          },
        ],
        createdAt: '2026-03-09T09:00:00Z',
        updatedAt: '2026-03-09T10:00:00Z',
      },
    ],
    trackingLinks: [
      {
        id: 'tl2',
        campaignId: 'camp2',
        destinationUrl: 'https://atlaslegal.com/compliance-guide',
        finalUrl: 'https://atlaslegal.com/compliance-guide?utm_source=google&utm_medium=paid_search&utm_campaign=thought_leadership_authority&utm_id=camp2&utm_content=compliance_confidence',
        utmSource: 'google',
        utmMedium: 'paid_search',
        utmCampaign: 'thought_leadership_authority',
        utmId: 'camp2',
        utmContent: 'compliance_confidence',
        createdAt: '2026-03-09T12:00:00Z',
      },
    ],
  },
];

// ── Pinnacle Academy (c3) ──────────────────────────
export const pinnacleCampaigns: Campaign[] = [
  {
    id: 'camp3',
    clientId: 'c3',
    strategySectionId: 's4',
    name: 'Spring Enrollment Drive',
    objective: 'leads',
    offer: 'Schedule a campus tour — limited spots for Fall 2026 enrollment',
    audience: 'Parents 30-50, metro area, HHI $120k+',
    painPoint: 'Parents want the best education for their children but feel overwhelmed by private school options and unsure about fit',
    desiredOutcome: '150+ campus tour bookings in 6 weeks, 40+ enrollments',
    cta: 'Book a Campus Tour',
    angle: 'social_proof',
    landingPageUrl: 'https://pinnacleacademy.edu/visit',
    notes: 'Coordinate with admissions team on tour capacity. Max 15 tours/week.',
    restrictions: 'Must include "results may vary" disclaimer on academic outcomes. Student images require signed consent.',
    status: 'active',
    platformFocus: 'multi_channel',
    startDate: '2026-03-01',
    endDate: '2026-04-15',
    createdAt: '2026-02-20T09:00:00Z',
    updatedAt: '2026-03-10T16:00:00Z',
    concepts: [
      {
        id: 'con5',
        campaignId: 'camp3',
        name: 'Parent Voices',
        audience: 'Parents 32-45, within 15mi radius, education-focused',
        channel: 'social_media',
        hook: '"We looked at 6 schools. After one tour here, we knew."',
        coreMessage: 'Real parents share why they chose Pinnacle — from academics to community to individual attention.',
        visualDirection: 'Authentic parent testimonial videos. Shot on campus, natural lighting. Warm, inviting. Not overly produced.',
        suggestedPlatform: 'Meta + Google',
        suggestedFormats: ['short_form_video', 'static_image', 'search_copy'],
        reasonToPerform: 'Parent testimonials generated 3x engagement vs. institutional messaging in prior campaigns. Social proof is the #1 driver for school selection.',
        requiredAssetTypes: ['ugc_video', 'testimonial', 'brand_photo'],
        status: 'approved',
        modelUsed: 'gpt-4o',
        notes: 'Top performing concept. Testimonials from 3 parent families recorded.',
        outputs: [
          {
            id: 'out4',
            conceptId: 'con5',
            platform: 'meta',
            formatType: 'short_form_video',
            copyPrimary: '"We visited six schools before Pinnacle. After the first tour, our daughter turned to us and said, \'This is my school.\'\n\nThat was two years ago. Best decision we ever made."\n\n— The Martinez Family\n\n📍 Limited spots for Fall 2026. Book your campus tour today.',
            copyHeadline: 'See Why Families Choose Pinnacle',
            copyDescription: 'Book a campus tour. Limited spots for Fall 2026 enrollment.',
            visualBrief: 'Parent testimonial video (30-45s). Martinez family on campus — walking through hallways, watching daughter in class, sitting in courtyard. Natural audio. End card with tour booking CTA.',
            outputStatus: 'approved',
            createdAt: '2026-02-25T10:00:00Z',
            updatedAt: '2026-03-02T14:00:00Z',
          },
          {
            id: 'out5',
            conceptId: 'con5',
            platform: 'google_search',
            formatType: 'search_copy',
            headlines: [
              'Best Private School Near You', 'Book a Campus Tour Today', 'Fall 2026 Enrollment Open',
              'Pinnacle Academy Tours', 'Top-Rated Private School', 'Limited Spots Available',
              'See Why Parents Choose Us', 'Schedule Your Visit Today', 'Award-Winning Private School',
              'K-12 Private Education', 'Small Class Sizes', 'Personalized Learning',
              'Join Our Community', 'Pinnacle Academy', 'Tour Our Campus',
            ],
            descriptions: [
              'Discover why families choose Pinnacle Academy. Book a campus tour and see our award-winning programs in action. Limited Fall 2026 spots.',
              'Small class sizes, personalized attention, exceptional academics. Schedule a tour at Pinnacle Academy and find the right fit for your child.',
              'From kindergarten through 12th grade, Pinnacle Academy nurtures every student. Visit us and see the difference. Book your tour today.',
              'Top-rated private school in the metro area. 95% college acceptance rate. Schedule your campus tour — limited Fall 2026 enrollment.',
            ],
            searchIntentNotes: 'Target: "private school near me", "best private schools [city]", "K-12 private school tours", "private school enrollment 2026"',
            outputStatus: 'approved',
            createdAt: '2026-02-25T11:00:00Z',
            updatedAt: '2026-03-01T09:00:00Z',
          },
        ],
        createdAt: '2026-02-22T09:00:00Z',
        updatedAt: '2026-03-02T14:00:00Z',
      },
      {
        id: 'con6',
        campaignId: 'camp3',
        name: 'Behind the Classroom',
        audience: 'Parents 30-42, first-time private school considerers',
        channel: 'social_media',
        hook: 'What does a day at Pinnacle actually look like?',
        coreMessage: 'Take a behind-the-scenes look at student life — from morning drop-off to after-school activities. Authentic, unscripted, real.',
        visualDirection: 'Day-in-the-life format. Follow a student through their day. iPhone-style shooting for authenticity. Bright, energetic.',
        suggestedPlatform: 'Meta',
        suggestedFormats: ['reel_story', 'short_form_video'],
        reasonToPerform: 'Behind-the-scenes content reduces perceived risk for parents considering private school. Authenticity builds trust.',
        requiredAssetTypes: ['ugc_video', 'brand_photo'],
        status: 'pending',
        outputs: [],
        createdAt: '2026-02-22T09:00:00Z',
        updatedAt: '2026-02-22T09:00:00Z',
      },
    ],
    trackingLinks: [
      {
        id: 'tl3',
        campaignId: 'camp3',
        conceptId: 'con5',
        outputId: 'out4',
        destinationUrl: 'https://pinnacleacademy.edu/visit',
        finalUrl: 'https://pinnacleacademy.edu/visit?utm_source=meta&utm_medium=paid_social&utm_campaign=spring_enrollment_drive&utm_id=camp3&utm_content=parent_voices_video',
        utmSource: 'meta',
        utmMedium: 'paid_social',
        utmCampaign: 'spring_enrollment_drive',
        utmId: 'camp3',
        utmContent: 'parent_voices_video',
        createdAt: '2026-03-01T10:00:00Z',
      },
    ],
  },
];

// ── Client Assets ─────────────────────────────────────
export const seedClientAssets: ClientAsset[] = [
  { id: 'ca1', clientId: 'c1', title: 'Spring Collection Hero', assetType: 'lifestyle_image', fileUrl: '/placeholder.svg', tags: ['lifestyle', 'product', 'seasonal'], uploadedBy: 'Priya Patel', linkedCampaigns: ['camp1'], createdAt: '2026-03-01T09:00:00Z' },
  { id: 'ca2', clientId: 'c1', title: 'Brand Logo — Primary', assetType: 'logo', fileUrl: '/placeholder.svg', tags: ['brand'], uploadedBy: 'Marcus Webb', linkedCampaigns: [], createdAt: '2025-09-01T09:00:00Z' },
  { id: 'ca3', clientId: 'c1', title: 'Product Flat Lay — Ceramics', assetType: 'product_image', fileUrl: '/placeholder.svg', tags: ['product', 'static'], uploadedBy: 'Priya Patel', linkedCampaigns: ['camp1'], createdAt: '2026-02-28T09:00:00Z' },
  { id: 'ca4', clientId: 'c3', title: 'Campus Aerial Drone Shot', assetType: 'brand_photo', fileUrl: '/placeholder.svg', tags: ['brand', 'lifestyle'], uploadedBy: 'Marcus Webb', linkedCampaigns: ['camp3'], createdAt: '2026-01-15T09:00:00Z' },
  { id: 'ca5', clientId: 'c3', title: 'Martinez Family Testimonial', assetType: 'ugc_video', fileUrl: '/placeholder.svg', tags: ['ugc', 'testimonial'], uploadedBy: 'Priya Patel', linkedCampaigns: ['camp3'], createdAt: '2026-02-20T09:00:00Z' },
  { id: 'ca6', clientId: 'c3', title: 'Student Life Montage', assetType: 'ugc_video', fileUrl: '/placeholder.svg', tags: ['ugc', 'lifestyle'], uploadedBy: 'Priya Patel', linkedCampaigns: ['camp3'], createdAt: '2026-02-22T09:00:00Z' },
];

// ── Performance (mocked) ──────────────────────────────
export const seedCreativePerformance: CreativePerformance[] = [
  { id: 'cp1', campaignId: 'camp3', conceptId: 'con5', outputId: 'out4', platform: 'meta', dateRange: 'Mar 1-10, 2026', spend: 3200, impressions: 142000, clicks: 4680, ctr: 3.3, cpc: 0.68, conversions: 87, cvr: 1.86, cpa: 36.78, revenue: 0, roas: 0, notes: 'Strong CTR. Parent testimonial format performing well above benchmark.', createdAt: '2026-03-10T12:00:00Z' },
  { id: 'cp2', campaignId: 'camp1', conceptId: 'con1', outputId: 'out1', platform: 'meta', dateRange: 'Mar 8-10, 2026', spend: 1800, impressions: 68000, clicks: 2040, ctr: 3.0, cpc: 0.88, conversions: 42, cvr: 2.06, cpa: 42.86, revenue: 8820, roas: 4.9, notes: 'Early results promising. Lifestyle imagery driving strong engagement.', createdAt: '2026-03-10T12:00:00Z' },
];

// ── Creative Learnings ────────────────────────────────
export const seedCreativeLearnings: CreativeLearning[] = [
  { id: 'cl1', clientId: 'c1', campaignId: 'camp1', platform: 'meta', audienceType: 'cold_prospecting', angleType: 'benefit_led', hookPattern: 'aspirational_lifestyle', visualPattern: 'lifestyle_hero', ctaPattern: 'shop_now', resultSummary: 'Benefit-led messaging with lifestyle imagery outperformed product-only shots by 2.3x in CTR and 1.8x in ROAS for cold audiences.', confidenceScore: 0.85, createdAt: '2026-03-10T12:00:00Z' },
  { id: 'cl2', clientId: 'c1', platform: 'meta', audienceType: 'retargeting', angleType: 'urgency_scarcity', hookPattern: 'limited_time', visualPattern: 'product_closeup', ctaPattern: 'buy_now', resultSummary: 'Urgency-based retargeting ads saw 15% higher CVR but 20% lower engagement. Best used for bottom-funnel only.', confidenceScore: 0.72, createdAt: '2026-02-15T12:00:00Z' },
  { id: 'cl3', clientId: 'c3', campaignId: 'camp3', platform: 'meta', audienceType: 'cold_prospecting', angleType: 'social_proof', hookPattern: 'parent_testimonial', visualPattern: 'ugc_authentic', ctaPattern: 'book_tour', resultSummary: 'Parent testimonial videos generated 3x engagement vs. institutional messaging. Authenticity is the top driver for school selection ads.', confidenceScore: 0.92, createdAt: '2026-03-10T12:00:00Z' },
  { id: 'cl4', clientId: 'c3', platform: 'meta', angleType: 'educational', hookPattern: 'day_in_life', visualPattern: 'polished_video', resultSummary: 'Polished studio-quality videos underperformed UGC-style content by 40% in engagement for education sector.', confidenceScore: 0.78, createdAt: '2026-01-20T12:00:00Z' },
];

// ── Naming Rules ──────────────────────────────────────
export const seedNamingRules: NamingRules[] = [
  { id: 'nr1', clientId: 'c1', sourceRules: ['meta', 'google', 'klaviyo'], mediumRules: ['paid_social', 'paid_search', 'email'], campaignFormat: '{client}_{objective}_{name}_{date}', contentFormat: '{concept}_{format}_{variant}', createdAt: '2025-09-15T09:00:00Z' },
  { id: 'nr2', clientId: 'c3', sourceRules: ['meta', 'google'], mediumRules: ['paid_social', 'paid_search'], campaignFormat: '{client}_{campaign}_{season}', contentFormat: '{concept}_{platform}_{format}', createdAt: '2025-06-15T09:00:00Z' },
];

// ── Helpers ───────────────────────────────────────────
export function getCampaignsForClient(clientId: string): Campaign[] {
  const all = [...meridianCampaigns, ...atlasCampaigns, ...pinnacleCampaigns];
  return all.filter(c => c.clientId === clientId);
}

export function getAssetsForClient(clientId: string): ClientAsset[] {
  return seedClientAssets.filter(a => a.clientId === clientId);
}

export function getLearningsForClient(clientId: string): CreativeLearning[] {
  return seedCreativeLearnings.filter(l => l.clientId === clientId);
}

export function getPerformanceForCampaign(campaignId: string): CreativePerformance[] {
  return seedCreativePerformance.filter(p => p.campaignId === campaignId);
}

export function getNamingRulesForClient(clientId: string): NamingRules | undefined {
  return seedNamingRules.find(r => r.clientId === clientId);
}
