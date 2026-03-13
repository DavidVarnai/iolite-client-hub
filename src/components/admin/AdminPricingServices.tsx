import { useState } from 'react';
import { Plus, Pencil, Archive, RotateCcw, Trash2, Copy, ChevronDown, ChevronRight, Package, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { repository } from '@/lib/repository';
import type {
  ServiceLine, PricingType, ServiceUnit, ServiceLineStatus,
  ServicePackage, PackagePricingModel, PackageDeliverable, SpendTier,
} from '@/types/services';
import {
  PRICING_TYPE_LABELS, SERVICE_UNIT_LABELS, PACKAGE_PRICING_MODEL_LABELS,
} from '@/types/services';

/* ── Constants ── */

const PRICING_TYPES = Object.entries(PRICING_TYPE_LABELS) as [PricingType, string][];
const SERVICE_UNITS = Object.entries(SERVICE_UNIT_LABELS) as [ServiceUnit, string][];
const PKG_PRICING_MODELS = Object.entries(PACKAGE_PRICING_MODEL_LABELS) as [PackagePricingModel, string][];

/* ── Helpers ── */

const fmt = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });

/* ══════════════════════════════════════════════
   SERVICE LINES SUB-TAB
   ══════════════════════════════════════════════ */

const emptyLineForm: Omit<ServiceLine, 'id'> = {
  name: '', description: '', pricingType: 'hourly', defaultUnit: 'hour', status: 'active',
};

