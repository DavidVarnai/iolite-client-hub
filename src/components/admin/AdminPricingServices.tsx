import { useState } from 'react';
import { Plus, Pencil, Archive, RotateCcw, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { repository } from '@/lib/repository';
import type { ServiceLine, PricingType, ServiceUnit, ServiceLineStatus } from '@/types/services';
import { PRICING_TYPE_LABELS, SERVICE_UNIT_LABELS } from '@/types/services';

const PRICING_TYPES = Object.entries(PRICING_TYPE_LABELS) as [PricingType, string][];
const SERVICE_UNITS = Object.entries(SERVICE_UNIT_LABELS) as [ServiceUnit, string][];

const emptyForm: Omit<ServiceLine, 'id'> = {
  name: '',
  description: '',
  pricingType: 'hourly',
  defaultUnit: 'hour',
  status: 'active',
};

export default function AdminPricingServices() {
  const [lines, setLines] = useState<ServiceLine[]>(() => repository.serviceLines.getAll());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<ServiceLine, 'id'> & { defaultRateMin?: number; defaultRateMax?: number }>(emptyForm);

  const reload = () => setLines(repository.serviceLines.getAll());

  const openCreate = () => {
    setEditId(null);
    setForm({ ...emptyForm });
    setDialogOpen(true);
  };

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
    reload();
    setDialogOpen(false);
  };

  const toggleStatus = (sl: ServiceLine) => {
    const next: ServiceLineStatus = sl.status === 'active' ? 'archived' : 'active';
    repository.serviceLines.save({ ...sl, status: next });
    reload();
  };

  const handleDelete = (id: string) => {
    repository.serviceLines.delete(id);
    reload();
  };

  const activeLines = lines.filter(l => l.status === 'active');
  const archivedLines = lines.filter(l => l.status === 'archived');

  const rateHint = (sl: ServiceLine) => {
    if (sl.defaultRateMin && sl.defaultRateMax && sl.defaultRateMin !== sl.defaultRateMax) {
      return `$${sl.defaultRateMin}–$${sl.defaultRateMax}/${SERVICE_UNIT_LABELS[sl.defaultUnit]}`;
    }
    if (sl.defaultRateMin) return `$${sl.defaultRateMin}/${SERVICE_UNIT_LABELS[sl.defaultUnit]}`;
    return null;
  };

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
            <TableCell>
              <Badge variant="secondary" className="text-xs">{PRICING_TYPE_LABELS[sl.pricingType]}</Badge>
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">{SERVICE_UNIT_LABELS[sl.defaultUnit]}</TableCell>
            <TableCell className="text-sm">{rateHint(sl) || <span className="text-muted-foreground">—</span>}</TableCell>
            <TableCell className="text-right space-x-1">
              <Button variant="ghost" size="icon" onClick={() => openEdit(sl)}><Pencil className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" onClick={() => toggleStatus(sl)}>
                {showArchived ? <RotateCcw className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
              </Button>
              {showArchived && (
                <Button variant="ghost" size="icon" onClick={() => handleDelete(sl.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              )}
            </TableCell>
          </TableRow>
        ))}
        {items.length === 0 && (
          <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No service lines</TableCell></TableRow>
        )}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Service Lines</h2>
          <p className="text-sm text-muted-foreground">Define the core services your agency offers.</p>
        </div>
        <Button size="sm" onClick={openCreate}><Plus className="h-4 w-4 mr-1" /> Add Service Line</Button>
      </div>

      {/* Active */}
      {renderTable(activeLines)}

      {/* Archived */}
      {archivedLines.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Archived</h3>
          {renderTable(archivedLines, true)}
        </div>
      )}

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editId ? 'Edit Service Line' : 'New Service Line'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Paid Media Management" />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} placeholder="Brief description of this service line" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Pricing Type</Label>
                <Select value={form.pricingType} onValueChange={v => setForm(f => ({ ...f, pricingType: v as PricingType }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PRICING_TYPES.map(([val, label]) => <SelectItem key={val} value={val}>{label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Default Unit</Label>
                <Select value={form.defaultUnit} onValueChange={v => setForm(f => ({ ...f, defaultUnit: v as ServiceUnit }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SERVICE_UNITS.map(([val, label]) => <SelectItem key={val} value={val}>{label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Default Rate Min ($)</Label>
                <Input type="number" value={form.defaultRateMin ?? ''} onChange={e => setForm(f => ({ ...f, defaultRateMin: e.target.value ? Number(e.target.value) : undefined }))} placeholder="Optional" />
              </div>
              <div className="space-y-1.5">
                <Label>Default Rate Max ($)</Label>
                <Input type="number" value={form.defaultRateMax ?? ''} onChange={e => setForm(f => ({ ...f, defaultRateMax: e.target.value ? Number(e.target.value) : undefined }))} placeholder="Optional" />
              </div>
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
