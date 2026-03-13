import { Comment } from '@/types';
import { format } from 'date-fns';
import { useState } from 'react';
import { useClientContext } from '@/contexts/ClientContext';
import { Plus } from 'lucide-react';
import { currentUser } from '@/data/seed';

function CommentCard({ comment, onToggleStatus }: { comment: Comment; onToggleStatus: (id: string) => void }) {
  return (
    <div className="py-3 space-y-1.5">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">{comment.author.name}</span>
        {comment.isInternal && <span className="internal-indicator">Internal</span>}
        <button onClick={() => onToggleStatus(comment.id)}
          className={`text-[10px] px-1.5 py-0.5 rounded-full cursor-pointer hover:opacity-80 ${
            comment.status === 'open' ? 'bg-primary/10 text-primary' :
            comment.status === 'in_review' ? 'bg-amber/10 text-amber' :
            'bg-muted text-muted-foreground'
          }`}>
          {comment.status}
        </button>
      </div>
      <p className="prose-body text-sm">{comment.content}</p>
      <p className="text-[11px] text-muted-foreground">
        {format(new Date(comment.createdAt), 'MMM d, yyyy · h:mm a')} · {comment.contextType}
      </p>
    </div>
  );
}

export default function ClientComments() {
  const { client, updateClient } = useClientContext();
  const [showNewComment, setShowNewComment] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [newIsInternal, setNewIsInternal] = useState(true);
  const [newContextType, setNewContextType] = useState<Comment['contextType']>('strategy');

  const openComments = client.comments.filter(c => c.status === 'open');
  const resolvedComments = client.comments.filter(c => c.status === 'resolved');

  const handleAddComment = () => {
    if (!newContent.trim()) return;
    const comment: Comment = {
      id: `cm-${Date.now()}`,
      clientId: client.id,
      author: currentUser,
      content: newContent.trim(),
      createdAt: new Date().toISOString(),
      status: 'open',
      isInternal: newIsInternal,
      contextType: newContextType,
      contextId: '',
    };
    updateClient({ ...client, comments: [...client.comments, comment] });
    setNewContent('');
    setShowNewComment(false);
  };

  const toggleStatus = (commentId: string) => {
    const updated = client.comments.map(c => {
      if (c.id !== commentId) return c;
      return { ...c, status: c.status === 'open' ? 'resolved' as const : 'open' as const };
    });
    updateClient({ ...client, comments: updated });
  };

  return (
    <div className="p-6 max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Comments</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{openComments.length} open · {resolvedComments.length} resolved</p>
        </div>
        <button onClick={() => setShowNewComment(!showNewComment)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-md hover:opacity-90 transition-opacity">
          <Plus className="h-3.5 w-3.5" /> New Comment
        </button>
      </div>

      {showNewComment && (
        <div className="panel p-4 space-y-3">
          <textarea value={newContent} onChange={e => setNewContent(e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            rows={3} placeholder="Write a comment..." />
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-xs">
              <input type="checkbox" checked={newIsInternal} onChange={e => setNewIsInternal(e.target.checked)}
                className="rounded border-border" />
              Internal only
            </label>
            <select value={newContextType} onChange={e => setNewContextType(e.target.value as Comment['contextType'])}
              className="rounded-md border bg-background px-2 py-1 text-xs">
              <option value="strategy">Strategy</option>
              <option value="meeting">Meeting</option>
              <option value="performance">Performance</option>
              <option value="document">Document</option>
              <option value="task">Task</option>
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowNewComment(false)} className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground">Cancel</button>
            <button onClick={handleAddComment} disabled={!newContent.trim()}
              className="px-4 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-md hover:opacity-90 disabled:opacity-40">
              Add Comment
            </button>
          </div>
        </div>
      )}

      {openComments.length > 0 && (
        <div className="panel p-5">
          <h3 className="text-sm font-semibold mb-3">Open</h3>
          <div className="divide-y divide-border">
            {openComments.map(c => <CommentCard key={c.id} comment={c} onToggleStatus={toggleStatus} />)}
          </div>
        </div>
      )}

      {resolvedComments.length > 0 && (
        <div className="panel p-5">
          <h3 className="text-sm font-semibold mb-3">Resolved</h3>
          <div className="divide-y divide-border">
            {resolvedComments.map(c => <CommentCard key={c.id} comment={c} onToggleStatus={toggleStatus} />)}
          </div>
        </div>
      )}
    </div>
  );
}
