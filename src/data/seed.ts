import { Client, User, Comment } from '@/types';

export const currentUser: User = {
  id: 'u1',
  name: 'Sarah Chen',
  email: 'sarah@ioliteventures.com',
  role: 'master_admin',
};

const internalUsers: User[] = [
  currentUser,
  { id: 'u2', name: 'Marcus Webb', email: 'marcus@ioliteventures.com', role: 'project_manager' },
  { id: 'u3', name: 'Priya Patel', email: 'priya@ioliteventures.com', role: 'team_member' },
];

const clientUser: User = { id: 'u4', name: 'David Kim', email: 'david@meridiancommerce.com', role: 'client_user' };

function makeComment(id: string, clientId: string, content: string, isInternal: boolean, status: 'open' | 'resolved', contextType: Comment['contextType'], contextId: string): Comment {
  return {
    id, clientId, content, isInternal, status, contextType, contextId,
    author: isInternal ? internalUsers[Math.floor(Math.random() * 3)] : clientUser,
    createdAt: '2026-03-05T10:30:00Z',
  };
}

const seedClients: Client[] = [
  {
    id: 'c1',
    name: 'Meridian Commerce',
    company: 'Meridian Commerce Inc.',
    industry: 'E-commerce',
    logoInitials: 'MC',
    stage: 'active',
    contacts: [
      { id: 'ct1', name: 'David Kim', email: 'david@meridiancommerce.com', title: 'VP Marketing', isPrimary: true },
      { id: 'ct2', name: 'Lisa Park', email: 'lisa@meridiancommerce.com', title: 'Director of Growth', isPrimary: false },
    ],
    activeChannels: ['paid_media', 'email_marketing', 'social_media', 'website_development'],
    internalOwner: 'Marcus Webb',
    contractStart: '2025-09-01',
    contractEnd: '2026-08-31',
    notes: 'High-growth DTC brand expanding into wholesale. Strong Q4 performance. Focus on CAC reduction in 2026.',
    slackChannel: '#meridian-commerce',
    notionProjectId: 'notion-mc-001',
    agencyAnalyticsId: 'aa-mc-001',
    strategySections: [
      {
        id: 's1',
        channel: 'paid_media',
        clientSummary: {
          objective: 'Scale paid acquisition while reducing CAC by 15% through channel diversification and creative optimization.',
          priorities: ['Expand Meta prospecting audiences', 'Launch Google Performance Max', 'Test TikTok for awareness'],
          plan: 'Phased rollout starting with Meta optimization, followed by Google PMax launch in Q2, and TikTok testing in Q3.',
          expectedOutcomes: ['15% CAC reduction', '25% revenue growth from paid channels', 'Diversified channel mix'],
        },
        internal: {
          diagnosis: 'Current paid strategy is over-indexed on Meta retargeting (68% of spend). Prospecting is under-invested. Google Shopping is underperforming due to poor feed quality.',
          approach: 'Shift budget allocation to 50/50 prospecting/retargeting. Fix product feed issues before scaling Google. Use TikTok Spark Ads for top-of-funnel.',
          targetAudience: 'Women 25-45, household income $75k+, interests in premium home goods and sustainable products.',
          deliverables: ['Monthly media plans', 'Creative briefs', 'Weekly performance reports', 'Quarterly strategy reviews'],
          dependencies: ['Product feed optimization (client engineering team)', 'Creative assets from brand team'],
          timeline: 'Q1: Meta restructure. Q2: Google PMax launch. Q3: TikTok test.',
          internalNotes: 'Client has historically been resistant to reducing Meta spend. Need to present diversification as risk mitigation, not abandonment.',
          resourcing: 'Marcus (strategy), Priya (execution), 15 hrs/week total.',
          successMetrics: ['Blended CAC < $42', 'ROAS > 4.2x', 'New customer acquisition +30%'],
        },
      },
      {
        id: 's2',
        channel: 'email_marketing',
        clientSummary: {
          objective: 'Increase email revenue contribution to 30% of total through lifecycle automation and list growth.',
          priorities: ['Build post-purchase flow', 'Implement browse abandonment', 'Grow list via on-site capture'],
          plan: 'Audit existing flows, build new automation sequences, and deploy advanced segmentation.',
          expectedOutcomes: ['30% email revenue contribution', '15% improvement in open rates', '2x list growth'],
        },
        internal: {
          diagnosis: 'Email is currently 18% of revenue with only 3 basic flows. No segmentation beyond purchase/non-purchase. List hygiene is poor — 40% inactive subscribers.',
          approach: 'Clean list first, then build segmentation framework, then deploy flows in priority order based on revenue impact.',
          targetAudience: 'Segmented by: purchase recency, AOV tier, product category affinity, engagement level.',
          deliverables: ['Flow architecture document', 'Email templates', 'Segmentation framework', 'Monthly performance reports'],
          dependencies: ['Klaviyo access', 'Product catalog feed', 'Customer data export'],
          timeline: 'Month 1: Audit & cleanup. Month 2-3: Core flows. Month 4+: Advanced segmentation.',
          internalNotes: 'Their Klaviyo account is a mess. Budget 2 extra days for cleanup before we can start building.',
          resourcing: 'Priya (lead), 10 hrs/week.',
          successMetrics: ['Email revenue share > 28%', 'Flow revenue +45%', 'List growth rate > 5%/month'],
        },
      },
    ],
    meetings: [
      {
        id: 'm1',
        clientId: 'c1',
        date: '2026-03-07T14:00:00Z',
        type: 'biweekly',
        title: 'Biweekly Strategy Review',
        status: 'completed',
        generalNotes: 'Client expressed interest in exploring influencer partnerships. Discussed Q1 paid media results and email automation progress.',
        agenda: [
          {
            id: 'a1',
            channel: 'paid_media',
            notes: 'Meta CPMs down 12% after audience restructure. Google PMax showing early promise with 3.8x ROAS in first two weeks.',
            clientInputs: 'David asked about TikTok timeline. Wants to see competitive analysis before committing budget.',
            actionItems: [
              { id: 'ai1', title: 'Prepare TikTok competitive analysis', owner: 'Priya Patel', status: 'in_progress', dueDate: '2026-03-14', channel: 'paid_media' },
            ],
          },
          {
            id: 'a2',
            channel: 'email_marketing',
            notes: 'Post-purchase flow live and generating $4.2k in first week. Browse abandonment in QA.',
            clientInputs: 'Lisa wants to see examples of VIP segment campaigns from other brands.',
            actionItems: [
              { id: 'ai2', title: 'Share VIP email campaign examples', owner: 'Priya Patel', status: 'todo', dueDate: '2026-03-10', channel: 'email_marketing' },
            ],
          },
        ],
      },
    ],
    comments: [
      makeComment('cm1', 'c1', 'Can we get a breakdown of the Meta audience restructure performance by segment?', false, 'open', 'strategy', 's1'),
      makeComment('cm2', 'c1', 'Note: Client PM mentioned they want to see more granular ROAS by product category. Let\'s add this to the next report.', true, 'open', 'performance', 'perf1'),
      makeComment('cm3', 'c1', 'Browse abandonment flow is performing above benchmark. Great work on the subject line testing.', true, 'resolved', 'strategy', 's2'),
    ],
    tasks: [
      { id: 't1', title: 'Prepare TikTok competitive analysis', owner: 'Priya Patel', status: 'in_progress', dueDate: '2026-03-14', channel: 'paid_media' },
      { id: 't2', title: 'Share VIP email campaign examples', owner: 'Priya Patel', status: 'todo', dueDate: '2026-03-10', channel: 'email_marketing' },
      { id: 't3', title: 'Update Google PMax product feed', owner: 'Marcus Webb', status: 'todo', dueDate: '2026-03-18', channel: 'paid_media' },
      { id: 't4', title: 'Deploy browse abandonment flow', owner: 'Priya Patel', status: 'in_progress', dueDate: '2026-03-12', channel: 'email_marketing' },
    ],
    performance: [
      {
        id: 'perf1',
        clientId: 'c1',
        period: 'February 2026',
        executiveSummary: 'Strong month across paid and email channels. Paid search efficiency improved after budget reallocation and keyword cleanup. Email automation revenue up 34% with the launch of the post-purchase flow.',
        channelHighlights: [
          {
            channel: 'paid_media',
            narrative: 'Meta CPMs decreased 12% after audience restructure. Google PMax launched mid-month with encouraging early ROAS of 3.8x. Overall paid CAC down to $44 from $51.',
            metrics: { 'ROAS': '4.1x', 'CAC': '$44', 'Spend': '$82,400', 'Revenue': '$337,840' },
          },
          {
            channel: 'email_marketing',
            narrative: 'Post-purchase flow launched and generated $4,200 in first week. Open rates improved 8% after list cleanup. Browse abandonment in final QA.',
            metrics: { 'Revenue': '$48,200', 'Open Rate': '24.3%', 'Click Rate': '3.8%', 'List Growth': '+2,340' },
          },
        ],
        wins: ['CAC reduced from $51 to $44 (14% improvement)', 'Post-purchase flow generating incremental revenue', 'Google PMax launch ahead of schedule'],
        risks: ['Conversion rate flat despite traffic increase — potential landing page friction', 'Meta frequency increasing on retargeting audiences'],
        nextSteps: ['Landing page A/B test for top 5 products', 'Expand Google PMax to full product catalog', 'Launch browse abandonment flow'],
      },
    ],
    documents: [
      { id: 'd1', clientId: 'c1', title: 'Q1 2026 Growth Strategy', type: 'strategy', createdAt: '2026-01-15', updatedAt: '2026-02-28', author: 'Marcus Webb' },
      { id: 'd2', clientId: 'c1', title: 'February Performance Recap', type: 'recap', createdAt: '2026-03-03', updatedAt: '2026-03-05', author: 'Priya Patel' },
    ],
  },
  {
    id: 'c2',
    name: 'Atlas Legal Group',
    company: 'Atlas Legal Group LLP',
    industry: 'Professional Services',
    logoInitials: 'AL',
    stage: 'proposal',
    contacts: [
      { id: 'ct3', name: 'Jennifer Walsh', email: 'jwalsh@atlaslegal.com', title: 'Managing Partner', isPrimary: true },
    ],
    activeChannels: ['strategic_consulting', 'content_development', 'website_development'],
    internalOwner: 'Sarah Chen',
    contractStart: '2026-04-01',
    contractEnd: '2026-09-30',
    notes: 'Mid-size law firm looking to modernize their digital presence and thought leadership. Initial discovery call went well.',
    strategySections: [
      {
        id: 's3',
        channel: 'strategic_consulting',
        clientSummary: {
          objective: 'Develop a comprehensive digital growth strategy to increase qualified lead generation by 40%.',
          priorities: ['Audit current digital footprint', 'Define ideal client profiles', 'Create thought leadership framework'],
          plan: 'Phase 1: Discovery and audit. Phase 2: Strategy development. Phase 3: Implementation roadmap.',
          expectedOutcomes: ['Clear digital strategy document', '40% lead gen improvement target', 'Content calendar for 6 months'],
        },
        internal: {
          diagnosis: 'Firm has no content strategy, outdated website, and relies entirely on referrals. Partners are skeptical of digital marketing but open to "thought leadership" positioning.',
          approach: 'Frame everything as thought leadership and authority building, not "marketing." Use case studies and white papers as primary content vehicles.',
          targetAudience: 'Mid-market companies ($10M-$100M revenue) seeking corporate legal counsel, M&A advisory, or IP protection.',
          deliverables: ['Digital audit report', 'Growth strategy document', 'Content framework', 'Implementation roadmap'],
          dependencies: ['Access to partner calendars for interviews', 'Historical client data for case study development'],
          timeline: 'Month 1: Discovery. Month 2: Strategy. Month 3: Roadmap delivery.',
          internalNotes: 'Jennifer is the champion but needs ammunition to convince other partners. Make the proposal visually impressive and ROI-focused.',
          resourcing: 'Sarah (strategy lead), Marcus (content), 20 hrs/week.',
          successMetrics: ['Proposal accepted', 'Strategy document approved', 'Phase 2 engagement signed'],
        },
      },
    ],
    meetings: [],
    comments: [
      makeComment('cm4', 'c2', 'Proposal needs to emphasize the "thought leadership" angle heavily. Jennifer specifically used this term multiple times.', true, 'open', 'strategy', 's3'),
    ],
    tasks: [
      { id: 't5', title: 'Draft proposal document for Atlas Legal', owner: 'Sarah Chen', status: 'in_progress', dueDate: '2026-03-15' },
      { id: 't6', title: 'Research competitor digital presence', owner: 'Marcus Webb', status: 'todo', dueDate: '2026-03-12' },
    ],
    performance: [],
    documents: [
      { id: 'd3', clientId: 'c2', title: 'Atlas Legal — Growth Proposal Draft', type: 'proposal', createdAt: '2026-03-08', updatedAt: '2026-03-09', author: 'Sarah Chen' },
    ],
  },
  {
    id: 'c3',
    name: 'Pinnacle Academy',
    company: 'Pinnacle Academy International',
    industry: 'Education',
    logoInitials: 'PA',
    stage: 'active',
    contacts: [
      { id: 'ct4', name: 'Robert Chen', email: 'rchen@pinnacleacademy.edu', title: 'Director of Enrollment', isPrimary: true },
      { id: 'ct5', name: 'Maria Santos', email: 'msantos@pinnacleacademy.edu', title: 'Marketing Manager', isPrimary: false },
    ],
    activeChannels: ['paid_media', 'social_media', 'content_development', 'email_marketing'],
    internalOwner: 'Marcus Webb',
    contractStart: '2025-06-01',
    contractEnd: '2026-05-31',
    notes: 'Private K-12 institution focused on enrollment growth. Strong brand but underutilizing digital channels. Seasonal enrollment cycles are critical.',
    slackChannel: '#pinnacle-academy',
    strategySections: [
      {
        id: 's4',
        channel: 'social_media',
        clientSummary: {
          objective: 'Build an authentic social presence that showcases campus life and academic excellence to prospective families.',
          priorities: ['Instagram content strategy', 'Parent testimonial series', 'Virtual campus tour content'],
          plan: 'Content calendar with 4-5 posts/week across Instagram and Facebook, emphasizing student stories and campus culture.',
          expectedOutcomes: ['50% follower growth', '3x engagement rate', 'Social-attributed inquiry increase'],
        },
        internal: {
          diagnosis: 'Social accounts exist but are managed inconsistently by admin staff. Content is mostly event announcements. No strategy, no content pillars, no engagement protocol.',
          approach: 'Take over content management entirely. Build content pillar framework: Student Stories, Academic Excellence, Campus Life, Parent Voices. Use Reels heavily.',
          targetAudience: 'Parents 30-50 in metro area, HHI $120k+, values education, active on Instagram and Facebook.',
          deliverables: ['Monthly content calendars', 'Content templates', 'Engagement playbook', 'Monthly reports'],
          dependencies: ['Photo/video access to campus', 'Student/parent consent forms', 'Admin cooperation for scheduling'],
          timeline: 'Ongoing monthly engagement. Content pillar launch in Month 1.',
          internalNotes: 'Maria is great to work with but Robert sometimes overrides content decisions. Escalate to Sarah if needed.',
          resourcing: 'Priya (content creation), 12 hrs/week.',
          successMetrics: ['Engagement rate > 4%', 'Follower growth > 8%/month', 'Social inquiries > 20/month'],
        },
      },
    ],
    meetings: [
      {
        id: 'm2',
        clientId: 'c3',
        date: '2026-03-05T10:00:00Z',
        type: 'monthly',
        title: 'Monthly Strategy Review',
        status: 'completed',
        generalNotes: 'Enrollment season approaching. Need to ramp up paid and social efforts. Robert wants to see projection models for spring enrollment.',
        agenda: [
          {
            id: 'a3',
            channel: 'social_media',
            notes: 'Instagram engagement up 45% month-over-month. Parent testimonial Reels performing 3x above benchmark.',
            clientInputs: 'Robert wants more content featuring academic programs, not just campus life. Maria agrees but wants to maintain balance.',
            actionItems: [
              { id: 'ai3', title: 'Create academic-focused content series plan', owner: 'Priya Patel', status: 'todo', dueDate: '2026-03-12', channel: 'social_media' },
            ],
          },
        ],
      },
    ],
    comments: [
      makeComment('cm5', 'c3', 'The parent testimonial series is getting great engagement. Can we do a similar series for alumni?', false, 'open', 'strategy', 's4'),
      makeComment('cm6', 'c3', 'Enrollment season content plan needs to be ready by March 20. Prioritize this.', true, 'open', 'meeting', 'm2'),
    ],
    tasks: [
      { id: 't7', title: 'Create academic content series plan', owner: 'Priya Patel', status: 'todo', dueDate: '2026-03-12', channel: 'social_media' },
      { id: 't8', title: 'Build enrollment season ad campaign', owner: 'Marcus Webb', status: 'in_progress', dueDate: '2026-03-20', channel: 'paid_media' },
    ],
    performance: [
      {
        id: 'perf2',
        clientId: 'c3',
        period: 'February 2026',
        executiveSummary: 'Social media continues to outperform expectations. Instagram engagement rate at 5.2%, well above the 3% target. Paid media preparations underway for enrollment season push.',
        channelHighlights: [
          {
            channel: 'social_media',
            narrative: 'Parent testimonial Reels drove 3x average engagement. Follower growth at 12% for the month. Content calendar fully delivered with 22 posts published.',
            metrics: { 'Engagement Rate': '5.2%', 'Follower Growth': '+12%', 'Reach': '45,200', 'Posts': '22' },
          },
        ],
        wins: ['Instagram engagement rate 73% above target', 'Parent testimonial format proven as top performer', 'Content production workflow fully operational'],
        risks: ['Enrollment season requires 2x content volume — may need additional resources', 'Facebook engagement declining — consider reallocating effort'],
        nextSteps: ['Launch enrollment season content campaign', 'Build academic-focused content pillar', 'Prepare spring open house promotion plan'],
      },
    ],
    documents: [
      { id: 'd4', clientId: 'c3', title: '2025-2026 Social Strategy', type: 'strategy', createdAt: '2025-06-15', updatedAt: '2026-02-01', author: 'Marcus Webb' },
      { id: 'd5', clientId: 'c3', title: 'February Monthly Recap', type: 'recap', createdAt: '2026-03-02', updatedAt: '2026-03-04', author: 'Priya Patel' },
    ],
  },
];

  /* ── c4: HIBA Academy ── */
  {
    id: 'c4',
    name: 'HIBA Academy',
    company: 'HIBA Academy',
    industry: 'Education',
    logoInitials: 'HA',
    stage: 'active',
    contacts: [
      { id: 'ct6', name: 'Alaa Hammad', email: 'alaa@hibaacademy.com', title: 'Founder & Executive Director', isPrimary: true },
    ],
    activeChannels: ['paid_media', 'social_media', 'email_marketing', 'analytics_tracking'],
    internalOwner: 'David Khalil',
    contractStart: '2026-01-01',
    contractEnd: '2026-12-31',
    notes: 'Islamic-centered K-8 private academy focused on enrollment growth through digital marketing. Strong community reputation, building digital funnel to scale admissions beyond word-of-mouth.',
    strategySections: [
      {
        id: 's-c4-1', channel: 'paid_media',
        clientSummary: {
          objective: 'Drive enrollment inquiries through targeted Meta and Google campaigns during peak admissions windows.',
          priorities: ['Meta prospecting to local parents', 'Google Search for private school keywords', 'Retarget website visitors and open house attendees'],
          plan: 'Year-round awareness with seasonal surges during Jan–Apr enrollment push. Meta for awareness, Google for demand capture.',
          expectedOutcomes: ['150+ enrollment inquiries from paid channels', 'CPL under $60', 'ROAS trackable through enrollment attribution'],
        },
        internal: {
          diagnosis: 'Previously running boosted posts only. No conversion tracking, no landing pages, no structured campaigns.',
          approach: 'Build proper ad account structure with prospecting and retargeting layers. Implement conversion tracking. Create dedicated enrollment landing pages.',
          targetAudience: 'Muslim parents 28-50 in the greater metro area, HHI $80k+, values faith-based education.',
          deliverables: ['Monthly media plans', 'Ad creative briefs', 'Weekly performance reports', 'Landing page wireframes'],
          dependencies: ['Enrollment landing page build', 'Conversion tracking setup (GA4 + Meta Pixel)', 'Creative assets from school'],
          timeline: 'Month 1: Setup & tracking. Month 2-4: Enrollment season push. Month 5+: Sustained awareness.',
          internalNotes: 'Alaa is very hands-on and wants to approve all ad copy. Build review process into workflow.',
          resourcing: 'Seif (paid media), Kelly (creative), 12 hrs/week.',
          successMetrics: ['150+ paid inquiries/year', 'CPL < $60', 'Enrollment from paid > 20 students'],
        },
      },
      {
        id: 's-c4-2', channel: 'social_media',
        clientSummary: {
          objective: 'Build an authentic social presence that showcases campus life, academic excellence, and community values.',
          priorities: ['Instagram content strategy', 'Facebook community engagement', 'Parent testimonial content'],
          plan: 'Content calendar with 4-5 posts/week across Instagram and Facebook, emphasizing student stories, campus culture, and Islamic values.',
          expectedOutcomes: ['3x engagement rate', '50% follower growth', 'Social-attributed inquiry increase'],
        },
        internal: {
          diagnosis: 'Social accounts are managed inconsistently by admin staff. Content is mostly event announcements. No strategy.',
          approach: 'Take over content management. Build content pillars: Student Spotlight, Campus Life, Values & Community, Parent Voices.',
          targetAudience: 'Local Muslim parents, prospective families, alumni community.',
          deliverables: ['Monthly content calendars', 'Content templates', 'Engagement playbook'],
          dependencies: ['Photo/video access to campus', 'Student/parent consent forms'],
          timeline: 'Ongoing monthly engagement.',
          internalNotes: 'Alaa sometimes wants to push promotional content too heavily. Guide toward authentic storytelling.',
          resourcing: 'Mark (social), Kelly (design), 10 hrs/week.',
          successMetrics: ['Engagement rate > 4%', 'Follower growth > 8%/month'],
        },
      },
      {
        id: 's-c4-3', channel: 'email_marketing',
        clientSummary: {
          objective: 'Build enrollment nurture sequences and parent communication flows.',
          priorities: ['Inquiry follow-up automation', 'Open house invitation sequences', 'Re-enrollment reminders'],
          plan: 'Set up Mailchimp automation for inquiry nurture, event invitations, and retention communications.',
          expectedOutcomes: ['50% open rates on parent emails', 'Automated inquiry follow-up within 24hrs', 'Re-enrollment nudge sequence'],
        },
        internal: {
          diagnosis: 'No email automation. Manual follow-up on inquiries, often delayed. No segmentation.',
          approach: 'Build 3 core flows: inquiry nurture (5-email), open house invitation, re-enrollment reminder. Segment by inquiry stage.',
          targetAudience: 'Prospective parents who submitted inquiry, current parents for retention.',
          deliverables: ['Flow architecture', 'Email templates', 'Monthly reports'],
          dependencies: ['Mailchimp access', 'Inquiry form integration'],
          timeline: 'Month 1: Setup. Month 2: Core flows live. Month 3+: Optimize.',
          internalNotes: 'Low email list size (~800). Focus on nurture quality over volume.',
          resourcing: 'Mike (email), 6 hrs/week.',
          successMetrics: ['Open rate > 45%', 'Inquiry-to-tour rate > 30%'],
        },
      },
      {
        id: 's-c4-4', channel: 'analytics_tracking',
        clientSummary: {
          objective: 'Implement proper analytics and conversion tracking across website and ad platforms.',
          priorities: ['GA4 setup', 'Meta Pixel and CAPI', 'Google Ads conversion tracking', 'Enrollment funnel reporting'],
          plan: 'Full tracking implementation in Month 1, dashboard build in Month 2.',
          expectedOutcomes: ['Full-funnel visibility', 'Accurate attribution', 'Automated reporting dashboard'],
        },
        internal: {
          diagnosis: 'No analytics beyond basic Wix stats. No conversion tracking on any platform.',
          approach: 'Implement GA4 with GTM, Meta CAPI, Google Ads conversions. Build Looker Studio dashboard.',
          targetAudience: 'N/A — internal infrastructure.',
          deliverables: ['GTM container', 'GA4 property', 'Conversion setup', 'Reporting dashboard'],
          dependencies: ['Website access (Wix)', 'Ad account access'],
          timeline: 'Month 1: Implementation. Month 2: Dashboard. Ongoing: Maintenance.',
          internalNotes: 'Wix may limit some tracking capabilities. Consider recommending WordPress migration later.',
          resourcing: 'Seif (analytics), 8 hrs initial, 2 hrs/month ongoing.',
          successMetrics: ['All conversions tracked', 'Dashboard live', 'Weekly automated reports'],
        },
      },
    ],
    meetings: [],
    comments: [],
    tasks: [
      { id: 't-c4-1', title: 'Set up Meta ad account structure', owner: 'Seif Almadi', status: 'in_progress', dueDate: '2026-03-20', channel: 'paid_media' },
      { id: 't-c4-2', title: 'Build enrollment landing page', owner: 'David Khalil', status: 'todo', dueDate: '2026-03-25', channel: 'paid_media' },
      { id: 't-c4-3', title: 'Create March content calendar', owner: 'Mark Rivera', status: 'in_progress', dueDate: '2026-03-15', channel: 'social_media' },
      { id: 't-c4-4', title: 'Set up Mailchimp inquiry flow', owner: 'Mike Reeves', status: 'todo', dueDate: '2026-03-28', channel: 'email_marketing' },
    ],
    performance: [],
    documents: [],
  },

  /* ── c5: CIS US ── */
  {
    id: 'c5',
    name: 'CIS US',
    company: 'CIS US LLC',
    industry: 'IT Services / Managed Services',
    logoInitials: 'CI',
    stage: 'active',
    contacts: [
      { id: 'ct7', name: 'CIS Leadership', email: 'info@cisus.com', title: 'Leadership Team', isPrimary: true },
    ],
    activeChannels: ['strategic_consulting', 'paid_media', 'social_media', 'email_marketing', 'analytics_tracking', 'website_development'],
    internalOwner: 'David Khalil',
    contractStart: '2026-01-01',
    contractEnd: '2026-12-31',
    notes: 'Managed IT services provider in transition. David is leading both FCMO (strategic marketing leadership) and FCOO (operational transition support) at $10,000/month total ($200/hr equivalent). Current focus: transitioning operations to work with Venturity, rebuilding AutoTask workflows, and broader strategic/operational support.',
    strategySections: [
      {
        id: 's-c5-1', channel: 'strategic_consulting',
        clientSummary: {
          objective: 'Provide fractional CMO and COO leadership to guide CIS through operational transition and marketing modernization.',
          priorities: ['Strategic marketing planning', 'Operational transition to Venturity partnership', 'AutoTask rebuild and workflow optimization', 'Brand positioning refresh'],
          plan: 'Monthly strategic leadership covering both marketing direction and operational transformation. Near-term focus on stabilizing operations while building marketing foundation.',
          expectedOutcomes: ['Clear marketing roadmap', 'Operational workflows rebuilt', 'Venturity transition completed', 'Brand positioning defined'],
        },
        internal: {
          diagnosis: 'CIS is mid-transition — shifting operational model while trying to grow. David is wearing both CMO and COO hats. The $10,000/month fee covers ~50 hours at $200/hr spanning both functions.',
          approach: 'Split time roughly 60/40 between strategic marketing and operational transition. Marketing: build brand, define channels, plan campaigns. Operations: AutoTask rebuild, Venturity integration, process documentation.',
          targetAudience: 'SMBs needing managed IT services, 10-200 employees, $1M-$50M revenue.',
          deliverables: ['Monthly strategy sessions', 'Marketing roadmap', 'Operational playbooks', 'AutoTask workflow documentation', 'Venturity transition plan'],
          dependencies: ['AutoTask access', 'Financial data for unit economics', 'Venturity collaboration coordination'],
          timeline: 'Ongoing. Operational transition target: Q2 2026. Marketing foundation: Q1-Q2 2026.',
          internalNotes: 'David\'s $10,000/month fee = $200/hr × ~50hrs. This covers FCMO + FCOO/transition work. Track hours carefully as scope may need renegotiation once transition stabilizes.',
          resourcing: 'David (strategic lead, ~50 hrs/month), Veronica (PM support, 8 hrs/week).',
          successMetrics: ['Venturity transition complete', 'AutoTask rebuilt', 'Marketing plan approved', 'Pipeline growth initiated'],
        },
      },
      {
        id: 's-c5-2', channel: 'paid_media',
        clientSummary: {
          objective: 'Build a paid search presence targeting local businesses needing managed IT services.',
          priorities: ['Google Search campaigns for IT services keywords', 'Local service area targeting', 'Lead form optimization'],
          plan: 'Start with Google Search focused on high-intent managed IT keywords. Expand to LinkedIn for B2B targeting in Phase 2.',
          expectedOutcomes: ['20+ qualified leads/month from paid', 'CPL under $120', 'Clear attribution to revenue'],
        },
        internal: {
          diagnosis: 'No paid media history. Relying on referrals and existing client base. Need to build demand generation engine.',
          approach: 'Start with Google Search for bottom-funnel capture. Test LinkedIn for mid-market prospecting. Keep budgets modest until tracking is proven.',
          targetAudience: 'IT decision-makers at SMBs, 10-200 employees, local/regional service area.',
          deliverables: ['Campaign structure', 'Ad copy', 'Landing pages', 'Monthly reports'],
          dependencies: ['Website updates for landing pages', 'Conversion tracking setup', 'CRM integration'],
          timeline: 'Month 1: Setup. Month 2-3: Launch and optimize. Month 4+: Scale.',
          internalNotes: 'Budget is limited initially. Focus on proving ROI before requesting budget increase.',
          resourcing: 'Seif (paid media), 8 hrs/week.',
          successMetrics: ['20+ leads/month', 'CPL < $120', 'SQL rate > 25%'],
        },
      },
      {
        id: 's-c5-3', channel: 'social_media',
        clientSummary: {
          objective: 'Establish professional social presence on LinkedIn and Facebook for brand awareness and thought leadership.',
          priorities: ['LinkedIn company page optimization', 'Thought leadership content', 'Case study promotion', 'Community engagement'],
          plan: 'LinkedIn-first strategy with 3-4 posts/week. Facebook for local community presence.',
          expectedOutcomes: ['Professional brand presence', 'Thought leadership positioning', '500+ LinkedIn followers in 6 months'],
        },
        internal: {
          diagnosis: 'Minimal social presence. LinkedIn page exists but inactive. No content strategy.',
          approach: 'LinkedIn-first: IT insights, case studies, team spotlights. Facebook: community presence, client wins.',
          targetAudience: 'Local business owners, IT managers, SMB decision-makers.',
          deliverables: ['Content calendar', 'Post templates', 'Monthly analytics'],
          dependencies: ['Case study approvals from clients', 'Team headshots'],
          timeline: 'Ongoing monthly.',
          internalNotes: 'Low priority relative to paid + operations. Keep lean.',
          resourcing: 'Mark (social), 4 hrs/week.',
          successMetrics: ['3+ posts/week', 'Engagement rate > 2%', 'Follower growth > 5%/month'],
        },
      },
      {
        id: 's-c5-4', channel: 'email_marketing',
        clientSummary: {
          objective: 'Build client communication and lead nurture email infrastructure.',
          priorities: ['Monthly newsletter to existing clients', 'Lead nurture sequence', 'Service announcement templates'],
          plan: 'Set up email platform, build core templates, launch monthly newsletter and lead nurture automation.',
          expectedOutcomes: ['Monthly client touchpoint', 'Automated lead follow-up', 'Upsell/cross-sell pipeline from existing clients'],
        },
        internal: {
          diagnosis: 'No email marketing. Client communications are ad-hoc. No nurture for inbound leads.',
          approach: 'Start simple: monthly newsletter + 3-email lead nurture. Build from there.',
          targetAudience: 'Existing clients (retention), inbound leads (conversion).',
          deliverables: ['Email templates', 'Nurture flow', 'Monthly newsletter'],
          dependencies: ['Email platform selection', 'Client list export from AutoTask'],
          timeline: 'Month 1: Platform setup. Month 2: Templates + nurture. Month 3+: Newsletter launch.',
          internalNotes: 'Small list (~300 contacts). Focus on quality and retention value.',
          resourcing: 'Mike (email), 4 hrs/week.',
          successMetrics: ['Newsletter open rate > 35%', 'Lead nurture response rate > 10%'],
        },
      },
      {
        id: 's-c5-5', channel: 'analytics_tracking',
        clientSummary: {
          objective: 'Implement analytics and lead tracking across website and marketing channels.',
          priorities: ['GA4 implementation', 'Call tracking setup', 'CRM integration', 'Reporting dashboard'],
          plan: 'Full tracking stack implementation in Month 1, reporting dashboard in Month 2.',
          expectedOutcomes: ['Full attribution visibility', 'Lead source tracking', 'Automated weekly reports'],
        },
        internal: {
          diagnosis: 'Basic Google Analytics only. No call tracking, no CRM integration, no lead attribution.',
          approach: 'GA4 + GTM + CallRail + CRM integration. Build Looker Studio dashboard.',
          targetAudience: 'N/A — internal infrastructure.',
          deliverables: ['Tracking implementation', 'CallRail setup', 'CRM integration', 'Dashboard'],
          dependencies: ['Website access', 'CRM access', 'Phone system info'],
          timeline: 'Month 1: Implementation. Month 2: Dashboard. Ongoing: Maintenance.',
          internalNotes: 'AutoTask CRM integration may be complex. Budget extra time.',
          resourcing: 'Seif (analytics), 10 hrs initial, 2 hrs/month ongoing.',
          successMetrics: ['All lead sources tracked', 'Dashboard live', 'Attribution model working'],
        },
      },
    ],
    meetings: [],
    comments: [],
    tasks: [
      { id: 't-c5-1', title: 'Draft marketing roadmap for CIS', owner: 'David Khalil', status: 'in_progress', dueDate: '2026-03-20' },
      { id: 't-c5-2', title: 'AutoTask workflow documentation', owner: 'David Khalil', status: 'in_progress', dueDate: '2026-03-30' },
      { id: 't-c5-3', title: 'Set up GA4 and conversion tracking', owner: 'Seif Almadi', status: 'todo', dueDate: '2026-03-25', channel: 'analytics_tracking' },
      { id: 't-c5-4', title: 'Build Google Search campaign structure', owner: 'Seif Almadi', status: 'todo', dueDate: '2026-04-05', channel: 'paid_media' },
    ],
    performance: [],
    documents: [],
  },

  /* ── c6: Venturity ── */
  {
    id: 'c6',
    name: 'Venturity',
    company: 'Venturity LLC',
    industry: 'IT Services / MSP',
    logoInitials: 'VT',
    stage: 'active',
    contacts: [
      { id: 'ct8', name: 'Venturity Leadership', email: 'info@venturity.com', title: 'Leadership Team', isPrimary: true },
    ],
    activeChannels: ['strategic_consulting', 'paid_media', 'social_media', 'email_marketing', 'analytics_tracking', 'website_development'],
    internalOwner: 'David Khalil',
    contractStart: '2026-02-01',
    contractEnd: '2027-01-31',
    notes: 'Growing MSP/IT services firm. Full-funnel marketing engagement including FCMO, paid media, social, email/SMS, analytics, and web development. Closely tied to CIS transition — Venturity is the operational partner CIS is integrating with.',
    strategySections: [
      {
        id: 's-c6-1', channel: 'strategic_consulting',
        clientSummary: {
          objective: 'Provide fractional CMO leadership to build and execute a comprehensive growth marketing strategy.',
          priorities: ['Brand positioning and messaging', 'Go-to-market strategy', 'Channel mix optimization', 'Sales enablement content'],
          plan: 'Monthly strategic leadership with quarterly planning sessions. Build marketing engine from the ground up.',
          expectedOutcomes: ['Clear brand positioning', 'Defined ICP and messaging', '6-month marketing roadmap', 'Sales-marketing alignment'],
        },
        internal: {
          diagnosis: 'Venturity is growing through the CIS partnership but needs its own marketing identity and demand generation engine.',
          approach: 'Build brand foundation first (positioning, messaging, ICP), then activate channels systematically.',
          targetAudience: 'SMBs needing managed IT services, cybersecurity, cloud migration. 20-500 employees, $2M-$100M revenue.',
          deliverables: ['Brand guide', 'Marketing roadmap', 'Monthly strategy sessions', 'Quarterly reviews'],
          dependencies: ['CIS transition completion', 'Sales team input on ICP'],
          timeline: 'Month 1-2: Foundation. Month 3-6: Activation. Month 7+: Optimization.',
          internalNotes: 'Coordinate closely with CIS engagement. Some overlap in strategy work.',
          resourcing: 'David (FCMO, 20 hrs/month), Veronica (PM, 8 hrs/week).',
          successMetrics: ['Brand guide complete', 'Marketing roadmap approved', 'Pipeline growth > 25%'],
        },
      },
      {
        id: 's-c6-2', channel: 'paid_media',
        clientSummary: {
          objective: 'Build a multi-channel paid acquisition engine targeting SMBs needing IT services.',
          priorities: ['Google Search for managed IT keywords', 'LinkedIn for B2B decision-maker targeting', 'Retargeting for website visitors'],
          plan: 'Phase 1: Google Search. Phase 2: LinkedIn. Phase 3: Retargeting and expansion.',
          expectedOutcomes: ['30+ qualified leads/month', 'CPL under $100', 'Multi-channel attribution'],
        },
        internal: {
          diagnosis: 'No paid media history. Greenfield opportunity to build demand gen properly from day one.',
          approach: 'Google Search for demand capture, LinkedIn for B2B prospecting, Meta retargeting for awareness recapture.',
          targetAudience: 'IT managers, business owners, CTOs at SMBs in service area.',
          deliverables: ['Campaign architecture', 'Ad copy and creative', 'Landing pages', 'Monthly reports'],
          dependencies: ['Landing page development', 'Conversion tracking', 'CRM integration'],
          timeline: 'Month 1: Google launch. Month 2: LinkedIn launch. Month 3+: Optimize and scale.',
          internalNotes: 'Larger budget than CIS. Can be more aggressive with channel testing.',
          resourcing: 'Seif (paid media), 12 hrs/week.',
          successMetrics: ['30+ leads/month', 'CPL < $100', 'SQL rate > 30%'],
        },
      },
      {
        id: 's-c6-3', channel: 'social_media',
        clientSummary: {
          objective: 'Build professional social presence and thought leadership positioning.',
          priorities: ['LinkedIn company and personal brand strategy', 'Case study and testimonial content', 'Industry insights and IT trend content'],
          plan: 'LinkedIn-first strategy with cross-posting to Facebook. 4-5 posts/week.',
          expectedOutcomes: ['Professional brand presence', '1,000+ LinkedIn followers in 6 months', 'Social-sourced leads'],
        },
        internal: {
          diagnosis: 'New brand presence. Need to build from scratch.',
          approach: 'LinkedIn as primary. Content pillars: IT Insights, Client Success, Team Culture, Industry Trends.',
          targetAudience: 'Business leaders, IT decision-makers, SMB owners.',
          deliverables: ['Content calendar', 'Post templates', 'Monthly analytics'],
          dependencies: ['Brand guide completion', 'Case study approvals'],
          timeline: 'Launch Month 2, ongoing.',
          internalNotes: 'Coordinate with CIS content to avoid overlap.',
          resourcing: 'Mark (social), 8 hrs/week. Kelly (design), 4 hrs/week.',
          successMetrics: ['4+ posts/week', 'Engagement rate > 3%', '1,000+ followers by Month 6'],
        },
      },
      {
        id: 's-c6-4', channel: 'email_marketing',
        clientSummary: {
          objective: 'Build a complete email and SMS marketing infrastructure for lead nurture and client retention.',
          priorities: ['Lead nurture automation', 'Client onboarding sequence', 'Monthly newsletter', 'Service announcement flows'],
          plan: 'Implement HubSpot email, build core automation flows, launch newsletter program.',
          expectedOutcomes: ['Automated lead nurture', 'Client retention touchpoints', 'Upsell pipeline from existing clients'],
        },
        internal: {
          diagnosis: 'No email infrastructure. Need to build from scratch.',
          approach: 'HubSpot for email + CRM. Build nurture, onboarding, and newsletter flows. Add SMS for urgent service comms.',
          targetAudience: 'Inbound leads, existing clients, referral partners.',
          deliverables: ['HubSpot setup', 'Core email flows', 'Newsletter template', 'SMS integration'],
          dependencies: ['HubSpot license', 'Client list migration', 'Content for nurture emails'],
          timeline: 'Month 1: Setup. Month 2-3: Core flows. Month 4+: Newsletter + SMS.',
          internalNotes: 'Larger scope than CIS email. Budget appropriately.',
          resourcing: 'Mike (email), 8 hrs/week.',
          successMetrics: ['Nurture open rate > 40%', 'Newsletter open rate > 30%', 'Lead-to-SQL from nurture > 15%'],
        },
      },
      {
        id: 's-c6-5', channel: 'analytics_tracking',
        clientSummary: {
          objective: 'Implement full analytics and attribution stack.',
          priorities: ['GA4 + GTM implementation', 'HubSpot CRM integration', 'Call tracking', 'Attribution dashboard'],
          plan: 'Complete analytics implementation in first 6 weeks.',
          expectedOutcomes: ['Full-funnel attribution', 'Lead source reporting', 'ROI visibility by channel'],
        },
        internal: {
          diagnosis: 'Greenfield. Can build tracking properly from the start.',
          approach: 'GA4 + GTM + HubSpot + CallRail. Build unified dashboard in Looker Studio.',
          targetAudience: 'N/A — internal infrastructure.',
          deliverables: ['Tracking implementation', 'CRM integration', 'Attribution dashboard'],
          dependencies: ['Website access', 'HubSpot access', 'Phone system'],
          timeline: 'Week 1-2: GA4 + GTM. Week 3-4: CRM + CallRail. Week 5-6: Dashboard.',
          internalNotes: 'Do this right from the start. Will save headaches later.',
          resourcing: 'Seif (analytics), 12 hrs initial, 2 hrs/month ongoing.',
          successMetrics: ['All channels tracked', 'Dashboard live', 'Weekly automated reports'],
        },
      },
      {
        id: 's-c6-6', channel: 'website_development',
        clientSummary: {
          objective: 'Build a modern, conversion-optimized website that positions Venturity as a premium IT services provider.',
          priorities: ['New website design and development', 'Service pages with clear CTAs', 'Lead capture optimization', 'SEO foundation'],
          plan: 'Phase 1: Design. Phase 2: Development. Phase 3: Launch and optimize.',
          expectedOutcomes: ['Professional website', 'Conversion rate > 3%', 'SEO-ready architecture'],
        },
        internal: {
          diagnosis: 'Current website is basic. Needs complete rebuild to support marketing and sales.',
          approach: 'WordPress or Webflow build. Focus on service pages, case studies, and lead capture.',
          targetAudience: 'Prospective clients evaluating IT service providers.',
          deliverables: ['Website design mockups', 'Development', 'Content migration', 'Launch QA'],
          dependencies: ['Brand guide', 'Service descriptions', 'Case studies'],
          timeline: 'Month 1: Design. Month 2-3: Development. Month 4: Launch.',
          internalNotes: 'Coordinate with brand work. Website should reflect new positioning.',
          resourcing: 'Kelly (design), David (strategy oversight). Dev TBD.',
          successMetrics: ['Website live by Month 4', 'Conversion rate > 3%', 'Load time < 3s'],
        },
      },
    ],
    meetings: [],
    comments: [],
    tasks: [
      { id: 't-c6-1', title: 'Complete brand positioning document', owner: 'David Khalil', status: 'in_progress', dueDate: '2026-03-25' },
      { id: 't-c6-2', title: 'Build Google Search campaigns', owner: 'Seif Almadi', status: 'todo', dueDate: '2026-04-01', channel: 'paid_media' },
      { id: 't-c6-3', title: 'Set up HubSpot and email flows', owner: 'Mike Reeves', status: 'todo', dueDate: '2026-04-10', channel: 'email_marketing' },
      { id: 't-c6-4', title: 'Website design kickoff', owner: 'Kelly Nguyen', status: 'todo', dueDate: '2026-04-05', channel: 'website_development' },
      { id: 't-c6-5', title: 'Launch LinkedIn content program', owner: 'Mark Rivera', status: 'todo', dueDate: '2026-03-20', channel: 'social_media' },
    ],
    performance: [],
    documents: [],
  },
];

// Mutable client store
const clientsStore: Client[] = [...seedClients];

export { seedClients };

export function getClients(): Client[] {
  return clientsStore;
}

export function addClient(client: Client): Client {
  clientsStore.push(client);
  return client;
}
