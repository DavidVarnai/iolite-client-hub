/**
 * TeamMembersTable — displays team members with expandable compensation panels.
 */
import { Fragment, useState } from 'react';
import { Plus, Pencil, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { repository } from '@/lib/repository';
import type { TeamMember, CompensationComponent } from '@/domains/economics';
import { WORKER_TYPE_LABELS, COMP_TYPE_LABELS } from '@/domains/economics';
import { BadgeList } from '@/components/ui/common';
import TeamMemberForm from './TeamMemberForm';
import CompensationPanel from './CompensationPanel';

export default function TeamMembersTable() {
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

  const getCompBadges = (memberId: string) => {
    const comps = compensation.filter(c => c.teamMemberId === memberId);
    return comps.map(c => ({ key: c.id, label: COMP_TYPE_LABELS[c.componentType] }));
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
              <Fragment key={m.id}>
                <tr className="border-b last:border-b-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <button onClick={() => setExpandedId(expandedId === m.id ? null : m.id)}>
                      {expandedId === m.id ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                    </button>
                  </td>
                  <td className="px-4 py-3 font-medium">{m.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{m.role}</td>
                  <td className="px-4 py-3">
                    <BadgeList items={[{ key: m.workerType, label: WORKER_TYPE_LABELS[m.workerType] }]} />
                  </td>
                  <td className="px-4 py-3">
                    <BadgeList
                      items={[{
                        key: m.status,
                        label: m.status === 'active' ? 'Active' : 'Inactive',
                        variant: m.status === 'active' ? 'default' : 'secondary',
                      }]}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <BadgeList items={getCompBadges(m.id)} emptyText="No compensation defined" />
                  </td>
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
                  <tr>
                    <td colSpan={7} className="px-8 py-4 bg-muted/20">
                      <CompensationPanel memberId={m.id} compensation={compensation.filter(c => c.teamMemberId === m.id)} onChanged={refreshMembers} />
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
