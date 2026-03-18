import { useState, useEffect } from 'react';
import { Plug, CheckCircle2, XCircle, AlertCircle, ExternalLink, Link2, Globe, Database, Sparkles, FlaskConical, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { defaultIntegrations } from '@/data/adminSeed';
import type { ConfigurationCompleteness } from '@/types/admin';
import type { CompetitorResearchPreference } from '@/types/marketIntelligence';
import { repository } from '@/lib/repository';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const statusConfig = {
  connected: { icon: CheckCircle2, label: 'Connected', className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
  disconnected: { icon: XCircle, label: 'Not Connected', className: 'bg-muted text-muted-foreground' },
  error: { icon: AlertCircle, label: 'Error', className: 'bg-destructive/10 text-destructive border-destructive/20' },
} as const;

const configLabels: Record<ConfigurationCompleteness, { label: string; percent: number }> = {
  none: { label: 'Not Configured', percent: 0 },
  partial: { label: 'Partially Configured', percent: 50 },
  complete: { label: 'Fully Configured', percent: 100 },
};

const RESEARCH_MODES: { value: CompetitorResearchPreference; label: string; icon: typeof Globe; description: string }[] = [
  { value: 'auto', label: 'Auto', icon: Sparkles, description: 'Try live search first, fall back to modeled if unavailable or fails.' },
  { value: 'live_only', label: 'Live Search Only', icon: Globe, description: 'Always use real Google results via SerpAPI. Fails if API is unavailable.' },
  { value: 'modeled_only', label: 'Modeled Only', icon: Database, description: 'Use modeled industry pools. No API calls — zero cost.' },
];

/* ── Test Provider Panel ── */

type TestStatus = 'idle' | 'testing' | 'success' | 'fail';

interface TestResult {
  status: TestStatus;
  envReady: boolean;
  serpApiConfigured: boolean | null;
  sampleQuery: string;
  organicCount?: number;
  paidCount?: number;
  topDomains?: string[];
  latencyMs?: number;
  error?: string;
  failReason?: 'missing_api_key' | 'request_error' | 'empty_results';
  effectiveMode: string;
  reasoning: string;
}

const TEST_QUERY = 'best private schools in Houston';

const INITIAL_TEST: TestResult = {
  status: 'idle',
  envReady: Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY),
  serpApiConfigured: null,
  sampleQuery: TEST_QUERY,
  effectiveMode: '—',
  reasoning: '',
};

function SearchProviderTest({ researchMode }: { researchMode: CompetitorResearchPreference }) {
  const [test, setTest] = useState<TestResult>(INITIAL_TEST);

  const runTest = async () => {
    console.log(`[ProviderTest] Starting test — admin mode: "${researchMode}"`);

    if (researchMode === 'modeled_only') {
      console.log('[ProviderTest] Mode is modeled_only — no live call needed');
      setTest(prev => ({
        ...prev, status: 'success', serpApiConfigured: null, effectiveMode: 'Modeled Only',
        organicCount: undefined, paidCount: undefined, topDomains: undefined,
        latencyMs: undefined, error: undefined, failReason: undefined,
        reasoning: 'Live search skipped — admin mode is "Modeled Only". No API calls are made; modeled industry pools are used instead.',
      }));
      toast({ title: 'Modeled Only', description: 'No live search call is made in this mode.' });
      return;
    }

    setTest(prev => ({ ...prev, status: 'testing', error: undefined, failReason: undefined }));
    const start = performance.now();

    try {
      const { data, error } = await supabase.functions.invoke('serp-search', {
        body: { query: test.sampleQuery, num: 5 },
      });
      const latencyMs = Math.round(performance.now() - start);
      const wouldFallback = researchMode === 'auto';

      if (error) {
        console.error('[ProviderTest] Edge function error:', error);
        const isMissingKey = /secret|not configured|unauthorized/i.test(error.message || '');
        setTest(prev => ({
          ...prev, status: 'fail', serpApiConfigured: false, latencyMs,
          effectiveMode: wouldFallback ? 'Modeled Fallback' : 'BLOCKED',
          error: error.message || 'Edge function call failed',
          failReason: isMissingKey ? 'missing_api_key' : 'request_error',
          topDomains: undefined, organicCount: undefined, paidCount: undefined,
          reasoning: wouldFallback
            ? 'Live search failed. Mode is "Auto" so MI runs would fall back to modeled research automatically.'
            : 'Live search failed. Mode is "Live Only" — MI runs will be blocked until this is resolved.',
        }));
        return;
      }

      if (data?.error) {
        console.error('[ProviderTest] SerpAPI error:', data.error);
        const isMissingKey = /secret|not configured|key/i.test(data.error);
        setTest(prev => ({
          ...prev, status: 'fail', serpApiConfigured: false, latencyMs,
          effectiveMode: wouldFallback ? 'Modeled Fallback' : 'BLOCKED',
          error: `SerpAPI: ${data.error}`,
          failReason: isMissingKey ? 'missing_api_key' : 'request_error',
          topDomains: undefined, organicCount: undefined, paidCount: undefined,
          reasoning: wouldFallback
            ? 'SerpAPI returned an error. Mode is "Auto" — modeled fallback would be used.'
            : 'SerpAPI returned an error. Mode is "Live Only" — MI runs will fail.',
        }));
        return;
      }

      const organicResults: { domain: string }[] = data?.organic_results ?? [];
      const organicCount = organicResults.length;
      const paidCount = data?.paid_results?.length ?? 0;

      if (organicCount === 0 && paidCount === 0) {
        setTest(prev => ({
          ...prev, status: 'fail', serpApiConfigured: true, latencyMs,
          effectiveMode: wouldFallback ? 'Modeled Fallback' : 'BLOCKED',
          organicCount: 0, paidCount: 0, topDomains: [],
          error: 'SerpAPI responded but returned zero results for the test query.',
          failReason: 'empty_results',
          reasoning: wouldFallback
            ? 'API key works but query returned empty results. "Auto" mode would fall back to modeled research.'
            : 'API key works but query returned empty results. "Live Only" mode would block the run.',
        }));
        return;
      }

      const topDomains = organicResults
        .map((r: { domain: string }) => r.domain?.replace(/^www\./, ''))
        .filter(Boolean)
        .slice(0, 5);

      console.log(`[ProviderTest] ✅ Success — ${organicCount} organic, ${paidCount} paid (${latencyMs}ms)`);
      console.log(`[ProviderTest] Top domains:`, topDomains);

      setTest(prev => ({
        ...prev, status: 'success', serpApiConfigured: true,
        organicCount, paidCount, topDomains, latencyMs,
        effectiveMode: 'Live Search', error: undefined, failReason: undefined,
        reasoning: `Live search used because API key is present and mode = "${RESEARCH_MODES.find(m => m.value === researchMode)?.label}". ${wouldFallback ? 'Would fall back to modeled if API fails.' : ''}`.trim(),
      }));
    } catch (err) {
      const latencyMs = Math.round(performance.now() - start);
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('[ProviderTest] Unexpected error:', message);
      const wouldFallback = researchMode === 'auto';
      setTest(prev => ({
        ...prev, status: 'fail', serpApiConfigured: false, latencyMs,
        effectiveMode: wouldFallback ? 'Modeled Fallback' : 'BLOCKED',
        error: message, failReason: 'request_error',
        topDomains: undefined, organicCount: undefined, paidCount: undefined,
        reasoning: wouldFallback
          ? 'Request failed unexpectedly. "Auto" mode would fall back to modeled research.'
          : 'Request failed unexpectedly. "Live Only" mode blocks MI runs until fixed.',
      }));
    }
  };

  const StatusBadge = () => {
    if (test.status === 'idle') return <Badge variant="outline" className="text-muted-foreground">Not tested</Badge>;
    if (test.status === 'testing') return <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20"><Loader2 className="h-3 w-3 mr-1 animate-spin" />Testing…</Badge>;
    if (test.status === 'success') return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20"><CheckCircle2 className="h-3 w-3 mr-1" />Pass</Badge>;
    return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20"><XCircle className="h-3 w-3 mr-1" />Fail</Badge>;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FlaskConical className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Test Search Provider</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Verify live search connectivity without running a full MI workflow.
              </CardDescription>
            </div>
          </div>
          <StatusBadge />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Diagnostics grid */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
          <Row label="Backend configured" value={test.envReady ? 'Yes' : 'No'} ok={test.envReady} />
          <Row label="SerpAPI secret" value={test.serpApiConfigured === null ? '—' : test.serpApiConfigured ? 'Present' : 'Missing / Invalid'} ok={test.serpApiConfigured ?? undefined} />
          <Row label="Admin mode" value={RESEARCH_MODES.find(m => m.value === researchMode)?.label ?? researchMode} />
          <Row label="Effective source" value={test.effectiveMode} />
          {test.latencyMs !== undefined && <Row label="Latency" value={`${test.latencyMs}ms`} />}
          <Row label="Test query" value={`"${test.sampleQuery}"`} />
        </div>

        {/* Sample results + domains */}
        {test.organicCount !== undefined && (
          <div className="rounded-md bg-muted/50 border border-border px-3 py-2 space-y-1.5">
            <div className="flex items-center gap-3 text-xs">
              <span className="text-muted-foreground">Results:</span>
              <span className="font-medium text-foreground">{test.organicCount} organic · {test.paidCount ?? 0} paid</span>
            </div>
            {test.topDomains && test.topDomains.length > 0 && (
              <div className="text-xs">
                <span className="text-muted-foreground">Top domains: </span>
                <span className="font-mono text-[11px] text-foreground">
                  {test.topDomains.join(', ')}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Decision reasoning */}
        {test.reasoning && (
          <div className="rounded-md bg-primary/5 border border-primary/10 px-3 py-2 text-xs text-muted-foreground leading-relaxed">
            <span className="font-medium text-foreground">Decision: </span>{test.reasoning}
          </div>
        )}

        {/* Failure detail */}
        {test.error && (
          <div className="rounded-md bg-destructive/5 border border-destructive/20 px-3 py-2 text-xs space-y-1">
            <div className="flex items-start gap-1.5">
              <AlertCircle className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" />
              <div>
                <span className="font-medium text-destructive">
                  {test.failReason === 'missing_api_key' && 'Missing API Key — '}
                  {test.failReason === 'request_error' && 'Request Error — '}
                  {test.failReason === 'empty_results' && 'Empty Results — '}
                </span>
                <span className="text-destructive">{test.error}</span>
              </div>
            </div>
            {test.failReason === 'missing_api_key' && (
              <p className="text-muted-foreground ml-5">Add the SerpAPI secret in your backend function configuration.</p>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
          <p className="text-[10px] text-muted-foreground italic max-w-[260px]">
            Sends one lightweight test query. No secrets are exposed in the browser.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={runTest}
            disabled={test.status === 'testing'}
          >
            {test.status === 'testing' ? (
              <><Loader2 className="h-3 w-3 mr-1.5 animate-spin" />Testing…</>
            ) : (
              <><FlaskConical className="h-3 w-3 mr-1.5" />Run Test</>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function Row({ label, value, ok }: { label: string; value: string; ok?: boolean }) {
  return (
    <>
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-medium ${ok === true ? 'text-emerald-600' : ok === false ? 'text-destructive' : 'text-foreground'}`}>
        {value}
      </span>
    </>
  );
}

/* ── Main Component ── */

export default function AdminIntegrations() {
  const [researchMode, setResearchMode] = useState<CompetitorResearchPreference>('auto');

  useEffect(() => {
    const defaults = repository.marketIntelligenceDefaults.get();
    setResearchMode(defaults.competitorResearchMode || 'auto');
  }, []);

  const handleResearchModeChange = (mode: CompetitorResearchPreference) => {
    setResearchMode(mode);
    const defaults = repository.marketIntelligenceDefaults.get();
    repository.marketIntelligenceDefaults.save({ ...defaults, competitorResearchMode: mode });
    toast({
      title: 'Research Mode Updated',
      description: `Competitor research default set to "${RESEARCH_MODES.find(m => m.value === mode)?.label}".`,
    });
  };

  const handleIntegrationAction = (label: string, status: string) => {
    toast({
      title: status === 'connected' ? `${label} Settings` : `Connect ${label}`,
      description: 'Integration configuration coming soon.',
    });
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Integrations</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage global integration connections. Client-level mapping is configured in each Client Hub.
        </p>
      </div>

      {/* ── Competitor Research Mode ── */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Globe className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Competitor Research Provider</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Control how Market Intelligence discovers competitors. This sets the default for all new runs.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {RESEARCH_MODES.map(opt => {
              const Icon = opt.icon;
              const isActive = researchMode === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => handleResearchModeChange(opt.value)}
                  className={`flex flex-col items-start gap-1.5 p-3 rounded-lg text-left transition-colors border ${
                    isActive
                      ? 'bg-primary/10 border-primary'
                      : 'bg-muted/50 border-transparent hover:bg-muted'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className={`text-sm font-medium ${isActive ? 'text-primary' : 'text-foreground'}`}>{opt.label}</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground leading-tight">{opt.description}</span>
                </button>
              );
            })}
          </div>
          <p className="text-[10px] text-muted-foreground italic">
            Users can override this per-run in the Market Intelligence setup step.
          </p>
        </CardContent>
      </Card>

      {/* ── Test Provider ── */}
      <SearchProviderTest researchMode={researchMode} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {defaultIntegrations.map(integration => {
          const status = statusConfig[integration.status];
          const StatusIcon = status.icon;
          const config = configLabels[integration.configCompleteness];

          return (
            <Card key={integration.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Plug className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{integration.label}</CardTitle>
                      {integration.accountLabel && (
                        <p className="text-xs text-muted-foreground mt-0.5">{integration.accountLabel}</p>
                      )}
                    </div>
                  </div>
                  <Badge variant="outline" className={status.className}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {status.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <CardDescription>{integration.description}</CardDescription>

                {integration.status === 'connected' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{config.label}</span>
                      <span>{config.percent}%</span>
                    </div>
                    <Progress value={config.percent} className="h-1.5" />
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {integration.lastChecked && (
                      <span>Checked {new Date(integration.lastChecked).toLocaleDateString()}</span>
                    )}
                    {integration.clientMappings !== undefined && integration.clientMappings > 0 && (
                      <span className="flex items-center gap-1">
                        <Link2 className="h-3 w-3" />
                        {integration.clientMappings} client{integration.clientMappings !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => handleIntegrationAction(integration.label, integration.status)}
                  >
                    <ExternalLink className="h-3 w-3 mr-1.5" />
                    {integration.status === 'connected' ? 'Configure' : 'Connect'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
