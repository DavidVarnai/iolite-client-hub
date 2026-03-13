import { useState } from 'react';
import { ClientDiscovery, EMPTY_DISCOVERY, BusinessModel, GrowthGoal } from '@/types/onboarding';
import { ServiceChannel, SERVICE_CHANNEL_LABELS } from '@/types';
import { Check, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useClientContext } from '@/contexts/ClientContext';

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
        <SelectField label="Business Model" value={onboarding.businessModelType || 'other'}
          options={[
            { value: 'ecommerce', label: 'Ecommerce' },
            { value: 'lead_generation', label: 'Lead Generation' },
            { value: 'hybrid', label: 'Hybrid' },
            { value: 'other', label: 'Other' },
          ]}
          onChange={(v) => updateOnboarding({ ...onboarding, businessModelType: v as BusinessModel })} />
        <Field label="Geography" value={onboarding.geography || ''}
          onChange={(v) => updateOnboarding({ ...onboarding, geography: v })} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Primary Contact Name" value={client.contacts[0]?.name || ''}
          onChange={(v) => {
            const contacts = [...client.contacts];
            if (contacts.length === 0) contacts.push({ id: `ct-new`, name: v, email: '', title: '', isPrimary: true });
            else contacts[0] = { ...contacts[0], name: v };
            updateClient({ ...client, contacts });
          }} />
        <Field label="Primary Contact Email" value={client.contacts[0]?.email || ''}
          onChange={(v) => {
            const contacts = [...client.contacts];
            if (contacts.length === 0) contacts.push({ id: `ct-new`, name: '', email: v, title: '', isPrimary: true });
            else contacts[0] = { ...contacts[0], email: v };
            updateClient({ ...client, contacts });
          }} />
      </div>

      <SelectField label="Primary Growth Goal" value={onboarding.primaryGrowthGoal || 'revenue_growth'}
        options={[
          { value: 'revenue_growth', label: 'Revenue Growth' },
          { value: 'lead_volume', label: 'Lead Volume' },
          { value: 'market_expansion', label: 'Market Expansion' },
          { value: 'brand_awareness', label: 'Brand Awareness' },
        ]}
        onChange={(v) => updateOnboarding({ ...onboarding, primaryGrowthGoal: v as GrowthGoal })} />

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
  const { onboarding, updateOnboarding } = useClientContext();
  const d = onboarding.discovery;
  const updateD = (patch: Partial<ClientDiscovery>) => updateOnboarding({ ...onboarding, discovery: { ...d, ...patch } });

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
        <Field label="Primary Products / Services" value={d.primaryProducts} onChange={(v) => updateD({ primaryProducts: v })} />
        <Field label="Revenue Streams" value={d.revenueStreams} onChange={(v) => updateD({ revenueStreams: v })} />
        <Field label="Avg Order Value / Deal Size" value={d.avgOrderValue} onChange={(v) => updateD({ avgOrderValue: v })} />
        <Field label="Core Customer Segments" value={d.coreCustomerSegments} onChange={(v) => updateD({ coreCustomerSegments: v })} />
      </DiscoverySection>

      <DiscoverySection title="B. Growth Targets">
        <Field label="Revenue Targets" value={d.revenueTargets} onChange={(v) => updateD({ revenueTargets: v })} />
        <Field label="Customer / Lead Targets" value={d.customerLeadTargets} onChange={(v) => updateD({ customerLeadTargets: v })} />
        <Field label="Time Horizon" value={d.timeHorizon} onChange={(v) => updateD({ timeHorizon: v })} />
        <Field label="Major Growth Priorities" value={d.majorGrowthPriorities} onChange={(v) => updateD({ majorGrowthPriorities: v })} />
      </DiscoverySection>

      <DiscoverySection title="C. Sales Process">
        <Field label="Funnel Type" value={d.funnelType} onChange={(v) => updateD({ funnelType: v })} />
        <Field label="Lead → Qualification → Sale Structure" value={d.leadQualSaleStructure} onChange={(v) => updateD({ leadQualSaleStructure: v })} />
        <Field label="Close Rate" value={d.closeRate} onChange={(v) => updateD({ closeRate: v })} />
        <Field label="Sales Cycle Length" value={d.salesCycleLength} onChange={(v) => updateD({ salesCycleLength: v })} />
      </DiscoverySection>

      <DiscoverySection title="D. Current Marketing Stack">
        <Field label="Paid Media Platforms" value={d.paidMediaPlatforms} onChange={(v) => updateD({ paidMediaPlatforms: v })} />
        <Field label="CRM" value={d.crm} onChange={(v) => updateD({ crm: v })} />
        <Field label="Email Platform" value={d.emailPlatform} onChange={(v) => updateD({ emailPlatform: v })} />
        <Field label="Analytics Stack" value={d.analyticsStack} onChange={(v) => updateD({ analyticsStack: v })} />
        <Field label="Website Platform" value={d.websitePlatform} onChange={(v) => updateD({ websitePlatform: v })} />
      </DiscoverySection>

      <DiscoverySection title="E. Current Performance">
        <Field label="Current Traffic" value={d.currentTraffic} onChange={(v) => updateD({ currentTraffic: v })} />
        <Field label="Current Leads / Orders" value={d.currentLeadsOrders} onChange={(v) => updateD({ currentLeadsOrders: v })} />
        <Field label="Current CPA / CAC" value={d.currentCpaCac} onChange={(v) => updateD({ currentCpaCac: v })} />
        <Field label="Conversion Rates" value={d.conversionRates} onChange={(v) => updateD({ conversionRates: v })} />
        <Field label="Known Bottlenecks" value={d.knownBottlenecks} onChange={(v) => updateD({ knownBottlenecks: v })} />
      </DiscoverySection>

      <DiscoverySection title="F. Competitive Landscape">
        <Field label="Top Competitors" value={d.topCompetitors} onChange={(v) => updateD({ topCompetitors: v })} />
        <Field label="Positioning Notes" value={d.positioningNotes} onChange={(v) => updateD({ positioningNotes: v })} />
        <Field label="Differentiators" value={d.differentiators} onChange={(v) => updateD({ differentiators: v })} />
      </DiscoverySection>
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
    { channel: 'app_development', label: 'Development / Analytics' },
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
function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">{label}</label>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
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
