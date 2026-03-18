/**
 * MasterBriefSection — upload or paste a strategic document to enhance MI and Strategy.
 * Supports large documents via automatic chunking + merged extraction.
 * Compact, optional augmentation layer at the top of Discovery.
 */
import { useState, useRef, useCallback } from 'react';
import { FileText, Upload, Sparkles, Loader2, Check, X, ChevronDown, ChevronUp, Eye, EyeOff, ShieldCheck, AlertTriangle, Layers, Info } from 'lucide-react';
import { useClientContext } from '@/contexts/ClientContext';
import { supabase } from '@/integrations/supabase/client';
import type { MasterBrief, MasterBriefExtractedInsights, MasterBriefIncludedSections, DocumentChunk, ChunkProcessingStatus } from '@/types/onboarding';
import { EMPTY_MASTER_BRIEF, DEFAULT_INCLUDED_SECTIONS } from '@/types/onboarding';
import { processMasterBriefExtraction, detectExtractionMode } from '@/lib/ai/masterBriefChunking';
import { Progress } from '@/components/ui/progress';

const ACCEPTED_TYPES = '.pdf,.docx,.doc,.txt,.md';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const BINARY_TYPES = ['pdf', 'docx', 'doc'];

type ExtractionStatus = 'idle' | 'loading' | 'success' | 'error';
type ParseStatus = 'idle' | 'parsing' | 'done' | 'error';

