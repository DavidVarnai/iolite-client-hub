import { Client, Comment } from '@/types';
import { format } from 'date-fns';

function CommentCard({ comment }: { comment: Comment }) {
  return (
    <div className="py-3 space-y-1.5">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">{comment.author.name}</span>
        {comment.isInternal && <span className="internal-indicator">Internal</span>}
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
          comment.status === 'open' ? 'bg-primary/10 text-primary' :
          comment.status === 'in_review' ? 'bg-amber/10 text-amber' :
          'bg-muted text-muted-foreground'
        }`}>
          {comment.status}
        </span>
      </div>
      <p className="prose-body text-sm">{comment.content}</p>
      <p className="text-[11px] text-muted-foreground">
        {format(new Date(comment.createdAt), 'MMM d, yyyy · h:mm a')} · {comment.contextType}
      </p>
    </div>
  );
}

export default function ClientComments({ client }: { client: Client }) {
  const openComments = client.comments.filter(c => c.status === 'open');
  const resolvedComments = client.comments.filter(c => c.status === 'resolved');

  return (
    <div className="p-6 max-w-4xl space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Comments</h2>
        <p className="text-sm text-muted-foreground mt-0.5">{openComments.length} open · {resolvedComments.length} resolved</p>
      </div>

      {openComments.length > 0 && (
        <div className="panel p-5">
          <h3 className="text-sm font-semibold mb-3">Open</h3>
          <div className="divide-y divide-border">
            {openComments.map(c => <CommentCard key={c.id} comment={c} />)}
          </div>
        </div>
      )}

      {resolvedComments.length > 0 && (
        <div className="panel p-5">
          <h3 className="text-sm font-semibold mb-3">Resolved</h3>
          <div className="divide-y divide-border">
            {resolvedComments.map(c => <CommentCard key={c.id} comment={c} />)}
          </div>
        </div>
      )}
    </div>
  );
}
