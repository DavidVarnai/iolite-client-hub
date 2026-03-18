/**
 * Maps approved Master Brief insights to revenue stream suggestions.
 */
import type { MasterBriefExtractedInsights } from '@/types/onboarding';
import type { RevenueStreamType } from '@/types/onboarding';

interface RevenueStreamSuggestion {
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

function extractStreamName(text: string): string {
  // Capitalize first letter, truncate to reasonable length
  const trimmed = text.trim();
  if (trimmed.length > 60) return trimmed.substring(0, 57) + '...';
  return trimmed;
}

export function mapBriefToRevenueStreamSuggestions(
  approvedInsights: MasterBriefExtractedInsights,
): RevenueStreamSuggestion[] {
  const suggestions: RevenueStreamSuggestion[] = [];
  const seenNames = new Set<string>();

  const addIfNew = (name: string, type: RevenueStreamType) => {
    const key = name.toLowerCase();
    if (!seenNames.has(key)) {
      seenNames.add(key);
      suggestions.push({ name: extractStreamName(name), type });
    }
  };

  // Scan value props
  for (const vp of approvedInsights.valueProps) {
    const type = inferType(vp);
    if (type) addIfNew(vp, type);
  }

  // Scan positioning
  if (approvedInsights.positioning) {
    // Split by sentence-like boundaries
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
