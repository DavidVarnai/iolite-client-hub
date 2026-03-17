import { useState, useCallback, useMemo } from 'react';
import { ClientDiscovery, EMPTY_DISCOVERY, BusinessModel, GrowthGoal, PerformanceConfidence, BOTTLENECK_OPTIONS, DiscoveryCompetitor, AiDiscoveredCompetitor, FunnelStage, FunnelStageCategory, FUNNEL_STAGE_OPTIONS, FUNNEL_CATEGORY_ORDER, deriveRevenueUnit } from '@/types/onboarding';
import type { RevenueModelType } from '@/types/onboarding';
import { ServiceChannel, SERVICE_CHANNEL_LABELS } from '@/types';
import { Check, ChevronLeft, ChevronRight, X, Loader2, Sparkles, Plus, Trash2, ArrowRight, Download, Pause } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useClientContext } from '@/contexts/ClientContext';
import { runMarketResearch } from '@/lib/ai/aiActions';
import { repository } from '@/lib/repository';
import type { AiActionStatus } from '@/types/ai';
import FunnelVisualPreview from './discovery/FunnelVisualPreview';

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
const FUNNEL_TEMPLATES: Record<string, FunnelStage[]> = {
  ecommerce: [
    { name: 'Ad Click', category: 'traffic' },
    { name: 'Product Page', category: 'page_interaction' },
    { name: 'Email Signup', category: 'lead_capture' },
    { name: 'Purchase', category: 'conversion' },
  ],
  lead_gen: [
    { name: 'Ad Click', category: 'traffic' },
    { name: 'Landing Page Visit', category: 'page_interaction' },
    { name: 'Form Submission', category: 'lead_capture' },
    { name: 'Discovery Call', category: 'qualification' },
    { name: 'Closed Deal', category: 'conversion' },
  ],
  hybrid: [
    { name: 'Ad Click', category: 'traffic' },
    { name: 'Landing Page Visit', category: 'page_interaction' },
    { name: 'Form Submission', category: 'lead_capture' },
    { name: 'Consultation', category: 'qualification' },
    { name: 'Purchase', category: 'conversion' },
  ],
};

const FUNNEL_TYPE_OPTIONS = [
  { value: 'ecommerce', label: 'Ecommerce' },
  { value: 'lead_gen', label: 'Lead Gen' },
  { value: 'hybrid', label: 'Hybrid' },
];

