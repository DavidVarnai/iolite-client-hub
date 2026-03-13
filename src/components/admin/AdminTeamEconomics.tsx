/**
 * Admin Team & Economics — orchestrates team members, compensation, assignments, defaults.
 */
import { useState } from 'react';
import { Users, Link2, Settings } from 'lucide-react';
import TeamMembersTable from './teamEconomics/TeamMembersTable';
import ClientAssignmentsPanel from './teamEconomics/ClientAssignmentsPanel';
import EconomicsDefaultsPanel from './teamEconomics/EconomicsDefaultsPanel';

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

      {subTab === 'members' && <TeamMembersTable />}
      {subTab === 'assignments' && <ClientAssignmentsPanel />}
      {subTab === 'defaults' && <EconomicsDefaultsPanel />}
    </div>
  );
}
