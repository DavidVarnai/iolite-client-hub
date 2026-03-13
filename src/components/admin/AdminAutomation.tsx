import { useState } from 'react';
import { Cpu, Webhook } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { seedAiModules } from '@/data/adminSeed';
import type { AiModuleMode } from '@/types/admin';
import { toast } from '@/hooks/use-toast';

const modeConfig: Record<AiModuleMode, { label: string; className: string }> = {
  disabled: { label: 'Disabled', className: 'bg-muted text-muted-foreground' },
  approval_required: { label: 'Approval Required', className: 'bg-amber-500/10 text-amber-700 border-amber-500/20' },
  auto_apply: { label: 'Auto Apply', className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
};

const modeOptions: { value: AiModuleMode; label: string }[] = [
  { value: 'disabled', label: 'Disabled' },
  { value: 'approval_required', label: 'Approval Required' },
  { value: 'auto_apply', label: 'Auto Apply' },
];

export default function AdminAutomation() {
  const [modules, setModules] = useState(() =>
    seedAiModules.map(m => ({ ...m }))
  );

  const handleModeChange = (moduleId: string, newMode: AiModuleMode) => {
    setModules(prev =>
      prev.map(m => m.moduleId === moduleId ? { ...m, mode: newMode } : m)
    );
    const mod = modules.find(m => m.moduleId === moduleId);
    toast({
      title: `${mod?.label || 'Module'} updated`,
      description: `Mode set to ${modeOptions.find(o => o.value === newMode)?.label}.`,
    });
  };

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
          {modules.map(mod => {
            return (
              <Card key={mod.moduleId}>
                <CardHeader className="py-3 px-4 flex-row items-center justify-between space-y-0">
                  <div>
                    <CardTitle className="text-sm">{mod.label}</CardTitle>
                    <CardDescription className="text-xs mt-0.5">{mod.description}</CardDescription>
                  </div>
                  <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
                    {modeOptions.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => handleModeChange(mod.moduleId, opt.value)}
                        className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors ${
                          mod.mode === opt.value
                            ? 'bg-background text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                        aria-label={`Set ${mod.label} to ${opt.label}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </CardHeader>
              </Card>
            );
          })}
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
