import { Client, SERVICE_CHANNEL_LABELS, ServiceChannel } from '@/types';
import { Campaign, CampaignStatus, CAMPAIGN_STATUS_LABELS, PLATFORM_LABELS, PlatformFocus } from '@/types/campaigns';
import { useState, useMemo } from 'react';
import { Plus, Filter, ArrowUpDown } from 'lucide-react';

type SortBy = 'newest' | 'oldest' | 'name';

const statusColor: Record<CampaignStatus, string> = {
  draft: 'bg-muted text-muted-foreground',
  concept_generation: 'bg-primary/10 text-primary',
  concept_review: 'bg-primary/10 text-primary',
  production_generation: 'bg-primary/10 text-primary',
  ready_for_design: 'background-color: hsl(48 96% 95%); color: hsl(32 81% 39%)',
  ready_for_launch: 'background-color: hsl(140 49% 96%); color: hsl(142 64% 32%)',
  active: 'background-color: hsl(140 49% 96%); color: hsl(142 64% 32%)',
  archived: 'bg-muted text-muted-foreground',
};

function StatusBadge({ status }: { status: CampaignStatus }) {
  const isCustom = status === 'ready_for_design' || status === 'ready_for_launch' || status === 'active';
  if (isCustom) {
    const styles = status === 'active' || status === 'ready_for_launch'
      ? { backgroundColor: 'hsl(140 49% 96%)', color: 'hsl(142 64% 32%)' }
      : { backgroundColor: 'hsl(48 96% 95%)', color: 'hsl(32 81% 39%)' };
    return (
      <span className="status-badge" style={styles}>
        {CAMPAIGN_STATUS_LABELS[status]}
      </span>
    );
  }
  return (
    <span className={`status-badge ${statusColor[status]}`}>
      {CAMPAIGN_STATUS_LABELS[status]}
    </span>
  );
}

interface Props {
  client: Client;
  campaigns: Campaign[];
  onOpenCampaign: (id: string, view?: 'brief' | 'concepts' | 'outputs' | 'tracking') => void;
  onNewCampaign: () => void;
}

export default function CampaignDashboard({ client, campaigns, onOpenCampaign, onNewCampaign }: Props) {
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | 'all'>('all');
  const [channelFilter, setChannelFilter] = useState<ServiceChannel | 'all'>('all');
  const [platformFilter, setPlatformFilter] = useState<PlatformFocus | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortBy>('newest');

  const filtered = useMemo(() => {
    let result = [...campaigns];
    if (statusFilter !== 'all') result = result.filter(c => c.status === statusFilter);
    if (channelFilter !== 'all') result = result.filter(c => c.strategySectionId && client.strategySections.find(s => s.id === c.strategySectionId)?.channel === channelFilter);
    if (platformFilter !== 'all') result = result.filter(c => c.platformFocus === platformFilter);
    result.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return a.name.localeCompare(b.name);
    });
    return result;
  }, [campaigns, statusFilter, channelFilter, platformFilter, sortBy, client.strategySections]);

  const totalConcepts = (c: Campaign) => c.concepts.length;
  const approvedConcepts = (c: Campaign) => c.concepts.filter(x => x.status === 'approved').length;
  const totalOutputs = (c: Campaign) => c.concepts.reduce((sum, x) => sum + x.outputs.length, 0);

  return (
    <div className="p-6 space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Campaigns</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{campaigns.length} campaign{campaigns.length !== 1 ? 's' : ''} for {client.name}</p>
        </div>
        <button
          onClick={onNewCampaign}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" /> New Campaign
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Filter className="w-3.5 h-3.5" />
          <span>Filter:</span>
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as any)}
          className="text-xs border rounded-md px-2 py-1.5 bg-background text-foreground"
        >
          <option value="all">All Statuses</option>
          {Object.entries(CAMPAIGN_STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <select
          value={channelFilter}
          onChange={e => setChannelFilter(e.target.value as any)}
          className="text-xs border rounded-md px-2 py-1.5 bg-background text-foreground"
        >
          <option value="all">All Channels</option>
          {client.activeChannels.map(ch => (
            <option key={ch} value={ch}>{SERVICE_CHANNEL_LABELS[ch]}</option>
          ))}
        </select>
        <select
          value={platformFilter}
          onChange={e => setPlatformFilter(e.target.value as any)}
          className="text-xs border rounded-md px-2 py-1.5 bg-background text-foreground"
        >
          <option value="all">All Platforms</option>
          {Object.entries(PLATFORM_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <div className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
          <ArrowUpDown className="w-3.5 h-3.5" />
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as SortBy)}
            className="text-xs border rounded-md px-2 py-1.5 bg-background text-foreground"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="name">Name</option>
          </select>
        </div>
      </div>

      {/* Campaign Cards */}
      {filtered.length === 0 ? (
        <div className="panel p-8 text-center">
          <p className="text-sm text-muted-foreground">No campaigns found. Create your first campaign to get started.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map(campaign => {
            const section = client.strategySections.find(s => s.id === campaign.strategySectionId);
            return (
              <div
                key={campaign.id}
                onClick={() => onOpenCampaign(campaign.id)}
                className="panel p-5 hover:border-primary/30 cursor-pointer transition-colors group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-sm font-semibold group-hover:text-primary transition-colors truncate">{campaign.name}</h3>
                      <StatusBadge status={campaign.status} />
                    </div>
                    <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
                      {section && (
                        <span>{SERVICE_CHANNEL_LABELS[section.channel]}</span>
                      )}
                      <span>{PLATFORM_LABELS[campaign.platformFocus]}</span>
                      <span>Created {new Date(campaign.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-6 text-center flex-shrink-0">
                    <div>
                      <p className="text-lg font-semibold">{totalConcepts(campaign)}</p>
                      <p className="text-[10px] text-muted-foreground">Concepts</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold">{approvedConcepts(campaign)}</p>
                      <p className="text-[10px] text-muted-foreground">Approved</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold">{totalOutputs(campaign)}</p>
                      <p className="text-[10px] text-muted-foreground">Outputs</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
