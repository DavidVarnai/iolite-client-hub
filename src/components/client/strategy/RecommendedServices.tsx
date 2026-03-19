/**
 * RecommendedServices — strategic service recommendations (not financial).
 * Lives in Strategy tab. Designed to later seed Proposal Ready automatically.
 */
import { useState } from 'react';
import { useClientContext } from '@/contexts/ClientContext';
import type { RecommendedService, ScopeLevel } from '@/types/commercialServices';
import { SCOPE_LEVEL_LABELS } from '@/types/commercialServices';
import { SERVICE_CHANNEL_LABELS, type ServiceChannel } from '@/types';
import { Plus, Trash2, Pencil, X, Check, Layers } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const SERVICE_LINE_OPTIONS = [
  'Fractional CMO', 'Paid Media Management', 'Social Media Management',
  'Retention Marketing', 'Web Design', 'Creative', 'Development',
  'SEO', 'Copywriting', 'Analytics', 'Brand Strategy', 'Content Marketing',
];

const CHANNEL_OPTIONS = Object.entries(SERVICE_CHANNEL_LABELS) as [ServiceChannel, string][];

function emptyService(): RecommendedService {
  return {
    id: `rs-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    serviceLine: '',
    linkedChannel: '',
    rationale: '',
    scopeLevel: 'standard',
    deliveryNotes: '',
  };
}

export default function RecommendedServices() {
  const { onboarding, updateOnboarding } = useClientContext();
  const services: RecommendedService[] = (onboarding as any).recommendedServices || [];
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<RecommendedService>(emptyService());
  const [showAdd, setShowAdd] = useState(false);

  const persist = (updated: RecommendedService[]) => {
    updateOnboarding({ ...onboarding, recommendedServices: updated } as any);
  };

  const handleAdd = () => {
    if (!draft.serviceLine) return;
    persist([...services, draft]);
    setDraft(emptyService());
    setShowAdd(false);
  };

  const handleDelete = (id: string) => {
    persist(services.filter(s => s.id !== id));
  };

  const handleSaveEdit = (updated: RecommendedService) => {
    persist(services.map(s => s.id === updated.id ? updated : s));
    setEditingId(null);
  };

  return (
    <div className="panel">
      <div className="p-5 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Recommended Services</h3>
          <span className="text-xs text-muted-foreground">Strategic, not financial</span>
        </div>
        <button
          onClick={() => { setShowAdd(!showAdd); setDraft(emptyService()); }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-md hover:opacity-90 transition-opacity"
        >
          <Plus className="h-3.5 w-3.5" /> Add
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="p-4 border-b bg-muted/30 space-y-3">
          <ServiceForm draft={draft} onChange={setDraft} />
          <div className="flex items-center gap-2">
            <button onClick={handleAdd} disabled={!draft.serviceLine}
              className="px-3 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-md hover:opacity-90 disabled:opacity-50">
              <Check className="h-3 w-3 inline mr-1" /> Add Service
            </button>
            <button onClick={() => setShowAdd(false)} className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {services.length === 0 && !showAdd ? (
        <div className="p-6 text-center">
          <p className="text-sm text-muted-foreground">No recommended services yet.</p>
          <p className="text-xs text-muted-foreground mt-1">Add strategic service recommendations that can later seed your proposal.</p>
        </div>
      ) : (
        <div className="divide-y">
          {services.map(svc => (
            editingId === svc.id ? (
              <EditRow key={svc.id} service={svc} onSave={handleSaveEdit} onCancel={() => setEditingId(null)} />
            ) : (
              <div key={svc.id} className="px-5 py-3 flex items-start gap-4 group hover:bg-muted/30 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-foreground">{svc.serviceLine}</span>
                    <span className="status-badge bg-primary/10 text-primary text-[10px]">
                      {SCOPE_LEVEL_LABELS[svc.scopeLevel]}
                    </span>
                  </div>
                  {svc.linkedChannel && (
                    <p className="text-xs text-muted-foreground mb-0.5">
                      Channel: {SERVICE_CHANNEL_LABELS[svc.linkedChannel as ServiceChannel] || svc.linkedChannel}
                    </p>
                  )}
                  {svc.rationale && <p className="text-xs text-foreground/80">{svc.rationale}</p>}
                  {svc.deliveryNotes && <p className="text-xs text-muted-foreground mt-0.5 italic">{svc.deliveryNotes}</p>}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setEditingId(svc.id)} className="p-1 text-muted-foreground hover:text-foreground">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => handleDelete(svc.id)} className="p-1 text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Inline form fields ── */

function ServiceForm({ draft, onChange }: { draft: RecommendedService; onChange: (d: RecommendedService) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">Service Line</label>
        <Select value={draft.serviceLine} onValueChange={v => onChange({ ...draft, serviceLine: v })}>
          <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select..." /></SelectTrigger>
          <SelectContent>
            {SERVICE_LINE_OPTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">Linked Channel</label>
        <Select value={draft.linkedChannel} onValueChange={v => onChange({ ...draft, linkedChannel: v })}>
          <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Optional..." /></SelectTrigger>
          <SelectContent>
            {CHANNEL_OPTIONS.map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">Scope Level</label>
        <Select value={draft.scopeLevel} onValueChange={v => onChange({ ...draft, scopeLevel: v as ScopeLevel })}>
          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {Object.entries(SCOPE_LEVEL_LABELS).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">Rationale</label>
        <Input value={draft.rationale} onChange={e => onChange({ ...draft, rationale: e.target.value })}
          placeholder="Why recommended?" className="h-8 text-xs" />
      </div>
      <div className="col-span-2">
        <label className="text-xs font-medium text-muted-foreground mb-1 block">Delivery Notes</label>
        <Input value={draft.deliveryNotes} onChange={e => onChange({ ...draft, deliveryNotes: e.target.value })}
          placeholder="Optional scope or delivery notes" className="h-8 text-xs" />
      </div>
    </div>
  );
}

function EditRow({ service, onSave, onCancel }: { service: RecommendedService; onSave: (s: RecommendedService) => void; onCancel: () => void }) {
  const [draft, setDraft] = useState(service);
  return (
    <div className="p-4 bg-muted/30 space-y-3">
      <ServiceForm draft={draft} onChange={setDraft} />
      <div className="flex items-center gap-2">
        <button onClick={() => onSave(draft)} className="px-3 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-md hover:opacity-90">
          <Check className="h-3 w-3 inline mr-1" /> Save
        </button>
        <button onClick={onCancel} className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground">
          <X className="h-3 w-3 inline mr-1" /> Cancel
        </button>
      </div>
    </div>
  );
}
