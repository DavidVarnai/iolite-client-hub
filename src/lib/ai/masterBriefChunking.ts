/**
 * Master Brief chunking, extraction orchestration, and merge utilities.
 * Keeps chunk logic out of UI components.
 */
import type {
  MasterBriefExtractedInsights,
  DocumentChunk,
  ChunkProcessingStatus,
  ExtractionMode,
} from '@/types/onboarding';
import { supabase } from '@/integrations/supabase/client';

/* ═══════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════ */

/** Max characters for single-pass extraction (≈3.5k tokens) */
const SINGLE_PASS_LIMIT = 14_000;

/** Target chunk size in characters */
const CHUNK_TARGET_SIZE = 12_000;

/** Minimum chunk size — avoid tiny trailing chunks */
const CHUNK_MIN_SIZE = 500;

/* ═══════════════════════════════════════════════════════
   CHUNKING
   ═══════════════════════════════════════════════════════ */

let _chunkUid = 0;
function chunkId(): string {
  return `chunk-${Date.now()}-${++_chunkUid}`;
}

/**
 * Determines whether content needs chunking and returns the appropriate mode.
 */
export function detectExtractionMode(content: string): ExtractionMode {
  return content.length > SINGLE_PASS_LIMIT ? 'chunked' : 'single_pass';
}

/**
 * Splits content into logical chunks.
 * Tries to break at headings, then double-newlines, then character budget.
 */
