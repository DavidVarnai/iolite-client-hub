import { Link, useNavigate } from 'react-router-dom';
import { getClients, addClient } from '@/data/seed';
import { getOnboardingForClient } from '@/data/onboardingSeed';
import { LIFECYCLE_STAGES } from '@/types/onboarding';
import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { Client } from '@/types';

const stageClass: Record<string, string> = {
  lead: 'status-lead',
  proposal: 'status-proposal',
  active: 'status-active',
  paused: 'status-paused',
  completed: 'status-completed',
};

function NewClientModal({ onClose, onCreate }: { onClose: () => void; onCreate: (client: Partial<Client>) => void }) {
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [website, setWebsite] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [industry, setIndustry] = useState('');
  const [businessModel, setBusinessModel] = useState('other');
  const [growthGoal, setGrowthGoal] = useState('revenue_growth');

  const handleSubmit = () => {
    if (!name.trim() || !company.trim()) return;
    onCreate({
      name: name.trim(),
      company: company.trim(),
      industry: industry || 'General',
      contacts: contactName ? [{ id: `ct-${Date.now()}`, name: contactName, email: contactEmail, title: '', isPrimary: true }] : [],
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-background border rounded-xl shadow-lg w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-base font-semibold">New Client</h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-md transition-colors">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Client Name *</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Company Name *</label>
              <input type="text" value={company} onChange={(e) => setCompany(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Website</label>
              <input type="text" value={website} onChange={(e) => setWebsite(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Industry</label>
              <input type="text" value={industry} onChange={(e) => setIndustry(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Primary Contact Name</label>
              <input type="text" value={contactName} onChange={(e) => setContactName(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Primary Contact Email</label>
              <input type="text" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Business Model</label>
              <select value={businessModel} onChange={(e) => setBusinessModel(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="ecommerce">Ecommerce</option>
                <option value="lead_generation">Lead Generation</option>
                <option value="hybrid">Hybrid</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Primary Growth Goal</label>
              <select value={growthGoal} onChange={(e) => setGrowthGoal(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="revenue_growth">Revenue Growth</option>
                <option value="lead_volume">Lead Volume</option>
                <option value="market_expansion">Market Expansion</option>
                <option value="brand_awareness">Brand Awareness</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t">
          <button onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-md bg-muted text-muted-foreground hover:text-foreground transition-colors">
            Cancel
          </button>
          <button onClick={handleSubmit}
            disabled={!name.trim() || !company.trim()}
            className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed">
            Create Client
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Clients() {
  const navigate = useNavigate();
  const [clients, setClients] = useState(() => getClients());
  const [showNewClient, setShowNewClient] = useState(false);

  const handleCreate = (data: Partial<Client>) => {
    const newId = `c-${Date.now()}`;
    const initials = (data.name || 'NC').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    const newClient: Client = {
      id: newId,
      name: data.name || 'New Client',
      company: data.company || data.name || 'New Client',
      logoInitials: initials,
      industry: data.industry || 'General',
      stage: 'lead',
      internalOwner: 'Sarah Chen',
      contacts: data.contacts || [],
      activeChannels: [],
      tasks: [],
      comments: [],
      strategySections: [],
      documents: [],
      contractStart: new Date().toISOString(),
      contractEnd: new Date(Date.now() + 365 * 86400000).toISOString(),
      notes: '',
      meetings: [],
      performance: [],
    };
    addClient(newClient);
    setClients([...getClients()]);
    setShowNewClient(false);
    navigate(`/clients/${newId}`);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Clients</h1>
          <p className="text-sm text-muted-foreground mt-1">All client engagements managed by your agency.</p>
        </div>
        <button
          onClick={() => setShowNewClient(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" />
          New Client
        </button>
      </div>

      <div className="panel divide-y divide-border">
        {clients.map(client => {
          const onboarding = getOnboardingForClient(client.id);
          const lifecycleLabel = LIFECYCLE_STAGES.find(s => s.key === onboarding.lifecycleStage)?.label || client.stage;

          return (
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
                <span className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">{lifecycleLabel}</span>
                <span className={stageClass[client.stage]}>{client.stage}</span>
              </div>
            </Link>
          );
        })}
      </div>

      {showNewClient && <NewClientModal onClose={() => setShowNewClient(false)} onCreate={handleCreate} />}
    </div>
  );
}
