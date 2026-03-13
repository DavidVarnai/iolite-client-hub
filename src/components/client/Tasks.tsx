import { SERVICE_CHANNEL_LABELS, ServiceChannel } from '@/types';
import { format } from 'date-fns';
import { useState } from 'react';
import { useClientContext } from '@/contexts/ClientContext';
import { Plus, Trash2 } from 'lucide-react';

export default function ClientTasks() {
  const { client, updateClient } = useClientContext();
  const [showNewTask, setShowNewTask] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newOwner, setNewOwner] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newChannel, setNewChannel] = useState<ServiceChannel | ''>('');

  const todoTasks = client.tasks.filter(t => t.status === 'todo');
  const inProgressTasks = client.tasks.filter(t => t.status === 'in_progress');
  const doneTasks = client.tasks.filter(t => t.status === 'done');

  const handleAddTask = () => {
    if (!newTitle.trim()) return;
    const task = {
      id: `t-${Date.now()}`,
      title: newTitle.trim(),
      owner: newOwner || 'Unassigned',
      status: 'todo' as const,
      dueDate: newDueDate || new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
      channel: newChannel || undefined,
    };
    updateClient({ ...client, tasks: [...client.tasks, task] });
    setNewTitle(''); setNewOwner(''); setNewDueDate(''); setNewChannel('');
    setShowNewTask(false);
  };

  const cycleStatus = (taskId: string) => {
    const statusOrder: ('todo' | 'in_progress' | 'done')[] = ['todo', 'in_progress', 'done'];
    const updated = client.tasks.map(t => {
      if (t.id !== taskId) return t;
      if (t.status === 'done') return t; // Don't wrap from done back to todo
      const idx = statusOrder.indexOf(t.status);
      return { ...t, status: statusOrder[idx + 1] };
    });
    updateClient({ ...client, tasks: updated });
  };

  const deleteTask = (taskId: string) => {
    updateClient({ ...client, tasks: client.tasks.filter(t => t.id !== taskId) });
  };

  const TaskRow = ({ task }: { task: typeof client.tasks[0] }) => {
    const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'done';
    return (
      <div className="flex items-center justify-between py-2.5 px-3 hover:bg-muted/30 rounded-md transition-colors group">
        <div className="flex items-center gap-3">
          <button onClick={() => cycleStatus(task.id)}
            className={`w-2 h-2 rounded-full flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-primary/30 ${
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
          <button onClick={() => cycleStatus(task.id)}
            className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground capitalize cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors">
            {task.status.replace('_', ' ')}
          </button>
          <button onClick={() => deleteTask(task.id)}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Tasks</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{client.tasks.filter(t => t.status !== 'done').length} open tasks</p>
        </div>
        <button onClick={() => setShowNewTask(!showNewTask)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-md hover:opacity-90 transition-opacity">
          <Plus className="h-3.5 w-3.5" /> New Task
        </button>
      </div>

      {showNewTask && (
        <div className="panel p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Title</label>
              <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Task title" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Owner</label>
              <input type="text" value={newOwner} onChange={e => setNewOwner(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Assignee name" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Due Date</label>
              <input type="date" value={newDueDate} onChange={e => setNewDueDate(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Channel (optional)</label>
              <select value={newChannel} onChange={e => setNewChannel(e.target.value as ServiceChannel | '')}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="">None</option>
                {Object.entries(SERVICE_CHANNEL_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowNewTask(false)} className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground">Cancel</button>
            <button onClick={handleAddTask} disabled={!newTitle.trim()}
              className="px-4 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-md hover:opacity-90 disabled:opacity-40">
              Add Task
            </button>
          </div>
        </div>
      )}

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
