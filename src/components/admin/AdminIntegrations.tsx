import { Plug, CheckCircle2, XCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { defaultIntegrations } from '@/data/adminSeed';

const statusConfig = {
  connected: { icon: CheckCircle2, label: 'Connected', className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
  disconnected: { icon: XCircle, label: 'Not Connected', className: 'bg-muted text-muted-foreground' },
  error: { icon: AlertCircle, label: 'Error', className: 'bg-destructive/10 text-destructive border-destructive/20' },
} as const;

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

                {integration.lastChecked && (
                  <p className="text-xs text-muted-foreground">
                    Last checked: {new Date(integration.lastChecked).toLocaleDateString()}
                  </p>
                )}

                <div className="flex items-center gap-2 pt-1">
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
