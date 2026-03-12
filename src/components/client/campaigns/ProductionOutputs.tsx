import { Campaign, CreativeOutput, PLATFORM_LABELS } from '@/types/campaigns';
import { FileText, Image, Video, Layout } from 'lucide-react';

const formatIcon: Record<string, React.ReactNode> = {
  static_image: <Image className="w-4 h-4" />,
  carousel: <Layout className="w-4 h-4" />,
  short_form_video: <Video className="w-4 h-4" />,
  reel_story: <Video className="w-4 h-4" />,
  search_copy: <FileText className="w-4 h-4" />,
  pmax_visual_pack: <Layout className="w-4 h-4" />,
};

export default function ProductionOutputs({ campaign }: { campaign: Campaign }) {
  const approvedConcepts = campaign.concepts.filter(c => c.status === 'approved');
  const allOutputs = approvedConcepts.flatMap(c => c.outputs.map(o => ({ ...o, conceptName: c.name })));

  return (
    <div className="p-6 max-w-5xl space-y-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Production Outputs</h2>
        <p className="text-xs text-muted-foreground mt-0.5">{allOutputs.length} output{allOutputs.length !== 1 ? 's' : ''} from {approvedConcepts.length} approved concept{approvedConcepts.length !== 1 ? 's' : ''}</p>
      </div>

      {approvedConcepts.length === 0 ? (
        <div className="panel p-8 text-center">
          <p className="text-sm text-muted-foreground">Approve concepts first to generate production assets.</p>
        </div>
      ) : (
        approvedConcepts.map(concept => (
          <div key={concept.id} className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold">{concept.name}</h3>
              <span className="status-badge" style={{ backgroundColor: 'hsl(140 49% 96%)', color: 'hsl(142 64% 32%)' }}>Approved</span>
            </div>

            {concept.outputs.length === 0 ? (
              <div className="panel p-5 text-center">
                <p className="text-xs text-muted-foreground mb-3">No outputs generated yet.</p>
                <button className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors">
                  Generate Production Assets
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {concept.outputs.map(output => (
                  <OutputCard key={output.id} output={output} />
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

function OutputCard({ output }: { output: CreativeOutput }) {
  const isSearch = output.platform === 'google_search';
  const isPmax = output.platform === 'google_pmax';

  return (
    <div className="panel p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {formatIcon[output.formatType] || <FileText className="w-4 h-4" />}
          <span className="text-sm font-medium capitalize">{output.formatType.replace(/_/g, ' ')}</span>
          <span className="text-xs text-muted-foreground">· {PLATFORM_LABELS[output.platform]}</span>
        </div>
        <span className="status-badge bg-muted text-muted-foreground capitalize">{output.outputStatus}</span>
      </div>

      {/* Standard Meta-style output */}
      {!isSearch && !isPmax && (
        <div className="grid grid-cols-2 gap-4">
          {output.copyHeadline && (
            <div className="space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Headline</p>
              <p className="text-sm font-medium">{output.copyHeadline}</p>
            </div>
          )}
          {output.copyDescription && (
            <div className="space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Description</p>
              <p className="text-xs">{output.copyDescription}</p>
            </div>
          )}
          {output.copyPrimary && (
            <div className="col-span-2 space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Primary Text</p>
              <p className="text-xs whitespace-pre-line">{output.copyPrimary}</p>
            </div>
          )}
          {output.visualBrief && (
            <div className="col-span-2 space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Visual Brief</p>
              <p className="text-xs text-muted-foreground">{output.visualBrief}</p>
            </div>
          )}
        </div>
      )}

      {/* Google Search output */}
      {isSearch && (
        <div className="space-y-4">
          {output.headlines && output.headlines.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Headlines ({output.headlines.length})</p>
              <div className="grid grid-cols-3 gap-2">
                {output.headlines.map((h, i) => (
                  <span key={i} className="px-2 py-1.5 bg-muted rounded text-xs">{h}</span>
                ))}
              </div>
            </div>
          )}
          {output.descriptions && output.descriptions.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Descriptions ({output.descriptions.length})</p>
              {output.descriptions.map((d, i) => (
                <p key={i} className="text-xs p-2 bg-muted rounded">{d}</p>
              ))}
            </div>
          )}
          {output.searchIntentNotes && (
            <div className="space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Search Intent Notes</p>
              <p className="text-xs text-muted-foreground">{output.searchIntentNotes}</p>
            </div>
          )}
          {output.extensionIdeas && output.extensionIdeas.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Extension Ideas</p>
              <div className="flex flex-wrap gap-1.5">
                {output.extensionIdeas.map((e, i) => (
                  <span key={i} className="px-2 py-0.5 bg-muted rounded text-[10px]">{e}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
