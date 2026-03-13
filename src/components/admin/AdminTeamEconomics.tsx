/**
 * Admin Team & Economics — manages team members, compensation, assignments, defaults.
 */
import { useState, useMemo } from 'react';
import { Users, Link2, Settings, Plus, Pencil, Trash2, X, ChevronDown, ChevronRight, CircleDot, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { repository } from '@/lib/repository';
import type {
  TeamMember,
  CompensationComponent,
  ClientTeamAssignment,
  EconomicsDefaults,
  WorkerType,
  TeamMemberStatus,
  CompensationComponentType,
  RevenueCategory,
} from '@/types/economics';
import {
  WORKER_TYPE_LABELS,
  COMP_TYPE_LABELS,
  REVENUE_CATEGORY_LABELS,
} from '@/types/economics';

const SUB_TABS = [
  { key: 'members', label: 'Team Members', icon: Users },
  { key: 'assignments', label: 'Client Assignments', icon: Link2 },
  { key: 'defaults', label: 'Economics Defaults', icon: Settings },
] as const;

type SubTab = (typeof SUB_TABS)[number]['key'];

export default function AdminTeamEconomics() {
  const [subTab, setSubTab] = useState<SubTab>('members');

  return (
    <div>
      <h2 className="text-xl font-semibold tracking-tight mb-1">Team & Economics</h2>
      <p className="text-sm text-muted-foreground mb-6">Manage team cost modeling, client assignments, and economics defaults.</p>

      <div className="flex gap-2 mb-6">
        {SUB_TABS.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setSubTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm transition-colors ${
                subTab === t.key
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {subTab === 'members' && <TeamMembersSection />}
      {subTab === 'assignments' && <AssignmentsSection />}
      {subTab === 'defaults' && <DefaultsSection />}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   TEAM MEMBERS SECTION
   ═══════════════════════════════════════════════ */

function TeamMembersSection() {
  const [members, setMembers] = useState<TeamMember[]>(() => repository.teamMembers.getAll());
  const [compensation, setCompensation] = useState<CompensationComponent[]>(() => repository.compensation.getAll());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const refreshMembers = () => { setMembers(repository.teamMembers.getAll()); setCompensation(repository.compensation.getAll()); };

  const handleDelete = (id: string) => {
    repository.teamMembers.delete(id);
    compensation.filter(c => c.teamMemberId === id).forEach(c => repository.compensation.delete(c.id));
    refreshMembers();
    toast.success('Team member removed');
  };

  const getCompSummary = (memberId: string) => {
    const comps = compensation.filter(c => c.teamMemberId === memberId);
    if (comps.length === 0) return <span className="italic text-muted-foreground">No compensation defined</span>;
    return (
      <div className="flex flex-wrap gap-1.5">
        {comps.map(c => (
          <Badge key={c.id} variant="outline" className="text-xs font-normal">
            {COMP_TYPE_LABELS[c.componentType]}
          </Badge>
        ))}
      </div>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-medium">Team Members</h3>
        <Button size="sm" onClick={() => { setShowForm(true); setEditingId(null); }}>
          <Plus className="h-4 w-4 mr-1" /> Add Member
        </Button>
      </div>

      {showForm && (
        <TeamMemberForm
          memberId={editingId}
          onClose={() => { setShowForm(false); setEditingId(null); }}
          onSaved={refreshMembers}
        />
      )}

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 border-b">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground w-8"></th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Role</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Type</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Compensation</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map(m => (
              <>
                <tr key={m.id} className="border-b last:border-b-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <button onClick={() => setExpandedId(expandedId === m.id ? null : m.id)}>
                      {expandedId === m.id ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                    </button>
                  </td>
                  <td className="px-4 py-3 font-medium">{m.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{m.role}</td>
                  <td className="px-4 py-3"><Badge variant="outline">{WORKER_TYPE_LABELS[m.workerType]}</Badge></td>
                  <td className="px-4 py-3">
                    <Badge variant={m.status === 'active' ? 'default' : 'secondary'}>
                      {m.status === 'active' ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">{getCompSummary(m.id)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingId(m.id); setShowForm(true); }}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(m.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
                {expandedId === m.id && (
                  <tr key={`${m.id}-comp`}>
                    <td colSpan={7} className="px-8 py-4 bg-muted/20">
                      <CompensationPanel memberId={m.id} compensation={compensation.filter(c => c.teamMemberId === m.id)} onChanged={refreshMembers} />
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Team Member Form ── */

function TeamMemberForm({ memberId, onClose, onSaved }: { memberId: string | null; onClose: () => void; onSaved: () => void }) {
  const existing = memberId ? repository.teamMembers.getById(memberId) : null;
  const [name, setName] = useState(existing?.name || '');
  const [role, setRole] = useState(existing?.role || '');
  const [workerType, setWorkerType] = useState<WorkerType>(existing?.workerType || 'full_time');
  const [status, setStatus] = useState<TeamMemberStatus>(existing?.status || 'active');
  const [notes, setNotes] = useState(existing?.notes || '');

  const handleSave = () => {
    if (!name.trim()) { toast.error('Name is required'); return; }
    const member: TeamMember = {
      id: memberId || `tm_${Date.now()}`,
      name: name.trim(),
      role: role.trim(),
      workerType,
      status,
      notes,
    };
    repository.teamMembers.save(member);
    toast.success(memberId ? 'Team member updated' : 'Team member created');
    onSaved();
    onClose();
  };

  return (
    <div className="panel p-5 mb-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">{memberId ? 'Edit' : 'New'} Team Member</h4>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}><X className="h-4 w-4" /></Button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Name</Label><Input value={name} onChange={e => setName(e.target.value)} /></div>
        <div><Label>Role / Title</Label><Input value={role} onChange={e => setRole(e.target.value)} /></div>
        <div>
          <Label>Worker Type</Label>
          <Select value={workerType} onValueChange={v => setWorkerType(v as WorkerType)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(WORKER_TYPE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Status</Label>
          <Select value={status} onValueChange={v => setStatus(v as TeamMemberStatus)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div><Label>Notes</Label><Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} /></div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave}>Save</Button>
      </div>
    </div>
  );
}

/* ── Compensation Panel (expandable per member) ── */

function CompensationPanel({ memberId, compensation, onChanged }: { memberId: string; compensation: CompensationComponent[]; onChanged: () => void }) {
  const [showAdd, setShowAdd] = useState(false);

  const handleDelete = (id: string) => {
    repository.compensation.delete(id);
    onChanged();
    toast.success('Compensation component removed');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Compensation Components</p>
        <Button size="sm" variant="outline" onClick={() => setShowAdd(true)}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Add Component
        </Button>
      </div>

      {showAdd && (
        <CompensationForm memberId={memberId} onClose={() => setShowAdd(false)} onSaved={() => { onChanged(); setShowAdd(false); }} />
      )}

      {compensation.length === 0 && !showAdd && (
        <p className="text-xs text-muted-foreground italic">No compensation components defined.</p>
      )}

      <div className="space-y-2">
        {compensation.map(c => (
          <CompensationCard key={c.id} comp={c} onDelete={() => handleDelete(c.id)} />
        ))}
      </div>
    </div>
  );
}

/* ── Compensation Card (structured detail view) ── */

function CompensationCard({ comp, onDelete }: { comp: CompensationComponent; onDelete: () => void }) {
  const isShare = comp.componentType === 'revenue_share' || comp.componentType === 'profit_share';
  const isThreshold = comp.componentType === 'threshold_share';

  return (
    <div className="bg-background rounded-md border px-4 py-3 text-sm">
      <div className="flex items-start justify-between">
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-2">
            <CircleDot className="h-3.5 w-3.5 text-primary" />
            <span className="font-medium">{COMP_TYPE_LABELS[comp.componentType]}</span>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              {comp.isDefault ? 'Default' : 'Override'}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-1 ml-5.5 text-xs">
            {comp.componentType === 'salary_allocation' && (
              <DetailRow label="Monthly Cost" value={`$${comp.amount.toLocaleString()}`} />
            )}
            {comp.componentType === 'flat_client_fee' && (
              <DetailRow label="Default Fee" value={`$${comp.amount.toLocaleString()}/mo`} />
            )}
            {comp.componentType === 'hourly' && (
              <DetailRow label="Hourly Rate" value={`$${comp.amount}/hr`} />
            )}
            {isShare && (
              <>
                <DetailRow label="Share %" value={`${((comp.sharePercent || 0) * 100).toFixed(0)}%`} />
                <DetailRow
                  label={comp.componentType === 'revenue_share' ? 'Revenue Category' : 'Profit Category'}
                  value={comp.appliesToCategory ? REVENUE_CATEGORY_LABELS[comp.appliesToCategory] : 'Not set'}
                />
                {comp.capAmount != null && (
                  <DetailRow label="Cap" value={`$${comp.capAmount.toLocaleString()}`} />
                )}
              </>
            )}
            {isThreshold && (
              <>
                <DetailRow label="Share %" value={`${((comp.sharePercent || 0) * 100).toFixed(0)}%`} />
                <DetailRow label="Revenue Category" value={comp.appliesToCategory ? REVENUE_CATEGORY_LABELS[comp.appliesToCategory] : 'Not set'} />
                <DetailRow label="Base Threshold" value={`$${(comp.thresholdAmount || 0).toLocaleString()}`} />
                {comp.capAmount != null && (
                  <DetailRow label="Cap" value={`$${comp.capAmount.toLocaleString()}`} />
                )}
              </>
            )}
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive shrink-0" onClick={onDelete}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <>
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </>
  );
}

/* ── Compensation Form ── */

function CompensationForm({ memberId, onClose, onSaved }: { memberId: string; onClose: () => void; onSaved: () => void }) {
  const [compType, setCompType] = useState<CompensationComponentType>('salary_allocation');
  const [amount, setAmount] = useState(0);
  const [sharePercent, setSharePercent] = useState(10);
  const [category, setCategory] = useState<RevenueCategory>('paid_media_management');
  const [capAmount, setCapAmount] = useState<string>('');

  const isShareType = compType === 'revenue_share' || compType === 'profit_share';

  const handleSave = () => {
    const comp: CompensationComponent = {
      id: `cc_${Date.now()}`,
      teamMemberId: memberId,
      componentType: compType,
      amount: isShareType ? 0 : amount,
      sharePercent: isShareType ? sharePercent / 100 : undefined,
      appliesToCategory: isShareType ? category : undefined,
      capAmount: capAmount ? Number(capAmount) : undefined,
      isDefault: true,
    };
    repository.compensation.save(comp);
    toast.success('Compensation component added');
    onSaved();
  };

  return (
    <div className="bg-background border rounded-md p-4 mb-3 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Component Type</Label>
          <Select value={compType} onValueChange={v => setCompType(v as CompensationComponentType)}>
            <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(COMP_TYPE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        {!isShareType && (
          <div>
            <Label className="text-xs">
              {compType === 'hourly' ? 'Hourly Rate ($)' : compType === 'flat_client_fee' ? 'Default Monthly Fee ($)' : 'Monthly Salary ($)'}
            </Label>
            <Input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} className="h-9" />
          </div>
        )}
        {isShareType && (
          <>
            <div>
              <Label className="text-xs">Share Percent (%)</Label>
              <Input type="number" value={sharePercent} onChange={e => setSharePercent(Number(e.target.value))} className="h-9" />
            </div>
            <div>
              <Label className="text-xs">{compType === 'revenue_share' ? 'Revenue Category' : 'Profit Category'}</Label>
              <Select value={category} onValueChange={v => setCategory(v as RevenueCategory)}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(REVENUE_CATEGORY_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Cap Amount (optional)</Label>
              <Input type="number" value={capAmount} onChange={e => setCapAmount(e.target.value)} placeholder="No cap" className="h-9" />
            </div>
          </>
        )}
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
        <Button size="sm" onClick={handleSave}>Add Component</Button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   ASSIGNMENTS SECTION
   ═══════════════════════════════════════════════ */

function AssignmentsSection() {
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

  // Group by member
  const grouped = useMemo(() => {
    const map = new Map<string, ClientTeamAssignment[]>();
    for (const a of assignments) {
      if (!map.has(a.teamMemberId)) map.set(a.teamMemberId, []);
      map.get(a.teamMemberId)!.push(a);
    }
    return map;
  }, [assignments]);

  /** Describe what the assignment overrides vs default comp */
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
    if (a.flatFeeOverride != null) {
      badges.push({
        label: `$${a.flatFeeOverride.toLocaleString()}/mo flat`,
        tooltip: `Client-specific flat fee override`,
      });
    }
    if (a.hourlyRateOverride != null) {
      badges.push({
        label: `$${a.hourlyRateOverride}/hr`,
        tooltip: `Client-specific hourly rate override`,
      });
    }
    if (a.revenueShareOverride != null) {
      badges.push({
        label: `${(a.revenueShareOverride * 100).toFixed(0)}% rev share`,
        tooltip: `Client-specific revenue share override`,
      });
    }
    if (a.profitShareOverride != null) {
      badges.push({
        label: `${(a.profitShareOverride * 100).toFixed(0)}% profit share`,
        tooltip: `Client-specific profit share override`,
      });
    }

    // If no overrides, show default comp types
    if (badges.length === 0) {
      memberComps.forEach(c => {
        badges.push({ label: COMP_TYPE_LABELS[c.componentType], tooltip: 'Using default compensation' });
      });
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
                                <span>
                                  <Badge variant="outline" className="text-xs cursor-default">{d.label}</Badge>
                                </span>
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

/* ═══════════════════════════════════════════════
   DEFAULTS SECTION
   ═══════════════════════════════════════════════ */

function DefaultsSection() {
  const [defaults, setDefaults] = useState<EconomicsDefaults>(() => repository.economicsDefaults.get());

  const handleSave = () => {
    repository.economicsDefaults.save(defaults);
    toast.success('Economics defaults saved');
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h3 className="text-base font-medium mb-4">Economics Defaults</h3>
        <p className="text-xs text-muted-foreground mb-4">Global settings for margin targets and economic modeling.</p>
      </div>

      <div className="panel p-5 space-y-4">
        <h4 className="text-sm font-medium">General</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Default Currency</Label>
            <Input value={defaults.currency} onChange={e => setDefaults(d => ({ ...d, currency: e.target.value }))} />
          </div>
          <div>
            <Label>Margin Target (%)</Label>
            <Input type="number" value={defaults.marginTarget} onChange={e => setDefaults(d => ({ ...d, marginTarget: Number(e.target.value) }))} />
          </div>
        </div>
      </div>

      <div className="panel p-5 space-y-3">
        <h4 className="text-sm font-medium">Active Revenue Categories</h4>
        <p className="text-xs text-muted-foreground">Service categories used for revenue tracking and share-based compensation.</p>
        <div className="flex flex-wrap gap-2">
          {defaults.defaultRevenueCategories.map(cat => (
            <Badge key={cat} variant="outline" className="text-xs">
              {REVENUE_CATEGORY_LABELS[cat]}
            </Badge>
          ))}
        </div>
      </div>

      <div className="panel p-5 space-y-3">
        <h4 className="text-sm font-medium">Compensation Types</h4>
        <p className="text-xs text-muted-foreground">Supported compensation component types for team cost modeling.</p>
        <div className="flex flex-wrap gap-2">
          {defaults.defaultCompensationCategories.map(comp => (
            <Badge key={comp} variant="outline" className="text-xs">
              {COMP_TYPE_LABELS[comp]}
            </Badge>
          ))}
        </div>
      </div>

      <Button onClick={handleSave}>Save Defaults</Button>
    </div>
  );
}
