import { Tags, Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { seedTaxonomyGroups } from '@/data/adminSeed';

export default function AdminTaxonomy() {
  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Data & Defaults</h2>
        <p className="text-sm text-muted-foreground mt-1">
          System-wide controlled vocabularies, stage definitions, and default values.
        </p>
      </div>

      <div className="space-y-6">
        {seedTaxonomyGroups.map(group => (
          <Card key={group.key}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Tags className="h-4 w-4" />
                {group.label}
              </CardTitle>
              <CardDescription>{group.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {group.items.map(item => (
                  <Badge
                    key={item.id}
                    variant="outline"
                    className={`cursor-default ${
                      item.enabled
                        ? 'bg-primary/5 text-foreground border-primary/20'
                        : 'bg-muted text-muted-foreground line-through'
                    }`}
                  >
                    {item.enabled ? (
                      <Check className="h-3 w-3 mr-1 text-primary" />
                    ) : (
                      <X className="h-3 w-3 mr-1 text-muted-foreground" />
                    )}
                    {item.label}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
