/**
 * Competitor Search Provider — abstraction layer for live vs modeled competitor discovery.
 *
 * Architecture:
 * - `searchCompetitorsLive()` — calls serp-search edge function via SerpAPI
 * - `searchCompetitorsModeled()` — modeled pool logic (always available as fallback)
 * - `searchCompetitors()` — orchestrator that tries live, falls back to modeled
 */

import { supabase } from '@/integrations/supabase/client';
import type {
  CompetitorProfile,
  KeywordTheme,
  SourceType,
  SERPSource,
} from '@/types/marketIntelligence';

/* ── Result types ── */

export type ResearchSourceMode = 'live_search' | 'modeled_fallback';

export interface CompetitorSearchResult {
  competitors: CompetitorProfile[];
  sourceMode: ResearchSourceMode;
  sourceNote: string;
  discoveryQueries: string[];
}

export interface CompetitorSearchContext {
  inputs: import('@/types/marketIntelligence').MarketIntelligenceInputs;
  discoveryQueries: string[];
  coreKeywords: string[];
  keywordThemes: KeywordTheme[];
  normalizedIndustry: string;
  isLocal: boolean;
  localArea: string;
  area: string;
}

/* ── Constants ── */

const MAX_QUERIES_PER_RUN = 5;

const EXCLUDED_DOMAINS = new Set([
  'yelp.com', 'wikipedia.org', 'niche.com', 'yellowpages.com', 'bbb.org',
  'indeed.com', 'glassdoor.com', 'facebook.com', 'linkedin.com', 'twitter.com',
  'instagram.com', 'tiktok.com', 'youtube.com', 'reddit.com', 'quora.com',
  'amazon.com', 'ebay.com', 'craigslist.org', 'tripadvisor.com', 'pinterest.com',
  'google.com', 'apple.com', 'microsoft.com',
]);

const DIRECTORY_DOMAINS = new Set([
  'yelp.com', 'yellowpages.com', 'bbb.org', 'niche.com', 'greatschools.org',
  'zocdoc.com', 'healthgrades.com', 'zillow.com', 'realtor.com', 'thumbtack.com',
  'angi.com', 'homeadvisor.com', 'capterra.com', 'g2.com', 'clutch.co',
  'legalzoom.com', 'avvo.com', 'etsy.com',
]);

let _ts = 0;
function uid(prefix: string) { return `${prefix}-${Date.now()}-${++_ts}`; }

/* ── SerpAPI response types ── */

interface SerpOrganicResult {
  position: number;
  title: string;
  link: string;
  domain: string;
  snippet?: string;
}

interface SerpAdResult {
  position: number;
  title: string;
  link: string;
  domain: string;
}

interface SerpQueryResponse {
  query: string;
  organic_results: SerpOrganicResult[];
  paid_results: SerpAdResult[];
  error?: string;
}

/* ── Domain aggregation ── */

interface DomainEntry {
  domain: string;
  name: string;
  url: string;
  snippets: string[];
  organicCount: number;
  paidCount: number;
  queryAppearances: Set<string>;
  positions: number[];
}

/* ── Live search availability check ── */

function isLiveSearchAvailable(): boolean {
  // Check that Supabase client is configured (env vars present)
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  return Boolean(url && key);
}

/* ── Live search provider ── */

/**
 * Live competitor search using real Google results via SerpAPI edge function.
 *
 * Flow:
 * 1. Take top 3-5 discovery queries
 * 2. Call serp-search edge function for each
 * 3. Aggregate organic + paid results by domain
 * 4. Score by frequency, organic/paid presence, position
 * 5. Return structured CompetitorProfile[]
 */
