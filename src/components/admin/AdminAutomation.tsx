import { Cpu, ShieldCheck, Webhook } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { seedAiModules } from '@/data/adminSeed';

export default function AdminAutomation() {
  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Automation & AI</h2>
        <p className="text-sm text-muted-foreground mt-1">
          System-wide control over AI modules, prompt presets, and automation triggers.
        </p>
      </div>

      {/* AI Module Controls */}
      <div>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Cpu className="h-4 w-4" /> AI Modules
        </h3>
        <div className="space-y-2">
          {seedAiModules.map(mod => (
            <Card key={mod.moduleId}>
              <CardHeader className="py-3 px-4 flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-sm">{mod.label}</CardTitle>
                  <CardDescription className="text-xs mt-0.5">{mod.description}</CardDescription>
                </div>
                <div className="flex items-center gap-4">
                  {mod.requiresApproval && (
                    <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-700 border-amber-500/20">
                      <ShieldCheck className="h-3 w-3 mr-1" />
                      Requires Approval
                    </Badge>
                  )}
                  <Switch checked={mod.enabled} aria-label={`Toggle ${mod.label}`} />
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      <Separator />

      {/* Placeholder sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
              <Cpu className="h-4 w-4" /> Prompt Presets
            </CardTitle>
            <CardDescription className="text-xs">
              Custom prompt templates for each AI module. Coming soon.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
              <Webhook className="h-4 w-4" /> Automation Triggers
            </CardTitle>
            <CardDescription className="text-xs">
              Webhook endpoints and event-based triggers. Coming soon.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