const CONFIDENCE_OPTIONS: { value: PerformanceConfidence; label: string; color: string }[] = [
  { value: 'high', label: 'High', color: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20' },
  { value: 'medium', label: 'Medium', color: 'bg-amber-500/10 text-amber-700 border-amber-500/20' },
  { value: 'estimated', label: 'Estimated', color: 'bg-blue-500/10 text-blue-700 border-blue-500/20' },
  { value: 'unknown', label: 'Unknown', color: 'bg-muted text-muted-foreground border-border' },
];

// ── Helpers ──
function parseNum(s: string): number {
  const n = parseFloat(s.replace(/[^0-9.]/g, ''));
  return isNaN(n) ? 0 : n;
}

function fmtPct(n: number): string {
  if (!isFinite(n) || isNaN(n)) return '—';
  return n < 1 ? `${n.toFixed(2)}%` : `${n.toFixed(1)}%`;
}

function fmtCurrency(n: number): string {
  if (!isFinite(n) || isNaN(n)) return '—';
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

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
  const [aiSuggestions, setAiSuggestions] = useState<AiDiscoveredCompetitor[]>([]);
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<number>>(new Set());

  const handleResearchCompetitors = async () => {
    setAiStatus('loading');
    setAiSuggestions([]);
    setSelectedSuggestions(new Set());
    try {
      const result = await runMarketResearch({
        industry: client.industry,
        geography: onboarding.geography,
        serviceArea: onboarding.serviceArea,
        businessModel: d.businessModel,
        primaryProducts: d.primaryProducts,
        coreCustomerSegments: d.coreCustomerSegments,
      });
      // Filter out any AI suggestions that match existing manual entries
      const existingNames = new Set((d.competitors || []).map(c => c.name.toLowerCase()));
      const suggestions: AiDiscoveredCompetitor[] = result.topCompetitors
        .filter(c => !existingNames.has(c.name.toLowerCase()))
        .map(c => ({
          name: c.name,
          url: c.url || '',
          reason: c.notes,
        }));
      setAiSuggestions(suggestions);
      updateD({ positioningNotes: result.positioningThemes.join('\n') });
      setAiStatus('success');
    } catch {
      setAiStatus('error');
    }
  };

  const toggleSuggestion = (idx: number) => {
    setSelectedSuggestions(prev => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  const approveSelectedSuggestions = () => {
    const toAdd: DiscoveryCompetitor[] = [];
    const existingNames = new Set((d.competitors || []).map(c => c.name.toLowerCase()));
    selectedSuggestions.forEach(idx => {
      const s = aiSuggestions[idx];
      if (s && !existingNames.has(s.name.toLowerCase())) {
        toAdd.push({ name: s.name, url: s.url });
      }
    });
    if (toAdd.length > 0) {
      updateD({ competitors: [...(d.competitors || []), ...toAdd] });
    }
    // Remove approved from suggestions
    setAiSuggestions(prev => prev.filter((_, i) => !selectedSuggestions.has(i)));
    setSelectedSuggestions(new Set());
  };

  // Auto-calculated metrics
  const visitors = parseNum(d.monthlyVisitors);
  const leads = parseNum(d.monthlyLeads);
  const customers = parseNum(d.monthlyCustomers);
  const budget = parseNum(d.monthlyMarketingBudget);

  const visitorToLeadRate = visitors > 0 && leads > 0 ? (leads / visitors) * 100 : 0;
  const leadToCustomerRate = leads > 0 && customers > 0 ? (customers / leads) * 100 : 0;
  const visitorToCustomerRate = visitors > 0 && customers > 0 ? (customers / visitors) * 100 : 0;
  const cpa = budget > 0 && leads > 0 ? budget / leads : 0;
  const cac = budget > 0 && customers > 0 ? budget / customers : 0;

  const hasMetrics = visitors > 0 || leads > 0 || customers > 0;

  // Import MI approved competitors
  const handleImportMI = () => {
    const runs = repository.marketIntelligence.getByClient(client.id);
    const approvedRun = runs.find(r => r.status === 'approved' && r.approved?.approvedCompetitors?.length);
    if (!approvedRun?.approved?.approvedCompetitors?.length) return;
    const imported: DiscoveryCompetitor[] = approvedRun.approved.approvedCompetitors.map(c => ({
      name: c.name,
      url: c.websiteUrl || '',
    }));
    // Merge: add only new names
    const existing = d.competitors || [];
    const existingNames = new Set(existing.map(c => c.name.toLowerCase()));
    const toAdd = imported.filter(c => !existingNames.has(c.name.toLowerCase()));
    updateD({ competitors: [...existing, ...toAdd] });
  };

  const hasMIApproved = useMemo(() => {
    const runs = repository.marketIntelligence.getByClient(client.id);
    return runs.some(r => r.status === 'approved' && r.approved?.approvedCompetitors?.length);
  }, [client.id]);

  // Competitor helpers
  const addCompetitor = () => updateD({ competitors: [...(d.competitors || []), { name: '', url: '' }] });
  const updateCompetitor = (idx: number, patch: Partial<DiscoveryCompetitor>) => {
    const next = [...(d.competitors || [])];
    next[idx] = { ...next[idx], ...patch };
    updateD({ competitors: next });
  };
  const removeCompetitor = (idx: number) => {
    updateD({ competitors: (d.competitors || []).filter((_, i) => i !== idx) });
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
        <Field label="Avg Order Value / Deal Size (legacy)" value={d.avgOrderValue} onChange={(v) => updateD({ avgOrderValue: v })} />
        <div className="space-y-3 py-2">
          <p className="text-xs font-semibold text-foreground">Revenue per Conversion</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Model Type</label>
              <select
                value={d.revenueModel?.revenueModelType || 'one_time'}
                onChange={(e) => {
                  const type = e.target.value as import('@/types/onboarding').RevenueModelType;
                  const { deriveRevenueUnit } = require('@/types/onboarding') as typeof import('@/types/onboarding');
                  updateD({ revenueModel: { ...d.revenueModel, revenueModelType: type, revenueUnit: deriveRevenueUnit(type) } });
                }}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="one_time">One-time (per deal)</option>
                <option value="monthly_recurring">Monthly recurring (per month)</option>
                <option value="annual_contract">Annual contract (per year)</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Amount ($)</label>
              <input
                type="number"
                value={d.revenueModel?.revenuePerConversion || ''}
                onChange={(e) => updateD({ revenueModel: { ...d.revenueModel, revenuePerConversion: parseFloat(e.target.value) || 0 } })}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                placeholder="e.g. 5000"
              />
            </div>
            {(d.revenueModel?.revenueModelType === 'monthly_recurring' || d.revenueModel?.revenueModelType === 'annual_contract') && (
              <div>
                <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Avg Contract Length (months)</label>
                <input
                  type="number"
                  value={d.revenueModel?.avgContractLengthMonths || ''}
                  onChange={(e) => updateD({ revenueModel: { ...d.revenueModel, avgContractLengthMonths: parseInt(e.target.value) || undefined } })}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  placeholder="e.g. 12"
                />
              </div>
            )}
          </div>
        </div>
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
                leadQualSaleStructure: template.map(s => s.name).join('\n'),
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
          <p className="text-[10px] text-muted-foreground mb-2">Build your funnel by adding steps. Select a funnel type above to auto-populate a template.</p>

          {/* Structured funnel step rows */}
          <div className="space-y-2">
            {(d.salesFunnelStages || []).map((stage, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-5 text-right shrink-0">{idx + 1}.</span>
                <select
                  value={stage.isCustom ? '__custom__' : `${stage.category}::${stage.name}`}
                  onChange={(e) => {
                    const val = e.target.value;
                    const stages = [...d.salesFunnelStages];
                    if (val === '__custom__') {
                      stages[idx] = { name: stage.name || '', category: stage.category || 'qualification', isCustom: true };
                    } else {
                      const [cat, name] = val.split('::');
                      stages[idx] = { name, category: cat as FunnelStageCategory };
                    }
                    updateD({ salesFunnelStages: stages, leadQualSaleStructure: stages.map(s => s.name).join('\n') });
                  }}
                  className="flex-1 rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Select stage…</option>
                  {FUNNEL_CATEGORY_ORDER.map(cat => {
                    const group = FUNNEL_STAGE_OPTIONS[cat];
                    return (
                      <optgroup key={cat} label={group.label}>
                        {group.stages.map(s => (
                          <option key={`${cat}::${s}`} value={`${cat}::${s}`}>{s}</option>
                        ))}
                      </optgroup>
                    );
                  })}
                  <optgroup label="Other">
                    <option value="__custom__">Custom…</option>
                  </optgroup>
                </select>
                {stage.isCustom && (
                  <input
                    type="text"
                    value={stage.name}
                    onChange={(e) => {
                      const stages = [...d.salesFunnelStages];
                      stages[idx] = { ...stages[idx], name: e.target.value };
                      updateD({ salesFunnelStages: stages, leadQualSaleStructure: stages.map(s => s.name).join('\n') });
                    }}
                    placeholder="Custom stage name"
                    className="flex-1 rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                )}
                <button
                  type="button"
                  onClick={() => {
                    const stages = d.salesFunnelStages.filter((_, i) => i !== idx);
                    updateD({ salesFunnelStages: stages, leadQualSaleStructure: stages.map(s => s.name).join('\n') });
                  }}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              const stages = [...(d.salesFunnelStages || []), { name: '', category: 'qualification' as FunnelStageCategory }];
              updateD({ salesFunnelStages: stages });
            }}
            className="mt-2 flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> Add Step
          </button>

          {/* Visual funnel diagram */}
          <FunnelVisualPreview stages={d.salesFunnelStages} />
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

      {/* ── E. Current Performance (structured) ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b pb-2">
          <h4 className="text-sm font-semibold">E. Current Performance</h4>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Confidence:</span>
            <div className="flex gap-1">
              {CONFIDENCE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => updateD({ performanceConfidence: opt.value })}
                  className={`px-2 py-0.5 text-[10px] font-medium rounded border transition-colors ${
                    d.performanceConfidence === opt.value ? opt.color : 'bg-background text-muted-foreground border-border hover:border-primary/30'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Input groups */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-3">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Traffic</p>
            <NumericField label="Monthly Website Visitors" value={d.monthlyVisitors}
              onChange={(v) => updateD({ monthlyVisitors: v })} placeholder="e.g. 25000" />
          </div>
          <div className="space-y-3">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Conversion</p>
            <NumericField label="Monthly Leads" value={d.monthlyLeads}
              onChange={(v) => updateD({ monthlyLeads: v })} placeholder="e.g. 500" />
            <NumericField label="Monthly Customers" value={d.monthlyCustomers}
              onChange={(v) => updateD({ monthlyCustomers: v })} placeholder="e.g. 50" />
          </div>
          <div className="space-y-3">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Marketing Spend</p>
            <NumericField label="Monthly Marketing Budget" value={d.monthlyMarketingBudget}
              onChange={(v) => updateD({ monthlyMarketingBudget: v })} placeholder="e.g. 15000" prefix="$" />
          </div>
        </div>

        {/* Auto-calculated metrics */}
        {hasMetrics && (
          <div className="p-3 rounded-md bg-muted/50 border">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">Calculated Metrics</p>
            <div className="grid grid-cols-5 gap-3">
              <MetricCard label="Visitor → Lead" value={visitorToLeadRate > 0 ? fmtPct(visitorToLeadRate) : '—'} />
              <MetricCard label="Lead → Customer" value={leadToCustomerRate > 0 ? fmtPct(leadToCustomerRate) : '—'} />
              <MetricCard label="Visitor → Customer" value={visitorToCustomerRate > 0 ? fmtPct(visitorToCustomerRate) : '—'} />
              <MetricCard label="CPA (per Lead)" value={cpa > 0 ? fmtCurrency(cpa) : '—'} />
              <MetricCard label="CAC (per Customer)" value={cac > 0 ? fmtCurrency(cac) : '—'} />
            </div>
          </div>
        )}

        {/* Bottleneck selector */}
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Known Constraints</label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {BOTTLENECK_OPTIONS.map(tag => {
              const active = (d.bottleneckTags || []).includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    const tags = d.bottleneckTags || [];
                    updateD({
                      bottleneckTags: active ? tags.filter(t => t !== tag) : [...tags, tag],
                    });
                  }}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${
                    active
                      ? 'bg-destructive/10 text-destructive border-destructive/20'
                      : 'bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
          <textarea
            value={d.bottleneckNotes || ''}
            onChange={(e) => updateD({ bottleneckNotes: e.target.value })}
            placeholder="Additional notes about constraints or bottlenecks…"
            rows={2}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-y placeholder:text-muted-foreground/50"
          />
        </div>
      </div>

      {/* ── F. Competitive Landscape (structured) ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b pb-2">
          <h4 className="text-sm font-semibold">F. Competitive Landscape</h4>
          <div className="flex items-center gap-2">
            {hasMIApproved && (
              <button
                type="button"
                onClick={handleImportMI}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-accent text-accent-foreground hover:bg-accent/80 transition-colors"
              >
                <Download className="h-3.5 w-3.5" /> Import from MI
              </button>
            )}
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
        </div>
        {aiStatus === 'error' && (
          <p className="text-[10px] text-destructive font-medium">Failed to research competitors. Please try again.</p>
        )}

        {/* AI Discovered Competitors */}
        {aiSuggestions.length > 0 && (
          <div className="panel border-primary/20 bg-primary/[0.02]">
            <div className="flex items-center justify-between px-4 py-3 border-b border-primary/10">
              <div className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-semibold">AI Discovered Competitors</span>
                <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{aiSuggestions.length} found</span>
              </div>
              {selectedSuggestions.size > 0 && (
                <button
                  type="button"
                  onClick={approveSelectedSuggestions}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <Check className="h-3 w-3" /> Add {selectedSuggestions.size} to Top Competitors
                </button>
              )}
            </div>
            <div className="divide-y divide-border">
              {aiSuggestions.map((suggestion, idx) => (
                <label
                  key={idx}
                  className="flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedSuggestions.has(idx)}
                    onChange={() => toggleSuggestion(idx)}
                    className="mt-1 h-4 w-4 rounded border-primary text-primary focus:ring-primary"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{suggestion.name}</span>
                      {suggestion.url && (
                        <a
                          href={suggestion.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-[11px] text-primary hover:underline truncate max-w-[200px] font-mono"
                        >
                          {suggestion.url.replace(/^https?:\/\//, '')}
                        </a>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{suggestion.reason}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Competitor list */}
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Top Competitors</label>
          <div className="space-y-2">
            {(d.competitors || []).map((comp, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={comp.name}
                  onChange={(e) => updateCompetitor(idx, { name: e.target.value })}
                  placeholder="Competitor name"
                  className="flex-1 rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground/50"
                />
                <input
                  type="text"
                  value={comp.url}
                  onChange={(e) => updateCompetitor(idx, { url: e.target.value })}
                  placeholder="https://…"
                  className="flex-1 rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground/50 font-mono text-xs"
                />
                <button
                  type="button"
                  onClick={() => removeCompetitor(idx)}
                  className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addCompetitor}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <Plus className="h-3.5 w-3.5" /> Add Competitor
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
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
        <p className="text-sm text-foreground mb-1">
          Continue to the Strategy tab to create and refine strategy sections for each service line.
        </p>
        <p className="text-xs text-muted-foreground mb-3">
          You'll stay in onboarding — a progress panel will guide you back when you're ready.
        </p>
        <button
          onClick={() => onNavigateTab('strategy')}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-xs font-medium rounded-md hover:opacity-90 transition-opacity"
        >
          Continue to Strategy <ArrowRight className="h-3.5 w-3.5" />
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
        <p className="text-sm text-foreground mb-1">
          Continue to the Growth Model tab to build the investment plan, assumptions, and revenue projections.
        </p>
        <p className="text-xs text-muted-foreground mb-3">
          You'll stay in onboarding — a progress panel will guide you back when you're ready.
        </p>
        <button
          onClick={() => onNavigateTab('growth-model')}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-xs font-medium rounded-md hover:opacity-90 transition-opacity"
        >
          Continue to Growth Model <ArrowRight className="h-3.5 w-3.5" />
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

function NumericField({ label, value, onChange, placeholder, prefix }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; prefix?: string;
}) {
  return (
    <div>
      <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1 block">{label}</label>
      <div className="relative">
        {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">{prefix}</span>}
        <input
          type="text"
          inputMode="numeric"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full rounded-md border bg-background py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground/50 tabular-nums ${prefix ? 'pl-7 pr-3' : 'px-3'}`}
        />
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center p-2 rounded-md bg-background border">
      <p className="text-[10px] text-muted-foreground mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-foreground tabular-nums">{value}</p>
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
          <button onClick={onClose} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors">
            <Pause className="h-3 w-3" />
            Save &amp; Exit
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
          <button onClick={onClose} className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
            Pause Onboarding
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
