import { ServiceChannel } from './index';

export type CampaignStatus =
  | 'draft'
  | 'concept_generation'
  | 'concept_review'
  | 'production_generation'
  | 'ready_for_design'
  | 'ready_for_launch'
  | 'active'
  | 'archived';

export const CAMPAIGN_STATUS_LABELS: Record<CampaignStatus, string> = {
  draft: 'Draft',
  concept_generation: 'Concept Generation',
  concept_review: 'Concept Review',
  production_generation: 'Production Generation',
  ready_for_design: 'Ready for Design',
  ready_for_launch: 'Ready for Launch',
  active: 'Active',
  archived: 'Archived',
};

export type PlatformFocus = 'meta' | 'google_search' | 'google_pmax' | 'multi_channel';
export const PLATFORM_LABELS: Record<PlatformFocus, string> = {
  meta: 'Meta',
  google_search: 'Google Search',
  google_pmax: 'Google Performance Max',
  multi_channel: 'Multi-channel',
};

export type MessageAngle =
  | 'problem_solution' | 'benefit_led' | 'offer_led' | 'social_proof'
  | 'comparison' | 'educational' | 'objection_handling' | 'founder_led' | 'urgency_scarcity';

export const MESSAGE_ANGLE_LABELS: Record<MessageAngle, string> = {
  problem_solution: 'Problem / Solution',
  benefit_led: 'Benefit-led',
  offer_led: 'Offer-led',
  social_proof: 'Social Proof',
  comparison: 'Comparison',
  educational: 'Educational',
  objection_handling: 'Objection Handling',
  founder_led: 'Founder-led',
  urgency_scarcity: 'Urgency / Scarcity',
};

export type CampaignObjective = 'awareness' | 'traffic' | 'leads' | 'sales' | 'retargeting' | 'product_launch' | 'promotion';
export const OBJECTIVE_LABELS: Record<CampaignObjective, string> = {
  awareness: 'Awareness',
  traffic: 'Traffic',
  leads: 'Leads',
  sales: 'Sales',
  retargeting: 'Retargeting',
  product_launch: 'Product Launch',
  promotion: 'Promotion',
};

export type ConceptStatus = 'pending' | 'approved' | 'rejected' | 'variation';
export type OutputStatus = 'draft' | 'review' | 'approved' | 'exported';
export type FormatType = 'static_image' | 'carousel' | 'short_form_video' | 'reel_story' | 'search_copy' | 'pmax_visual_pack';
export type AssetType = 'logo' | 'product_image' | 'lifestyle_image' | 'brand_photo' | 'ugc_video' | 'testimonial' | 'screenshot' | 'promo_graphic' | 'video' | 'ad_reference';
export type AssetTag = 'product' | 'lifestyle' | 'ugc' | 'testimonial' | 'brand' | 'seasonal' | 'promo' | 'founder' | 'static' | 'video';

export const ASSET_TYPE_LABELS: Record<AssetType, string> = {
  logo: 'Logo', product_image: 'Product Image', lifestyle_image: 'Lifestyle Image',
  brand_photo: 'Brand Photo', ugc_video: 'UGC Video', testimonial: 'Testimonial',
  screenshot: 'Screenshot', promo_graphic: 'Promo Graphic', video: 'Video', ad_reference: 'Ad Reference',
};

export interface Campaign {
  id: string;
  clientId: string;
  strategySectionId?: string;
  name: string;
  objective: CampaignObjective;
  offer: string;
  audience: string;
  painPoint: string;
  desiredOutcome: string;
  cta: string;
  angle: MessageAngle;
  landingPageUrl: string;
  notes?: string;
  restrictions?: string;
  status: CampaignStatus;
  platformFocus: PlatformFocus;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
  concepts: CampaignConcept[];
  trackingLinks: TrackingLink[];
}

export interface CampaignConcept {
  id: string;
  campaignId: string;
  name: string;
  audience: string;
  channel: ServiceChannel;
  hook: string;
  coreMessage: string;
  visualDirection: string;
  suggestedPlatform: string;
  suggestedFormats: FormatType[];
  reasonToPerform: string;
  requiredAssetTypes: AssetType[];
  status: ConceptStatus;
  modelUsed?: string;
  notes?: string;
  internalNotes?: string;
  outputs: CreativeOutput[];
  createdAt: string;
  updatedAt: string;
}

export interface CreativeOutput {
  id: string;
  conceptId: string;
  platform: PlatformFocus;
  formatType: FormatType;
  copyPrimary?: string;
  copyHeadline?: string;
  copyDescription?: string;
  visualBrief?: string;
  storyboard?: string;
  outputStatus: OutputStatus;
  // Google Search specifics
  headlines?: string[];
  descriptions?: string[];
  searchIntentNotes?: string;
  extensionIdeas?: string[];
  // PMax specifics
  shortHeadlines?: string[];
  longHeadlines?: string[];
  imageDirections?: string[];
  videoDirections?: string[];
  audienceSignals?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ClientAsset {
  id: string;
  clientId: string;
  title: string;
  assetType: AssetType;
  fileUrl: string;
  thumbnailUrl?: string;
  tags: AssetTag[];
  notes?: string;
  uploadedBy: string;
  linkedCampaigns: string[];
  createdAt: string;
}

export interface TrackingLink {
  id: string;
  campaignId: string;
  conceptId?: string;
  outputId?: string;
  destinationUrl: string;
  finalUrl: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmId: string;
  utmContent: string;
  utmTerm?: string;
  utmSourcePlatform?: string;
  utmMarketingTactic?: string;
  utmCreativeFormat?: string;
  createdAt: string;
}

export interface CreativePerformance {
  id: string;
  campaignId: string;
  conceptId?: string;
  outputId?: string;
  platform: PlatformFocus;
  dateRange: string;
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  conversions: number;
  cvr: number;
  cpa: number;
  revenue: number;
  roas: number;
  notes?: string;
  createdAt: string;
}

export interface CreativeLearning {
  id: string;
  clientId: string;
  campaignId?: string;
  platform?: PlatformFocus;
  audienceType?: string;
  angleType?: string;
  hookPattern?: string;
  visualPattern?: string;
  ctaPattern?: string;
  resultSummary: string;
  confidenceScore?: number;
  createdAt: string;
}

export interface NamingRules {
  id: string;
  clientId: string;
  sourceRules: string[];
  mediumRules: string[];
  campaignFormat: string;
  contentFormat: string;
  termRules?: string;
  createdAt: string;
}

export const LOCKED_SOURCES = ['meta', 'google', 'youtube', 'linkedin', 'klaviyo'] as const;
export const LOCKED_MEDIUMS = ['paid_social', 'paid_search', 'email', 'sms', 'organic_social', 'affiliate'] as const;
