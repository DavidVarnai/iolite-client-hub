import { Link } from 'react-router-dom';
import { seedClients } from '@/data/seed';
import { format } from 'date-fns';

const stageClass: Record<string, string> = {
  lead: 'status-lead',
  proposal: 'status-proposal',
  active: 'status-active',
  paused: 'status-paused',
  completed: 'status-completed',
};

export default function Dashboard() {
  const activeClients = seedClients.filter(c => c.stage === 'active');
  const allTasks = seedClients.flatMap(c => c.tasks);
  const overdueTasks = allTasks.filter(t => t.status !== 'done' && new Date(t.dueDate) < new Date());
  const recentMeetings = seedClients
    .flatMap(c => c.meetings.map(m => ({ ...m, clientName: c.name, clientId: c.id })))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
  const unresolvedComments = seedClients.flatMap(c => c.comments.filter(cm => cm.status === 'open'));

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Overview of your client engagements and recent activity.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Active Clients', value: activeClients.length },
          { label: 'Open Tasks', value: allTasks.filter(t => t.status !== 'done').length },
          { label: 'Overdue Items', value: overdueTasks.length },
          { label: 'Unresolved Comments', value: unresolvedComments.length },
        ].map(card => (
          <div key={card.label} className="panel p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{card.label}</p>
            <p className="text-3xl font-semibold mt-2">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Clients */}
        <div className="panel p-5">
          <h2 className="text-sm font-semibold mb-4">Clients</h2>
          <div className="space-y-3">
            {seedClients.map(client => (
              <Link
                key={client.id}
                to={`/clients/${client.id}`}
                className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-muted/50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                    {client.logoInitials}
                  </div>
                  <div>
                    <p className="text-sm font-medium group-hover:text-primary transition-colors">{client.name}</p>
                    <p className="text-xs text-muted-foreground">{client.industry} · {client.internalOwner}</p>
                  </div>
                </div>
                <span className={stageClass[client.stage]}>{client.stage}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Meetings */}
        <div className="panel p-5">
          <h2 className="text-sm font-semibold mb-4">Recent Meetings</h2>
          <div className="space-y-3">
            {recentMeetings.length === 0 && (
              <p className="text-sm text-muted-foreground">No meetings yet.</p>
            )}
            {recentMeetings.map(meeting => (
              <Link
                key={meeting.id}
                to={`/clients/${meeting.clientId}/meetings`}
                className="block py-2 px-3 rounded-md hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{meeting.title}</p>
                  <span className="text-xs text-muted-foreground">{format(new Date(meeting.date), 'MMM d')}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{meeting.clientName} · {meeting.type}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Tasks */}
      <div className="panel p-5">
        <h2 className="text-sm font-semibold mb-4">Open Tasks</h2>
        <div className="space-y-2">
          {allTasks.filter(t => t.status !== 'done').map(task => {
            const client = seedClients.find(c => c.tasks.some(ct => ct.id === task.id));
            const isOverdue = new Date(task.dueDate) < new Date();
            return (
              <div key={task.id} className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${task.status === 'in_progress' ? 'bg-primary' : 'bg-border'}`} />
                  <div>
                    <p className="text-sm">{task.title}</p>
                    <p className="text-xs text-muted-foreground">{client?.name} · {task.owner}</p>
                  </div>
                </div>
                <span className={`text-xs ${isOverdue ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                  {format(new Date(task.dueDate), 'MMM d')}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
