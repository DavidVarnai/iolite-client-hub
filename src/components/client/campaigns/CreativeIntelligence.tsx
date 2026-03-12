import { Client } from '@/types';
import { CreativeLearning, PLATFORM_LABELS } from '@/types/campaigns';
import { getPerformanceForCampaign, getCampaignsForClient, seedCreativePerformance } from '@/data/campaignSeed';
import { Brain, TrendingUp, TrendingDown, Target, Lightbulb } from 'lucide-react';

export default function CreativeIntelligence({ client, learnings }: { client: Client; learnings: CreativeLearning[] }) {
  const campaigns = getCampaignsForClient(client.id);
  const performance = campaigns.flatMap(c => getPerformanceForCampaign(c.id));

  // Categorize learnings
  const winners = learnings.filter(l => (l.confidenceScore || 0) >= 0.7);
  const cautions = learnings.filter(l => (l.confidenceScore || 0) < 0.7);

  return (
    <div className="p-6 max-w-5xl space-y-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Creative Intelligence</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Learnings and patterns from {client.name}'s campaigns.</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard icon={<Brain className="w-4 h-4" />} label="Total Learnings" value={String(learnings.length)} />
        <StatCard icon={<TrendingUp className="w-4 h-4" />} label="Winning Patterns" value={String(winners.length)} />
        <StatCard icon={<Target className="w-4 h-4" />} label="Campaigns Tracked" value={String(campaigns.length)} />
        <StatCard icon={<Lightbulb className="w-4 h-4" />} label="Performance Records" value={String(performance.length)} />
      </div>

      {/* Winning Patterns */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" /> Winning Patterns
        </h3>
        {winners.length === 0 ? (
          <p className="text-xs text-muted-foreground">No high-confidence patterns yet.</p>
        ) : (
          <div className="grid gap-3">
            {winners.map(learning => (
              <LearningCard key={learning.id} learning={learning} type="win" />
            ))}
          </div>
        )}
      </div>

      {/* Cautions / Lower confidence */}
      {cautions.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <TrendingDown className="w-4 h-4" /> Observations & Cautions
          </h3>
          <div className="grid gap-3">
            {cautions.map(learning => (
              <LearningCard key={learning.id} learning={learning} type="caution" />
            ))}
          </div>
        </div>
      )}

      {/* Performance Data */}
      {performance.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Performance Data</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3 font-medium text-muted-foreground">Campaign</th>
                  <th className="text-left py-2 px-3 font-medium text-muted-foreground">Platform</th>
                  <th className="text-left py-2 px-3 font-medium text-muted-foreground">Period</th>
                  <th className="text-right py-2 px-3 font-medium text-muted-foreground">Spend</th>
                  <th className="text-right py-2 px-3 font-medium text-muted-foreground">Impressions</th>
                  <th className="text-right py-2 px-3 font-medium text-muted-foreground">CTR</th>
                  <th className="text-right py-2 px-3 font-medium text-muted-foreground">CPC</th>
                  <th className="text-right py-2 px-3 font-medium text-muted-foreground">Conv.</th>
                  <th className="text-right py-2 px-3 font-medium text-muted-foreground">CPA</th>
                  <th className="text-right py-2 px-3 font-medium text-muted-foreground">ROAS</th>
                </tr>
              </thead>
              <tbody>
                {performance.map(p => {
                  const camp = campaigns.find(c => c.id === p.campaignId);
                  return (
                    <tr key={p.id} className="border-b hover:bg-muted/30">
                      <td className="py-2 px-3 font-medium">{camp?.name || '—'}</td>
                      <td className="py-2 px-3">{PLATFORM_LABELS[p.platform]}</td>
                      <td className="py-2 px-3">{p.dateRange}</td>
                      <td className="py-2 px-3 text-right">${p.spend.toLocaleString()}</td>
                      <td className="py-2 px-3 text-right">{p.impressions.toLocaleString()}</td>
                      <td className="py-2 px-3 text-right">{p.ctr}%</td>
                      <td className="py-2 px-3 text-right">${p.cpc.toFixed(2)}</td>
                      <td className="py-2 px-3 text-right">{p.conversions}</td>
                      <td className="py-2 px-3 text-right">${p.cpa.toFixed(2)}</td>
                      <td className="py-2 px-3 text-right">{p.roas > 0 ? `${p.roas}x` : '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="panel p-4 flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">{icon}</div>
      <div>
        <p className="text-lg font-semibold">{value}</p>
        <p className="text-[10px] text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function LearningCard({ learning, type }: { learning: CreativeLearning; type: 'win' | 'caution' }) {
  const confidence = learning.confidenceScore ? Math.round(learning.confidenceScore * 100) : null;

  return (
    <div className="panel p-4 space-y-2">
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm">{learning.resultSummary}</p>
        {confidence !== null && (
          <span className="status-badge bg-muted text-muted-foreground flex-shrink-0">{confidence}% confidence</span>
        )}
      </div>
      <div className="flex flex-wrap gap-3 text-[10px] text-muted-foreground">
        {learning.platform && <span>Platform: {PLATFORM_LABELS[learning.platform]}</span>}
        {learning.angleType && <span>Angle: {learning.angleType.replace(/_/g, ' ')}</span>}
        {learning.hookPattern && <span>Hook: {learning.hookPattern.replace(/_/g, ' ')}</span>}
        {learning.visualPattern && <span>Visual: {learning.visualPattern.replace(/_/g, ' ')}</span>}
        {learning.audienceType && <span>Audience: {learning.audienceType.replace(/_/g, ' ')}</span>}
        {learning.ctaPattern && <span>CTA: {learning.ctaPattern.replace(/_/g, ' ')}</span>}
      </div>
    </div>
  );
}
