/**
 * Modeled competitor provider — extracted from marketIntelligenceAdapter.ts.
 * Contains the SERP competitor pools and frequency-based scoring logic.
 * This is the fallback path when live search is unavailable.
 */

import type {
  CompetitorProfile,
  KeywordTheme,
  SourceType,
  SERPSource,
} from '@/types/marketIntelligence';
import type { CompetitorSearchContext } from './competitorSearchProvider';

let _ts = 0;
function uid(prefix: string) { return `${prefix}-${Date.now()}-${++_ts}`; }

/* ── Excluded & directory domains ── */

const EXCLUDED_DOMAINS = [
  'yelp.com', 'wikipedia.org', 'niche.com', 'yellowpages.com', 'bbb.org',
  'indeed.com', 'glassdoor.com', 'facebook.com', 'linkedin.com', 'twitter.com',
  'instagram.com', 'tiktok.com', 'youtube.com', 'reddit.com', 'quora.com',
  'amazon.com', 'ebay.com', 'craigslist.org', 'tripadvisor.com',
];

/* ── SERP competitor pools ── */

interface SERPPoolEntry {
  name: string;
  url: string;
  geography: string;
  positioning: string;
  rankingKeywords: string[];
  organic: boolean;
  paidAds: boolean;
  domainAuthority: number;
}

