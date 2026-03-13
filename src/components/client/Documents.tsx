import { format } from 'date-fns';
import { useClientContext } from '@/contexts/ClientContext';

const typeLabels: Record<string, string> = {
  proposal: 'Proposal',
  strategy: 'Strategy',
  recap: 'Meeting Recap',
  reference: 'Reference',
  other: 'Other',
};

export default function ClientDocuments() {
  const { client } = useClientContext();

  return (
    <div className="p-6 max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Documents</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Proposals, strategy docs, recaps, and reference materials.</p>
        </div>
        <button className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:opacity-90 transition-opacity">
          Upload Document
        </button>
      </div>

      {client.documents.length === 0 ? (
        <div className="panel p-8 text-center">
          <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>
        </div>
      ) : (
        <div className="panel divide-y divide-border">
          {client.documents.map(doc => (
            <div key={doc.id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors cursor-pointer">
              <div>
                <p className="text-sm font-medium">{doc.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {typeLabels[doc.type]} · {doc.author} · Updated {format(new Date(doc.updatedAt), 'MMM d, yyyy')}
                </p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground uppercase">
                {doc.type}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