function ServiceLinesTab() {
  const [lines, setLines] = useState<ServiceLine[]>(() => repository.serviceLines.getAll());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<ServiceLine, 'id'> & { defaultRateMin?: number; defaultRateMax?: number }>(emptyLineForm);

  const reload = () => setLines(repository.serviceLines.getAll());

  const openCreate = () => { setEditId(null); setForm({ ...emptyLineForm }); setDialogOpen(true); };
  const openEdit = (sl: ServiceLine) => {
    setEditId(sl.id);
    setForm({ name: sl.name, description: sl.description, pricingType: sl.pricingType, defaultUnit: sl.defaultUnit, status: sl.status, defaultRateMin: sl.defaultRateMin, defaultRateMax: sl.defaultRateMax });
    setDialogOpen(true);
  };

  const handleSave = () => {
    const id = editId || `sl_${Date.now()}`;
    const line: ServiceLine = { id, ...form };
    if (!line.defaultRateMin) delete line.defaultRateMin;
    if (!line.defaultRateMax) delete line.defaultRateMax;
    repository.serviceLines.save(line);
    reload(); setDialogOpen(false);
  };

  const toggleStatus = (sl: ServiceLine) => {
    repository.serviceLines.save({ ...sl, status: sl.status === 'active' ? 'archived' : 'active' as ServiceLineStatus });
    reload();
  };

  const rateHint = (sl: ServiceLine) => {
    if (sl.defaultRateMin && sl.defaultRateMax && sl.defaultRateMin !== sl.defaultRateMax)
      return `$${sl.defaultRateMin}–$${sl.defaultRateMax}/${SERVICE_UNIT_LABELS[sl.defaultUnit]}`;
    if (sl.defaultRateMin) return `$${sl.defaultRateMin}/${SERVICE_UNIT_LABELS[sl.defaultUnit]}`;
    return null;
  };

  const activeLines = lines.filter(l => l.status === 'active');
  const archivedLines = lines.filter(l => l.status === 'archived');

  const renderTable = (items: ServiceLine[], showArchived = false) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Service</TableHead>
          <TableHead>Pricing Type</TableHead>
          <TableHead>Default Unit</TableHead>
          <TableHead>Rate</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map(sl => (
          <TableRow key={sl.id}>
            <TableCell>
              <div className="font-medium">{sl.name}</div>
              {sl.description && <div className="text-xs text-muted-foreground mt-0.5 max-w-xs truncate">{sl.description}</div>}
            </TableCell>
            <TableCell><Badge variant="secondary" className="text-xs">{PRICING_TYPE_LABELS[sl.pricingType]}</Badge></TableCell>
            <TableCell className="text-sm text-muted-foreground">{SERVICE_UNIT_LABELS[sl.defaultUnit]}</TableCell>
            <TableCell className="text-sm">{rateHint(sl) || <span className="text-muted-foreground">—</span>}</TableCell>
            <TableCell className="text-right space-x-1">
              <Button variant="ghost" size="icon" onClick={() => openEdit(sl)}><Pencil className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" onClick={() => toggleStatus(sl)}>
                {showArchived ? <RotateCcw className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
              </Button>
              {showArchived && <Button variant="ghost" size="icon" onClick={() => { repository.serviceLines.delete(sl.id); reload(); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>}
            </TableCell>
          </TableRow>
        ))}
        {items.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No service lines</TableCell></TableRow>}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold">Service Lines</h3>
          <p className="text-sm text-muted-foreground">Define the core services your agency offers.</p>
        </div>
        <Button size="sm" onClick={openCreate}><Plus className="h-4 w-4 mr-1" /> Add Service Line</Button>
      </div>
      {renderTable(activeLines)}
      {archivedLines.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-2">Archived</h4>
          {renderTable(archivedLines, true)}
        </div>
      )}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{editId ? 'Edit Service Line' : 'New Service Line'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5"><Label>Name</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Paid Media Management" /></div>
            <div className="space-y-1.5"><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label>Pricing Type</Label>
                <Select value={form.pricingType} onValueChange={v => setForm(f => ({ ...f, pricingType: v as PricingType }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{PRICING_TYPES.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent></Select>
              </div>
              <div className="space-y-1.5"><Label>Default Unit</Label>
                <Select value={form.defaultUnit} onValueChange={v => setForm(f => ({ ...f, defaultUnit: v as ServiceUnit }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{SERVICE_UNITS.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent></Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label>Default Rate Min ($)</Label><Input type="number" value={form.defaultRateMin ?? ''} onChange={e => setForm(f => ({ ...f, defaultRateMin: e.target.value ? Number(e.target.value) : undefined }))} placeholder="Optional" /></div>
              <div className="space-y-1.5"><Label>Default Rate Max ($)</Label><Input type="number" value={form.defaultRateMax ?? ''} onChange={e => setForm(f => ({ ...f, defaultRateMax: e.target.value ? Number(e.target.value) : undefined }))} placeholder="Optional" /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!form.name.trim()}>{editId ? 'Save Changes' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ══════════════════════════════════════════════
   PACKAGES SUB-TAB
   ══════════════════════════════════════════════ */

interface PkgFormState {
  name: string;
  description: string;
  serviceLineId: string;
  pricingModel: PackagePricingModel;
  basePrice: number;
  minimumFee?: number;
  pricingRules: Record<string, unknown>;
  deliverables: PackageDeliverable[];
  internalCost?: number;
  active: boolean;
}

const emptyPkgForm = (serviceLineId: string): PkgFormState => ({
  name: '', description: '', serviceLineId, pricingModel: 'flat_monthly',
  basePrice: 0, pricingRules: {}, deliverables: [], active: true,
});

function PackagesTab() {
  const [packages, setPackages] = useState<ServicePackage[]>(() => repository.servicePackages.getAll());
  const [lines] = useState<ServiceLine[]>(() => repository.serviceLines.getAll().filter(l => l.status === 'active'));
  const [expandedLine, setExpandedLine] = useState<string | null>(lines[0]?.id ?? null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<PkgFormState>(emptyPkgForm(lines[0]?.id ?? ''));

  const reload = () => setPackages(repository.servicePackages.getAll());

  const openCreate = (serviceLineId: string) => {
    setEditId(null);
    setForm(emptyPkgForm(serviceLineId));
    setDialogOpen(true);
  };

  const openEdit = (pkg: ServicePackage) => {
    setEditId(pkg.id);
    setForm({
      name: pkg.name, description: pkg.description, serviceLineId: pkg.serviceLineId,
      pricingModel: pkg.pricingModel, basePrice: pkg.basePrice, minimumFee: pkg.minimumFee,
      pricingRules: { ...pkg.pricingRules }, deliverables: [...pkg.deliverables.map(d => ({ ...d }))],
      internalCost: pkg.internalCost, active: pkg.active,
    });
    setDialogOpen(true);
  };

  const handleDuplicate = (pkg: ServicePackage) => {
    const dup: ServicePackage = {
      ...pkg, id: `pkg_${Date.now()}`, name: `${pkg.name} (Copy)`,
      pricingRules: { ...pkg.pricingRules },
      deliverables: pkg.deliverables.map(d => ({ ...d })),
    };
    repository.servicePackages.save(dup);
    reload();
  };

  const handleSave = () => {
    const id = editId || `pkg_${Date.now()}`;
    const pkg: ServicePackage = { id, ...form };
    repository.servicePackages.save(pkg);
    reload(); setDialogOpen(false);
  };

  const toggleActive = (pkg: ServicePackage) => {
    repository.servicePackages.save({ ...pkg, active: !pkg.active });
    reload();
  };

  /* ── Spend tiers helper ── */
  const getSpendTiers = (): SpendTier[] =>
    (form.pricingRules.spendTiers as SpendTier[] | undefined) || [];

  const setSpendTiers = (tiers: SpendTier[]) =>
    setForm(f => ({ ...f, pricingRules: { ...f.pricingRules, spendTiers: tiers } }));

  const addSpendTier = () => setSpendTiers([...getSpendTiers(), { label: '', upTo: null, rate: 0 }]);

  const updateSpendTier = (idx: number, patch: Partial<SpendTier>) => {
    const tiers = [...getSpendTiers()];
    tiers[idx] = { ...tiers[idx], ...patch };
    setSpendTiers(tiers);
  };

  const removeSpendTier = (idx: number) => setSpendTiers(getSpendTiers().filter((_, i) => i !== idx));

  /* ── Deliverables helper ── */
  const addDeliverable = () =>
    setForm(f => ({ ...f, deliverables: [...f.deliverables, { key: `d_${Date.now()}`, label: '', value: '' }] }));

  const updateDeliverable = (idx: number, patch: Partial<PackageDeliverable>) => {
    const ds = [...form.deliverables];
    ds[idx] = { ...ds[idx], ...patch };
    setForm(f => ({ ...f, deliverables: ds }));
  };

  const removeDeliverable = (idx: number) =>
    setForm(f => ({ ...f, deliverables: f.deliverables.filter((_, i) => i !== idx) }));

  /* ── Render per-line package list ── */
  const renderLineGroup = (line: ServiceLine) => {
    const linePkgs = packages.filter(p => p.serviceLineId === line.id);
    const activePkgs = linePkgs.filter(p => p.active);
    const archivedPkgs = linePkgs.filter(p => !p.active);
    const isExpanded = expandedLine === line.id;

    return (
      <div key={line.id} className="border rounded-lg">
        <button
          onClick={() => setExpandedLine(isExpanded ? null : line.id)}
          className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
            <div className="text-left">
              <div className="font-medium">{line.name}</div>
              <div className="text-xs text-muted-foreground">{PRICING_TYPE_LABELS[line.pricingType]} · {linePkgs.length} package{linePkgs.length !== 1 ? 's' : ''}</div>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">{activePkgs.length} active</Badge>
        </button>

        {isExpanded && (
          <div className="border-t px-4 pb-4 space-y-3">
            <div className="flex justify-end pt-3">
              <Button size="sm" variant="outline" onClick={() => openCreate(line.id)}>
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Package
              </Button>
            </div>

            {activePkgs.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Package</TableHead>
                    <TableHead>Pricing Model</TableHead>
                    <TableHead>Base Price</TableHead>
                    <TableHead>Min Fee</TableHead>
                    <TableHead>Deliverables</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activePkgs.map(pkg => (
                    <TableRow key={pkg.id}>
                      <TableCell>
                        <div className="font-medium">{pkg.name}</div>
                        <div className="text-xs text-muted-foreground mt-0.5 max-w-xs truncate">{pkg.description}</div>
                      </TableCell>
                      <TableCell><Badge variant="secondary" className="text-xs">{PACKAGE_PRICING_MODEL_LABELS[pkg.pricingModel]}</Badge></TableCell>
                      <TableCell className="text-sm">{fmt(pkg.basePrice)}</TableCell>
                      <TableCell className="text-sm">{pkg.minimumFee ? fmt(pkg.minimumFee) : <span className="text-muted-foreground">—</span>}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{pkg.deliverables.length} items</TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(pkg)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDuplicate(pkg)}><Copy className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => toggleActive(pkg)}><Archive className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {archivedPkgs.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-medium text-muted-foreground mb-1">Archived</p>
                <Table>
                  <TableBody>
                    {archivedPkgs.map(pkg => (
                      <TableRow key={pkg.id} className="opacity-60">
                        <TableCell className="font-medium">{pkg.name}</TableCell>
                        <TableCell>{fmt(pkg.basePrice)}</TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button variant="ghost" size="icon" onClick={() => toggleActive(pkg)}><RotateCcw className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => { repository.servicePackages.delete(pkg.id); reload(); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {linePkgs.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">No packages defined yet.</p>
            )}
          </div>
        )}
      </div>
    );
  };

  /* ── Spend tiers editor (for spend_percentage model) ── */
  const renderSpendTiersEditor = () => {
    const tiers = getSpendTiers();
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Spend Tiers</Label>
          <Button variant="outline" size="sm" onClick={addSpendTier}><Plus className="h-3 w-3 mr-1" /> Add Tier</Button>
        </div>
        {tiers.map((tier, i) => (
          <div key={i} className="grid grid-cols-[1fr_100px_80px_32px] gap-2 items-center">
            <Input value={tier.label} onChange={e => updateSpendTier(i, { label: e.target.value })} placeholder="e.g. First $20k" className="h-8 text-sm" />
            <Input type="number" value={tier.upTo ?? ''} onChange={e => updateSpendTier(i, { upTo: e.target.value ? Number(e.target.value) : null })} placeholder="Cap $" className="h-8 text-sm" />
            <Input type="number" value={tier.rate ? (tier.rate * 100) : ''} onChange={e => updateSpendTier(i, { rate: e.target.value ? Number(e.target.value) / 100 : 0 })} placeholder="%" className="h-8 text-sm" />
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeSpendTier(i)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
          </div>
        ))}
        {tiers.length > 0 && <p className="text-[11px] text-muted-foreground">Label · Cap ($, blank=unlimited) · Rate (%)</p>}
      </div>
    );
  };

  /* ── Pricing rules editor (model-specific fields) ── */
  const renderPricingRulesEditor = () => {
    const rules = form.pricingRules;

    return (
      <div className="space-y-3">
        <Label className="text-sm font-medium">Pricing Rules</Label>
        {form.pricingModel === 'spend_percentage' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Base Account Fee</Label>
                <Input type="number" value={(rules.baseAccountFee as number) ?? ''} onChange={e => setForm(f => ({ ...f, pricingRules: { ...f.pricingRules, baseAccountFee: Number(e.target.value) } }))} className="h-8 text-sm" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Multi-DSP Fee</Label>
                <Input type="number" value={(rules.multiDSPFee as number) ?? ''} onChange={e => setForm(f => ({ ...f, pricingRules: { ...f.pricingRules, multiDSPFee: Number(e.target.value) } }))} className="h-8 text-sm" />
              </div>
            </div>
            {renderSpendTiersEditor()}
          </div>
        )}

        {form.pricingModel === 'retainer_plus_volume' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Campaigns/Month</Label>
                <Input type="number" value={(rules.campaignsPerMonth as number) ?? ''} onChange={e => setForm(f => ({ ...f, pricingRules: { ...f.pricingRules, campaignsPerMonth: Number(e.target.value) } }))} className="h-8 text-sm" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Segmentation Level</Label>
                <Input value={(rules.segmentation as string) ?? ''} onChange={e => setForm(f => ({ ...f, pricingRules: { ...f.pricingRules, segmentation: e.target.value } }))} className="h-8 text-sm" />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Flows Included</Label>
              <Input value={(rules.flowsIncluded as string) ?? ''} onChange={e => setForm(f => ({ ...f, pricingRules: { ...f.pricingRules, flowsIncluded: e.target.value } }))} className="h-8 text-sm" />
            </div>
          </div>
        )}

        {form.pricingModel === 'hourly' && (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Rate Min ($)</Label>
              <Input type="number" value={(rules.rateMin as number) ?? ''} onChange={e => setForm(f => ({ ...f, pricingRules: { ...f.pricingRules, rateMin: Number(e.target.value) } }))} className="h-8 text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Rate Max ($)</Label>
              <Input type="number" value={(rules.rateMax as number) ?? ''} onChange={e => setForm(f => ({ ...f, pricingRules: { ...f.pricingRules, rateMax: Number(e.target.value) } }))} className="h-8 text-sm" />
            </div>
          </div>
        )}

        {(form.pricingModel === 'flat_monthly' || form.pricingModel === 'tier_package' || form.pricingModel === 'add_on_package') && (
          <p className="text-xs text-muted-foreground">Base price and deliverables define this package. No additional pricing rules needed.</p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold">Packages</h3>
        <p className="text-sm text-muted-foreground">Define pricing packages for each service line.</p>
      </div>

      <div className="space-y-3">
        {lines.map(renderLineGroup)}
      </div>

      {/* Package Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editId ? 'Edit Package' : 'New Package'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-2">
            {/* Basic info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Name</Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Growth" />
              </div>
              <div className="space-y-1.5">
                <Label>Service Line</Label>
                <Select value={form.serviceLineId} onValueChange={v => setForm(f => ({ ...f, serviceLineId: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{lines.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} />
            </div>

            {/* Pricing */}
            <Separator />
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label>Pricing Model</Label>
                <Select value={form.pricingModel} onValueChange={v => setForm(f => ({ ...f, pricingModel: v as PackagePricingModel }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{PKG_PRICING_MODELS.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Base Price ($)</Label>
                <Input type="number" value={form.basePrice || ''} onChange={e => setForm(f => ({ ...f, basePrice: Number(e.target.value) }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Minimum Fee ($)</Label>
                <Input type="number" value={form.minimumFee ?? ''} onChange={e => setForm(f => ({ ...f, minimumFee: e.target.value ? Number(e.target.value) : undefined }))} placeholder="Optional" />
              </div>
            </div>

            {form.pricingModel === 'add_on_package' && (
              <div className="space-y-1.5">
                <Label>Internal Cost ($)</Label>
                <Input type="number" value={form.internalCost ?? ''} onChange={e => setForm(f => ({ ...f, internalCost: e.target.value ? Number(e.target.value) : undefined }))} placeholder="Optional — margin calculated automatically" />
                {form.internalCost != null && form.basePrice > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Margin: {((1 - form.internalCost / form.basePrice) * 100).toFixed(0)}%
                  </p>
                )}
              </div>
            )}

            {/* Pricing rules */}
            {renderPricingRulesEditor()}

            {/* Deliverables */}
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Deliverables</Label>
                <Button variant="outline" size="sm" onClick={addDeliverable}><Plus className="h-3 w-3 mr-1" /> Add</Button>
              </div>
              {form.deliverables.map((d, i) => (
                <div key={i} className="grid grid-cols-[1fr_1fr_32px] gap-2 items-center">
                  <Input value={d.label} onChange={e => updateDeliverable(i, { label: e.target.value })} placeholder="Label" className="h-8 text-sm" />
                  <Input value={String(d.value)} onChange={e => updateDeliverable(i, { value: e.target.value })} placeholder="Value" className="h-8 text-sm" />
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeDeliverable(i)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                </div>
              ))}
            </div>

            {/* Active */}
            <div className="flex items-center gap-3">
              <Switch checked={form.active} onCheckedChange={v => setForm(f => ({ ...f, active: v }))} />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!form.name.trim() || !form.serviceLineId}>{editId ? 'Save Changes' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════ */

export default function AdminPricingServices() {
  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Package className="h-5 w-5" /> Pricing & Services
        </h2>
        <p className="text-sm text-muted-foreground">Manage your agency's service catalog and pricing structure.</p>
      </div>
      <Tabs defaultValue="service_lines">
        <TabsList>
          <TabsTrigger value="service_lines">Service Lines</TabsTrigger>
          <TabsTrigger value="packages">Packages</TabsTrigger>
        </TabsList>
        <TabsContent value="service_lines" className="mt-4">
          <ServiceLinesTab />
        </TabsContent>
        <TabsContent value="packages" className="mt-4">
          <PackagesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