export default function MasterBriefSection() {
  const { onboarding, updateOnboarding } = useClientContext();
  const brief = onboarding.masterBrief || { ...EMPTY_MASTER_BRIEF };
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [extractionStatus, setExtractionStatus] = useState<ExtractionStatus>(brief.extractedInsights ? 'success' : 'idle');
  const [extractionError, setExtractionError] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [confirmReextract, setConfirmReextract] = useState(false);
  const [chunkProgress, setChunkProgress] = useState<ChunkProcessingStatus | null>(null);
  const [showChunkDetails, setShowChunkDetails] = useState(false);
  const [parseStatus, setParseStatus] = useState<ParseStatus>('idle');
  const [parseError, setParseError] = useState('');

  const hasBrief = !!(brief.rawText?.trim() || brief.uploadedFileName);
  const hasInsights = !!brief.extractedInsights;
  const isBinaryUpload = brief.uploadedFileType && BINARY_TYPES.includes(brief.uploadedFileType);
  const isChunked = brief.extractionMode === 'chunked';

  const updateBrief = useCallback((patch: Partial<MasterBrief>) => {
    const next = { ...brief, ...patch, lastUpdatedAt: new Date().toISOString() };
    updateOnboarding(prev => ({ ...prev, masterBrief: next }));
  }, [brief, updateOnboarding]);

  const handleTextChange = (text: string) => {
    updateBrief({ rawText: text });
    if (brief.extractedInsights && Math.abs(text.length - (brief.rawText?.length || 0)) > 50) {
      updateBrief({ rawText: text, extractedInsights: undefined, isApproved: false, approvedAt: undefined, documentChunks: undefined, extractionMode: undefined, extractionNotes: undefined, mergedInsights: undefined, chunkProcessingStatus: undefined });
      setExtractionStatus('idle');
      setChunkProgress(null);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      setExtractionError('File too large. Maximum 5 MB.');
      return;
    }
    const ext = file.name.split('.').pop()?.toLowerCase() || '';

    if (ext === 'txt' || ext === 'md') {
      const text = await file.text();
      updateBrief({
        uploadedFileName: file.name,
        uploadedFileType: ext,
        uploadedFileContent: text,
        rawText: brief.rawText ? `${brief.rawText}\n\n--- Uploaded: ${file.name} ---\n\n${text}` : text,
        extractionSourceType: 'text',
      });
    } else if (BINARY_TYPES.includes(ext)) {
      // Binary file — send to parse-document edge function
      setParseStatus('parsing');
      setParseError('');
      try {
        const base64 = await readFileAsBase64(file);
        const { data, error } = await supabase.functions.invoke('parse-document', {
          body: { fileBase64: base64, fileName: file.name, mimeType: file.type },
        });
        if (error) throw error;
        if (data?.error) throw new Error(data.error);

        const extractedText = data.text as string;
        updateBrief({
          uploadedFileName: file.name,
          uploadedFileType: ext,
          uploadedFileContent: extractedText,
          rawText: brief.rawText ? `${brief.rawText}\n\n--- Uploaded: ${file.name} ---\n\n${extractedText}` : extractedText,
          extractionSourceType: ext as any,
        });
        setParseStatus('done');
      } catch (err: any) {
        console.error('Document parse failed:', err);
        setParseError(err?.message || 'Failed to extract text from file.');
        setParseStatus('error');
        // Still store metadata so user knows a file was uploaded
        updateBrief({
          uploadedFileName: file.name,
          uploadedFileType: ext,
          uploadedFileContent: undefined,
          extractionSourceType: ext as any,
        });
      }
    } else {
      updateBrief({
        uploadedFileName: file.name,
        uploadedFileType: ext,
        uploadedFileContent: undefined,
        extractionSourceType: ext as any,
      });
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  /* Read a File as base64 (strip the data-url prefix) */
  function readFileAsBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1]; // strip "data:…;base64,"
        resolve(base64);
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  const handleExtractInsights = async () => {
    if (brief.isApproved && !confirmReextract) {
      setConfirmReextract(true);
      return;
    }
    setConfirmReextract(false);

    const content = brief.rawText?.trim() || brief.uploadedFileContent?.trim();
    if (!content || content.length < 50) {
      setExtractionError('Please provide at least a few sentences of content.');
      return;
    }

    setExtractionStatus('loading');
    setExtractionError('');
    setChunkProgress(null);

    const mode = detectExtractionMode(content);

    try {
      const result = await processMasterBriefExtraction(content, {
        sourceLabel: brief.uploadedFileName || 'Brief',
        onProgress: ({ status }) => {
          setChunkProgress({ ...status });
        },
      });

      updateBrief({
        extractedInsights: result.mergedInsights,
        mergedInsights: result.mode === 'chunked' ? result.mergedInsights : undefined,
        documentChunks: result.mode === 'chunked' ? result.chunks : undefined,
        extractionMode: result.mode,
        extractionNotes: result.notes.length > 0 ? result.notes : undefined,
        chunkProcessingStatus: result.mode === 'chunked' ? result.processingStatus : undefined,
        includedSections: { ...DEFAULT_INCLUDED_SECTIONS },
        isApproved: false,
        approvedAt: undefined,
      });

      if (result.isPartial) {
        setExtractionError('Some chunks failed. Results may be incomplete — see details below.');
        setExtractionStatus('success');
      } else {
        setExtractionStatus('success');
      }
      setChunkProgress(null);
    } catch (err: any) {
      console.error('Master Brief extraction failed:', err);
      setExtractionError('Extraction failed. Brief will still be available as raw context.');
      setExtractionStatus('error');
      setChunkProgress(null);
    }
  };

  const handleApproveInsights = () => {
    updateBrief({ isApproved: true, approvedAt: new Date().toISOString() });
  };

  const handleUpdateIncluded = (key: string, value: boolean) => {
    const current = brief.includedSections || { ...DEFAULT_INCLUDED_SECTIONS };
    updateBrief({ includedSections: { ...current, [key]: value } });
  };

  const clearBrief = () => {
    updateOnboarding(prev => ({ ...prev, masterBrief: undefined }));
    setExtractionStatus('idle');
    setExtractionError('');
    setConfirmReextract(false);
    setChunkProgress(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b pb-2">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          <h4 className="text-sm font-semibold">Master Brief</h4>
          <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">Optional</span>
          {brief.isApproved && (
            <span className="flex items-center gap-1 text-[10px] font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded">
              <ShieldCheck className="h-3 w-3" /> Approved
            </span>
          )}
          {isChunked && hasInsights && (
            <span className="flex items-center gap-1 text-[10px] font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-1.5 py-0.5 rounded">
              <Layers className="h-3 w-3" /> Chunked ({brief.documentChunks?.length || 0} chunks)
            </span>
          )}
        </div>
        {hasBrief && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            {expanded ? 'Collapse' : 'Expand'}
          </button>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Upload or paste a strategic document describing the business, positioning, audience, offerings, pain points, competitors, and strategic context.
      </p>

      {/* How This Is Used */}
      <div className="flex items-start gap-2 p-2.5 rounded-md bg-muted/50 border border-border/50">
        <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">How this is used</p>
          <ul className="text-[10px] text-muted-foreground space-y-0.5 list-none">
            <li>• Enhances Market Intelligence (competitors, queries)</li>
            <li>• Improves Strategy recommendations</li>
            <li>• Suggests revenue streams and discovery inputs</li>
            <li>• Large documents are automatically chunked for complete extraction</li>
            <li>• Requires approval before being used downstream</li>
          </ul>
        </div>
      </div>

      {/* Upload + Paste */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <input ref={fileInputRef} type="file" accept={ACCEPTED_TYPES} onChange={handleFileUpload} className="hidden" />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-md border-2 border-dashed border-border hover:border-primary/40 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Upload className="h-4 w-4" />
            <span className="text-xs font-medium">{brief.uploadedFileName || 'Upload file (PDF, DOCX, TXT)'}</span>
          </button>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {brief.uploadedFileName && (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-muted text-foreground">
                <FileText className="h-3 w-3" />
                <span className="truncate max-w-[140px]">{brief.uploadedFileName}</span>
                <button type="button" onClick={() => updateBrief({ uploadedFileName: undefined, uploadedFileType: undefined, uploadedFileContent: undefined })} className="text-muted-foreground hover:text-destructive">
                  <X className="h-3 w-3" />
                </button>
              </div>
              {isBinaryUpload && !brief.uploadedFileContent && parseStatus !== 'parsing' && (
                <span className="flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="h-3 w-3" />
                  {parseStatus === 'error' ? (parseError || 'Text extraction failed — paste key content below') : 'PDF/DOCX content not auto-extracted — paste key content below'}
                </span>
              )}
              {parseStatus === 'parsing' && (
                <span className="flex items-center gap-1 text-[10px] text-primary">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Extracting text from document…
                </span>
              )}
              {parseStatus === 'done' && brief.uploadedFileContent && (
                <span className="flex items-center gap-1 text-[10px] text-green-600 dark:text-green-400">
                  <Check className="h-3 w-3" />
                  Extracted {(brief.uploadedFileContent.length / 1000).toFixed(1)}k characters
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <textarea
        value={brief.rawText || ''}
        onChange={(e) => handleTextChange(e.target.value)}
        placeholder="Paste strategic brief content here…"
        rows={hasBrief && !expanded ? 3 : 6}
        className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-y min-h-[60px] placeholder:text-muted-foreground/50"
      />

      {/* Chunk progress indicator */}
      {chunkProgress && chunkProgress.inProgress && (
        <div className="space-y-2 p-3 rounded-md bg-muted/30 border border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
              <span className="text-xs font-medium">
                Processing chunk {chunkProgress.completedChunks + 1} of {chunkProgress.totalChunks}…
              </span>
            </div>
            <span className="text-[10px] text-muted-foreground tabular-nums">
              {Math.round((chunkProgress.completedChunks / chunkProgress.totalChunks) * 100)}%
            </span>
          </div>
          <Progress value={(chunkProgress.completedChunks / chunkProgress.totalChunks) * 100} className="h-1.5" />
          {chunkProgress.failedChunks > 0 && (
            <span className="text-[10px] text-amber-600 dark:text-amber-400">
              {chunkProgress.failedChunks} chunk{chunkProgress.failedChunks > 1 ? 's' : ''} failed
            </span>
          )}
        </div>
      )}

      {/* Extract insights button */}
      {hasBrief && !chunkProgress?.inProgress && (
        <div className="flex items-center gap-3 flex-wrap">
          {confirmReextract ? (
            <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
              <span className="text-xs text-amber-700 dark:text-amber-400">This will replace approved insights. Continue?</span>
              <button type="button" onClick={handleExtractInsights} className="px-2 py-1 text-xs font-medium rounded bg-amber-600 text-white hover:bg-amber-700">Yes, Re-extract</button>
              <button type="button" onClick={() => setConfirmReextract(false)} className="text-xs text-muted-foreground hover:text-foreground">Cancel</button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleExtractInsights}
              disabled={extractionStatus === 'loading'}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50"
            >
              {extractionStatus === 'loading' ? (
                <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Extracting…</>
              ) : extractionStatus === 'success' ? (
                <><Check className="h-3.5 w-3.5" /> Re-extract Insights</>
              ) : (
                <><Sparkles className="h-3.5 w-3.5" /> Extract Insights</>
              )}
            </button>
          )}
          <button type="button" onClick={clearBrief} className="text-xs text-muted-foreground hover:text-destructive transition-colors">
            Clear Brief
          </button>
          {extractionError && <span className="text-xs text-destructive">{extractionError}</span>}
        </div>
      )}

      {/* Extraction notes / warnings */}
      {brief.extractionNotes && brief.extractionNotes.length > 0 && hasInsights && (
        <div className="space-y-1 p-2.5 rounded-md bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-800/30">
          <div className="flex items-center gap-1.5">
            <Info className="h-3 w-3 text-amber-600 dark:text-amber-400" />
            <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Extraction Notes</span>
          </div>
          {brief.extractionNotes.map((note, i) => (
            <p key={i} className="text-[10px] text-amber-700 dark:text-amber-300">{note}</p>
          ))}
        </div>
      )}

      {/* Extraction mode badge */}
      {hasInsights && brief.extractionMode && (
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <span className="px-1.5 py-0.5 rounded bg-muted font-medium">
            {brief.extractionMode === 'chunked' ? 'Chunked Extraction' : 'Single Pass'}
          </span>
          {brief.extractionMode === 'chunked' && brief.chunkProcessingStatus && (
            <span>
              {brief.chunkProcessingStatus.completedChunks - brief.chunkProcessingStatus.failedChunks} of {brief.chunkProcessingStatus.totalChunks} chunks succeeded
            </span>
          )}
        </div>
      )}

      {/* Chunk details (collapsible, secondary) */}
      {isChunked && brief.documentChunks && brief.documentChunks.length > 0 && hasInsights && (
        <div>
          <button
            type="button"
            onClick={() => setShowChunkDetails(!showChunkDetails)}
            className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
          >
            {showChunkDetails ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            {showChunkDetails ? 'Hide chunk details' : 'View chunk details'}
          </button>
          {showChunkDetails && (
            <div className="mt-2 space-y-2">
              {brief.documentChunks.map((chunk) => (
                <ChunkDetailCard key={chunk.id} chunk={chunk} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Extracted Insights review */}
      {hasInsights && (
        <ExtractedInsightsReview
          insights={brief.extractedInsights!}
          includedSections={brief.includedSections || { ...DEFAULT_INCLUDED_SECTIONS }}
          isApproved={!!brief.isApproved}
          onUpdate={(updated) => updateBrief({ extractedInsights: updated })}
          onToggleSection={handleUpdateIncluded}
          onApprove={handleApproveInsights}
        />
      )}
    </div>
  );
}

/* ── Chunk Detail Card ── */

function ChunkDetailCard({ chunk }: { chunk: DocumentChunk }) {
  const [expanded, setExpanded] = useState(false);
  const statusColors: Record<string, string> = {
    success: 'text-green-600 dark:text-green-400',
    error: 'text-destructive',
    pending: 'text-muted-foreground',
    processing: 'text-primary',
  };

  return (
    <div className="p-2.5 rounded-md border bg-card text-card-foreground">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-medium">Chunk {chunk.chunkIndex + 1}</span>
          <span className={`text-[10px] font-medium ${statusColors[chunk.status] || ''}`}>
            {chunk.status === 'success' ? '✓ Extracted' : chunk.status === 'error' ? '✗ Failed' : chunk.status}
          </span>
          <span className="text-[10px] text-muted-foreground">{(chunk.text.length / 1000).toFixed(1)}k chars</span>
        </div>
        <button type="button" onClick={() => setExpanded(!expanded)} className="text-[10px] text-muted-foreground hover:text-foreground">
          {expanded ? 'Hide' : 'Details'}
        </button>
      </div>
      {chunk.error && (
        <p className="text-[10px] text-destructive mt-1">{chunk.error}</p>
      )}
      {expanded && (
        <div className="mt-2 space-y-2">
          <p className="text-[10px] text-muted-foreground line-clamp-3 whitespace-pre-wrap">{chunk.text.substring(0, 300)}…</p>
          {chunk.extractedInsights && (
            <div className="space-y-1">
              {Object.entries(chunk.extractedInsights).map(([key, value]) => {
                if (!value || (Array.isArray(value) && value.length === 0) || (typeof value === 'string' && !value.trim())) return null;
                return (
                  <div key={key} className="text-[10px]">
                    <span className="font-medium text-muted-foreground">{key}: </span>
                    <span className="text-foreground">{Array.isArray(value) ? value.join(', ') : String(value).substring(0, 100)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Extracted Insights Panel ── */

interface InsightSectionProps {
  label: string;
  items: string[];
  included: boolean;
  onToggle: () => void;
  onEdit: (items: string[]) => void;
}

function InsightSection({ label, items, included, onToggle, onEdit }: InsightSectionProps) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(items.join(', '));

  if (items.length === 0) return null;

  return (
    <div className={`space-y-1.5 ${!included ? 'opacity-50' : ''}`}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
        <div className="flex items-center gap-1.5">
          <button type="button" onClick={onToggle} className="p-0.5 text-muted-foreground hover:text-foreground transition-colors" title={included ? 'Exclude from downstream' : 'Include in downstream'}>
            {included ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
          </button>
          {included && (
            <button type="button" onClick={() => { setEditing(!editing); setEditValue(items.join(', ')); }} className="text-[10px] text-primary hover:underline">
              {editing ? 'Cancel' : 'Edit'}
            </button>
          )}
        </div>
      </div>
      {editing && included ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="flex-1 rounded-md border bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <button
            type="button"
            onClick={() => { onEdit(editValue.split(',').map(s => s.trim()).filter(Boolean)); setEditing(false); }}
            className="px-2 py-1 text-xs font-medium rounded bg-primary text-primary-foreground"
          >
            Save
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap gap-1">
          {items.map((item, i) => (
            <span key={i} className="px-2 py-0.5 text-xs rounded bg-muted text-foreground">{item}</span>
          ))}
        </div>
      )}
    </div>
  );
}

interface ExtractedInsightsReviewProps {
  insights: MasterBriefExtractedInsights;
  includedSections: MasterBriefIncludedSections;
  isApproved: boolean;
  onUpdate: (i: MasterBriefExtractedInsights) => void;
  onToggleSection: (key: string, value: boolean) => void;
  onApprove: () => void;
}

function ExtractedInsightsReview({ insights, includedSections, isApproved, onUpdate, onToggleSection, onApprove }: ExtractedInsightsReviewProps) {
  const sections: { key: keyof MasterBriefExtractedInsights; label: string }[] = [
    { key: 'audiences', label: 'Audience Segments' },
    { key: 'painPoints', label: 'Pain Points' },
    { key: 'valueProps', label: 'Value Propositions' },
    { key: 'differentiators', label: 'Differentiators' },
    { key: 'industries', label: 'Industries' },
    { key: 'inferredCompetitors', label: 'Inferred Competitors' },
  ];

  return (
    <div className={`panel p-4 space-y-3 ${isApproved ? 'border-green-200 dark:border-green-800 bg-green-50/30 dark:bg-green-900/5' : 'border-primary/20 bg-primary/[0.02]'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-semibold">Extracted Insights from Master Brief</span>
          {isApproved && (
            <span className="flex items-center gap-1 text-[10px] font-medium text-green-600 dark:text-green-400">
              <ShieldCheck className="h-3 w-3" /> Approved — used downstream
            </span>
          )}
        </div>
        {!isApproved && (
          <button
            type="button"
            onClick={onApprove}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-green-600 text-white hover:bg-green-700 transition-colors"
          >
            <ShieldCheck className="h-3 w-3" /> Approve Insights
          </button>
        )}
      </div>

      {!isApproved && (
        <p className="text-[10px] text-muted-foreground italic">
          Review, edit, and toggle sections, then approve to make these signals available to Market Intelligence and Strategy.
        </p>
      )}

      {insights.summary && (
        <p className="text-xs text-muted-foreground leading-relaxed">{insights.summary}</p>
      )}

      {insights.positioning && (
        <div className={`space-y-1 ${includedSections.positioning === false ? 'opacity-50' : ''}`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Positioning</span>
            <button type="button" onClick={() => onToggleSection('positioning', !(includedSections.positioning !== false))} className="p-0.5 text-muted-foreground hover:text-foreground">
              {includedSections.positioning !== false ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
            </button>
          </div>
          <p className="text-xs text-foreground">{insights.positioning}</p>
        </div>
      )}

      {sections.map(({ key, label }) => {
        const items = insights[key];
        if (!Array.isArray(items)) return null;
        return (
          <InsightSection
            key={key}
            label={label}
            items={items as string[]}
            included={includedSections[key] !== false}
            onToggle={() => onToggleSection(key, !(includedSections[key] !== false))}
            onEdit={(updated) => onUpdate({ ...insights, [key]: updated })}
          />
        );
      })}
    </div>
  );
}
