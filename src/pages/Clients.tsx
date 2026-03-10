import { Link } from 'react-router-dom';
import { seedClients } from '@/data/seed';

const stageClass: Record<string, string> = {
  lead: 'status-lead',
  proposal: 'status-proposal',
  active: 'status-active',
  paused: 'status-paused',
  completed: 'status-completed',
};

export default function Clients() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Clients</h1>
          <p className="text-sm text-muted-foreground mt-1">All client engagements managed by Iolite Ventures.</p>
        </div>
        <button className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:opacity-90 transition-opacity">
          New Client
        </button>
      </div>

      <div className="panel divide-y divide-border">
        {seedClients.map(client => (
          <Link
            key={client.id}
            to={`/clients/${client.id}`}
            className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors first:rounded-t-lg last:rounded-b-lg"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                {client.logoInitials}
              </div>
              <div>
                <p className="text-sm font-medium">{client.name}</p>
                <p className="text-xs text-muted-foreground">{client.industry} · {client.internalOwner} · {client.activeChannels.length} channels</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right mr-4">
                <p className="text-xs text-muted-foreground">{client.tasks.filter(t => t.status !== 'done').length} open tasks</p>
                <p className="text-xs text-muted-foreground">{client.comments.filter(c => c.status === 'open').length} unresolved</p>
              </div>
              <span className={stageClass[client.stage]}>{client.stage}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
