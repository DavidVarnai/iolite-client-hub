import { useState, useCallback } from 'react';
import { ClientDiscovery, EMPTY_DISCOVERY, BusinessModel, GrowthGoal } from '@/types/onboarding';
import { ServiceChannel, SERVICE_CHANNEL_LABELS } from '@/types';
import { Check, ChevronLeft, ChevronRight, X, Loader2, Sparkles } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useClientContext } from '@/contexts/ClientContext';
import { runMarketResearch } from '@/lib/ai/aiActions';
import type { AiActionStatus } from '@/types/ai';

type WizardStep = 'setup' | 'discovery' | 'strategy' | 'growth_model' | 'proposal';

const STEPS: { key: WizardStep; label: string; number: number }[] = [
  { key: 'setup', label: 'Client Setup', number: 1 },
  { key: 'discovery', label: 'Discovery', number: 2 },
  { key: 'strategy', label: 'Strategy Draft', number: 3 },
  { key: 'growth_model', label: 'Growth Model', number: 4 },
  { key: 'proposal', label: 'Proposal Ready', number: 5 },
];

interface Props {
  onClose: () => void;
  onNavigateTab: (tab: string) => void;
  initialStep?: WizardStep;
}

// ── Marketing Stack options ──
const STACK_OPTIONS: Record<string, string[]> = {
  paidMediaPlatforms: ['Google Ads', 'Meta Ads', 'LinkedIn Ads', 'TikTok Ads', 'Microsoft Ads'],
  crm: ['Salesforce', 'HubSpot', 'Pipedrive', 'Zoho', 'None'],
  emailPlatform: ['Klaviyo', 'Mailchimp', 'ActiveCampaign', 'HubSpot', 'Constant Contact'],
  analyticsStack: ['GA4', 'Adobe Analytics', 'Mixpanel', 'Triple Whale'],
  websitePlatform: ['Shopify', 'WordPress', 'Webflow', 'Squarespace', 'Custom'],
};

// ── Sales funnel templates by type ──
const FUNNEL_TEMPLATES: Record<string, string[]> = {
  ecommerce: ['Ad Click', 'Landing Page Visit', 'Product View', 'Add to Cart', 'Purchase'],
  lead_gen: ['Ad Click', 'Landing Page Visit', 'Form Submission', 'Qualification Call', 'Closed Deal'],
  hybrid: ['Ad Click', 'Landing Page Visit', 'Form / Cart', 'Qualification', 'Proposal', 'Closed Deal'],
};

const FUNNEL_TYPE_OPTIONS = [
  { value: 'ecommerce', label: 'Ecommerce' },
  { value: 'lead_gen', label: 'Lead Gen' },
  { value: 'hybrid', label: 'Hybrid' },
];

// ---------- STEP 1: Client Setup ----------
function ClientSetupStep() {
  const { client, updateClient, onboarding, updateOnboarding } = useClientContext();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold mb-1">Client Setup</h3>
        <p className="text-sm text-muted-foreground">Capture foundational client data.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Client Name" value={client.name}
          onChange={(v) => updateClient({ ...client, name: v })} />
        <Field label="Company Name" value={client.company}
          onChange={(v) => updateClient({ ...client, company: v })} />
        <Field label="Website" value={onboarding.website || ''}
          onChange={(v) => updateOnboarding({ ...onboarding, website: v })} />
        <Field label="Industry" value={client.industry}
          onChange={(v) => updateClient({ ...client, industry: v })} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Geography" value={onboarding.geography || ''}
          onChange={(v) => updateOnboarding({ ...onboarding, geography: v })}
          placeholder="e.g., United States, Europe"
          hint="Country or region" />
        <Field label="Service Area" value={onboarding.serviceArea || ''}
          onChange={(v) => updateOnboarding({ ...onboarding, serviceArea: v })}
          placeholder="e.g., Phoenix Metro Area, AZ"
          hint="Where does this business serve customers? City, state, or radius" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Business Address" value={onboarding.businessAddress || ''}
          onChange={(v) => updateOnboarding({ ...onboarding, businessAddress: v })}
          placeholder="e.g., 123 Main St, Phoenix, AZ 85001"
          hint="Physical location (if applicable)" />
        <Field label="Primary Contact Name" value={client.contacts[0]?.name || ''}
          onChange={(v) => {
            const contacts = [...client.contacts];
            if (contacts.length === 0) contacts.push({ id: `ct-new`, name: v, email: '', title: '', isPrimary: true });
            else contacts[0] = { ...contacts[0], name: v };
            updateClient({ ...client, contacts });
          }} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Primary Contact Email" value={client.contacts[0]?.email || ''}
          onChange={(v) => {
            const contacts = [...client.contacts];
            if (contacts.length === 0) contacts.push({ id: `ct-new`, name: '', email: v, title: '', isPrimary: true });
            else contacts[0] = { ...contacts[0], email: v };
            updateClient({ ...client, contacts });
          }} />
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Notes</label>
        <textarea
          value={client.notes}
          onChange={(e) => updateClient({ ...client, notes: e.target.value })}
          rows={3}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
    </div>
  );
}

