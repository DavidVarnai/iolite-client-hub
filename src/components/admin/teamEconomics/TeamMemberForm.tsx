/**
 * TeamMemberForm — create/edit a team member.
 */
import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { repository } from '@/lib/repository';
import type { TeamMember, WorkerType, TeamMemberStatus } from '@/domains/economics';
import { WORKER_TYPE_LABELS } from '@/domains/economics';
import { FormRow } from '@/components/ui/common';

interface Props {
  memberId: string | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function TeamMemberForm({ memberId, onClose, onSaved }: Props) {
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
        <FormRow label="Name">
          <Input value={name} onChange={e => setName(e.target.value)} />
        </FormRow>
        <FormRow label="Role / Title">
          <Input value={role} onChange={e => setRole(e.target.value)} />
        </FormRow>
        <FormRow label="Worker Type">
          <Select value={workerType} onValueChange={v => setWorkerType(v as WorkerType)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(WORKER_TYPE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
        </FormRow>
        <FormRow label="Status">
          <Select value={status} onValueChange={v => setStatus(v as TeamMemberStatus)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </FormRow>
      </div>
      <FormRow label="Notes">
        <Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} />
      </FormRow>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave}>Save</Button>
      </div>
    </div>
  );
}
