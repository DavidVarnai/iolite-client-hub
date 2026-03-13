/**
 * AI Action orchestration layer.
 * Each action: set loading → call adapter → return result or error.
 */
import type {
  MarketResearchRequest, MarketResearchResult,
  StrategyDraftRequest, StrategyDraftResult,
  BenchmarkRequest, BenchmarkResult,
  PerformanceAnalysisRequest, PerformanceAnalysisResult,
  SummaryWriterRequest, SummaryWriterResult,
} from '@/types/ai';
import {
  fetchMarketResearch,
  fetchStrategyDraft,
  fetchBenchmarks,
  fetchPerformanceAnalysis,
  fetchSummary,
} from './aiAdapters';

export async function runMarketResearch(req: MarketResearchRequest): Promise<MarketResearchResult> {
  return fetchMarketResearch(req);
}

export async function runStrategyDraft(req: StrategyDraftRequest): Promise<StrategyDraftResult> {
  return fetchStrategyDraft(req);
}

export async function runBenchmarks(req: BenchmarkRequest): Promise<BenchmarkResult> {
  return fetchBenchmarks(req);
}

export async function runPerformanceAnalysis(req: PerformanceAnalysisRequest): Promise<PerformanceAnalysisResult> {
  return fetchPerformanceAnalysis(req);
}

export async function runSummaryWriter(req: SummaryWriterRequest): Promise<SummaryWriterResult> {
  return fetchSummary(req);
}
