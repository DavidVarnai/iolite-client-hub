import { Client } from '@/types';
import { Campaign, TrackingLink, LOCKED_SOURCES, LOCKED_MEDIUMS } from '@/types/campaigns';
import { getNamingRulesForClient } from '@/data/campaignSeed';
import { useState } from 'react';
import { Copy, Link2, Plus, Download } from 'lucide-react';

export default function TrackingBuilder({ client, campaigns, selectedCampaign }: { client: Client; campaigns: Campaign[]; selectedCampaign: Campaign | null }) {
  const namingRules = getNamingRulesForClient(client.id);
  const [activeCampaignId, setActiveCampaignId] = useState(selectedCampaign?.id || campaigns[0]?.id || '');
  const activeCampaign = campaigns.find(c => c.id === activeCampaignId);
  const links = activeCampaign?.trackingLinks || [];

  // UTM builder state
  const [destinationUrl, setDestinationUrl] = useState(activeCampaign?.landingPageUrl || '');
  const [utmSource, setUtmSource] = useState('');
  const [utmMedium, setUtmMedium] = useState('');
  const [utmCampaign, setUtmCampaign] = useState('');
  const [utmId, setUtmId] = useState('');
  const [utmContent, setUtmContent] = useState('');
  const [utmTerm, setUtmTerm] = useState('');

  const buildUrl = () => {
    if (!destinationUrl) return '';
    const params = new URLSearchParams();
    if (utmSource) params.set('utm_source', utmSource);
    if (utmMedium) params.set('utm_medium', utmMedium);
    if (utmCampaign) params.set('utm_campaign', utmCampaign);
    if (utmId) params.set('utm_id', utmId);
    if (utmContent) params.set('utm_content', utmContent);
    if (utmTerm) params.set('utm_term', utmTerm);
    const qs = params.toString();
    return qs ? `${destinationUrl}?${qs}` : destinationUrl;
  };

  const finalUrl = buildUrl();

  return (
    <div className="p-6 max-w-5xl space-y-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Tracking & URLs</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Build, manage, and export tagged URLs for campaign assets.</p>
      </div>

      {/* Campaign selector */}
      <div className="flex items-center gap-3">
        <label className="text-xs font-medium">Campaign:</label>
        <select
          value={activeCampaignId}
          onChange={e => {
            setActiveCampaignId(e.target.value);
            const c = campaigns.find(x => x.id === e.target.value);
            if (c) setDestinationUrl(c.landingPageUrl);
          }}
          className="text-xs border rounded-md px-2 py-1.5 bg-background text-foreground"
        >
          {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* UTM Builder */}
        <div className="panel p-5 space-y-4">
          <h3 className="text-sm font-semibold">UTM Builder</h3>

          <BuilderField label="Destination URL" value={destinationUrl} onChange={setDestinationUrl} required />

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium">utm_source <span className="text-destructive">*</span></label>
              <select value={utmSource} onChange={e => setUtmSource(e.target.value)} className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs">
                <option value="">Select...</option>
                {LOCKED_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium">utm_medium <span className="text-destructive">*</span></label>
              <select value={utmMedium} onChange={e => setUtmMedium(e.target.value)} className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs">
                <option value="">Select...</option>
                {LOCKED_MEDIUMS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>

          <BuilderField label="utm_campaign" value={utmCampaign} onChange={setUtmCampaign} required placeholder="e.g., spring_collection_launch" />
          <BuilderField label="utm_id" value={utmId} onChange={setUtmId} required placeholder="e.g., camp1" />
          <BuilderField label="utm_content" value={utmContent} onChange={setUtmContent} required placeholder="e.g., elevated_everyday_static" />
          <BuilderField label="utm_term" value={utmTerm} onChange={setUtmTerm} placeholder="Optional" />

          {/* Preview */}
          {finalUrl && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Generated URL</p>
              <div className="p-3 bg-muted rounded-md text-xs break-all font-mono">{finalUrl}</div>
              <button
                onClick={() => navigator.clipboard.writeText(finalUrl)}
                className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
              >
                <Copy className="w-3 h-3" /> Copy to clipboard
              </button>
            </div>
          )}

          <button className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors">
            Save Link
          </button>
        </div>

        {/* Saved Links + Naming Rules */}
        <div className="space-y-6">
          {/* Saved links */}
          <div className="panel p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Saved Links</h3>
              <span className="text-xs text-muted-foreground">{links.length} link{links.length !== 1 ? 's' : ''}</span>
            </div>
            {links.length === 0 ? (
              <p className="text-xs text-muted-foreground">No saved links yet.</p>
            ) : (
              <div className="space-y-3">
                {links.map(link => (
                  <div key={link.id} className="p-3 border rounded-md space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Link2 className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs font-medium">{link.utmContent || link.utmCampaign}</span>
                    </div>
                    <p className="text-[10px] font-mono text-muted-foreground break-all">{link.finalUrl}</p>
                    <div className="flex gap-3 text-[10px] text-muted-foreground">
                      <span>source: {link.utmSource}</span>
                      <span>medium: {link.utmMedium}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {links.length > 0 && (
              <button className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline">
                <Download className="w-3 h-3" /> Export All URLs
              </button>
            )}
          </div>

          {/* Naming Rules */}
          <div className="panel p-5 space-y-4">
            <h3 className="text-sm font-semibold">Naming Rules</h3>
            {namingRules ? (
              <div className="space-y-3 text-xs">
                <div>
                  <p className="text-muted-foreground">Source Values</p>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {namingRules.sourceRules.map(s => (
                      <span key={s} className="px-2 py-0.5 bg-muted rounded text-[10px] font-medium">{s}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground">Medium Values</p>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {namingRules.mediumRules.map(m => (
                      <span key={m} className="px-2 py-0.5 bg-muted rounded text-[10px] font-medium">{m}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground">Campaign Format</p>
                  <p className="font-mono">{namingRules.campaignFormat}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Content Format</p>
                  <p className="font-mono">{namingRules.contentFormat}</p>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-xs text-muted-foreground mb-2">No naming rules configured for this client.</p>
                <button className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline">
                  <Plus className="w-3 h-3" /> Add Naming Rules
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function BuilderField({ label, value, onChange, placeholder, required }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium">{label} {required && <span className="text-destructive">*</span>}</label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
    </div>
  );
}
