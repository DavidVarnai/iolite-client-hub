import { Client, SERVICE_CHANNEL_LABELS } from '@/types';
import { format } from 'date-fns';

export default function ClientOverview({ client }: { client: Client }) {
  const primaryContact = client.contacts.find(c => c.isPrimary);

  return (
    <div className="p-6 max-w-4xl space-y-6">
      <div className="grid grid-cols-2 gap-6">
        {/* Client info */}
        <div className="panel p-5 space-y-4">
          <h2 className="text-sm font-semibold">Client Information</h2>
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Company</p>
              <p className="font-medium">{client.company}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Industry</p>
              <p>{client.industry}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Internal Owner</p>
              <p>{client.internalOwner}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Contract Period</p>
              <p>{format(new Date(client.contractStart), 'MMM d, yyyy')} — {format(new Date(client.contractEnd), 'MMM d, yyyy')}</p>
            </div>
          </div>
        </div>

        {/* Primary contact */}
        <div className="panel p-5 space-y-4">
          <h2 className="text-sm font-semibold">Primary Contact</h2>
          {primaryContact && (
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Name</p>
                <p className="font-medium">{primaryContact.name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Title</p>
                <p>{primaryContact.title}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-primary">{primaryContact.email}</p>
              </div>
            </div>
          )}
          {client.contacts.length > 1 && (
            <p className="text-xs text-muted-foreground">+{client.contacts.length - 1} additional contacts</p>
          )}
        </div>
      </div>

      {/* Active channels */}
      <div className="panel p-5 space-y-3">
        <h2 className="text-sm font-semibold">Active Channels</h2>
        <div className="flex flex-wrap gap-2">
          {client.activeChannels.map(ch => (
            <span key={ch} className="px-3 py-1.5 bg-muted rounded-md text-xs font-medium">
              {SERVICE_CHANNEL_LABELS[ch]}
            </span>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="panel p-5 space-y-3">
        <h2 className="text-sm font-semibold">Notes</h2>
        <p className="prose-body text-sm">{client.notes}</p>
      </div>

      {/* Integrations */}
      <div className="panel p-5 space-y-3">
        <h2 className="text-sm font-semibold">Integrations</h2>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Slack</p>
            <p>{client.slackChannel || 'Not connected'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Notion</p>
            <p>{client.notionProjectId ? 'Connected' : 'Not connected'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Agency Analytics</p>
            <p>{client.agencyAnalyticsId ? 'Connected' : 'Not connected'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
