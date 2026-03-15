/**
 * FunnelVisualPreview — read-only visual flow diagram of the structured funnel.
 * Renders: Traffic Sources → Landing → Conversion Paths → Sales Process (optional).
 */
import { useMemo } from 'react';
import type { FunnelStage, FunnelStageCategory } from '@/types/onboarding';
import { FUNNEL_STAGE_OPTIONS } from '@/types/onboarding';
import { cn } from '@/lib/utils';

interface Props {
  stages: FunnelStage[];
}

// Stages whose conversion path should show a sales sub-funnel
const LEAD_BASED_CONVERSIONS = new Set([
  'Form Submission', 'Quote Request', 'Demo Request',
  'Lead Form', 'Consultation', 'Application Submitted',
]);

// Category → visual config
const NODE_STYLES: Record<FunnelStageCategory | 'sales', { bg: string; border: string; text: string; dot: string }> = {
  traffic:          { bg: 'bg-sky-500/10',     border: 'border-sky-500/25',     text: 'text-sky-700 dark:text-sky-300',         dot: 'bg-sky-500' },
  page_interaction: { bg: 'bg-blue-600/10',    border: 'border-blue-600/25',    text: 'text-blue-700 dark:text-blue-300',       dot: 'bg-blue-600' },
  lead_capture:     { bg: 'bg-violet-500/10',  border: 'border-violet-500/25',  text: 'text-violet-700 dark:text-violet-300',   dot: 'bg-violet-500' },
  qualification:    { bg: 'bg-amber-500/10',   border: 'border-amber-500/25',   text: 'text-amber-700 dark:text-amber-300',     dot: 'bg-amber-500' },
  conversion:       { bg: 'bg-purple-500/10',  border: 'border-purple-500/25',  text: 'text-purple-700 dark:text-purple-300',   dot: 'bg-purple-500' },
  sales:            { bg: 'bg-emerald-500/10', border: 'border-emerald-500/25', text: 'text-emerald-700 dark:text-emerald-300', dot: 'bg-emerald-500' },
};

interface FunnelLayer {
  label: string;
  type: FunnelStageCategory | 'sales';
  nodes: { name: string; hasSalesBranch?: boolean }[];
}

/** Build visual layers from flat stage list */
function buildLayers(stages: FunnelStage[]): FunnelLayer[] {
  if (!stages.length) return [];

  const layers: FunnelLayer[] = [];

  // Group by category preserving order
  const categoryOrder: FunnelStageCategory[] = ['traffic', 'page_interaction', 'lead_capture', 'qualification', 'conversion'];
  const grouped: Partial<Record<FunnelStageCategory, FunnelStage[]>> = {};
  for (const s of stages) {
    if (!s.name) continue;
    if (!grouped[s.category]) grouped[s.category] = [];
    grouped[s.category]!.push(s);
  }

  // Map categories to conceptual layers
  // Traffic → "Traffic Sources"
  if (grouped.traffic?.length) {
    layers.push({
      label: 'Traffic Sources',
      type: 'traffic',
      nodes: grouped.traffic.map(s => ({ name: s.name })),
    });
  }

  // Page interaction → "Landing Experience"
  if (grouped.page_interaction?.length) {
    layers.push({
      label: 'Landing Experience',
      type: 'page_interaction',
      nodes: grouped.page_interaction.map(s => ({ name: s.name })),
    });
  }

  // Lead capture → "Conversion Paths"
  if (grouped.lead_capture?.length) {
    layers.push({
      label: 'Conversion Paths',
      type: 'lead_capture',
      nodes: grouped.lead_capture.map(s => ({
        name: s.name,
        hasSalesBranch: LEAD_BASED_CONVERSIONS.has(s.name),
      })),
    });
  }

  // Qualification + Conversion → "Sales Process" (only if lead-based stages exist)
  const salesStages = [...(grouped.qualification || []), ...(grouped.conversion || [])];
  if (salesStages.length) {
    // Only show sales layer if there's a lead-based conversion path
    const hasLeadPath = grouped.lead_capture?.some(s => LEAD_BASED_CONVERSIONS.has(s.name));
    if (hasLeadPath || !grouped.lead_capture?.length) {
      layers.push({
        label: 'Sales Process',
        type: 'sales',
        nodes: salesStages.map(s => ({ name: s.name })),
      });
    }
  }

  return layers;
}

function ArrowDown({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col items-center', className)}>
      <div className="w-px h-5 bg-border" />
      <svg width="10" height="6" viewBox="0 0 10 6" className="text-border">
        <path d="M0 0 L5 6 L10 0" fill="currentColor" />
      </svg>
    </div>
  );
}

function NodeChip({ name, type }: { name: string; type: FunnelStageCategory | 'sales' }) {
  const style = NODE_STYLES[type];
  return (
    <div className={cn(
      'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium',
      style.bg, style.border, style.text,
    )}>
      <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', style.dot)} />
      {name}
    </div>
  );
}

export default function FunnelVisualPreview({ stages }: Props) {
  const layers = useMemo(() => buildLayers(stages), [stages]);

  if (!layers.length) return null;

  return (
    <div className="mt-4 p-4 rounded-lg bg-muted/30 border space-y-0">
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-4">
        Visual Funnel Preview
      </p>

      <div className="flex flex-col items-center gap-0">
        {layers.map((layer, li) => (
          <div key={li} className="flex flex-col items-center w-full">
            {/* Arrow between layers */}
            {li > 0 && <ArrowDown />}

            {/* Layer label */}
            <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">
              {layer.label}
            </p>

            {/* Nodes */}
            <div className="flex flex-wrap justify-center gap-2 mb-1">
              {layer.nodes.map((node, ni) => (
                <div key={ni} className="flex flex-col items-center">
                  <NodeChip name={node.name} type={layer.type} />
                  {/* Lead-based indicator dot */}
                  {node.hasSalesBranch && (
                    <div className="mt-1 flex items-center gap-1">
                      <span className="h-1 w-1 rounded-full bg-emerald-500" />
                      <span className="text-[8px] text-emerald-600 dark:text-emerald-400 font-medium">sales path</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Connector lines for multiple nodes converging */}
            {layer.nodes.length > 1 && li < layers.length - 1 && (
              <div className="relative w-full flex justify-center my-0.5">
                {/* Horizontal bar spanning node group */}
                <div className="h-px bg-border" style={{ width: `${Math.min(layer.nodes.length * 80, 320)}px` }} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
