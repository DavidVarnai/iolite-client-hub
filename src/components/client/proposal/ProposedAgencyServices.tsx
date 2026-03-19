/**
 * ProposedAgencyServices — commercial pricing layer in Proposal Ready.
 * Source of truth for agency service pricing.
 */
import { useState } from 'react';
import type { ProposedAgencyService, ProposalPricingModelType, BillingCadence } from '@/types/commercialServices';
import { PROPOSAL_PRICING_MODEL_LABELS, BILLING_CADENCE_LABELS } from '@/types/commercialServices';
import { useClientContext } from '@/contexts/ClientContext';
import { Plus, Trash2, Pencil, Check, X, DollarSign } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency } from '@/lib/parsing';

const SERVICE_LINE_OPTIONS = [
  'Fractional CMO', 'Paid Media Management', 'Social Media Management',
  'Retention Marketing', 'Web Design', 'Creative', 'Development',
  'SEO', 'Copywriting', 'Analytics', 'Brand Strategy', 'Content Marketing',
];

function emptyRow(): ProposedAgencyService {
  const now = new Date();
  return {
    id: `pas-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    serviceLine: '',
    pricingModelType: 'flat_monthly',
    packageOrScope: '',
    billingCadence: 'monthly',
    startMonth: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
    durationMonths: 6,
    monthlyFee: 0,
    setupFee: 0,
    notes: '',
  };
}

interface Props {
  services: ProposedAgencyService[];
  onChange: (services: ProposedAgencyService[]) => void;
}

export default function ProposedAgencyServices({ services, onChange }: Props) {
  const [showAdd, setShowAdd] = useState(false);
  const [draft, setDraft] = useState<ProposedAgencyService>(emptyRow());
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAdd = () => {
    if (!draft.serviceLine) return;
    onChange([...services, draft]);
    setDraft(emptyRow());
    setShowAdd(false);
  };

  const handleDelete = (id: string) => {
    onChange(services.filter(s => s.id !== id));
  };

  const handleSaveEdit = (updated: ProposedAgencyService) => {
    onChange(services.map(s => s.id === updated.id ? updated : s));
    setEditingId(null);
  };

  const totalMonthly = services.reduce((s, r) => s + r.monthlyFee, 0);
  const totalSetup = services.reduce((s, r) => s + r.setupFee, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Proposed Agency Services</h3>
          <span className="text-xs text-muted-foreground">Source of truth for pricing</span>
        </div>
        <button
          onClick={() => { setShowAdd(!showAdd); setDraft(emptyRow()); }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-md hover:opacity-90 transition-opacity"
        >
          <Plus className="h-3.5 w-3.5" /> Add Service
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="panel p-4 bg-muted/30 space-y-3">
          <ServiceRowForm draft={draft} onChange={setDraft} />
          <div className="flex items-center gap-2">
            <button onClick={handleAdd} disabled={!draft.serviceLine}
              className="px-3 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-md hover:opacity-90 disabled:opacity-50">
              <Check className="h-3 w-3 inline mr-1" /> Add
            </button>
            <button onClick={() => setShowAdd(false)} className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground">Cancel</button>
          </div>
        </div>
      )}

      {/* Table */}
      {services.length === 0 && !showAdd ? (
        <div className="panel p-6 text-center">
          <p className="text-sm text-muted-foreground">No proposed services yet.</p>
          <p className="text-xs text-muted-foreground mt-1">Add services from your strategy recommendations or create custom entries.</p>
        </div>
      ) : services.length > 0 && (
        <div className="panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Service Line</th>
                  <th className="text-left px-3 py-2.5 font-medium text-muted-foreground">Pricing Model</th>
                  <th className="text-left px-3 py-2.5 font-medium text-muted-foreground">Scope</th>
                  <th className="text-left px-3 py-2.5 font-medium text-muted-foreground">Billing</th>
                  <th className="text-left px-3 py-2.5 font-medium text-muted-foreground">Duration</th>
                  <th className="text-right px-3 py-2.5 font-medium text-muted-foreground">Monthly</th>
                  <th className="text-right px-3 py-2.5 font-medium text-muted-foreground">Setup</th>
                  <th className="w-16 px-3 py-2.5"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {services.map(svc => (
                  editingId === svc.id ? (
                    <EditTableRow key={svc.id} service={svc} onSave={handleSaveEdit} onCancel={() => setEditingId(null)} />
                  ) : (
                    <tr key={svc.id} className="hover:bg-muted/20 transition-colors group">
                      <td className="px-4 py-2.5 font-medium text-foreground">{svc.serviceLine}</td>
                      <td className="px-3 py-2.5 text-muted-foreground">{PROPOSAL_PRICING_MODEL_LABELS[svc.pricingModelType]}</td>
                      <td className="px-3 py-2.5 text-muted-foreground">{svc.packageOrScope || '—'}</td>
                      <td className="px-3 py-2.5 text-muted-foreground">{BILLING_CADENCE_LABELS[svc.billingCadence]}</td>
                      <td className="px-3 py-2.5 text-muted-foreground">{svc.durationMonths} mo</td>
                      <td className="px-3 py-2.5 text-right tabular-nums font-medium text-foreground">{formatCurrency(svc.monthlyFee)}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-muted-foreground">{svc.setupFee > 0 ? formatCurrency(svc.setupFee) : '—'}</td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setEditingId(svc.id)} className="p-1 text-muted-foreground hover:text-foreground">
                            <Pencil className="h-3 w-3" />
                          </button>
                          <button onClick={() => handleDelete(svc.id)} className="p-1 text-muted-foreground hover:text-destructive">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                ))}
              </tbody>
              {services.length > 0 && (
                <tfoot>
                  <tr className="border-t bg-muted/30 font-semibold">
                    <td className="px-4 py-2.5 text-foreground" colSpan={5}>Total</td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-primary">{formatCurrency(totalMonthly)}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-foreground">{totalSetup > 0 ? formatCurrency(totalSetup) : '—'}</td>
                    <td></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Form ── */

function ServiceRowForm({ draft, onChange }: { draft: ProposedAgencyService; onChange: (d: ProposedAgencyService) => void }) {
  return (
    <div className="grid grid-cols-3 gap-3">
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
        <label className="text-xs font-medium text-muted-foreground mb-1 block">Pricing Model</label>
        <Select value={draft.pricingModelType} onValueChange={v => onChange({ ...draft, pricingModelType: v as ProposalPricingModelType })}>
          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {Object.entries(PROPOSAL_PRICING_MODEL_LABELS).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">Package / Scope</label>
        <Input value={draft.packageOrScope} onChange={e => onChange({ ...draft, packageOrScope: e.target.value })}
          placeholder="e.g. Growth Package" className="h-8 text-xs" />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">Billing Cadence</label>
        <Select value={draft.billingCadence} onValueChange={v => onChange({ ...draft, billingCadence: v as BillingCadence })}>
          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {Object.entries(BILLING_CADENCE_LABELS).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">Start Month</label>
        <Input type="month" value={draft.startMonth} onChange={e => onChange({ ...draft, startMonth: e.target.value })}
          className="h-8 text-xs" />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">Duration (months)</label>
        <Input type="number" value={draft.durationMonths} onChange={e => onChange({ ...draft, durationMonths: parseInt(e.target.value) || 1 })}
          className="h-8 text-xs" min={1} />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">Monthly Fee</label>
        <Input type="number" value={draft.monthlyFee || ''} onChange={e => onChange({ ...draft, monthlyFee: parseFloat(e.target.value) || 0 })}
          placeholder="$0" className="h-8 text-xs" />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">Setup Fee</label>
        <Input type="number" value={draft.setupFee || ''} onChange={e => onChange({ ...draft, setupFee: parseFloat(e.target.value) || 0 })}
          placeholder="$0" className="h-8 text-xs" />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">Notes</label>
        <Input value={draft.notes} onChange={e => onChange({ ...draft, notes: e.target.value })}
          placeholder="Optional" className="h-8 text-xs" />
      </div>
    </div>
  );
}

function EditTableRow({ service, onSave, onCancel }: { service: ProposedAgencyService; onSave: (s: ProposedAgencyService) => void; onCancel: () => void }) {
  const [draft, setDraft] = useState(service);
  return (
    <tr>
      <td colSpan={8} className="p-4 bg-muted/30">
        <ServiceRowForm draft={draft} onChange={setDraft} />
        <div className="flex items-center gap-2 mt-3">
          <button onClick={() => onSave(draft)} className="px-3 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-md hover:opacity-90">
            <Check className="h-3 w-3 inline mr-1" /> Save
          </button>
          <button onClick={onCancel} className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground">
            <X className="h-3 w-3 inline mr-1" /> Cancel
          </button>
        </div>
      </td>
    </tr>
  );
}