// ---------- STEP 2: Discovery ----------
function DiscoveryStep() {
  const { client, onboarding, updateOnboarding } = useClientContext();
  const d = onboarding.discovery;
  const updateD = (patch: Partial<ClientDiscovery>) => updateOnboarding({ ...onboarding, discovery: { ...d, ...patch } });
  const [aiStatus, setAiStatus] = useState<AiActionStatus>('idle');

  const handleResearchCompetitors = async () => {
    setAiStatus('loading');
    try {
      const result = await runMarketResearch({
        industry: client.industry,
        geography: onboarding.geography,
        serviceArea: onboarding.serviceArea,
        businessModel: d.businessModel,
        primaryProducts: d.primaryProducts,
        coreCustomerSegments: d.coreCustomerSegments,
      });
      updateD({
        topCompetitors: result.topCompetitors.map(c => `${c.name}${c.notes ? ` — ${c.notes}` : ''}`).join('\n'),
        positioningNotes: result.positioningThemes.join('\n'),
      });
      setAiStatus('success');
    } catch {
      setAiStatus('error');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-base font-semibold mb-1">Discovery</h3>
        <p className="text-sm text-muted-foreground">Capture structured discovery inputs that will feed Strategy and Growth Model.</p>
      </div>

      <DiscoverySection title="A. Business Overview">
        <SelectField label="Business Model" value={d.businessModel}
          options={[
            { value: 'ecommerce', label: 'Ecommerce' },
            { value: 'lead_generation', label: 'Lead Generation' },
            { value: 'hybrid', label: 'Hybrid' },
            { value: 'other', label: 'Other' },
          ]}
          onChange={(v) => updateD({ businessModel: v as BusinessModel })} />
        <ExpandableField label="Primary Products / Services" value={d.primaryProducts} onChange={(v) => updateD({ primaryProducts: v })} />
        <ExpandableField label="Revenue Streams" value={d.revenueStreams} onChange={(v) => updateD({ revenueStreams: v })} />
        <Field label="Avg Order Value / Deal Size" value={d.avgOrderValue} onChange={(v) => updateD({ avgOrderValue: v })} />
        <ExpandableField label="Core Customer Segments" value={d.coreCustomerSegments} onChange={(v) => updateD({ coreCustomerSegments: v })} />
      </DiscoverySection>

      <DiscoverySection title="B. Growth Targets">
        <ExpandableField label="Revenue Targets" value={d.revenueTargets} onChange={(v) => updateD({ revenueTargets: v })} />
        <ExpandableField label="Customer / Lead Targets" value={d.customerLeadTargets} onChange={(v) => updateD({ customerLeadTargets: v })} />
        <Field label="Time Horizon" value={d.timeHorizon} onChange={(v) => updateD({ timeHorizon: v })} />
        <ExpandableField label="Major Growth Priorities" value={d.majorGrowthPriorities} onChange={(v) => updateD({ majorGrowthPriorities: v })} />
      </DiscoverySection>

      <DiscoverySection title="C. Sales Process">
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Funnel Type</label>
          <select
            value={d.funnelType}
            onChange={(e) => {
              const ft = e.target.value;
              const template = FUNNEL_TEMPLATES[ft] || [];
              updateD({
                funnelType: ft,
                salesFunnelStages: template,
                leadQualSaleStructure: template.join('\n'),
              });
            }}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Select type…</option>
            {FUNNEL_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div /> {/* grid spacer */}
        <div className="col-span-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
            Funnel Steps
          </label>
          <p className="text-[10px] text-muted-foreground mb-2">One step per line. Select a funnel type above to auto-populate a template.</p>
          <textarea
            value={d.salesFunnelStages.length > 0 ? d.salesFunnelStages.join('\n') : d.leadQualSaleStructure}
            onChange={(e) => {
              const text = e.target.value;
              const stages = text.split('\n').map(s => s.trim()).filter(Boolean);
              updateD({
                leadQualSaleStructure: text,
                salesFunnelStages: stages,
              });
            }}
            placeholder={"Ad Click\nLanding Page Visit\nForm Submission\nQualification Call\nClosed Deal"}
            rows={5}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-y font-mono leading-relaxed"
          />
          {/* Visual funnel rendering */}
          {d.salesFunnelStages.length > 0 && (
            <div className="mt-3 p-3 rounded-md bg-muted/50 border">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Funnel Preview</p>
              <div className="flex flex-wrap items-center gap-1">
                {d.salesFunnelStages.map((stage, idx) => (
                  <span key={idx} className="flex items-center gap-1">
                    <span className="px-2.5 py-1 text-xs font-medium rounded-md bg-primary/10 text-primary border border-primary/20">
                      {stage}
                    </span>
                    {idx < d.salesFunnelStages.length - 1 && (
                      <span className="text-muted-foreground text-xs">→</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        <Field label="Close Rate" value={d.closeRate} onChange={(v) => updateD({ closeRate: v })} placeholder="e.g. 15%" />
        <Field label="Sales Cycle Length" value={d.salesCycleLength} onChange={(v) => updateD({ salesCycleLength: v })} placeholder="e.g. 30 days" />
      </DiscoverySection>

      <DiscoverySection title="D. Current Marketing Stack">
        <CheckboxGroup label="Paid Media Platforms" value={d.paidMediaPlatforms} options={STACK_OPTIONS.paidMediaPlatforms}
          onChange={(v) => updateD({ paidMediaPlatforms: v })} />
        <CheckboxGroup label="CRM" value={d.crm} options={STACK_OPTIONS.crm}
          onChange={(v) => updateD({ crm: v })} />
        <CheckboxGroup label="Email Platform" value={d.emailPlatform} options={STACK_OPTIONS.emailPlatform}
          onChange={(v) => updateD({ emailPlatform: v })} />
        <CheckboxGroup label="Analytics Stack" value={d.analyticsStack} options={STACK_OPTIONS.analyticsStack}
          onChange={(v) => updateD({ analyticsStack: v })} />
        <CheckboxGroup label="Website Platform" value={d.websitePlatform} options={STACK_OPTIONS.websitePlatform}
          onChange={(v) => updateD({ websitePlatform: v })} />
      </DiscoverySection>

      <DiscoverySection title="E. Current Performance">
        <Field label="Current Traffic" value={d.currentTraffic} onChange={(v) => updateD({ currentTraffic: v })}
          placeholder="e.g., 25,000 monthly sessions" hint="Monthly website sessions from all sources" />
        <Field label="Current Leads / Orders" value={d.currentLeadsOrders} onChange={(v) => updateD({ currentLeadsOrders: v })}
          placeholder="e.g., 500 leads/month" hint="Monthly conversions (leads, orders, or calls)" />
        <Field label="Current CPA / CAC" value={d.currentCpaCac} onChange={(v) => updateD({ currentCpaCac: v })}
          placeholder="e.g., $45 CPA" hint="Average cost to acquire a customer or lead" />
        <Field label="Conversion Rates" value={d.conversionRates} onChange={(v) => updateD({ conversionRates: v })}
          placeholder="e.g., 2.5% site-wide" hint="Overall website conversion rate" />
        <ExpandableField label="Known Bottlenecks" value={d.knownBottlenecks} onChange={(v) => updateD({ knownBottlenecks: v })}
          placeholder="e.g., Low mobile conversion, high cart abandonment" hint="Key friction points limiting growth" />
      </DiscoverySection>

      <div className="space-y-4">
        <div className="flex items-center justify-between border-b pb-2">
          <h4 className="text-sm font-semibold">F. Competitive Landscape</h4>
          <button
            onClick={handleResearchCompetitors}
            disabled={aiStatus === 'loading'}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50"
          >
            {aiStatus === 'loading' ? (
              <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Researching…</>
            ) : (
              <><Sparkles className="h-3.5 w-3.5" /> Research Competitors</>
            )}
          </button>
        </div>
        {aiStatus === 'success' && (
          <p className="text-[10px] text-primary font-medium">✓ AI research applied — review and edit below</p>
        )}
        <div className="grid grid-cols-2 gap-4">
          <ExpandableField label="Top Competitors" value={d.topCompetitors} onChange={(v) => updateD({ topCompetitors: v })}
            placeholder="Competitor names and notes" />
          <ExpandableField label="Positioning Notes" value={d.positioningNotes} onChange={(v) => updateD({ positioningNotes: v })}
            placeholder="Key positioning themes in your market" />
          <ExpandableField label="Differentiators" value={d.differentiators} onChange={(v) => updateD({ differentiators: v })}
            placeholder="What sets this client apart from competitors?" hint="Unique value propositions, strengths, moats" />
        </div>
      </div>
    </div>
  );
}

// ---------- STEP 3: Strategy Draft ----------
function StrategyDraftStep({ onNavigateTab }: { onNavigateTab: (tab: string) => void }) {
  const { client } = useClientContext();
  const STRATEGY_MODULES: { channel: ServiceChannel; label: string }[] = [
    { channel: 'strategic_consulting', label: 'Fractional CMO / Strategic Consulting' },
    { channel: 'paid_media', label: 'Paid Media' },
    { channel: 'social_media', label: 'Social Media' },
    { channel: 'email_marketing', label: 'Retention / Email Marketing' },
    { channel: 'content_development', label: 'Content / SEO' },
    { channel: 'website_development', label: 'Website' },
    { channel: 'brand_strategy', label: 'Brand / Creative' },
    { channel: 'analytics_tracking', label: 'Analytics & Tracking' },
    { channel: 'app_development', label: 'Development' },
  ];

  const existingSections = new Set(client.strategySections.map(s => s.channel));

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold mb-1">Strategy Draft</h3>
        <p className="text-sm text-muted-foreground">Build initial strategy structure across service lines.</p>
      </div>

      <div className="space-y-2">
        {STRATEGY_MODULES.map(mod => {
          const hasSection = existingSections.has(mod.channel);
          return (
            <div key={mod.channel} className="panel p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {hasSection ? (
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-border" />
                )}
                <span className="text-sm font-medium">{mod.label}</span>
              </div>
              {hasSection && <span className="text-xs text-muted-foreground">Draft created</span>}
            </div>
          );
        })}
      </div>

      <div className="panel p-4 bg-primary/5 border-primary/20">
        <p className="text-sm text-foreground mb-3">
          Open the Strategy tab to create and edit detailed strategy sections for each service line.
        </p>
        <button
          onClick={() => onNavigateTab('strategy')}
          className="px-4 py-2 bg-primary text-primary-foreground text-xs font-medium rounded-md hover:opacity-90 transition-opacity"
        >
          Go to Strategy Tab
        </button>
      </div>
    </div>
  );
}

// ---------- STEP 4: Growth Model ----------
function GrowthModelStep({ onNavigateTab }: { onNavigateTab: (tab: string) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold mb-1">Growth Model</h3>
        <p className="text-sm text-muted-foreground">Turn the strategy into investment and outcome planning.</p>
      </div>

      <div className="space-y-3">
        {['Investment Plan — Agency services, media budgets, other costs',
          'Channel Assumptions — CPC, CTR, conversion rate, CPA/CPL targets',
          'Revenue Model — AOV, close rate, repeat multiplier, gross margin',
        ].map((item, idx) => (
          <div key={idx} className="panel p-4 flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground">
              {String.fromCharCode(65 + idx)}
            </div>
            <span className="text-sm">{item}</span>
          </div>
        ))}
      </div>

      <div className="panel p-4 bg-primary/5 border-primary/20">
        <p className="text-sm text-foreground mb-3">
          Open the Growth Model tab to build the investment plan, assumptions, and revenue projections.
        </p>
        <button
          onClick={() => onNavigateTab('growth-model')}
          className="px-4 py-2 bg-primary text-primary-foreground text-xs font-medium rounded-md hover:opacity-90 transition-opacity"
        >
          Go to Growth Model Tab
        </button>
      </div>
    </div>
  );
}

// ---------- STEP 5: Proposal Ready ----------
function ProposalReadyStep({ onNavigateTab }: { onNavigateTab: (tab: string) => void }) {
  const { client, onboarding, updateOnboarding, hasGrowthModel } = useClientContext();

  const checklist = [
    { key: 'client_setup', label: 'Client setup complete', complete: !!client.name && !!client.company },
    { key: 'discovery', label: 'Discovery complete', complete: !!(onboarding.discovery.primaryProducts && onboarding.discovery.revenueTargets) },
    { key: 'strategy', label: 'Strategy module summarized', complete: client.strategySections.length > 0 },
    { key: 'growth_model', label: 'Growth model populated', complete: hasGrowthModel },
  ];

  const allComplete = checklist.every(c => c.complete);

  const handleMarkReady = () => {
    updateOnboarding({ ...onboarding, lifecycleStage: 'proposal_ready', proposalReadyAt: new Date().toISOString() });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold mb-1">Proposal Ready</h3>
        <p className="text-sm text-muted-foreground">Review whether the proposal is ready for client presentation.</p>
      </div>

      <div className="space-y-2">
        {checklist.map(item => (
          <div key={item.key} className="panel p-4 flex items-center gap-3">
            {item.complete ? (
              <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <Check className="h-3 w-3 text-primary-foreground" />
              </div>
            ) : (
              <div className="w-5 h-5 rounded-full border-2 border-border flex-shrink-0" />
            )}
            <span className={`text-sm ${item.complete ? 'text-foreground' : 'text-muted-foreground'}`}>{item.label}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button onClick={() => onNavigateTab('overview')}
          className="px-4 py-2 text-xs font-medium rounded-md bg-muted text-muted-foreground hover:text-foreground transition-colors">
          Preview Client View
        </button>
        <button onClick={handleMarkReady} disabled={!allComplete}
          className="px-4 py-2 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed">
          Mark Proposal Ready
        </button>
      </div>
    </div>
  );
}

// ---------- Shared helpers ----------
function Field({ label, value, onChange, placeholder, hint }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; hint?: string;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">{label}</label>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground/50" />
      {hint && <p className="text-[10px] text-muted-foreground mt-1">{hint}</p>}
    </div>
  );
}

function ExpandableField({ label, value, onChange, placeholder, hint }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; hint?: string;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={2}
        className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-y min-h-[40px] placeholder:text-muted-foreground/50"
      />
      {hint && <p className="text-[10px] text-muted-foreground mt-1">{hint}</p>}
    </div>
  );
}

function CheckboxGroup({ label, value, options, onChange }: {
  label: string; value: string; options: string[]; onChange: (v: string) => void;
}) {
  const selected = value.split(',').map(s => s.trim()).filter(Boolean);
  const otherValues = selected.filter(s => !options.includes(s));
  const hasOther = otherValues.length > 0;
  const [showOther, setShowOther] = useState(hasOther);
  const [otherText, setOtherText] = useState(otherValues.join(', '));

  const toggle = (opt: string) => {
    const next = selected.includes(opt)
      ? selected.filter(s => s !== opt)
      : [...selected, opt];
    onChange(next.join(', '));
  };

  const handleOtherChange = (text: string) => {
    setOtherText(text);
    const knownSelected = selected.filter(s => options.includes(s));
    const otherItems = text.split(',').map(s => s.trim()).filter(Boolean);
    onChange([...knownSelected, ...otherItems].join(', '));
  };

  return (
    <div className="col-span-2">
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">{label}</label>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {options.map(opt => (
          <button key={opt} type="button" onClick={() => toggle(opt)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${
              selected.includes(opt)
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
            }`}>
            {opt}
          </button>
        ))}
        <button type="button" onClick={() => setShowOther(!showOther)}
          className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${
            showOther
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
          }`}>
          Other
        </button>
      </div>
      {showOther && (
        <input type="text" value={otherText} onChange={(e) => handleOtherChange(e.target.value)}
          placeholder="Enter other tools, comma-separated"
          className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground/50" />
      )}
    </div>
  );
}

function SelectField({ label, value, options, onChange }: {
  label: string; value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function DiscoverySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold border-b pb-2">{title}</h4>
      <div className="grid grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

// ---------- Main Wizard ----------
export default function ClientOnboardingWizard({ onClose, onNavigateTab, initialStep }: Props) {
  const [currentStep, setCurrentStep] = useState<WizardStep>(initialStep || 'setup');
  const stepIdx = STEPS.findIndex(s => s.key === currentStep);

  const handleNext = () => {
    if (stepIdx < STEPS.length - 1) setCurrentStep(STEPS[stepIdx + 1].key);
  };
  const handleBack = () => {
    if (stepIdx > 0) setCurrentStep(STEPS[stepIdx - 1].key);
  };

  const handleCloseAndNavigate = (tab: string) => {
    onClose();
    onNavigateTab(tab);
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-background border rounded-xl shadow-lg w-full max-w-4xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="text-base font-semibold">Client Onboarding</h2>
            <p className="text-xs text-muted-foreground">Step {stepIdx + 1} of {STEPS.length}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-md transition-colors">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Step navigation sidebar */}
          <div className="w-56 border-r p-4 space-y-1 flex-shrink-0">
            {STEPS.map((step, idx) => (
              <button key={step.key} onClick={() => setCurrentStep(step.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                  step.key === currentStep ? 'bg-primary/10 text-primary font-medium'
                    : idx < stepIdx ? 'text-foreground hover:bg-muted' : 'text-muted-foreground hover:bg-muted'
                }`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${
                  idx < stepIdx ? 'bg-primary text-primary-foreground'
                    : step.key === currentStep ? 'border-2 border-primary text-primary' : 'border-2 border-border text-muted-foreground'
                }`}>
                  {idx < stepIdx ? <Check className="h-3 w-3" /> : step.number}
                </div>
                <span>{step.label}</span>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <AnimatePresence mode="wait">
              <motion.div key={currentStep} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
                {currentStep === 'setup' && <ClientSetupStep />}
                {currentStep === 'discovery' && <DiscoveryStep />}
                {currentStep === 'strategy' && <StrategyDraftStep onNavigateTab={handleCloseAndNavigate} />}
                {currentStep === 'growth_model' && <GrowthModelStep onNavigateTab={handleCloseAndNavigate} />}
                {currentStep === 'proposal' && <ProposalReadyStep onNavigateTab={handleCloseAndNavigate} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t">
          <button onClick={onClose} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            Save & Continue Later
          </button>
          <div className="flex gap-2">
            {stepIdx > 0 && (
              <button onClick={handleBack}
                className="flex items-center gap-1 px-4 py-2 text-xs font-medium rounded-md bg-muted text-muted-foreground hover:text-foreground transition-colors">
                <ChevronLeft className="h-3.5 w-3.5" /> Back
              </button>
            )}
            {stepIdx < STEPS.length - 1 ? (
              <button onClick={handleNext}
                className="flex items-center gap-1 px-4 py-2 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
                Next <ChevronRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button onClick={onClose}
                className="px-4 py-2 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
                Finish
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
