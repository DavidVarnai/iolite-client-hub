import { useState } from 'react';
import { Client } from '@/types';
import { Campaign, CampaignStatus, CAMPAIGN_STATUS_LABELS, PLATFORM_LABELS, PlatformFocus } from '@/types/campaigns';
import { getCampaignsForClient, getAssetsForClient, getLearningsForClient } from '@/data/campaignSeed';
import CampaignDashboard from './campaigns/CampaignDashboard';
import CampaignBriefForm from './campaigns/CampaignBriefForm';
import ConceptReview from './campaigns/ConceptReview';
import ProductionOutputs from './campaigns/ProductionOutputs';
import AssetLibrary from './campaigns/AssetLibrary';
import TrackingBuilder from './campaigns/TrackingBuilder';
import CreativeIntelligence from './campaigns/CreativeIntelligence';

type CampaignView = 'dashboard' | 'brief' | 'concepts' | 'outputs' | 'assets' | 'tracking' | 'intelligence';

const SUB_TABS: { key: CampaignView; label: string }[] = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'brief', label: 'Brief' },
  { key: 'concepts', label: 'Concepts' },
  { key: 'outputs', label: 'Outputs' },
  { key: 'assets', label: 'Assets' },
  { key: 'tracking', label: 'Tracking' },
  { key: 'intelligence', label: 'Intelligence' },
];

export default function Campaigns({ client }: { client: Client }) {
  const [view, setView] = useState<CampaignView>('dashboard');
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const campaigns = getCampaignsForClient(client.id);
  const assets = getAssetsForClient(client.id);
  const learnings = getLearningsForClient(client.id);
  const selectedCampaign = campaigns.find(c => c.id === selectedCampaignId) || null;

  const openCampaign = (id: string, targetView: CampaignView = 'brief') => {
    setSelectedCampaignId(id);
    setView(targetView);
  };

  const backToDashboard = () => {
    setSelectedCampaignId(null);
    setView('dashboard');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Sub-navigation */}
      <div className="border-b px-6 flex items-center gap-0 overflow-x-auto bg-background">
        {SUB_TABS.map(t => (
          <button
            key={t.key}
            onClick={() => {
              if (t.key === 'dashboard') backToDashboard();
              else setView(t.key);
            }}
            className={`px-3 py-2.5 text-xs font-medium capitalize whitespace-nowrap transition-colors ${
              view === t.key ? 'text-foreground border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {view === 'dashboard' && (
          <CampaignDashboard
            client={client}
            campaigns={campaigns}
            onOpenCampaign={openCampaign}
            onNewCampaign={() => setView('brief')}
          />
        )}
        {view === 'brief' && (
          <CampaignBriefForm
            client={client}
            campaign={selectedCampaign}
            onBack={backToDashboard}
          />
        )}
        {view === 'concepts' && selectedCampaign && (
          <ConceptReview
            campaign={selectedCampaign}
            client={client}
          />
        )}
        {view === 'outputs' && selectedCampaign && (
          <ProductionOutputs campaign={selectedCampaign} />
        )}
        {view === 'assets' && (
          <AssetLibrary client={client} assets={assets} />
        )}
        {view === 'tracking' && (
          <TrackingBuilder
            client={client}
            campaigns={campaigns}
            selectedCampaign={selectedCampaign}
          />
        )}
        {view === 'intelligence' && (
          <CreativeIntelligence
            client={client}
            learnings={learnings}
          />
        )}
        {/* Fallback for views needing a campaign */}
        {(view === 'concepts' || view === 'outputs') && !selectedCampaign && (
          <div className="p-6">
            <p className="text-sm text-muted-foreground">Select a campaign from the dashboard first.</p>
            <button onClick={backToDashboard} className="mt-2 text-sm text-primary hover:underline">← Back to Dashboard</button>
          </div>
        )}
      </div>
    </div>
  );
}