export function chunkMasterBrief(
  content: string,
  options: { sourceLabel?: string } = {},
): DocumentChunk[] {
  const label = options.sourceLabel || 'Brief';

  if (content.length <= SINGLE_PASS_LIMIT) {
    return [{
      id: chunkId(),
      sourceLabel: label,
      chunkIndex: 0,
      text: content,
      status: 'pending',
    }];
  }

  const chunks: DocumentChunk[] = [];

  // Try splitting by markdown headings first
  const headingSplit = content.split(/(?=^#{1,3}\s)/m);
  const segments = headingSplit.length > 1
    ? headingSplit
    : content.split(/\n{2,}/); // Fall back to paragraph groups

  let currentChunkText = '';
  let idx = 0;

  for (const segment of segments) {
    if (currentChunkText.length + segment.length > CHUNK_TARGET_SIZE && currentChunkText.length >= CHUNK_MIN_SIZE) {
      chunks.push({
        id: chunkId(),
        sourceLabel: label,
        chunkIndex: idx++,
        text: currentChunkText.trim(),
        status: 'pending',
      });
      currentChunkText = '';
    }
    currentChunkText += (currentChunkText ? '\n\n' : '') + segment;
  }

  // Remaining text
  if (currentChunkText.trim().length > 0) {
    // If very small, merge with last chunk
    if (currentChunkText.trim().length < CHUNK_MIN_SIZE && chunks.length > 0) {
      chunks[chunks.length - 1].text += '\n\n' + currentChunkText.trim();
    } else {
      chunks.push({
        id: chunkId(),
        sourceLabel: label,
        chunkIndex: idx,
        text: currentChunkText.trim(),
        status: 'pending',
      });
    }
  }

  return chunks;
}

/* ═══════════════════════════════════════════════════════
   PER-CHUNK EXTRACTION
   ═══════════════════════════════════════════════════════ */

/**
 * Extracts insights from a single chunk via the edge function.
 */
export async function extractChunkInsights(
  chunk: DocumentChunk,
): Promise<DocumentChunk> {
  try {
    const { data, error } = await supabase.functions.invoke('extract-master-brief', {
      body: { content: chunk.text },
    });
    if (error) throw error;
    return {
      ...chunk,
      status: 'success',
      extractedInsights: data as MasterBriefExtractedInsights,
      error: undefined,
    };
  } catch (err: any) {
    console.error(`Chunk ${chunk.chunkIndex} extraction failed:`, err);
    return {
      ...chunk,
      status: 'error',
      error: err?.message || 'Extraction failed',
    };
  }
}

/* ═══════════════════════════════════════════════════════
   MERGE LOGIC
   ═══════════════════════════════════════════════════════ */

/** Case-insensitive deduplication with normalization */
function dedupeStrings(arrays: string[][]): string[] {
  const seen = new Map<string, string>(); // lowercase → best version
  for (const arr of arrays) {
    for (const item of arr) {
      const trimmed = item.trim();
      if (!trimmed) continue;
      const key = trimmed.toLowerCase().replace(/\s+/g, ' ');
      if (!seen.has(key) || trimmed.length > (seen.get(key)?.length || 0)) {
        seen.set(key, trimmed);
      }
    }
  }
  return Array.from(seen.values());
}

/** Merge positioning/summary strings from multiple chunks */
function mergeTextFields(values: string[]): string {
  const unique = values.filter(v => v.trim().length > 0);
  if (unique.length === 0) return '';
  if (unique.length === 1) return unique[0];
  // Combine and deduplicate sentences
  const allSentences: string[] = [];
  const seenSentences = new Set<string>();
  for (const v of unique) {
    const sentences = v.split(/(?<=[.!?])\s+/);
    for (const s of sentences) {
      const key = s.trim().toLowerCase().replace(/\s+/g, ' ');
      if (key.length > 10 && !seenSentences.has(key)) {
        seenSentences.add(key);
        allSentences.push(s.trim());
      }
    }
  }
  return allSentences.join(' ');
}

export interface MergeResult {
  mergedInsights: MasterBriefExtractedInsights;
  notes: string[];
  isPartial: boolean;
}

/**
 * Merges insights from multiple chunk extraction results.
 * Deterministic: dedupes arrays, synthesizes text fields, reports conflicts.
 */
export function mergeChunkInsights(chunks: DocumentChunk[]): MergeResult {
  const successful = chunks.filter(c => c.status === 'success' && c.extractedInsights);
  const failed = chunks.filter(c => c.status === 'error');
  const notes: string[] = [];
  const isPartial = failed.length > 0;

  if (successful.length === 0) {
    notes.push('All chunks failed extraction. No insights available.');
    return {
      mergedInsights: {
        audiences: [], painPoints: [], valueProps: [], differentiators: [],
        positioning: '', industries: [], inferredCompetitors: [], summary: '',
      },
      notes,
      isPartial: true,
    };
  }

  if (isPartial) {
    notes.push(`${failed.length} of ${chunks.length} chunks failed extraction. Results may be incomplete.`);
    for (const f of failed) {
      notes.push(`Chunk ${f.chunkIndex + 1} ("${f.sourceLabel}"): ${f.error || 'unknown error'}`);
    }
  }

  const allInsights = successful.map(c => c.extractedInsights!);

  const mergedInsights: MasterBriefExtractedInsights = {
    audiences: dedupeStrings(allInsights.map(i => i.audiences)),
    painPoints: dedupeStrings(allInsights.map(i => i.painPoints)),
    valueProps: dedupeStrings(allInsights.map(i => i.valueProps)),
    differentiators: dedupeStrings(allInsights.map(i => i.differentiators)),
    industries: dedupeStrings(allInsights.map(i => i.industries)),
    inferredCompetitors: dedupeStrings(allInsights.map(i => i.inferredCompetitors)),
    positioning: mergeTextFields(allInsights.map(i => i.positioning)),
    summary: mergeTextFields(allInsights.map(i => i.summary)),
  };

  notes.push(`Merged insights from ${successful.length} chunk${successful.length > 1 ? 's' : ''}.`);

  return { mergedInsights, notes, isPartial };
}

/* ═══════════════════════════════════════════════════════
   ORCHESTRATION
   ═══════════════════════════════════════════════════════ */

export interface ExtractionProgress {
  status: ChunkProcessingStatus;
  chunks: DocumentChunk[];
}

/**
 * Full extraction orchestration: chunk → extract each → merge.
 * Calls onProgress for real-time UI updates.
 */
export async function processMasterBriefExtraction(
  content: string,
  options: {
    sourceLabel?: string;
    onProgress?: (progress: ExtractionProgress) => void;
  } = {},
): Promise<{
  mode: ExtractionMode;
  chunks: DocumentChunk[];
  mergedInsights: MasterBriefExtractedInsights;
  notes: string[];
  isPartial: boolean;
  processingStatus: ChunkProcessingStatus;
}> {
  const mode = detectExtractionMode(content);
  const chunks = chunkMasterBrief(content, { sourceLabel: options.sourceLabel });

  const status: ChunkProcessingStatus = {
    totalChunks: chunks.length,
    completedChunks: 0,
    failedChunks: 0,
    inProgress: true,
  };

  options.onProgress?.({ status: { ...status }, chunks: [...chunks] });

  // Process chunks sequentially to avoid rate limiting
  for (let i = 0; i < chunks.length; i++) {
    chunks[i] = { ...chunks[i], status: 'processing' };
    options.onProgress?.({ status: { ...status }, chunks: [...chunks] });

    const result = await extractChunkInsights(chunks[i]);
    chunks[i] = result;
    status.completedChunks++;
    if (result.status === 'error') status.failedChunks++;

    options.onProgress?.({ status: { ...status }, chunks: [...chunks] });
  }

  status.inProgress = false;

  const { mergedInsights, notes, isPartial } = mergeChunkInsights(chunks);

  if (mode === 'chunked') {
    notes.unshift(`Document was split into ${chunks.length} chunks for processing.`);
  }

  return {
    mode,
    chunks,
    mergedInsights,
    notes,
    isPartial,
    processingStatus: status,
  };
}
