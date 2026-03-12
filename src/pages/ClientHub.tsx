import { useParams, useNavigate } from 'react-router-dom';
import { seedClients } from '@/data/seed';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ClientOverview from '@/components/client/Overview';
import ClientStrategy from '@/components/client/Strategy';
import MeetingHub from '@/components/client/MeetingHub';
import ClientComments from '@/components/client/Comments';
import ClientPerformance from '@/components/client/Performance';
import ClientTasks from '@/components/client/Tasks';
import ClientCommunications from '@/components/client/Communications';
import ClientDocuments from '@/components/client/Documents';
import ClientSettings from '@/components/client/ClientSettings';
import Campaigns from '@/components/client/Campaigns';

const TABS = [
  'overview', 'strategy', 'campaigns', 'performance', 'meetings',
  'comments', 'tasks', 'communications', 'documents', 'settings',
] as const;

const stageClass: Record<string, string> = {
  lead: 'status-lead',
  proposal: 'status-proposal',
  active: 'status-active',
  paused: 'status-paused',
  completed: 'status-completed',
};

export default function ClientHub() {
  const { clientId, tab } = useParams();
  const navigate = useNavigate();
  const client = seedClients.find(c => c.id === clientId);
  const [proposalMode, setProposalMode] = useState(false);
  const activeTab = (tab && TABS.includes(tab as any)) ? tab : 'overview';

  if (!client) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Client not found.</p>
      </div>
    );
  }

  const setTab = (t: string) => navigate(`/clients/${clientId}/${t}`);

  const renderTab = () => {
    switch (activeTab) {
      case 'overview': return <ClientOverview client={client} />;
      case 'strategy': return <ClientStrategy client={client} proposalMode={proposalMode} />;
      case 'performance': return <ClientPerformance client={client} />;
      case 'meetings': return <MeetingHub client={client} />;
      case 'comments': return <ClientComments client={client} />;
      case 'tasks': return <ClientTasks client={client} />;
      case 'communications': return <ClientCommunications />;
      case 'documents': return <ClientDocuments client={client} />;
      case 'settings': return <ClientSettings client={client} />;
      default: return <ClientOverview client={client} />;
    }
  };

  return (
    <div className={`proposal-transition ${proposalMode ? 'bg-background' : ''}`}>
      {/* Client context bar */}
      <div className="border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
            {client.logoInitials}
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">{client.name}</h1>
            <p className="text-xs text-muted-foreground">{client.company} · {client.industry}</p>
          </div>
          <span className={stageClass[client.stage]}>{client.stage}</span>
        </div>

        {/* Proposal mode toggle */}
        <button
          onClick={() => setProposalMode(!proposalMode)}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            proposalMode
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:text-foreground'
          }`}
        >
          {proposalMode ? 'Exit Proposal Mode' : 'Present to Client'}
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b px-6 flex gap-0 overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-3 text-sm capitalize whitespace-nowrap transition-colors ${
              activeTab === t ? 'tab-active' : 'tab-inactive'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
        >
          {renderTab()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
