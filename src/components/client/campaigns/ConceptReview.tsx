import { Client, SERVICE_CHANNEL_LABELS } from '@/types';
import { Campaign, CampaignConcept, ConceptStatus, CAMPAIGN_STATUS_LABELS } from '@/types/campaigns';
import { useState } from 'react';
import { Check, X, Copy, Sparkles, ChevronRight } from 'lucide-react';

const conceptStatusStyle: Record<ConceptStatus, { bg: string; text: string; label: string }> = {
  pending: { bg: 'bg-muted', text: 'text-muted-foreground', label: 'Pending' },
  approved: { bg: '', text: '', label: 'Approved' },
  rejected: { bg: '', text: '', label: 'Rejected' },
  variation: { bg: 'bg-primary/10', text: 'text-primary', label: 'Variation' },
};

export default function ConceptReview({ campaign, client }: { campaign: Campaign; client: Client }) {
  const [selectedId, setSelectedId] = useState<string | null>(campaign.concepts[0]?.id || null);
  const [statusFilter, setStatusFilter] = useState<ConceptStatus | 'all'>('all');
  const selected = campaign.concepts.find(c => c.id === selectedId) || null;
  const filtered = statusFilter === 'all' ? campaign.concepts : campaign.concepts.filter(c => c.status === statusFilter);

  return (
    <div className="flex h-[calc(100vh-220px)]">
      {/* Left panel — campaign summary + list */}
      <div className="w-72 border-r flex flex-col overflow-hidden flex-shrink-0">
        <div className="p-4 border-b space-y-3">
          <h3 className="text-sm font-semibold">{campaign.name}</h3>
          <p className="text-xs text-muted-foreground">{campaign.offer}</p>
          <div className="flex flex-wrap gap-1.5">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="text-[10px] border rounded px-1.5 py-1 bg-background text-foreground"
            >
              <option value="all">All ({campaign.concepts.length})</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          {filtered.map(concept => (
            <button
              key={concept.id}
              onClick={() => setSelectedId(concept.id)}
              className={`w-full text-left px-4 py-3 border-b text-xs transition-colors ${
                selectedId === concept.id ? 'bg-primary/5 border-l-2 border-l-primary' : 'hover:bg-muted/50'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium truncate">{concept.name}</span>
                <ConceptStatusBadge status={concept.status} />
              </div>
              <p className="text-muted-foreground mt-1 truncate">{concept.hook}</p>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="p-4 text-xs text-muted-foreground text-center">No concepts match filter.</p>
          )}
        </div>
        {/* Generate button */}
        <div className="p-3 border-t">
          <button className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors">
            <Sparkles className="w-3.5 h-3.5" /> Generate Concepts
          </button>
        </div>
      </div>

      {/* Center — concept cards grid */}
      <div className="flex-1 overflow-auto p-6">
        {selected ? (
          <ConceptDetailCard concept={selected} />
        ) : (
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
            Select a concept to review
          </div>
        )}
      </div>

      {/* Right panel — actions */}
      {selected && (
        <div className="w-64 border-l flex-shrink-0 overflow-auto p-4 space-y-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</h4>
          <div className="space-y-2">
            <ActionButton icon={<Check className="w-3.5 h-3.5" />} label="Approve" variant="success" />
            <ActionButton icon={<X className="w-3.5 h-3.5" />} label="Reject" variant="danger" />
            <ActionButton icon={<Copy className="w-3.5 h-3.5" />} label="Duplicate" />
            <ActionButton icon={<Sparkles className="w-3.5 h-3.5" />} label="Generate Variations" />
          </div>

          <div className="border-t pt-4 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Notes</h4>
            <textarea
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs min-h-[80px] placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Internal review notes..."
              defaultValue={selected.internalNotes || ''}
            />
          </div>

          {selected.status === 'approved' && (
            <div className="border-t pt-4">
              <button className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors">
                Generate Production Assets <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="border-t pt-4 space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Details</h4>
            <DetailRow label="Platform" value={selected.suggestedPlatform} />
            <DetailRow label="Formats" value={selected.suggestedFormats.join(', ')} />
            <DetailRow label="Model" value={selected.modelUsed || 'N/A'} />
            <DetailRow label="Outputs" value={`${selected.outputs.length}`} />
          </div>
        </div>
      )}
    </div>
  );
}

function ConceptDetailCard({ concept }: { concept: CampaignConcept }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <h3 className="text-base font-semibold">{concept.name}</h3>
        <ConceptStatusBadge status={concept.status} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <InfoCard label="Audience" value={concept.audience} />
        <InfoCard label="Channel" value={SERVICE_CHANNEL_LABELS[concept.channel]} />
      </div>

      <InfoCard label="Hook" value={`"${concept.hook}"`} highlight />
      <InfoCard label="Core Message" value={concept.coreMessage} />
      <InfoCard label="Visual Direction" value={concept.visualDirection} />
      <InfoCard label="Why It Should Perform" value={concept.reasonToPerform} />

      <div className="grid grid-cols-2 gap-4">
        <div className="panel p-4 space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Suggested Formats</p>
          <div className="flex flex-wrap gap-1.5">
            {concept.suggestedFormats.map(f => (
              <span key={f} className="px-2 py-0.5 bg-muted rounded text-[10px] font-medium capitalize">{f.replace(/_/g, ' ')}</span>
            ))}
          </div>
        </div>
        <div className="panel p-4 space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Required Assets</p>
          <div className="flex flex-wrap gap-1.5">
            {concept.requiredAssetTypes.map(a => (
              <span key={a} className="px-2 py-0.5 bg-muted rounded text-[10px] font-medium capitalize">{a.replace(/_/g, ' ')}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Outputs preview */}
      {concept.outputs.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Production Outputs ({concept.outputs.length})</h4>
          {concept.outputs.map(output => (
            <div key={output.id} className="panel p-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium capitalize">{output.formatType.replace(/_/g, ' ')}</span>
                <span className="status-badge bg-muted text-muted-foreground">{output.outputStatus}</span>
              </div>
              {output.copyHeadline && <p className="text-sm font-medium">{output.copyHeadline}</p>}
              {output.copyPrimary && <p className="text-xs text-muted-foreground whitespace-pre-line line-clamp-3">{output.copyPrimary}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ConceptStatusBadge({ status }: { status: ConceptStatus }) {
  if (status === 'approved') {
    return <span className="status-badge" style={{ backgroundColor: 'hsl(140 49% 96%)', color: 'hsl(142 64% 32%)' }}>Approved</span>;
  }
  if (status === 'rejected') {
    return <span className="status-badge" style={{ backgroundColor: 'hsl(0 84% 96%)', color: 'hsl(0 84% 40%)' }}>Rejected</span>;
  }
  const s = conceptStatusStyle[status];
  return <span className={`status-badge ${s.bg} ${s.text}`}>{s.label}</span>;
}

function InfoCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="panel p-4 space-y-1.5">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`text-sm ${highlight ? 'font-medium italic' : ''}`}>{value}</p>
    </div>
  );
}

function ActionButton({ icon, label, variant }: { icon: React.ReactNode; label: string; variant?: 'success' | 'danger' }) {
  const base = "w-full inline-flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-colors";
  if (variant === 'success') return <button className={`${base} border hover:bg-muted`} style={{ borderColor: 'hsl(142 64% 80%)', color: 'hsl(142 64% 32%)' }}>{icon}{label}</button>;
  if (variant === 'danger') return <button className={`${base} border hover:bg-muted`} style={{ borderColor: 'hsl(0 84% 80%)', color: 'hsl(0 84% 40%)' }}>{icon}{label}</button>;
  return <button className={`${base} border hover:bg-muted text-foreground`}>{icon}{label}</button>;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right max-w-[140px] truncate">{value}</span>
    </div>
  );
}