const SERP_COMPETITOR_POOLS: Record<string, SERPPoolEntry[]> = {
  'Education': [
    { name: 'Stratford School', url: 'https://www.stratfordschools.com', geography: 'San Francisco Bay Area', positioning: 'Private K-8 school with STEM focus', rankingKeywords: ['private school san francisco', 'k-8 school bay area'], organic: true, paidAds: true, domainAuthority: 45 },
    { name: 'Kumon', url: 'https://www.kumon.com', geography: 'National (local centers)', positioning: 'Franchise tutoring chain, math and reading', rankingKeywords: ['tutoring near me', 'math tutoring'], organic: true, paidAds: true, domainAuthority: 62 },
    { name: 'Sylvan Learning', url: 'https://www.sylvanlearning.com', geography: 'National (local centers)', positioning: 'Personalized tutoring and test prep', rankingKeywords: ['learning center near me', 'tutoring services'], organic: true, paidAds: true, domainAuthority: 55 },
    { name: 'BASIS Independent Schools', url: 'https://www.basisindependent.com', geography: 'Multiple US metros', positioning: 'Rigorous college-prep curriculum', rankingKeywords: ['best private school', 'college prep school'], organic: true, paidAds: false, domainAuthority: 38 },
    { name: 'Fusion Academy', url: 'https://www.fusionacademy.com', geography: 'Multiple US metros', positioning: 'One-to-one private school model', rankingKeywords: ['private school small class', 'alternative school'], organic: true, paidAds: true, domainAuthority: 35 },
    { name: 'Primrose Schools', url: 'https://www.primroseschools.com', geography: 'National (franchise)', positioning: 'Early education and childcare franchise', rankingKeywords: ['preschool near me', 'early childhood education'], organic: true, paidAds: true, domainAuthority: 48 },
  ],
  'IT Services': [
    { name: 'Dataprise', url: 'https://www.dataprise.com', geography: 'Mid-Atlantic / National', positioning: 'Managed IT services and cybersecurity for mid-market', rankingKeywords: ['managed it services', 'it support near me', 'msp provider'], organic: true, paidAds: true, domainAuthority: 48 },
    { name: 'Ntiva', url: 'https://www.ntiva.com', geography: 'Mid-Atlantic / National', positioning: 'IT services and strategic consulting for SMBs', rankingKeywords: ['managed service provider', 'it consulting firm', 'it help desk'], organic: true, paidAds: true, domainAuthority: 42 },
    { name: 'Corsica Technologies', url: 'https://www.corsicatech.com', geography: 'Eastern US', positioning: 'Unified IT services with cybersecurity focus', rankingKeywords: ['managed cybersecurity', 'it services company'], organic: true, paidAds: true, domainAuthority: 35 },
    { name: 'Electric', url: 'https://www.electric.ai', geography: 'US (Remote-first)', positioning: 'IT management platform for SMBs', rankingKeywords: ['it management platform', 'outsourced it department'], organic: true, paidAds: true, domainAuthority: 50 },
    { name: 'Kaseya', url: 'https://www.kaseya.com', geography: 'Global', positioning: 'IT management software for MSPs', rankingKeywords: ['rmm software', 'msp platform', 'it automation'], organic: true, paidAds: true, domainAuthority: 65 },
    { name: 'ConnectWise', url: 'https://www.connectwise.com', geography: 'Global', positioning: 'Business management platform for MSPs', rankingKeywords: ['psa software', 'msp business management'], organic: true, paidAds: true, domainAuthority: 62 },
    { name: 'Datto (Kaseya)', url: 'https://www.datto.com', geography: 'Global', positioning: 'Backup, networking, and business continuity', rankingKeywords: ['data backup solutions', 'business continuity msp'], organic: true, paidAds: true, domainAuthority: 58 },
  ],
  'E-commerce': [
    { name: 'Parachute Home', url: 'https://www.parachutehome.com', geography: 'US (National)', positioning: 'Premium DTC home essentials', rankingKeywords: ['organic bedding', 'premium towels online'], organic: true, paidAds: true, domainAuthority: 52 },
    { name: 'West Elm', url: 'https://www.westelm.com', geography: 'US + International', positioning: 'Modern furniture and home décor', rankingKeywords: ['modern home decor', 'furniture online'], organic: true, paidAds: true, domainAuthority: 75 },
    { name: 'Crate & Barrel', url: 'https://www.crateandbarrel.com', geography: 'US + International', positioning: 'Contemporary home furnishings', rankingKeywords: ['home furnishings', 'kitchen accessories'], organic: true, paidAds: true, domainAuthority: 78 },
    { name: 'Brooklinen', url: 'https://www.brooklinen.com', geography: 'US (DTC)', positioning: 'Luxury bedding and bath DTC', rankingKeywords: ['best sheets online', 'luxury bedding'], organic: true, paidAds: true, domainAuthority: 48 },
  ],
  'Professional Services': [
    { name: 'Fisher Phillips', url: 'https://www.fisherphillips.com', geography: 'National', positioning: 'Labor & employment law leader', rankingKeywords: ['employment lawyer', 'labor law firm'], organic: true, paidAds: true, domainAuthority: 58 },
    { name: 'Foley & Lardner', url: 'https://www.foley.com', geography: 'National', positioning: 'Full-service corporate law', rankingKeywords: ['corporate lawyer', 'M&A attorney'], organic: true, paidAds: false, domainAuthority: 65 },
    { name: 'Cooley', url: 'https://www.cooley.com', geography: 'National', positioning: 'Tech and startup legal services', rankingKeywords: ['startup lawyer', 'venture capital attorney'], organic: true, paidAds: false, domainAuthority: 62 },
    { name: 'Baker McKenzie', url: 'https://www.bakermckenzie.com', geography: 'Global', positioning: 'International corporate law', rankingKeywords: ['international law firm', 'global corporate counsel'], organic: true, paidAds: false, domainAuthority: 72 },
  ],
  'Healthcare': [
    { name: 'One Medical', url: 'https://www.onemedical.com', geography: 'Major US metros', positioning: 'Membership-based primary care', rankingKeywords: ['primary care near me', 'concierge doctor'], organic: true, paidAds: true, domainAuthority: 55 },
    { name: 'Carbon Health', url: 'https://carbonhealth.com', geography: 'US metros', positioning: 'Tech-enabled urgent and primary care', rankingKeywords: ['urgent care near me', 'walk-in clinic'], organic: true, paidAds: true, domainAuthority: 45 },
    { name: 'Teladoc', url: 'https://www.teladoc.com', geography: 'US (Telehealth)', positioning: 'Virtual care platform', rankingKeywords: ['online doctor', 'telehealth visit'], organic: true, paidAds: true, domainAuthority: 60 },
    { name: 'MinuteClinic (CVS)', url: 'https://www.cvs.com/minuteclinic', geography: 'National (retail)', positioning: 'Retail clinic for basic care', rankingKeywords: ['walk-in clinic near me', 'quick medical visit'], organic: true, paidAds: true, domainAuthority: 80 },
  ],
  'Real Estate': [
    { name: 'Compass', url: 'https://www.compass.com', geography: 'Major US metros', positioning: 'Tech-forward luxury brokerage', rankingKeywords: ['real estate agent near me', 'luxury homes'], organic: true, paidAds: true, domainAuthority: 68 },
    { name: 'Redfin', url: 'https://www.redfin.com', geography: 'US (National)', positioning: 'Discount brokerage with listing portal', rankingKeywords: ['homes for sale', 'real estate listings'], organic: true, paidAds: true, domainAuthority: 82 },
    { name: 'Keller Williams', url: 'https://www.kw.com', geography: 'US (National franchise)', positioning: 'Large agent network', rankingKeywords: ['real estate broker', 'buy a home'], organic: true, paidAds: true, domainAuthority: 65 },
  ],
};

