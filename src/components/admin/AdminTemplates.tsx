import { LayoutTemplate } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { seedTemplates } from '@/data/adminSeed';
import type { TemplateCategory } from '@/types/admin';

const categoryLabels: Record<TemplateCategory, string> = {
  onboarding: 'Onboarding',
  strategy: 'Strategy',
  growth_model: 'Growth Model',
  proposal: 'Proposal',
  meeting: 'Meeting',
  task: 'Task',
  ai_prompt: 'AI Prompt',
};

export default function AdminTemplates() {
  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Templates</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage reusable agency frameworks, presets, and AI prompt templates.
        </p>
      </div>

      {/* Group by category */}
      {Object.entries(categoryLabels).map(([cat, label]) => {
        const templates = seedTemplates.filter(t => t.category === cat);
        if (templates.length === 0) return null;

        return (
          <div key={cat}>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <LayoutTemplate className="h-4 w-4" />
              {label}
            </h3>
            <div className="space-y-2">
              {templates.map(t => (
                <Card key={t.id}>
                  <CardHeader className="py-3 px-4 flex-row items-center justify-between space-y-0">
                    <div className="flex items-center gap-3">
                      <div>
                        <CardTitle className="text-sm">{t.name}</CardTitle>
                        <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {t.isDefault && (
                        <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20">
                          Default
                        </Badge>
                      )}
                      <Switch checked={t.enabled} aria-label={`Toggle ${t.name}`} />
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
