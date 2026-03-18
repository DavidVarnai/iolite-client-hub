/**
 * Maps approved Master Brief insights to revenue stream suggestions.
 * Also provides Discovery suggestion helpers.
 */
import type { MasterBriefExtractedInsights } from '@/types/onboarding';
import type { RevenueStreamType, RevenueStream } from '@/types/onboarding';

export interface RevenueStreamSuggestion {
  name: string;
  type: RevenueStreamType;
}

const RECURRING_KEYWORDS = ['retainer', 'managed service', 'subscription', 'monthly', 'recurring', 'saas', 'membership', 'annual plan'];
const ONE_TIME_KEYWORDS = ['project', 'implementation', 'consulting', 'one-time', 'one time', 'setup', 'installation', 'audit', 'assessment'];

function inferType(text: string): RevenueStreamType | null {
  const lower = text.toLowerCase();
  const hasRecurring = RECURRING_KEYWORDS.some(k => lower.includes(k));
  const hasOneTime = ONE_TIME_KEYWORDS.some(k => lower.includes(k));
  if (hasRecurring && hasOneTime) return 'hybrid';
  if (hasRecurring) return 'recurring';
  if (hasOneTime) return 'one_time';
  return null;
}

/** Title-case a name: "managed services" → "Managed Services" */
function normalizeName(text: string): string {
  const trimmed = text.trim();
  if (trimmed.length > 60) return titleCase(trimmed.substring(0, 57)) + '...';
  return titleCase(trimmed);
}

function titleCase(s: string): string {
  return s.replace(/\b\w/g, c => c.toUpperCase());
}

export function mapBriefToRevenueStreamSuggestions(
  approvedInsights: MasterBriefExtractedInsights,
): RevenueStreamSuggestion[] {
  const suggestions: RevenueStreamSuggestion[] = [];
  const seenNames = new Set<string>();

  const addIfNew = (name: string, type: RevenueStreamType) => {
    const normalized = normalizeName(name);
    const key = normalized.toLowerCase();
    if (!seenNames.has(key) && normalized.length > 3) {
      seenNames.add(key);
      suggestions.push({ name: normalized, type });
    }
  };

  // Scan value props
  for (const vp of approvedInsights.valueProps) {
    const type = inferType(vp);
    if (type) addIfNew(vp, type);
  }

  // Scan positioning
  if (approvedInsights.positioning) {
    const sentences = approvedInsights.positioning.split(/[.;,]\s*/);
    for (const s of sentences) {
      const type = inferType(s);
      if (type && s.trim().length > 5) addIfNew(s.trim(), type);
    }
  }

  // Scan summary
  if (approvedInsights.summary) {
    const sentences = approvedInsights.summary.split(/[.;]\s*/);
    for (const s of sentences) {
      const type = inferType(s);
      if (type && s.trim().length > 5) addIfNew(s.trim(), type);
    }
  }

  return suggestions;
}

/**
 * Revenue stream summary for future Growth Model calculations.
 */
export function getRevenueStreamSummary(streams: RevenueStream[]): {
  totalRecurringMonthly: number;
  avgOneTimeDeal: number;
  blendedRevenueEstimate: number;
  streamCount: number;
} {
  let totalRecurringMonthly = 0;
  let oneTimeTotal = 0;
  let oneTimeCount = 0;

  for (const s of streams) {
    if (s.type === 'recurring' || s.type === 'hybrid') {
      totalRecurringMonthly += s.monthlyValue || 0;
    }
    if (s.type === 'one_time' || s.type === 'hybrid') {
      oneTimeTotal += s.averageDealSize || 0;
      oneTimeCount++;
    }
  }

  const avgOneTimeDeal = oneTimeCount > 0 ? oneTimeTotal / oneTimeCount : 0;
  // Simple blended estimate: annual recurring + average one-time
  const blendedRevenueEstimate = (totalRecurringMonthly * 12) + avgOneTimeDeal;

  return {
    totalRecurringMonthly,
    avgOneTimeDeal,
    blendedRevenueEstimate,
    streamCount: streams.length,
  };
}

/**
 * Maps approved Master Brief insights to Discovery field suggestions.
 * Returns structured hints — NOT auto-applied.
 */
export interface DiscoverySuggestions {
  audiences: string[];
  industries: string[];
  inferredCompetitors: string[];
  primaryProductsHint: string;
}

export function mapBriefToDiscoverySuggestions(
  approvedInsights: MasterBriefExtractedInsights,
): DiscoverySuggestions {
  return {
    audiences: approvedInsights.audiences || [],
    industries: approvedInsights.industries || [],
    inferredCompetitors: approvedInsights.inferredCompetitors || [],
    primaryProductsHint: approvedInsights.valueProps?.slice(0, 3).join(', ') || '',
  };
}
