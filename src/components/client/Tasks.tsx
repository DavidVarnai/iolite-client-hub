import { Client, SERVICE_CHANNEL_LABELS } from '@/types';
import { format } from 'date-fns';

export default function ClientTasks({ client }: { client: Client }) {
  const todoTasks = client.tasks.filter(t => t.status === 'todo');
  const inProgressTasks = client.tasks.filter(t => t.status === 'in_progress');
  const doneTasks = client.tasks.filter(t => t.status === 'done');

  const TaskRow = ({ task }: { task: typeof client.tasks[0] }) => {
    const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'done';
    return (
      <div className="flex items-center justify-between py-2.5 px-3 hover:bg-muted/30 rounded-md transition-colors">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
            task.status === 'in_progress' ? 'bg-primary' : task.status === 'done' ? 'bg-emerald-500' : 'bg-border'
          }`} />
          <div>
            <p className="text-sm">{task.title}</p>
            <p className="text-xs text-muted-foreground">
              {task.owner}
              {task.channel && ` · ${SERVICE_CHANNEL_LABELS[task.channel]}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs ${isOverdue ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
            {format(new Date(task.dueDate), 'MMM d')}
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground capitalize">
            {task.status.replace('_', ' ')}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Tasks</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Execution handoff and Notion sync status.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Notion sync:</span>
          <span className="text-xs text-primary font-medium">{client.notionProjectId ? 'Connected' : 'Not connected'}</span>
        </div>
      </div>

      {inProgressTasks.length > 0 && (
        <div className="panel p-4">
          <h3 className="text-sm font-semibold mb-2 px-3">In Progress</h3>
          {inProgressTasks.map(t => <TaskRow key={t.id} task={t} />)}
        </div>
      )}

      {todoTasks.length > 0 && (
        <div className="panel p-4">
          <h3 className="text-sm font-semibold mb-2 px-3">To Do</h3>
          {todoTasks.map(t => <TaskRow key={t.id} task={t} />)}
        </div>
      )}

      {doneTasks.length > 0 && (
        <div className="panel p-4">
          <h3 className="text-sm font-semibold mb-2 px-3">Done</h3>
          {doneTasks.map(t => <TaskRow key={t.id} task={t} />)}
        </div>
      )}
    </div>
  );
}