/** Directories/platforms — classified separately */
const DIRECTORY_POOL: Record<string, { name: string; url: string; geography: string; positioning: string; rankingKeywords: string[]; domainAuthority: number }[]> = {
  'Education': [
    { name: 'Great Schools', url: 'https://www.greatschools.org', geography: 'National', positioning: 'School ratings and reviews platform', rankingKeywords: ['school ratings', 'best schools near me'], domainAuthority: 78 },
    { name: 'Niche', url: 'https://www.niche.com', geography: 'National', positioning: 'School search and rankings directory', rankingKeywords: ['best schools', 'school rankings'], domainAuthority: 75 },
  ],
  'Healthcare': [
    { name: 'ZocDoc', url: 'https://www.zocdoc.com', geography: 'US (Online)', positioning: 'Doctor booking platform', rankingKeywords: ['find a doctor near me', 'book doctor appointment'], domainAuthority: 72 },
    { name: 'Healthgrades', url: 'https://www.healthgrades.com', geography: 'National', positioning: 'Doctor ratings and reviews platform', rankingKeywords: ['doctor reviews', 'best doctor near me'], domainAuthority: 70 },
  ],
  'Real Estate': [
    { name: 'Zillow', url: 'https://www.zillow.com', geography: 'US (Online)', positioning: 'Dominant home search platform', rankingKeywords: ['homes for sale near me', 'home values'], domainAuthority: 92 },
    { name: 'Realtor.com', url: 'https://www.realtor.com', geography: 'US (Online)', positioning: 'MLS-based listing portal', rankingKeywords: ['houses for sale', 'real estate market'], domainAuthority: 85 },
  ],
  'E-commerce': [
    { name: 'Etsy', url: 'https://www.etsy.com', geography: 'Global marketplace', positioning: 'Handmade and artisan marketplace', rankingKeywords: ['handmade home goods', 'artisan decor'], domainAuthority: 92 },
  ],
  'Professional Services': [
    { name: 'LegalZoom', url: 'https://www.legalzoom.com', geography: 'US (Online)', positioning: 'Self-service legal platform', rankingKeywords: ['legal services online', 'business formation'], domainAuthority: 75 },
  ],
  'IT Services': [
    { name: 'Capterra', url: 'https://www.capterra.com', geography: 'Global', positioning: 'Software reviews and comparison platform', rankingKeywords: ['it software reviews', 'msp software comparison'], domainAuthority: 80 },
    { name: 'G2', url: 'https://www.g2.com', geography: 'Global', positioning: 'Business software reviews', rankingKeywords: ['rmm reviews', 'it management software reviews'], domainAuthority: 82 },
  ],
};

/**
 * Generate competitor profiles using modeled industry pools.
 * Scores by query frequency + organic/paid weighting.
 */
