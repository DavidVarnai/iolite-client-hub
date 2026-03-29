/**
 * ServicesConfig — deal builder tab.
 * Supports package-based services (from Admin catalog) and flexible-priced services.
 */
import { useState, useMemo } from 'react';
import { useClientContext } from '@/contexts/ClientContext';
import { repository } from '@/lib/repository';
import type { ProposedAgencyService, PricingOverrides, FlexPricing, FlexPricingMode } from '@/types/commercialServices';
import { DEFAULT_PAID_MEDIA_CONFIG, resolveServiceFee, resolveSetupFee, FLEX_PRICING_MODE_LABELS } from '@/types/commercialServices';
import type { ServiceLine, ServicePackage, PackageDeliverable } from '@/types/services';
import { PACKAGE_PRICING_MODEL_LABELS, pricingModelUnit } from '@/types/services';
import { formatCurrency } from '@/lib/parsing';
import { Plus, Trash2, Package, ExternalLink, ChevronDown, ChevronRight, Settings2, Pencil } from 'lucide-react';
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
            Select packages from your catalog or add custom-priced services.
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
            Add services from your package catalog or create custom-priced services.
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

/* ── Add Service Button ── */

type AddMode = 'choose' | 'package' | 'flexible';

function AddServiceButton({
  allLines, allPackages, existingServices, onAdd,
}: {
  allLines: ServiceLine[];
  allPackages: ServicePackage[];
  existingServices: ProposedAgencyService[];
  onAdd: (svc: ProposedAgencyService) => void;
}) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<AddMode>('choose');
  const [selectedLineId, setSelectedLineId] = useState<string>('');
  const [flexMode, setFlexMode] = useState<FlexPricingMode>('hourly');
  const [flexRate, setFlexRate] = useState<string>('');
  const [flexHours, setFlexHours] = useState<string>('');
  const [flexLabel, setFlexLabel] = useState<string>('');

  const linePackages = allPackages.filter(p => p.serviceLineId === selectedLineId);
  const selectedLine = allLines.find(l => l.id === selectedLineId);

  const reset = () => {
    setOpen(false);
    setMode('choose');
    setSelectedLineId('');
    setFlexMode('hourly');
    setFlexRate('');
    setFlexHours('');
    setFlexLabel('');
  };

  const now = new Date();
  const defaultStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const handleSelectPackage = (pkg: ServicePackage) => {
    const isPaidMedia = selectedLine?.name === 'Paid Media Management';
    const svc: ProposedAgencyService = {
      id: `pas-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      serviceLine: selectedLine?.name || '',
      serviceLineId: selectedLineId,
      selectedPackageId: pkg.id,
      startMonth: defaultStart,
      durationMonths: 6,
      notes: '',
      overrideEnabled: false,
      pricingOverrides: {},
      ...(isPaidMedia ? { paidMediaConfig: { ...DEFAULT_PAID_MEDIA_CONFIG } } : {}),
    };
    onAdd(svc);
    reset();
    toast.success(`Added ${selectedLine?.name} — ${pkg.name}`);
  };

  const handleAddFlexible = () => {
    const rate = parseFloat(flexRate) || 0;
    if (rate <= 0) { toast.error('Enter a valid rate/fee'); return; }
    const svc: ProposedAgencyService = {
      id: `pas-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      serviceLine: selectedLine?.name || 'Custom Service',
      serviceLineId: selectedLineId || '',
      selectedPackageId: '',
      startMonth: defaultStart,
      durationMonths: flexMode === 'fixed_scope' || flexMode === 'one_time' ? 1 : 6,
      notes: '',
      overrideEnabled: false,
      pricingOverrides: {},
      flexPricing: {
        mode: flexMode,
        rate,
        ...(flexMode === 'hourly' ? { estimatedHours: parseInt(flexHours) || 0 } : {}),
        ...(flexLabel ? { label: flexLabel } : {}),
      },
    };
    onAdd(svc);
    reset();
    toast.success(`Added custom ${FLEX_PRICING_MODE_LABELS[flexMode]} service`);
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
      {mode === 'choose' && (
        <>
          <p className="text-xs font-medium text-muted-foreground">How would you like to add this service?</p>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setMode('package')} className="panel p-3 hover:bg-muted/50 transition-colors text-left">
              <Package className="h-4 w-4 text-primary mb-1" />
              <p className="text-sm font-medium text-foreground">From Package</p>
              <p className="text-[10px] text-muted-foreground">Select a pre-defined package from your admin catalog</p>
            </button>
            <button onClick={() => setMode('flexible')} className="panel p-3 hover:bg-muted/50 transition-colors text-left">
              <Pencil className="h-4 w-4 text-primary mb-1" />
              <p className="text-sm font-medium text-foreground">Custom Pricing</p>
              <p className="text-[10px] text-muted-foreground">Hourly, retainer, fixed-scope, or one-time fee</p>
            </button>
          </div>
        </>
      )}

      {/* Package flow */}
      {mode === 'package' && (
        <>
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
        </>
      )}

      {/* Flexible pricing flow */}
      {mode === 'flexible' && (
        <>
          <p className="text-xs font-medium text-muted-foreground">Service Line (optional)</p>
          <Select value={selectedLineId} onValueChange={setSelectedLineId}>
            <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="None — custom service" /></SelectTrigger>
            <SelectContent>
              {allLines.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
            </SelectContent>
          </Select>

          <div>
            <Label className="text-xs text-muted-foreground">Service Label</Label>
            <Input
              value={flexLabel}
              onChange={e => setFlexLabel(e.target.value)}
              placeholder={selectedLine?.name || 'e.g. Strategy Workshop'}
              className="h-8 text-xs mt-1"
            />
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Pricing Model</Label>
            <Select value={flexMode} onValueChange={v => setFlexMode(v as FlexPricingMode)}>
              <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.entries(FLEX_PRICING_MODE_LABELS) as [FlexPricingMode, string][]).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">
                {flexMode === 'hourly' ? 'Hourly Rate ($)' : 'Fee ($)'}
              </Label>
              <Input
                type="number" min={0} value={flexRate}
                onChange={e => setFlexRate(e.target.value)}
                placeholder="0"
                className="h-8 text-xs mt-1"
              />
            </div>
            {flexMode === 'hourly' && (
              <div>
                <Label className="text-xs text-muted-foreground">Est. Hours / Month</Label>
                <Input
                  type="number" min={0} value={flexHours}
                  onChange={e => setFlexHours(e.target.value)}
                  placeholder="20"
                  className="h-8 text-xs mt-1"
                />
              </div>
            )}
          </div>

          {flexMode === 'hourly' && flexRate && flexHours && (
            <p className="text-xs text-muted-foreground">
              Estimated: <span className="font-medium text-foreground">{formatCurrency((parseFloat(flexRate) || 0) * (parseInt(flexHours) || 0))}/mo</span>
            </p>
          )}

          <button
            onClick={handleAddFlexible}
            className="w-full px-3 py-2 bg-primary text-primary-foreground text-xs font-medium rounded-md hover:opacity-90 transition-opacity"
          >
            Add Service
          </button>
        </>
      )}

      <button onClick={reset} className="text-xs text-muted-foreground hover:text-foreground">
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
  const isFlex = !!service.flexPricing;
  const flexMode = service.flexPricing?.mode;
  const isHourly = isFlex ? flexMode === 'hourly' : pkg?.pricingModel === 'hourly';
  const isFixedScope = isFlex ? (flexMode === 'fixed_scope' || flexMode === 'one_time') : pkg?.pricingModel === 'fixed_scope';
  const feeLabel = isHourly ? formatCurrency(fee) + '/mo' : isFixedScope ? formatCurrency(fee) + ' total' : formatCurrency(fee);
  const displayName = isFlex ? (service.flexPricing?.label || service.serviceLine || 'Custom Service') : service.serviceLine;

  return (
    <div className="panel overflow-hidden">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setExpanded(!expanded)} className="text-muted-foreground hover:text-foreground">
            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">{displayName}</span>
              {isFlex ? (
                <Badge variant="outline" className="text-[10px]">{FLEX_PRICING_MODE_LABELS[flexMode!]}</Badge>
              ) : (
                <>
                  {pkg && <Badge variant="secondary" className="text-[10px]">{pkg.name}</Badge>}
                  {pkg && <Badge variant="outline" className="text-[10px]">{PACKAGE_PRICING_MODEL_LABELS[pkg.pricingModel]}</Badge>}
                </>
              )}
              {isFlex && <Badge className="text-[10px] bg-accent text-accent-foreground">Custom</Badge>}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {service.durationMonths} mo · starts {service.startMonth}
              {service.overrideEnabled && <span className="ml-1 text-amber-500 font-medium">· override</span>}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-semibold tabular-nums text-foreground">{feeLabel}{!isHourly && !isFixedScope && <span className="text-xs text-muted-foreground font-normal">/mo</span>}</p>
            {setupFee > 0 && <p className="text-[10px] text-muted-foreground">+ {formatCurrency(setupFee)} setup</p>}
          </div>
          <button onClick={onDelete} className="p-1 text-muted-foreground hover:text-destructive">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t px-4 pb-4 pt-3 space-y-4 bg-muted/10">
          {/* Flex pricing inline editor */}
          {isFlex && service.flexPricing && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">
                    {flexMode === 'hourly' ? 'Hourly Rate' : 'Fee'}
                  </Label>
                  <Input
                    type="number" min={0} value={service.flexPricing.rate}
                    onChange={e => onUpdate({
                      ...service,
                      flexPricing: { ...service.flexPricing!, rate: parseFloat(e.target.value) || 0 },
                    })}
                    className="h-8 text-xs mt-1"
                  />
                </div>
                {flexMode === 'hourly' && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Est. Hours / Month</Label>
                    <Input
                      type="number" min={0} value={service.flexPricing.estimatedHours ?? ''}
                      onChange={e => onUpdate({
                        ...service,
                        flexPricing: { ...service.flexPricing!, estimatedHours: parseInt(e.target.value) || 0 },
                      })}
                      className="h-8 text-xs mt-1"
                    />
                  </div>
                )}
              </div>
              {flexMode === 'hourly' && (
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(service.flexPricing.rate)}/hr × {service.flexPricing.estimatedHours ?? 0} hrs = <span className="font-medium text-foreground">{formatCurrency(fee)}/mo</span>
                </p>
              )}
            </div>
          )}

          {/* Hourly hours input (package-based) */}
          {!isFlex && isHourly && (
            <div className="mb-3">
              <Label className="text-xs text-muted-foreground">Estimated Hours / Month</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  type="number" min={0} value={service.estimatedMonthlyHours ?? ''}
                  onChange={e => onUpdate({ ...service, estimatedMonthlyHours: e.target.value ? parseInt(e.target.value) : undefined })}
                  placeholder={String((pkg?.pricingRules as any)?.defaultHoursPerMonth ?? 20)}
                  className="h-8 text-xs w-28"
                />
                <span className="text-xs text-muted-foreground">× {formatCurrency(pkg?.basePrice ?? 0)}/hr = <span className="font-medium text-foreground">{formatCurrency(fee)}/mo</span></span>
              </div>
            </div>
          )}

          {/* Deliverables (package only) */}
          {!isFlex && pkg && pkg.deliverables.length > 0 && (
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

          {/* Override toggle (package-based only) */}
          {!isFlex && (
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
          )}

          {/* Admin link (package only) */}
          {!isFlex && (
            <p className="text-[10px] text-muted-foreground">
              Package pricing managed in <a href="/admin" className="text-primary hover:underline inline-flex items-center gap-0.5">Admin → Packages <ExternalLink className="h-2.5 w-2.5" /></a>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
