import { Client, SERVICE_CHANNEL_LABELS } from '@/types';
import { format } from 'date-fns';
import { useClientContext } from '@/contexts/ClientContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { repository } from '@/lib/repository';

export default function ClientSettings({ onDeleteClient }: { onDeleteClient: () => void }) {
  const { client, updateClient, onboarding } = useClientContext();
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(client.name);
  const [company, setCompany] = useState(client.company);
  const [industry, setIndustry] = useState(client.industry);
  const [notes, setNotes] = useState(client.notes);

  const handleSave = () => {
    updateClient({ ...client, name, company, industry, notes });
    setEditMode(false);
  };

  const handleDelete = () => {
    if (!confirm(`Are you sure you want to delete ${client.name}? This cannot be undone.`)) return;
    repository.clients.delete(client.id);
    repository.onboarding.delete(client.id);
    onDeleteClient();
  };

  return (
    <div className="p-6 max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Settings</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Client configuration, contacts, and integration mappings.</p>
        </div>
        <div className="flex items-center gap-2">
          {editMode ? (
            <>
              <button onClick={() => setEditMode(false)} className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground">Cancel</button>
              <button onClick={handleSave} className="px-4 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-md hover:opacity-90">Save</button>
            </>
          ) : (
            <button onClick={() => setEditMode(true)} className="px-4 py-1.5 bg-muted text-xs font-medium rounded-md hover:bg-muted/80">Edit</button>
          )}
        </div>
      </div>

      <div className="panel p-5 space-y-4">
        <h3 className="text-sm font-semibold">General</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <label className="text-xs text-muted-foreground">Client Name</label>
            {editMode ? (
              <input type="text" value={name} onChange={e => setName(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm mt-0.5 focus:outline-none focus:ring-2 focus:ring-ring" />
            ) : (
              <p className="font-medium mt-0.5">{client.name}</p>
            )}
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Company</label>
            {editMode ? (
              <input type="text" value={company} onChange={e => setCompany(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm mt-0.5 focus:outline-none focus:ring-2 focus:ring-ring" />
            ) : (
              <p className="mt-0.5">{client.company}</p>
            )}
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Industry</label>
            {editMode ? (
              <input type="text" value={industry} onChange={e => setIndustry(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm mt-0.5 focus:outline-none focus:ring-2 focus:ring-ring" />
            ) : (
              <p className="mt-0.5">{client.industry}</p>
            )}
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
        {editMode && (
          <div>
            <label className="text-xs text-muted-foreground">Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm mt-0.5 focus:outline-none focus:ring-2 focus:ring-ring" rows={3} />
          </div>
        )}
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

      {/* Danger zone */}
      <div className="panel p-5 border-destructive/30 space-y-4">
        <h3 className="text-sm font-semibold text-destructive">Danger Zone</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm">Delete this client</p>
            <p className="text-xs text-muted-foreground">Permanently remove all data for {client.name}.</p>
          </div>
          <button onClick={handleDelete}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-destructive text-destructive-foreground text-xs font-medium rounded-md hover:opacity-90 transition-opacity">
            <Trash2 className="h-3.5 w-3.5" /> Delete Client
          </button>
        </div>
      </div>
    </div>
  );
}
