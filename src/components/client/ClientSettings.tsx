import { Client, SERVICE_CHANNEL_LABELS } from '@/types';
import { format } from 'date-fns';

export default function ClientSettings({ client }: { client: Client }) {
  return (
    <div className="p-6 max-w-4xl space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Settings</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Client configuration, contacts, and integration mappings.</p>
      </div>

      <div className="panel p-5 space-y-4">
        <h3 className="text-sm font-semibold">General</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <label className="text-xs text-muted-foreground">Client Name</label>
            <p className="font-medium mt-0.5">{client.name}</p>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Company</label>
            <p className="mt-0.5">{client.company}</p>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Industry</label>
            <p className="mt-0.5">{client.industry}</p>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Engagement Stage</label>
            <p className="mt-0.5 capitalize">{client.stage}</p>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Contract Start</label>
            <p className="mt-0.5">{format(new Date(client.contractStart), 'MMM d, yyyy')}</p>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Contract End</label>
            <p className="mt-0.5">{format(new Date(client.contractEnd), 'MMM d, yyyy')}</p>
          </div>
        </div>
      </div>

      <div className="panel p-5 space-y-4">
        <h3 className="text-sm font-semibold">Contacts</h3>
        <div className="divide-y divide-border">
          {client.contacts.map(contact => (
            <div key={contact.id} className="py-3 flex items-center justify-between">
              <div className="text-sm">
                <p className="font-medium">{contact.name}</p>
                <p className="text-xs text-muted-foreground">{contact.title} · {contact.email}</p>
              </div>
              {contact.isPrimary && <span className="text-[10px] px-2 py-0.5 rounded bg-primary/10 text-primary">Primary</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="panel p-5 space-y-4">
        <h3 className="text-sm font-semibold">Active Services</h3>
        <div className="flex flex-wrap gap-2">
          {client.activeChannels.map(ch => (
            <span key={ch} className="px-3 py-1.5 bg-muted rounded-md text-xs font-medium">
              {SERVICE_CHANNEL_LABELS[ch]}
            </span>
          ))}
        </div>
      </div>

      <div className="panel p-5 space-y-4">
        <h3 className="text-sm font-semibold">Integrations</h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium">Slack</p>
              <p className="text-xs text-muted-foreground">{client.slackChannel || 'No channel mapped'}</p>
            </div>
            <button className="text-xs text-primary font-medium">Configure</button>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium">Notion</p>
              <p className="text-xs text-muted-foreground">{client.notionProjectId || 'Not connected'}</p>
            </div>
            <button className="text-xs text-primary font-medium">Configure</button>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium">Agency Analytics</p>
              <p className="text-xs text-muted-foreground">{client.agencyAnalyticsId || 'Not connected'}</p>
            </div>
            <button className="text-xs text-primary font-medium">Configure</button>
          </div>
        </div>
      </div>
    </div>
  );
}
