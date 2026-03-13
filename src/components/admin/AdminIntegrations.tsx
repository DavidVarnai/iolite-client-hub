import { Plug, CheckCircle2, XCircle, AlertCircle, ExternalLink, Link2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { defaultIntegrations } from '@/data/adminSeed';
import type { ConfigurationCompleteness } from '@/types/admin';

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

export default function AdminIntegrations() {
  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Integrations</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage global integration connections. Client-level mapping is configured in each Client Hub.
        </p>
      </div>

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
                  <Button variant="outline" size="sm" className="text-xs">
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