export function generateCompetitorProfilesModeled(
  ctx: CompetitorSearchContext,
): CompetitorProfile[] {
  const { inputs, discoveryQueries, coreKeywords, keywordThemes, normalizedIndustry, isLocal, localArea, area } = ctx;
  const loc = isLocal ? localArea : area;
  const profiles: CompetitorProfile[] = [];
  const totalQueries = discoveryQueries.length;

  // 1. Manual competitors — highest trust
  const known = inputs.knownCompetitors?.filter(Boolean) || [];
  for (const name of known.slice(0, 5)) {
    profiles.push({
      id: uid('cp'), name, geography: loc,
      positioning: `Known competitor in the ${inputs.industry.toLowerCase()} space`,
      channelObservations: 'Monitor creative and messaging closely.',
      competitorType: 'direct', relevance: 'high',
      localRelevance: isLocal ? 'high' : 'medium',
      notes: 'User-provided competitor — authoritative.',
      sourceType: 'manual', sourceConfidence: 'high',
      manuallyAdded: true, approved: true,
      serpSource: 'both', queryFrequency: totalQueries, totalQueries, confidenceScore: 100,
    });
  }

  // 2. Pull from SERP pool, score by query frequency
  const serpPool = SERP_COMPETITOR_POOLS[normalizedIndustry] || [];
  const knownNames = new Set(known.map(n => n.toLowerCase()));

  const scored = serpPool
    .filter(c => !knownNames.has(c.name.toLowerCase()))
    .filter(c => !EXCLUDED_DOMAINS.some(d => c.url.includes(d)))
    .map(c => {
      let queryMatchCount = 0;
      for (const query of discoveryQueries) {
        const queryWords = query.toLowerCase().split(/\s+/);
        const matches = c.rankingKeywords.some(rk =>
          queryWords.some(qw => rk.toLowerCase().includes(qw) || qw.includes(rk.toLowerCase().split(' ')[0] || ''))
        );
        if (matches) queryMatchCount++;
      }
      const coreMatches = coreKeywords.filter(kw =>
        c.rankingKeywords.some(rk => rk.toLowerCase().includes(kw.split(' ')[0]?.toLowerCase() || ''))
      );
      queryMatchCount = Math.max(queryMatchCount, Math.min(coreMatches.length, totalQueries));

      let score = queryMatchCount * 5;
      if (c.organic && c.paidAds) score += 10;
      else if (c.paidAds) score += 7;
      else if (c.organic) score += 3;
      if (isLocal && c.geography.toLowerCase().includes(localArea.toLowerCase().split(',')[0] || '')) score += 5;
      if (c.geography.toLowerCase().includes('national') || c.geography.toLowerCase().includes('us')) score += 1;
      score += Math.floor(c.domainAuthority / 20);

      const serpSource: SERPSource = (c.organic && c.paidAds) ? 'both' : c.paidAds ? 'paid' : 'organic';
      const freqRatio = queryMatchCount / Math.max(totalQueries, 1);
      const sourceBonus = serpSource === 'both' ? 20 : serpSource === 'paid' ? 10 : 0;
      const confidenceScore = Math.min(100, Math.round(freqRatio * 60 + sourceBonus + Math.min(c.domainAuthority / 5, 20)));

      return { ...c, score, queryMatchCount, serpSource, confidenceScore, coreMatches };
    })
    .sort((a, b) => b.score - a.score);

  const slotsRemaining = 8 - profiles.length;
  for (const comp of scored.slice(0, Math.max(slotsRemaining, 0))) {
    const isMapResult = isLocal && comp.geography.toLowerCase().includes(localArea.toLowerCase().split(',')[0] || '');
    const sourceType: SourceType = isMapResult ? 'google_maps' : 'google_serp';

    const matchingThemeIds = keywordThemes
      .filter(kt => comp.coreMatches.some(mk => kt.keywordExamples.some(ke => ke.toLowerCase().includes(mk.split(' ')[0]?.toLowerCase() || ''))))
      .map(kt => kt.id);

    profiles.push({
      id: uid('cp'), name: comp.name, geography: comp.geography,
      positioning: comp.positioning,
      channelObservations: `${comp.paidAds ? 'Active Google Ads presence. ' : ''}${comp.organic ? 'Ranks organically. ' : ''}DA ~${comp.domainAuthority}. Found in ${comp.queryMatchCount}/${totalQueries} queries.`,
      websiteUrl: comp.url, competitorType: 'direct',
      relevance: comp.score >= 8 ? 'high' : comp.score >= 4 ? 'medium' : 'low',
      localRelevance: isMapResult ? 'high' : isLocal ? 'medium' : 'low',
      rankingKeywords: comp.rankingKeywords,
      estimatedDomainAuthority: comp.domainAuthority,
      paidAdsPresence: comp.paidAds,
      serpSource: comp.serpSource, queryFrequency: comp.queryMatchCount, totalQueries,
      confidenceScore: comp.confidenceScore,
      sourceType, sourceConfidence: comp.confidenceScore >= 60 ? 'high' : comp.confidenceScore >= 30 ? 'medium' : 'low',
      sourceKeyword: comp.coreMatches[0] || coreKeywords[0],
      evidenceRefs: matchingThemeIds.length > 0 ? matchingThemeIds : undefined,
    });
  }

  // 3. Directory/platform competitors
  const directoryPool = DIRECTORY_POOL[normalizedIndustry] || [];
  for (const dir of directoryPool.slice(0, 3)) {
    if (knownNames.has(dir.name.toLowerCase())) continue;
    if (profiles.find(p => p.name === dir.name)) continue;
    profiles.push({
      id: uid('cp'), name: dir.name, geography: dir.geography,
      positioning: dir.positioning,
      channelObservations: `High-DA directory (DA ~${dir.domainAuthority}) capturing organic traffic. Monitor for competitive listings.`,
      websiteUrl: dir.url, competitorType: 'directory_platform',
      relevance: 'medium', localRelevance: 'medium',
      rankingKeywords: dir.rankingKeywords,
      estimatedDomainAuthority: dir.domainAuthority,
      paidAdsPresence: false, serpSource: 'organic',
      sourceType: 'google_serp', sourceConfidence: 'high',
      sourceKeyword: coreKeywords[0],
      notes: 'Directory/platform — not a direct competitor but captures search traffic.',
    });
  }

  // 4. Gap state if insufficient
  if (profiles.filter(p => p.competitorType === 'direct' && p.sourceType !== 'manual').length < 3) {
    profiles.push({
      id: uid('cp'),
      name: '⚠ Insufficient verified competitors',
      geography: loc,
      positioning: `The modeled competitor pool for "${normalizedIndustry}" in ${loc} returned fewer than 3 verified direct competitors.`,
      channelObservations: 'Consider: refining keywords, widening geographic radius, or adding known competitors manually.',
      competitorType: 'direct', relevance: 'low', localRelevance: 'low',
      sourceType: 'ai_inference', sourceConfidence: 'low',
      notes: 'Gap indicator — not a real competitor. Expand search parameters for better results.',
    });
  }

  return profiles;
}
