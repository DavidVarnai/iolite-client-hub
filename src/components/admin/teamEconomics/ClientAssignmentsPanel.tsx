/**
 * ClientAssignmentsPanel — manage team member → client assignments with overrides.
 */
import { useState, useMemo } from 'react';
import { Plus, Trash2, X, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { repository } from '@/lib/repository';
import type { TeamMember, ClientTeamAssignment } from '@/types/economics';
import { COMP_TYPE_LABELS } from '@/types/economics';

export default function ClientAssignmentsPanel() {
  const [assignments, setAssignments] = useState<ClientTeamAssignment[]>(() => repository.clientAssignments.getAll());
  const members = useMemo(() => repository.teamMembers.getAll(), []);
  const clients = useMemo(() => repository.clients.getAll(), []);
  const compensation = useMemo(() => repository.compensation.getAll(), []);
  const [showForm, setShowForm] = useState(false);

  const refresh = () => setAssignments(repository.clientAssignments.getAll());

  const handleDelete = (id: string) => {
    repository.clientAssignments.delete(id);
    refresh();
    toast.success('Assignment removed');
  };

  const getMemberName = (id: string) => members.find(m => m.id === id)?.name || id;
  const getMemberRole = (id: string) => members.find(m => m.id === id)?.role || '';
  const getClientName = (id: string) => clients.find(c => c.id === id)?.name || id;

  const grouped = useMemo(() => {
    const map = new Map<string, ClientTeamAssignment[]>();
    for (const a of assignments) {
      if (!map.has(a.teamMemberId)) map.set(a.teamMemberId, []);
      map.get(a.teamMemberId)!.push(a);
    }
    return map;
  }, [assignments]);

  const getAssignmentDetail = (a: ClientTeamAssignment) => {
    const memberComps = compensation.filter(c => c.teamMemberId === a.teamMemberId);
    const badges: { label: string; tooltip: string }[] = [];

    if (a.allocationPercent != null) {
      const salaryComp = memberComps.find(c => c.componentType === 'salary_allocation');
      badges.push({
        label: `${a.allocationPercent}% allocation`,
        tooltip: salaryComp ? `${a.allocationPercent}% of $${salaryComp.amount.toLocaleString()}/mo salary` : `${a.allocationPercent}% allocation`,
      });
    }
    if (a.flatFeeOverride != null) badges.push({ label: `$${a.flatFeeOverride.toLocaleString()}/mo flat`, tooltip: 'Client-specific flat fee override' });
    if (a.hourlyRateOverride != null) badges.push({ label: `$${a.hourlyRateOverride}/hr`, tooltip: 'Client-specific hourly rate override' });
    if (a.revenueShareOverride != null) badges.push({ label: `${(a.revenueShareOverride * 100).toFixed(0)}% rev share`, tooltip: 'Client-specific revenue share override' });
    if (a.profitShareOverride != null) badges.push({ label: `${(a.profitShareOverride * 100).toFixed(0)}% profit share`, tooltip: 'Client-specific profit share override' });

    if (badges.length === 0) {
      memberComps.forEach(c => badges.push({ label: COMP_TYPE_LABELS[c.componentType], tooltip: 'Using default compensation' }));
    }
    return badges;
  };

  return (
    <TooltipProvider>
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-medium">Client Assignments</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Assign team members to clients with optional compensation overrides.</p>
          </div>
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-1" /> Add Assignment
          </Button>
        </div>

        {showForm && (
          <AssignmentForm members={members} clients={clients} onClose={() => setShowForm(false)} onSaved={() => { refresh(); setShowForm(false); }} />
        )}

        <div className="space-y-4">
          {Array.from(grouped.entries()).map(([memberId, memberAssignments]) => (
            <div key={memberId} className="panel p-4">
              <div className="flex items-baseline gap-2 mb-3">
                <h4 className="text-sm font-medium">{getMemberName(memberId)}</h4>
                <span className="text-xs text-muted-foreground">{getMemberRole(memberId)}</span>
              </div>
              <div className="space-y-2">
                {memberAssignments.map(a => {
                  const details = getAssignmentDetail(a);
                  return (
                    <div key={a.id} className="flex items-center justify-between bg-muted/30 rounded-md px-4 py-2.5 text-sm">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-medium">{getClientName(a.clientId)}</span>
                        <span className="text-muted-foreground">→ {a.roleOnClient}</span>
                        <div className="flex gap-1.5 flex-wrap">
                          {details.map((d, i) => (
                            <Tooltip key={i}>
                              <TooltipTrigger asChild>
                                <span><Badge variant="outline" className="text-xs cursor-default">{d.label}</Badge></span>
                              </TooltipTrigger>
                              <TooltipContent><p className="text-xs">{d.tooltip}</p></TooltipContent>
                            </Tooltip>
                          ))}
                        </div>
                        {!a.isActive && <Badge variant="secondary">Inactive</Badge>}
                      </div>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(a.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}

/* ── Assignment Form ── */

function AssignmentForm({ members, clients, onClose, onSaved }: { members: TeamMember[]; clients: { id: string; name: string }[]; onClose: () => void; onSaved: () => void }) {
  const [memberId, setMemberId] = useState(members[0]?.id || '');
  const [clientId, setClientId] = useState(clients[0]?.id || '');
  const [roleOnClient, setRoleOnClient] = useState('');
  const [allocationPercent, setAllocationPercent] = useState<string>('');
  const [flatFeeOverride, setFlatFeeOverride] = useState<string>('');
  const [hourlyRateOverride, setHourlyRateOverride] = useState<string>('');
  const [revenueShareOverride, setRevenueShareOverride] = useState<string>('');
  const [profitShareOverride, setProfitShareOverride] = useState<string>('');
  const [notes, setNotes] = useState('');

  const handleSave = () => {
    if (!roleOnClient.trim()) { toast.error('Role on client is required'); return; }
    const assignment: ClientTeamAssignment = {
      id: `ca_${Date.now()}`,
      teamMemberId: memberId,
      clientId,
      roleOnClient: roleOnClient.trim(),
      allocationPercent: allocationPercent ? Number(allocationPercent) : undefined,
      flatFeeOverride: flatFeeOverride ? Number(flatFeeOverride) : undefined,
      hourlyRateOverride: hourlyRateOverride ? Number(hourlyRateOverride) : undefined,
      revenueShareOverride: revenueShareOverride ? Number(revenueShareOverride) / 100 : undefined,
      profitShareOverride: profitShareOverride ? Number(profitShareOverride) / 100 : undefined,
      isActive: true,
      notes,
    };
    repository.clientAssignments.save(assignment);
    toast.success('Assignment created');
    onSaved();
  };

  return (
    <div className="panel p-5 mb-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">New Assignment</h4>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}><X className="h-4 w-4" /></Button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Team Member</Label>
          <Select value={memberId} onValueChange={setMemberId}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{members.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label>Client</Label>
          <Select value={clientId} onValueChange={setClientId}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div><Label>Role on Client</Label><Input value={roleOnClient} onChange={e => setRoleOnClient(e.target.value)} placeholder="e.g. Strategy Lead" /></div>
        <div><Label>Allocation % <span className="text-muted-foreground font-normal">(optional)</span></Label><Input type="number" value={allocationPercent} onChange={e => setAllocationPercent(e.target.value)} placeholder="e.g. 40" /></div>
      </div>
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
          <Info className="h-3 w-3" /> Client-Specific Overrides <span className="font-normal">— leave blank to use defaults</span>
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div><Label className="text-xs">Flat Fee Override ($/mo)</Label><Input type="number" value={flatFeeOverride} onChange={e => setFlatFeeOverride(e.target.value)} placeholder="Leave blank for default" /></div>
          <div><Label className="text-xs">Hourly Rate Override ($)</Label><Input type="number" value={hourlyRateOverride} onChange={e => setHourlyRateOverride(e.target.value)} placeholder="Leave blank for default" /></div>
          <div><Label className="text-xs">Revenue Share Override (%)</Label><Input type="number" value={revenueShareOverride} onChange={e => setRevenueShareOverride(e.target.value)} placeholder="e.g. 12 for 12%" /></div>
          <div><Label className="text-xs">Profit Share Override (%)</Label><Input type="number" value={profitShareOverride} onChange={e => setProfitShareOverride(e.target.value)} placeholder="e.g. 25 for 25%" /></div>
        </div>
      </div>
      <div><Label>Notes</Label><Input value={notes} onChange={e => setNotes(e.target.value)} /></div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave}>Save</Button>
      </div>
    </div>
  );
}
