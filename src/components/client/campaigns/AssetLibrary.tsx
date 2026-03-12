import { Client } from '@/types';
import { ClientAsset, ASSET_TYPE_LABELS, AssetTag } from '@/types/campaigns';
import { useState } from 'react';
import { Upload, Image, Video, FileText, Tag } from 'lucide-react';

const tagColors: Record<AssetTag, string> = {
  product: 'bg-primary/10 text-primary',
  lifestyle: 'bg-primary/10 text-primary',
  ugc: 'bg-muted text-muted-foreground',
  testimonial: 'bg-muted text-muted-foreground',
  brand: 'bg-muted text-muted-foreground',
  seasonal: 'bg-muted text-muted-foreground',
  promo: 'bg-muted text-muted-foreground',
  founder: 'bg-muted text-muted-foreground',
  static: 'bg-muted text-muted-foreground',
  video: 'bg-muted text-muted-foreground',
};

export default function AssetLibrary({ client, assets }: { client: Client; assets: ClientAsset[] }) {
  const [tagFilter, setTagFilter] = useState<AssetTag | 'all'>('all');
  const filtered = tagFilter === 'all' ? assets : assets.filter(a => a.tags.includes(tagFilter));
  const allTags: AssetTag[] = ['product', 'lifestyle', 'ugc', 'testimonial', 'brand', 'seasonal', 'promo', 'founder', 'static', 'video'];

  return (
    <div className="p-6 max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Asset Library</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{assets.length} asset{assets.length !== 1 ? 's' : ''} for {client.name}</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
          <Upload className="w-4 h-4" /> Upload Asset
        </button>
      </div>

      {/* Tag filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setTagFilter('all')}
          className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${tagFilter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
        >
          All
        </button>
        {allTags.map(tag => (
          <button
            key={tag}
            onClick={() => setTagFilter(tag)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize transition-colors ${tagFilter === tag ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Asset grid */}
      {filtered.length === 0 ? (
        <div className="panel p-8 text-center">
          <p className="text-sm text-muted-foreground">No assets found. Upload your first asset.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {filtered.map(asset => (
            <div key={asset.id} className="panel overflow-hidden group cursor-pointer hover:border-primary/30 transition-colors">
              {/* Thumbnail */}
              <div className="h-36 bg-muted flex items-center justify-center">
                {asset.assetType.includes('video') ? (
                  <Video className="w-8 h-8 text-muted-foreground" />
                ) : asset.assetType === 'logo' ? (
                  <FileText className="w-8 h-8 text-muted-foreground" />
                ) : (
                  <Image className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              <div className="p-3 space-y-2">
                <p className="text-xs font-medium truncate">{asset.title}</p>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span>{ASSET_TYPE_LABELS[asset.assetType]}</span>
                  <span>·</span>
                  <span>{asset.uploadedBy}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {asset.tags.map(tag => (
                    <span key={tag} className={`px-1.5 py-0.5 rounded text-[10px] font-medium capitalize ${tagColors[tag]}`}>{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
