/**
 * ServicesConfig — deal builder tab.
 * Users select admin packages (source of truth for pricing), not configure pricing manually.
 */
import { useState, useMemo } from 'react';
import { useClientContext } from '@/contexts/ClientContext';
import { repository } from '@/lib/repository';
import type { ProposedAgencyService, PricingOverrides } from '@/types/commercialServices';
import { DEFAULT_PAID_MEDIA_CONFIG, resolveServiceFee, resolveSetupFee } from '@/types/commercialServices';
import type { ServiceLine, ServicePackage, PackageDeliverable } from '@/types/services';
import { PACKAGE_PRICING_MODEL_LABELS, pricingModelUnit } from '@/types/services';
import { formatCurrency } from '@/lib/parsing';
import { Plus, Trash2, Package, ExternalLink, ChevronDown, ChevronRight, Settings2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import PaidMediaConfig from './proposal/PaidMediaConfig';

export default function ServicesConfig() {
  const { onboarding, updateOnboarding, growthModel } = useClientContext();
  const services: ProposedAgencyService[] = (onboarding as any).proposedAgencyServices || [];

  const allLines = useMemo(() => repository.serviceLines.getAll().filter(l => l.status === 'active'), []);
  const allPackages = useMemo(() => repository.servicePackages.getAll().filter(p => p.active), []);

  // Monthly media spend from growth model
  const monthlyMediaSpend = useMemo(() => {
    if (!growthModel) return 0;
    const scenario = growthModel.scenarios.find(s => s.isDefault) || growthModel.scenarios[0];
    if (!scenario) return 0;
    const totalBudget = scenario.mediaChannelPlans.reduce(
      (sum, mp) => sum + mp.monthlyRecords.reduce((s, r) => s + r.plannedBudget, 0), 0
    );
    return totalBudget / (growthModel.monthCount || 1);
  }, [growthModel]);

  const handleChange = (updated: ProposedAgencyService[]) => {
    updateOnboarding({ ...onboarding, proposedAgencyServices: updated } as any);
  };

  const handleDelete = (id: string) => handleChange(services.filter(s => s.id !== id));

  const handleUpdateService = (updated: ProposedAgencyService) => {
    handleChange(services.map(s => s.id === updated.id ? updated : s));
  };

  // Totals
  const totals = useMemo(() => {
    let monthly = 0;
    let setup = 0;
    for (const svc of services) {
      const pkg = allPackages.find(p => p.id === svc.selectedPackageId);
      monthly += resolveServiceFee(svc, pkg?.basePrice ?? 0, monthlyMediaSpend, pkg?.pricingModel);
      setup += resolveSetupFee(svc);
    }
    return { monthly, setup };
  }, [services, allPackages, monthlyMediaSpend]);

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">Services Configuration</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Select packages from your admin catalog. Pricing comes from packages — override only when needed.
          </p>
        </div>
        <AddServiceButton
          allLines={allLines}
          allPackages={allPackages}
          existingServices={services}
          onAdd={(svc) => handleChange([...services, svc])}
        />
      </div>

      {services.length === 0 ? (
        <div className="panel p-8 text-center">
          <Package className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground">No services selected yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Add services from your admin package catalog using the button above.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {services.map(svc => (
            <ServiceCard
              key={svc.id}
              service={svc}
              pkg={allPackages.find(p => p.id === svc.selectedPackageId)}
              line={allLines.find(l => l.id === svc.serviceLineId)}
              monthlyMediaSpend={monthlyMediaSpend}
              hasMediaPlan={monthlyMediaSpend > 0}
              onUpdate={handleUpdateService}
              onDelete={() => handleDelete(svc.id)}
            />
          ))}

          {/* Totals */}
          <div className="panel p-4 bg-muted/30">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">Total</span>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Monthly</p>
                  <p className="text-base font-semibold tabular-nums text-primary">{formatCurrency(totals.monthly)}</p>
                </div>
                {totals.setup > 0 && (
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Setup</p>
                    <p className="text-base font-semibold tabular-nums text-foreground">{formatCurrency(totals.setup)}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Add Service Button (multi-step: line → package) ── */

function AddServiceButton({
  allLines, allPackages, existingServices, onAdd,
}: {
  allLines: ServiceLine[];
  allPackages: ServicePackage[];
  existingServices: ProposedAgencyService[];
  onAdd: (svc: ProposedAgencyService) => void;
}) {
  const [open, setOpen] = useState(false);
  const [selectedLineId, setSelectedLineId] = useState<string>('');
  const linePackages = allPackages.filter(p => p.serviceLineId === selectedLineId);
  const selectedLine = allLines.find(l => l.id === selectedLineId);

  const handleSelectPackage = (pkg: ServicePackage) => {
    const now = new Date();
    const isPaidMedia = selectedLine?.name === 'Paid Media Management';
    const svc: ProposedAgencyService = {
      id: `pas-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      serviceLine: selectedLine?.name || '',
      serviceLineId: selectedLineId,
      selectedPackageId: pkg.id,
      startMonth: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
      durationMonths: 6,
      notes: '',
      overrideEnabled: false,
      pricingOverrides: {},
      ...(isPaidMedia ? { paidMediaConfig: { ...DEFAULT_PAID_MEDIA_CONFIG } } : {}),
    };
    onAdd(svc);
    setOpen(false);
    setSelectedLineId('');
    toast.success(`Added ${selectedLine?.name} — ${pkg.name}`);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-md hover:opacity-90 transition-opacity"
      >
        <Plus className="h-3.5 w-3.5" /> Add Service
      </button>
    );
  }

  return (
    <div className="panel p-4 bg-muted/30 space-y-3 w-full max-w-md">
      <p className="text-xs font-medium text-muted-foreground">Step 1: Select Service Line</p>
      <Select value={selectedLineId} onValueChange={setSelectedLineId}>
        <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Choose service line..." /></SelectTrigger>
        <SelectContent>
          {allLines.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
        </SelectContent>
      </Select>

      {selectedLineId && (
        <>
          <p className="text-xs font-medium text-muted-foreground mt-2">Step 2: Select Package</p>
          {linePackages.length === 0 ? (
            <p className="text-xs text-muted-foreground">No packages defined for this service line. <a href="/admin" className="text-primary hover:underline inline-flex items-center gap-0.5">Create in Admin <ExternalLink className="h-3 w-3" /></a></p>
          ) : (
            <div className="grid gap-2">
              {linePackages.map(pkg => (
                <button
                  key={pkg.id}
                  onClick={() => handleSelectPackage(pkg)}
                  className="text-left panel p-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{pkg.name}</span>
                    <span className="text-sm font-semibold tabular-nums text-primary">{formatCurrency(pkg.basePrice)}{pricingModelUnit(pkg.pricingModel)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{pkg.description}</p>
                  {pkg.deliverables.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {pkg.deliverables.slice(0, 3).map(d => (
                        <Badge key={d.key} variant="secondary" className="text-[10px]">{d.label}: {String(d.value)}</Badge>
                      ))}
                      {pkg.deliverables.length > 3 && (
                        <Badge variant="outline" className="text-[10px]">+{pkg.deliverables.length - 3} more</Badge>
                      )}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      <button onClick={() => { setOpen(false); setSelectedLineId(''); }} className="text-xs text-muted-foreground hover:text-foreground">
        Cancel
      </button>
    </div>
  );
}

/* ── Service Card ── */

function ServiceCard({
  service, pkg, line, monthlyMediaSpend, hasMediaPlan, onUpdate, onDelete,
}: {
  service: ProposedAgencyService;
  pkg: ServicePackage | undefined;
  line: ServiceLine | undefined;
  monthlyMediaSpend: number;
  hasMediaPlan: boolean;
  onUpdate: (svc: ProposedAgencyService) => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const fee = resolveServiceFee(service, pkg?.basePrice ?? 0, monthlyMediaSpend, pkg?.pricingModel);
  const setupFee = resolveSetupFee(service);
  const isHourly = pkg?.pricingModel === 'hourly';
  const isFixedScope = pkg?.pricingModel === 'fixed_scope';
  const unit = pkg ? pricingModelUnit(pkg.pricingModel) : '/mo';
  const feeLabel = isHourly ? formatCurrency(fee) + '/mo' : isFixedScope ? formatCurrency(fee) + ' total' : formatCurrency(fee);

  return (
    <div className="panel overflow-hidden">
      {/* Header row */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setExpanded(!expanded)} className="text-muted-foreground hover:text-foreground">
            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">{service.serviceLine}</span>
              {pkg && <Badge variant="secondary" className="text-[10px]">{pkg.name}</Badge>}
              {pkg && <Badge variant="outline" className="text-[10px]">{PACKAGE_PRICING_MODEL_LABELS[pkg.pricingModel]}</Badge>}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {service.durationMonths} mo · starts {service.startMonth}
              {service.overrideEnabled && <span className="ml-1 text-amber-500 font-medium">· override</span>}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-semibold tabular-nums text-foreground">{formatCurrency(fee)}<span className="text-xs text-muted-foreground font-normal">/mo</span></p>
            {setupFee > 0 && <p className="text-[10px] text-muted-foreground">+ {formatCurrency(setupFee)} setup</p>}
          </div>
          <button onClick={onDelete} className="p-1 text-muted-foreground hover:text-destructive">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t px-4 pb-4 pt-3 space-y-4 bg-muted/10">
          {/* Deliverables (read-only from package) */}
          {pkg && pkg.deliverables.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1.5">Deliverables (from package)</p>
              <div className="grid grid-cols-2 gap-1.5">
                {pkg.deliverables.map((d: PackageDeliverable) => (
                  <div key={d.key} className="flex justify-between bg-muted/30 rounded px-2.5 py-1.5 text-xs">
                    <span className="text-muted-foreground">{d.label}</span>
                    <span className="font-medium text-foreground">{String(d.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Optional fields */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Start Month</Label>
              <Input
                type="month" value={service.startMonth}
                onChange={e => onUpdate({ ...service, startMonth: e.target.value })}
                className="h-8 text-xs mt-1"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Duration (months)</Label>
              <Input
                type="number" value={service.durationMonths} min={1}
                onChange={e => onUpdate({ ...service, durationMonths: parseInt(e.target.value) || 1 })}
                className="h-8 text-xs mt-1"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Notes</Label>
              <Input
                value={service.notes}
                onChange={e => onUpdate({ ...service, notes: e.target.value })}
                placeholder="Optional" className="h-8 text-xs mt-1"
              />
            </div>
          </div>

          {/* Paid Media Config */}
          {service.paidMediaConfig && (
            <PaidMediaConfig
              config={service.paidMediaConfig}
              onChange={cfg => onUpdate({ ...service, paidMediaConfig: cfg })}
              monthlyMediaSpend={monthlyMediaSpend}
              hasMediaPlan={hasMediaPlan}
            />
          )}

          {/* Override toggle */}
          <div className="border-t pt-3">
            <div className="flex items-center gap-2">
              <Switch
                checked={service.overrideEnabled}
                onCheckedChange={v => onUpdate({ ...service, overrideEnabled: v, pricingOverrides: v ? service.pricingOverrides : {} })}
              />
              <Label className="text-xs text-muted-foreground flex items-center gap-1">
                <Settings2 className="h-3 w-3" /> Pricing override
              </Label>
            </div>
            {service.overrideEnabled && (
              <div className="grid grid-cols-2 gap-3 mt-2">
                <div>
                  <Label className="text-xs text-muted-foreground">Monthly Fee Override</Label>
                  <Input
                    type="number" placeholder={pkg ? formatCurrency(pkg.basePrice) : '$0'}
                    value={service.pricingOverrides.monthlyFee ?? ''}
                    onChange={e => onUpdate({
                      ...service,
                      pricingOverrides: { ...service.pricingOverrides, monthlyFee: e.target.value ? parseFloat(e.target.value) : undefined },
                    })}
                    className="h-8 text-xs mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Setup Fee Override</Label>
                  <Input
                    type="number" placeholder="$0"
                    value={service.pricingOverrides.setupFee ?? ''}
                    onChange={e => onUpdate({
                      ...service,
                      pricingOverrides: { ...service.pricingOverrides, setupFee: e.target.value ? parseFloat(e.target.value) : undefined },
                    })}
                    className="h-8 text-xs mt-1"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Admin link */}
          <p className="text-[10px] text-muted-foreground">
            Package pricing managed in <a href="/admin" className="text-primary hover:underline inline-flex items-center gap-0.5">Admin → Packages <ExternalLink className="h-2.5 w-2.5" /></a>
          </p>
        </div>
      )}
    </div>
  );
}
