/**
 * Competitor Search Provider — abstraction layer for live vs modeled competitor discovery.
 * 
 * Architecture:
 * - `searchCompetitorsLive()` — stub for Firecrawl/SERP API integration (wired later)
 * - `searchCompetitorsModeled()` — existing modeled pool logic (always available)
 * - `searchCompetitors()` — orchestrator that tries live, falls back to modeled
 * 
 * To connect Firecrawl later:
 *   1. Enable Lovable Cloud
 *   2. Connect Firecrawl connector
 *   3. Create firecrawl-search edge function
 *   4. Implement `searchCompetitorsLive()` body
 */

import type {
  MarketIntelligenceInputs,
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
  inputs: MarketIntelligenceInputs;
  discoveryQueries: string[];
  coreKeywords: string[];
  keywordThemes: KeywordTheme[];
  normalizedIndustry: string;
  isLocal: boolean;
  localArea: string;
  area: string;
}

/* ── Live search availability check ── */

/**
 * Check if live search infrastructure is configured.
 * When Firecrawl is connected, this will check for edge function availability.
 */
function isLiveSearchAvailable(): boolean {
  // TODO: Check for Firecrawl/Supabase configuration
  // When ready, this will verify:
  //   - Supabase client is initialized
  //   - firecrawl-search edge function exists
  //   - FIRECRAWL_API_KEY is configured
  return false;
}

/* ── Live search provider (stub) ── */

/**
 * Live competitor search using real Google results via Firecrawl.
 * 
 * When implemented, this will:
 * 1. Call firecrawl-search edge function for each discovery query
 * 2. Parse organic + paid results from search responses
 * 3. Extract and normalize competitor domains
 * 4. Deduplicate and score by frequency
 * 
 * Integration point for Firecrawl:
 * ```ts
 * const { data } = await supabase.functions.invoke('firecrawl-search', {
 *   body: { query, options: { limit: 10 } },
 * });
 * ```
 */
export async function searchCompetitorsLive(
  _ctx: CompetitorSearchContext,
): Promise<CompetitorSearchResult> {
  // This stub always throws — the orchestrator catches and falls back to modeled
  throw new Error(
    'Live search not configured. Requires Firecrawl connector and Lovable Cloud edge function.'
  );
}

/* ── Modeled search provider ── */

// Re-export so the adapter can call this directly for the modeled path
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
