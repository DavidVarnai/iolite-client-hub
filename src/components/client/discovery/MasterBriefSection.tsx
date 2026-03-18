/**
 * MasterBriefSection — upload or paste a strategic document to enhance MI and Strategy.
 * Compact, optional augmentation layer at the top of Discovery.
 */
import { useState, useRef, useCallback } from 'react';
import { FileText, Upload, Sparkles, Loader2, Check, X, ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react';
import { useClientContext } from '@/contexts/ClientContext';
import type { MasterBrief, MasterBriefExtractedInsights } from '@/types/onboarding';
import { EMPTY_MASTER_BRIEF } from '@/types/onboarding';
import { supabase } from '@/integrations/supabase/client';

const ACCEPTED_TYPES = '.pdf,.docx,.doc,.txt,.md';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

type ExtractionStatus = 'idle' | 'loading' | 'success' | 'error';

export default function MasterBriefSection() {
  const { onboarding, updateOnboarding } = useClientContext();
  const brief = onboarding.masterBrief || { ...EMPTY_MASTER_BRIEF };
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [extractionStatus, setExtractionStatus] = useState<ExtractionStatus>(brief.extractedInsights ? 'success' : 'idle');
  const [extractionError, setExtractionError] = useState('');
  const [expanded, setExpanded] = useState(false);

  const hasBrief = !!(brief.rawText?.trim() || brief.uploadedFileName);
  const hasInsights = !!brief.extractedInsights;

  const updateBrief = useCallback((patch: Partial<MasterBrief>) => {
    const next = { ...brief, ...patch, lastUpdatedAt: new Date().toISOString() };
    updateOnboarding(prev => ({ ...prev, masterBrief: next }));
  }, [brief, updateOnboarding]);

  const handleTextChange = (text: string) => {
    updateBrief({ rawText: text });
    // Clear previous extraction when content changes significantly
    if (brief.extractedInsights && Math.abs(text.length - (brief.rawText?.length || 0)) > 50) {
      updateBrief({ rawText: text, extractedInsights: undefined });
      setExtractionStatus('idle');
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
      });
    } else {
      // For PDF/DOCX, store the file name and note that content extraction requires parsing
      updateBrief({
        uploadedFileName: file.name,
        uploadedFileType: ext,
        uploadedFileContent: `[File uploaded: ${file.name} — paste key content below or extract insights to parse]`,
      });
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleExtractInsights = async () => {
    const content = brief.rawText?.trim() || brief.uploadedFileContent?.trim();
    if (!content || content.length < 50) {
      setExtractionError('Please provide at least a few sentences of content.');
      return;
    }
    setExtractionStatus('loading');
    setExtractionError('');

    try {
      const { data, error } = await supabase.functions.invoke('extract-master-brief', {
        body: { content },
      });
      if (error) throw error;
      const insights = data as MasterBriefExtractedInsights;
      updateBrief({ extractedInsights: insights });
      setExtractionStatus('success');
    } catch (err: any) {
      console.error('Master Brief extraction failed:', err);
      setExtractionError('Extraction failed. Brief will still be available as raw context.');
      setExtractionStatus('error');
    }
  };

  const clearBrief = () => {
    updateOnboarding(prev => ({ ...prev, masterBrief: undefined }));
    setExtractionStatus('idle');
    setExtractionError('');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b pb-2">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          <h4 className="text-sm font-semibold">Master Brief</h4>
          <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">Optional</span>
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
        This will be used to enhance Market Intelligence and Strategy outputs.
      </p>

      {/* Upload + Paste */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_TYPES}
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-md border-2 border-dashed border-border hover:border-primary/40 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Upload className="h-4 w-4" />
            <span className="text-xs font-medium">
              {brief.uploadedFileName || 'Upload file (PDF, DOCX, TXT)'}
            </span>
          </button>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {brief.uploadedFileName && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-muted text-foreground">
              <FileText className="h-3 w-3" />
              <span className="truncate max-w-[140px]">{brief.uploadedFileName}</span>
              <button type="button" onClick={() => updateBrief({ uploadedFileName: undefined, uploadedFileType: undefined, uploadedFileContent: undefined })} className="text-muted-foreground hover:text-destructive">
                <X className="h-3 w-3" />
              </button>
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

      {/* Extract insights button */}
      {hasBrief && (
        <div className="flex items-center gap-3">
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
          <button
            type="button"
            onClick={clearBrief}
            className="text-xs text-muted-foreground hover:text-destructive transition-colors"
          >
            Clear Brief
          </button>
          {extractionError && (
            <span className="text-xs text-destructive">{extractionError}</span>
          )}
        </div>
      )}

      {/* Extracted Insights review */}
      {hasInsights && <ExtractedInsightsReview insights={brief.extractedInsights!} onUpdate={(updated) => updateBrief({ extractedInsights: updated })} />}
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
          <button type="button" onClick={onToggle} className="p-0.5 text-muted-foreground hover:text-foreground transition-colors" title={included ? 'Exclude' : 'Include'}>
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

function ExtractedInsightsReview({ insights, onUpdate }: { insights: MasterBriefExtractedInsights; onUpdate: (i: MasterBriefExtractedInsights) => void }) {
  const [included, setIncluded] = useState<Record<string, boolean>>({
    audiences: true, painPoints: true, valueProps: true, differentiators: true,
    positioning: true, industries: true, inferredCompetitors: true,
  });

  const toggle = (key: string) => setIncluded(prev => ({ ...prev, [key]: !prev[key] }));

  const sections: { key: keyof MasterBriefExtractedInsights; label: string }[] = [
    { key: 'audiences', label: 'Audience Segments' },
    { key: 'painPoints', label: 'Pain Points' },
    { key: 'valueProps', label: 'Value Propositions' },
    { key: 'differentiators', label: 'Differentiators' },
    { key: 'industries', label: 'Industries' },
    { key: 'inferredCompetitors', label: 'Inferred Competitors' },
  ];

  return (
    <div className="panel p-4 space-y-3 border-primary/20 bg-primary/[0.02]">
      <div className="flex items-center gap-2">
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        <span className="text-xs font-semibold">Extracted Insights from Master Brief</span>
      </div>

      {insights.summary && (
        <p className="text-xs text-muted-foreground leading-relaxed">{insights.summary}</p>
      )}

      {insights.positioning && (
        <div className={`space-y-1 ${!included.positioning ? 'opacity-50' : ''}`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Positioning</span>
            <button type="button" onClick={() => toggle('positioning')} className="p-0.5 text-muted-foreground hover:text-foreground">
              {included.positioning ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
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
            included={included[key] !== false}
            onToggle={() => toggle(key)}
            onEdit={(updated) => onUpdate({ ...insights, [key]: updated })}
          />
        );
      })}
    </div>
  );
}
