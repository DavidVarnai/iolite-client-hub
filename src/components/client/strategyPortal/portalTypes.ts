/**
 * Strategy Portal data types — per-client editable strategy document.
 */

export interface PortalPersona {
  initials: string;
  title: string;
  role: string;
  primary: boolean;
}

export interface PortalPhase {
  num: string;
  title: string;
  desc: string;
  tags: string[];
}

export interface PortalChannel {
  icon: string;
  title: string;
  role: string;
  desc: string;
}

export interface PortalAngle {
  num: string;
  title: string;
  desc: string;
}

export interface PortalBudgetLine {
  label: string;
  value: string;
}

export interface PortalCheckItem {
  id: number;
  label: string;
  sub: string;
  done: boolean;
}

export interface PortalDiscussionTopic {
  title: string;
  desc: string;
}

export interface StrategyPortalData {
  status: 'draft' | 'review' | 'approved';

  // Overview
  overviewTitle: string;
  overviewSubtitle: string;
  campaignContext: string;
  overviewStats: { val: string; label: string }[];
  primaryFocus: { label: string; tag: string; desc: string; positioning: string };
  secondaryFocus: { label: string; tag: string; tagColor: string; desc: string; positioning: string };
  notTraditionalPoints: { title: string; desc: string }[];

  // ICP
  icpSubtitle: string;
  icp4WhoTheyAre: string[];
  icp4Challenges: string[];
  icp4WhatTheyWant: string[];
  icp4Positioning: string;
  icp3WhoTheyAre: string[];
  icp3Challenges: string[];
  icp3WhatTheyWant: string[];
  icp3Positioning: string;

  // Personas
  personasSubtitle: string;
  personas: PortalPersona[];

  // Core Insight
  insightSubtitle: string;
  strategicInsight: string;
  insightForProspect: string;
  insightForCompany: string;

  // Messaging
  messagingSubtitle: string;
  messagingAngles: PortalAngle[];

  // Campaign Structure
  structureSubtitle: string;
  phases: PortalPhase[];

  // Channel Strategy
  channelsSubtitle: string;
  channels: PortalChannel[];

  // Creative Strategy
  creativeSubtitle: string;
  visualTone: string[];
  contentFormats: string[];
  creativePrinciple: string;

  // Execution Options
  executionSubtitle: string;
  foundationLines: PortalBudgetLine[];
  foundationTotal: string;
  growthLines: PortalBudgetLine[];
  growthTotal: string;

  // BD Outreach
  bdSubtitle: string;
  bdIncluded: string[];
  bdOutcomes: string[];
  bdLines: PortalBudgetLine[];
  bdTotal: string;

  // Next Steps
  nextStepsSubtitle: string;
  checkItems: PortalCheckItem[];

  // Notes
  notes: string;
  discussionTopics: PortalDiscussionTopic[];
}

export const DEFAULT_PORTAL_DATA: StrategyPortalData = {
  status: 'draft',

  overviewTitle: 'Strategy Portal',
  overviewSubtitle: 'Client Review Document',
  campaignContext: 'Enter campaign context and background here...',
  overviewStats: [
    { val: '$50M–$500M+', label: 'Target Company Revenue Range' },
    { val: '2 ICPs', label: 'Defined Audience Profiles' },
    { val: '3 Phases', label: 'Campaign Structure' },
  ],
  primaryFocus: {
    label: 'Primary Campaign Focus',
    tag: 'ICP #1',
    desc: 'Describe your primary target audience...',
    positioning: 'Your primary positioning statement...',
  },
  secondaryFocus: {
    label: 'Secondary Audience',
    tag: 'ICP #2',
    tagColor: 'green',
    desc: 'Describe your secondary target audience...',
    positioning: 'Your secondary positioning statement...',
  },
  notTraditionalPoints: [
    { title: 'Reframing Required', desc: 'Describe why prospects need a new perspective...' },
    { title: 'Proof Required', desc: 'Describe the proof requirements...' },
    { title: 'High Trust Required', desc: 'Describe trust requirements...' },
  ],

  icpSubtitle: 'Primary growth audiences defined by operational complexity and need for reliable infrastructure.',
  icp4WhoTheyAre: ['Target segment description'],
  icp4Challenges: ['Core challenge'],
  icp4WhatTheyWant: ['Key desire'],
  icp4Positioning: 'Positioning statement for primary ICP...',
  icp3WhoTheyAre: ['Secondary segment description'],
  icp3Challenges: ['Core challenge'],
  icp3WhatTheyWant: ['Key desire'],
  icp3Positioning: 'Positioning statement for secondary ICP...',

  personasSubtitle: 'Key decision-makers and influencers within target accounts.',
  personas: [
    { initials: 'DM', title: 'Decision Maker', role: 'Primary Decision-Maker', primary: true },
    { initials: 'ES', title: 'Executive Sponsor', role: 'Executive Sponsor', primary: false },
  ],

  insightSubtitle: 'The strategic narrative driving every touchpoint in this campaign.',
  strategicInsight: 'Enter the core strategic insight that drives your campaign narrative...',
  insightForProspect: 'Why this insight matters for the prospect...',
  insightForCompany: 'Why this insight matters for your company...',

  messagingSubtitle: 'Core messaging angles that drive the campaign narrative across all channels.',
  messagingAngles: [
    { num: '01', title: 'Angle 1', desc: 'Describe messaging angle...' },
    { num: '02', title: 'Angle 2', desc: 'Describe messaging angle...' },
  ],

  structureSubtitle: 'Phased approach from awareness to conversion.',
  phases: [
    { num: '1', title: 'Phase 1 — Foundation', desc: 'Describe phase 1...', tags: ['Tag 1'] },
    { num: '2', title: 'Phase 2 — Engagement', desc: 'Describe phase 2...', tags: ['Tag 1'] },
    { num: '3', title: 'Phase 3 — Conversion', desc: 'Describe phase 3...', tags: ['Tag 1'] },
  ],

  channelsSubtitle: 'Multi-channel approach for engagement.',
  channels: [
    { icon: '🔗', title: 'LinkedIn', role: 'Primary Channel', desc: 'Channel description...' },
    { icon: '📧', title: 'Email', role: 'Nurture Channel', desc: 'Channel description...' },
  ],

  creativeSubtitle: 'Visual and creative direction for all campaign assets.',
  visualTone: ['Clean, premium aesthetic'],
  contentFormats: ['Video content'],
  creativePrinciple: 'Every creative asset must answer the key question...',

  executionSubtitle: 'Investment tiers aligned to campaign scope.',
  foundationLines: [{ label: 'Service', value: '$0' }],
  foundationTotal: '$0',
  growthLines: [{ label: 'Everything in Foundation', value: 'Included' }],
  growthTotal: '$0',

  bdSubtitle: 'Direct business development outreach layer.',
  bdIncluded: ['Targeted prospect list building'],
  bdOutcomes: ['Qualified meetings per quarter'],
  bdLines: [{ label: 'Service', value: '$0/mo' }],
  bdTotal: '$0/mo',

  nextStepsSubtitle: 'Action items to move from review to execution.',
  checkItems: [
    { id: 1, label: 'Review strategy document', sub: 'All stakeholders', done: false },
  ],

  notes: '',
  discussionTopics: [
    { title: 'Topic 1', desc: 'Discussion question...' },
  ],
};
