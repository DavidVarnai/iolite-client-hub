/**
 * Client Unit Economics tab — revenue, team cost allocation, other costs, margin summary.
 */
import { useState, useMemo } from 'react';
import { DollarSign, Users, TrendingUp, TrendingDown, Pencil, Plus, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { repository } from '@/lib/repository';
import { useClientContext } from '@/contexts/ClientContext';
import { computeClientTeamCosts, calcMarginSummary, type TeamMemberCostLine } from '@/lib/economicsCalculations';
import type { ClientEconomics, ClientRevenueEntry, OtherCostEntry, RevenueCategory } from '@/types/economics';
import { REVENUE_CATEGORY_LABELS } from '@/types/economics';

export default function UnitEconomics() {
  const { client } = useClientContext();
  const [economics, setEconomics] = useState<ClientEconomics>(() => repository.clientEconomics.get(client.id));
  const [editingRevenue, setEditingRevenue] = useState(false);
  const [editingCosts, setEditingCosts] = useState(false);

  const members = useMemo(() => repository.teamMembers.getAll(), []);
  const compensation = useMemo(() => repository.compensation.getAll(), []);
  const assignments = useMemo(() => repository.clientAssignments.getAll(), []);

  const teamCostLines = useMemo(() =>
    computeClientTeamCosts(client.id, assignments, members, compensation, economics.revenueEntries),
    [client.id, assignments, members, compensation, economics.revenueEntries]
  );

  const totalRevenue = economics.revenueEntries.reduce((sum, r) => sum + r.monthlyAmount, 0);
  const totalTeamCost = teamCostLines.reduce((sum, l) => sum + l.estimatedMonthlyCost, 0);
  const totalOtherCosts = economics.otherCosts.reduce((sum, c) => sum + c.monthlyAmount, 0);
  const margin = calcMarginSummary(totalRevenue, totalTeamCost, totalOtherCosts);

  const persistEconomics = (updated: ClientEconomics) => {
    setEconomics(updated);
    repository.clientEconomics.save(updated);
  };

  const marginColor = margin.estimatedMarginPercent >= 50 ? 'text-green-600' : margin.estimatedMarginPercent >= 30 ? 'text-amber-600' : 'text-destructive';

  return (
    <div className="p-6 space-y-6">
      {/* Margin Summary Card */}
      <div className="panel p-5">
        <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-primary" /> Margin Summary
        </h3>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          <SummaryCard label="Total Revenue" value={`$${totalRevenue.toLocaleString()}`} sub="/month" />
          <SummaryCard label="Team Cost" value={`$${totalTeamCost.toLocaleString()}`} sub="/month" />
          <SummaryCard label="Other Costs" value={`$${totalOtherCosts.toLocaleString()}`} sub="/month" />
          <SummaryCard label="Total Cost" value={`$${margin.totalEstimatedCost.toLocaleString()}`} sub="/month" />
          <SummaryCard label="Gross Profit" value={`$${margin.estimatedGrossProfit.toLocaleString()}`} sub="/month" icon={margin.estimatedGrossProfit >= 0 ? <TrendingUp className="h-4 w-4 text-green-600" /> : <TrendingDown className="h-4 w-4 text-destructive" />} />
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">Est. Margin</p>
            <p className={`text-2xl font-bold ${marginColor}`}>{margin.estimatedMarginPercent.toFixed(1)}%</p>
          </div>
        </div>
      </div>

      {/* Revenue */}
      <div className="panel p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold">Revenue by Category</h3>
          <Button size="sm" variant="outline" onClick={() => setEditingRevenue(!editingRevenue)}>
            {editingRevenue ? 'Done' : <><Pencil className="h-3.5 w-3.5 mr-1" /> Edit</>}
          </Button>
        </div>

        {editingRevenue ? (
          <RevenueEditor economics={economics} onSave={persistEconomics} />
        ) : (
          <div className="space-y-2">
            {economics.revenueEntries.length === 0 && <p className="text-sm text-muted-foreground italic">No revenue entries. Click Edit to add.</p>}
            {economics.revenueEntries.map((r, i) => (
              <div key={i} className="flex items-center justify-between bg-muted/30 rounded-md px-4 py-2.5 text-sm">
                <span>{REVENUE_CATEGORY_LABELS[r.category] || r.category}</span>
                <span className="font-medium">${r.monthlyAmount.toLocaleString()}/mo</span>
              </div>
            )))}
          </div>
        )}
      </div>

      {/* Team Cost Allocation */}
      <div className="panel p-5">
        <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" /> Team Cost Allocation
        </h3>
        {teamCostLines.length === 0 && <p className="text-sm text-muted-foreground italic">No team members assigned to this client.</p>}
        <div className="space-y-2">
          {teamCostLines.map(line => (
            <div key={line.teamMemberId} className="flex items-center justify-between bg-muted/30 rounded-md px-4 py-3 text-sm">
              <div>
                <span className="font-medium">{line.name}</span>
                <span className="text-muted-foreground ml-2">— {line.role}</span>
                <p className="text-xs text-muted-foreground mt-0.5">{line.compensationBasis} · {line.formula}</p>
              </div>
              <span className="font-semibold">${line.estimatedMonthlyCost.toLocaleString()}/mo</span>
            </div>
          )))}
        </div>
      </div>

      {/* Other Costs */}
      <div className="panel p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold">Other Costs</h3>
          <Button size="sm" variant="outline" onClick={() => setEditingCosts(!editingCosts)}>
            {editingCosts ? 'Done' : <><Pencil className="h-3.5 w-3.5 mr-1" /> Edit</>}
          </Button>
        </div>

        {editingCosts ? (
          <OtherCostsEditor economics={economics} onSave={persistEconomics} />
        ) : (
          <div className="space-y-2">
            {economics.otherCosts.length === 0 && <p className="text-sm text-muted-foreground italic">No other costs. Click Edit to add software, tools, or vendor costs.</p>}
            {economics.otherCosts.map(c => (
              <div key={c.id} className="flex items-center justify-between bg-muted/30 rounded-md px-4 py-2.5 text-sm">
                <span>{c.label}</span>
                <span className="font-medium">${c.monthlyAmount.toLocaleString()}/mo</span>
              </div>
            )))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Summary Card ── */

function SummaryCard({ label, value, sub, icon }: { label: string; value: string; sub?: string; icon?: React.ReactNode }) {
  return (
    <div className="text-center">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <div className="flex items-center justify-center gap-1">
        {icon}
        <p className="text-lg font-bold">{value}</p>
      </div>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

/* ── Revenue Editor ── */

function RevenueEditor({ economics, onSave }: { economics: ClientEconomics; onSave: (e: ClientEconomics) => void }) {
  const [entries, setEntries] = useState<ClientRevenueEntry[]>(economics.revenueEntries);
  const [newCat, setNewCat] = useState<RevenueCategory>('fractional_cmo');
  const [newAmt, setNewAmt] = useState(0);

  const usedCats = new Set(entries.map(e => e.category));
  const availableCats = Object.keys(REVENUE_CATEGORY_LABELS).filter(k => !usedCats.has(k as RevenueCategory)) as RevenueCategory[];

  const handleAdd = () => {
    if (newAmt <= 0) return;
    const updated = [...entries, { category: newCat, monthlyAmount: newAmt }];
    setEntries(updated);
    onSave({ ...economics, revenueEntries: updated });
    setNewAmt(0);
    if (availableCats.length > 1) setNewCat(availableCats.find(c => c !== newCat) || availableCats[0]);
  };

  const handleRemove = (idx: number) => {
    const updated = entries.filter((_, i) => i !== idx);
    setEntries(updated);
    onSave({ ...economics, revenueEntries: updated });
  };

  const handleUpdate = (idx: number, amount: number) => {
    const updated = [...entries];
    updated[idx] = { ...updated[idx], monthlyAmount: amount };
    setEntries(updated);
    onSave({ ...economics, revenueEntries: updated });
  };

  return (
    <div className="space-y-3">
      {entries.map((r, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="text-sm flex-1">{REVENUE_CATEGORY_LABELS[r.category]}</span>
          <Input type="number" className="w-32 h-9" value={r.monthlyAmount} onChange={e => handleUpdate(i, Number(e.target.value))} />
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleRemove(i)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      )))}
      {availableCats.length > 0 && (
        <div className="flex items-end gap-3 pt-2 border-t">
          <div className="flex-1">
            <Label className="text-xs">Category</Label>
            <Select value={newCat} onValueChange={v => setNewCat(v as RevenueCategory)}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                {availableCats.map(k => <SelectItem key={k} value={k}>{REVENUE_CATEGORY_LABELS[k]}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Monthly ($)</Label>
            <Input type="number" className="w-32 h-9" value={newAmt} onChange={e => setNewAmt(Number(e.target.value))} />
          </div>
          <Button size="sm" onClick={handleAdd}><Plus className="h-4 w-4 mr-1" /> Add</Button>
        </div>
      )}
    </div>
  );
}

/* ── Other Costs Editor ── */

function OtherCostsEditor({ economics, onSave }: { economics: ClientEconomics; onSave: (e: ClientEconomics) => void }) {
  const [costs, setCosts] = useState<OtherCostEntry[]>(economics.otherCosts);
  const [newLabel, setNewLabel] = useState('');
  const [newAmt, setNewAmt] = useState(0);

  const handleAdd = () => {
    if (!newLabel.trim() || newAmt <= 0) return;
    const updated = [...costs, { id: `oc_${Date.now()}`, label: newLabel.trim(), monthlyAmount: newAmt }];
    setCosts(updated);
    onSave({ ...economics, otherCosts: updated });
    setNewLabel('');
    setNewAmt(0);
  };

  const handleRemove = (id: string) => {
    const updated = costs.filter(c => c.id !== id);
    setCosts(updated);
    onSave({ ...economics, otherCosts: updated });
  };

  return (
    <div className="space-y-3">
      {costs.map(c => (
        <div key={c.id} className="flex items-center gap-3">
          <span className="text-sm flex-1">{c.label}</span>
          <span className="text-sm font-medium">${c.monthlyAmount.toLocaleString()}/mo</span>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleRemove(c.id)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      )))}
      <div className="flex items-end gap-3 pt-2 border-t">
        <div className="flex-1">
          <Label className="text-xs">Label</Label>
          <Input value={newLabel} onChange={e => setNewLabel(e.target.value)} placeholder="e.g. Figma subscription" className="h-9" />
        </div>
        <div>
          <Label className="text-xs">Monthly ($)</Label>
          <Input type="number" className="w-32 h-9" value={newAmt} onChange={e => setNewAmt(Number(e.target.value))} />
        </div>
        <Button size="sm" onClick={handleAdd}><Plus className="h-4 w-4 mr-1" /> Add</Button>
      </div>
    </div>
  );
}