export async function searchCompetitorsLive(
  ctx: CompetitorSearchContext,
): Promise<CompetitorSearchResult> {
  const queries = ctx.discoveryQueries.slice(0, MAX_QUERIES_PER_RUN);
  const location = ctx.isLocal ? ctx.localArea : ctx.area;

  console.log(`[MI-Live] Starting live search: ${queries.length} queries (max ${MAX_QUERIES_PER_RUN})`);

  // Execute queries sequentially to respect rate limits
  const responses: SerpQueryResponse[] = [];
  for (const query of queries) {
    console.log(`[MI-Live] Query: "${query}"`);
    const { data, error } = await supabase.functions.invoke('serp-search', {
      body: { query, location, num: 15 },
    });

    if (error) {
      console.error(`[MI-Live] Edge function error for "${query}":`, error);
      throw new Error(`SerpAPI edge function failed: ${error.message || 'Unknown error'}`);
    }

    if (data?.error) {
      console.error(`[MI-Live] SerpAPI error for "${query}":`, data.error);
      throw new Error(`SerpAPI returned error: ${data.error}`);
    }

    responses.push(data as SerpQueryResponse);
  }

  console.log(`[MI-Live] Queries executed: ${responses.length}`);

  // Aggregate by domain
  const domainMap = new Map<string, DomainEntry>();

  for (const res of responses) {
    // Process organic results
    for (const result of res.organic_results) {
      const domain = normalizeDomain(result.domain);
      if (EXCLUDED_DOMAINS.has(domain)) continue;

      const entry = getOrCreateEntry(domainMap, domain, result.title, result.link);
      entry.organicCount++;
      entry.queryAppearances.add(res.query);
      entry.positions.push(result.position);
      if (result.snippet) entry.snippets.push(result.snippet);
    }

    // Process paid results
    for (const result of res.paid_results) {
      const domain = normalizeDomain(result.domain);
      if (EXCLUDED_DOMAINS.has(domain)) continue;

      const entry = getOrCreateEntry(domainMap, domain, result.title, result.link);
      entry.paidCount++;
      entry.queryAppearances.add(res.query);
    }
  }

  // Exclude the client's own domain
  const clientDomain = extractClientDomain(ctx.inputs.website);
  if (clientDomain) {
    const hadOwn = domainMap.has(clientDomain);
    domainMap.delete(clientDomain);
    if (hadOwn) console.log(`[MI-Live] Excluded client's own domain: ${clientDomain}`);
  }

  // Score and sort
  const totalQueries = queries.length;
  const scored = Array.from(domainMap.values())
    .map(entry => ({
      ...entry,
      score: computeScore(entry, totalQueries),
      queryFrequency: entry.queryAppearances.size,
    }))
    .sort((a, b) => b.score - a.score);

  // Separate direct competitors from directories
  const directCompetitors: typeof scored = [];
  const directoryResults: typeof scored = [];

  for (const entry of scored) {
    if (DIRECTORY_DOMAINS.has(entry.domain)) {
      directoryResults.push(entry);
    } else {
      directCompetitors.push(entry);
    }
  }

  // Build profiles
  const profiles: CompetitorProfile[] = [];

  // Add manual/known competitors first
  const known = ctx.inputs.knownCompetitors?.filter(Boolean) || [];
  for (const name of known.slice(0, 5)) {
    profiles.push({
      id: uid('cp'), name, geography: location,
      positioning: `Known competitor in the ${ctx.inputs.industry.toLowerCase()} space`,
      channelObservations: 'User-provided — monitor creative and messaging closely.',
      competitorType: 'direct', relevance: 'high',
      localRelevance: ctx.isLocal ? 'high' : 'medium',
      notes: 'User-provided competitor — authoritative.',
      sourceType: 'manual', sourceConfidence: 'high',
      manuallyAdded: true, approved: true,
      serpSource: 'both', queryFrequency: totalQueries, totalQueries, confidenceScore: 100,
    });
  }

  // Add live direct competitors (up to 8 total)
  const slotsForDirect = 8 - profiles.length;
  for (const entry of directCompetitors.slice(0, Math.max(slotsForDirect, 0))) {
    const serpSource: SERPSource = (entry.organicCount > 0 && entry.paidCount > 0)
      ? 'both'
      : entry.paidCount > 0 ? 'paid' : 'organic';

    const confidenceScore = computeConfidence(entry, totalQueries);
    const avgPosition = entry.positions.length > 0
      ? Math.round(entry.positions.reduce((a, b) => a + b, 0) / entry.positions.length)
      : undefined;

    profiles.push({
      id: uid('cp'),
      name: entry.name,
      geography: location,
      positioning: entry.snippets[0] || `Found in ${entry.queryAppearances.size}/${totalQueries} discovery queries`,
      channelObservations: buildChannelObs(entry, totalQueries, avgPosition),
      websiteUrl: entry.url,
      competitorType: 'direct',
      relevance: confidenceScore >= 60 ? 'high' : confidenceScore >= 30 ? 'medium' : 'low',
      localRelevance: ctx.isLocal ? 'medium' : 'low',
      rankingKeywords: Array.from(entry.queryAppearances),
      paidAdsPresence: entry.paidCount > 0,
      serpSource,
      queryFrequency: entry.queryAppearances.size,
      totalQueries,
      confidenceScore,
      sourceType: 'google_serp',
      sourceConfidence: confidenceScore >= 60 ? 'high' : confidenceScore >= 30 ? 'medium' : 'low',
      sourceKeyword: Array.from(entry.queryAppearances)[0],
    });
  }

  // Add directory/platform results (up to 3)
  for (const entry of directoryResults.slice(0, 3)) {
    profiles.push({
      id: uid('cp'),
      name: entry.name,
      geography: location,
      positioning: entry.snippets[0] || 'Directory/platform capturing search traffic',
      channelObservations: `Directory present in ${entry.queryAppearances.size}/${totalQueries} queries. Monitor for competitive listings.`,
      websiteUrl: entry.url,
      competitorType: 'directory_platform',
      relevance: 'medium',
      localRelevance: 'medium',
      paidAdsPresence: entry.paidCount > 0,
      serpSource: entry.paidCount > 0 ? 'both' : 'organic',
      queryFrequency: entry.queryAppearances.size,
      totalQueries,
      sourceType: 'google_serp',
      sourceConfidence: 'high',
      notes: 'Directory/platform — not a direct competitor but captures search traffic.',
    });
  }

  console.log(`[MI-Live] Final: ${profiles.length} competitors (${directCompetitors.length} direct candidates, ${directoryResults.length} directories)`);

  return {
    competitors: profiles,
    sourceMode: 'live_search',
    sourceNote: 'Competitors identified using live Google search results via SerpAPI. Results ranked by query frequency and organic/paid presence.',
    discoveryQueries: queries,
  };
}

