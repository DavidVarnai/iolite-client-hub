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
  // ── CLIENT 4 — HIBA Academy ──
  {
    id: 'c4',
    name: 'HIBA Academy',
    company: 'HIBA Academy',
    industry: 'Education',
    logoInitials: 'HA',
    stage: 'active',
    contacts: [
      { id: 'ct6', name: 'HIBA Contact', email: 'info@hibaacademy.com', title: 'Director of Admissions', isPrimary: true },
    ],
    activeChannels: ['paid_media', 'social_media', 'email_marketing', 'analytics_tracking'],
    internalOwner: 'Sarah Chen',
    contractStart: '2026-01-01',
    contractEnd: '2026-12-31',
    notes: 'Private bilingual K-8 school in San Francisco. Focus on enrollment growth and brand awareness ahead of school opening. No web dev or fractional CMO in scope.',
    strategySections: [],
    meetings: [],
    comments: [],
    tasks: [],
    performance: [],
    documents: [],
  },
  // ── CLIENT 5 — CIS ──
  {
    id: 'c5',
    name: 'CIS',
    company: 'CIS',
    industry: 'IT Services / MSP',
    logoInitials: 'CI',
    stage: 'active',
    contacts: [
      { id: 'ct7', name: 'CIS Contact', email: 'info@cis.com', title: 'Managing Director', isPrimary: true },
    ],
    activeChannels: ['strategic_consulting', 'paid_media', 'social_media', 'email_marketing', 'analytics_tracking', 'website_development'],
    internalOwner: 'Sarah Chen',
    contractStart: '2026-01-01',
    contractEnd: '2026-12-31',
    notes: 'IT Services / IAM / Managed Service Provider. Current engagement: $10,000/month consulting (David @ $200/hr). Scope includes Fractional CMO, operational transition leadership, CIS-Venturity integration, and AutoTask rebuild.',
    strategySections: [],
    meetings: [],
    comments: [],
    tasks: [],
    performance: [],
    documents: [],
  },
  // ── CLIENT 6 — Venturity ──
  {
    id: 'c6',
    name: 'Venturity',
    company: 'Venturity',
    industry: 'Financial Services',
    logoInitials: 'VT',
    stage: 'active',
    contacts: [
      { id: 'ct8', name: 'Venturity Contact', email: 'info@venturity.com', title: 'Principal', isPrimary: true },
    ],
    activeChannels: ['strategic_consulting', 'paid_media', 'social_media', 'email_marketing', 'analytics_tracking', 'website_development'],
    internalOwner: 'Sarah Chen',
    contractStart: '2026-01-01',
    contractEnd: '2026-12-31',
    notes: 'Financial advisory and services firm. Venturity is NOT an MSP or IT company — it works operationally with CIS but is a separate financial firm.',
    strategySections: [],
    meetings: [],
    comments: [],
    tasks: [],
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