/* ── Modeled search provider ── */

export { generateCompetitorProfilesModeled } from './competitorModeledProvider';

/* ── Orchestrator ── */

/**
 * Main entry point: tries live search, falls back to modeled.
 * Never throws — always returns a result with clear sourceMode labeling.
 */
export async function searchCompetitors(
  ctx: CompetitorSearchContext,
): Promise<CompetitorSearchResult> {
  // 1. Try live search if available
  if (isLiveSearchAvailable()) {
    try {
      const liveResult = await searchCompetitorsLive(ctx);
      console.log('[MI] Live search succeeded:', liveResult.competitors.length, 'competitors');
      return liveResult;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.warn('[MI] Live search failed, falling back to modeled:', message);
      // Fall through to modeled
    }
  } else {
    console.log('[MI] Live search not available (Supabase not configured), using modeled fallback');
  }

  // 2. Modeled fallback (always works)
  const { generateCompetitorProfilesModeled } = await import('./competitorModeledProvider');
  const competitors = generateCompetitorProfilesModeled(ctx);

  return {
    competitors,
    sourceMode: 'modeled_fallback',
    sourceNote: 'Competitors identified using discovery queries matched against modeled industry pools. Live Google search is not yet configured.',
    discoveryQueries: ctx.discoveryQueries,
  };
}

/* ── Helpers ── */

function normalizeDomain(domain: string): string {
  return (domain || '').toLowerCase().replace(/^www\./, '');
}

function extractClientDomain(website: string): string | null {
  if (!website) return null;
  try {
    const url = website.startsWith('http') ? website : `https://${website}`;
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

function getOrCreateEntry(
  map: Map<string, DomainEntry>,
  domain: string,
  title: string,
  link: string,
): DomainEntry {
  let entry = map.get(domain);
  if (!entry) {
    // Clean title: remove " - Company Name" suffixes, " | Site" etc.
    const cleanName = title.replace(/\s*[-|–—]\s*[^-|–—]*$/, '').trim() || domain;
    entry = {
      domain,
      name: cleanName,
      url: link,
      snippets: [],
      organicCount: 0,
      paidCount: 0,
      queryAppearances: new Set(),
      positions: [],
    };
    map.set(domain, entry);
  }
  return entry;
}

/**
 * Score = query frequency base + paid bonus + organic bonus + position bonus
 */
function computeScore(entry: DomainEntry, totalQueries: number): number {
  const freq = entry.queryAppearances.size;
  let score = freq * 5; // base: frequency across queries

  // +2 per paid appearance, +1 per organic
  score += entry.paidCount * 2;
  score += entry.organicCount * 1;

  // Bonus for appearing in both organic and paid
  if (entry.organicCount > 0 && entry.paidCount > 0) score += 5;

  // Position bonus (higher rank = lower position number)
  if (entry.positions.length > 0) {
    const avgPos = entry.positions.reduce((a, b) => a + b, 0) / entry.positions.length;
    score += Math.max(0, 10 - avgPos); // top positions get up to +10
  }

  return score;
}

function computeConfidence(entry: DomainEntry, totalQueries: number): number {
  const freqRatio = entry.queryAppearances.size / Math.max(totalQueries, 1);
  const sourceBonus = (entry.organicCount > 0 && entry.paidCount > 0) ? 20 : entry.paidCount > 0 ? 10 : 0;
  const posBonus = entry.positions.length > 0
    ? Math.max(0, 15 - (entry.positions.reduce((a, b) => a + b, 0) / entry.positions.length))
    : 0;
  return Math.min(100, Math.round(freqRatio * 50 + sourceBonus + posBonus + 10));
}

function buildChannelObs(entry: DomainEntry, totalQueries: number, avgPosition?: number): string {
  const parts: string[] = [];
  if (entry.paidCount > 0) parts.push(`Active in paid search (${entry.paidCount} ad appearances)`);
  if (entry.organicCount > 0) parts.push(`Ranks organically (${entry.organicCount} results)`);
  if (avgPosition) parts.push(`Avg position: #${avgPosition}`);
  parts.push(`Found in ${entry.queryAppearances.size}/${totalQueries} queries`);
  return parts.join('. ') + '.';
}
