/**
 * ProposalConfigPanel — bundle/service/package selection and generation trigger.
 */
import { useState, useMemo } from 'react';
import {
  FileText, Sparkles, Check, AlertCircle, Package, Plus, Layers, BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useClientContext } from '@/contexts/ClientContext';
import { repository } from '@/lib/repository';
import { fmt } from './proposalHelpers';
import type { GenerationConfig } from './proposalGeneration';

interface ProposalConfigPanelProps {
  clientId: string;
  onGenerate: (config: GenerationConfig) => void;
}

export default function ProposalConfigPanel({ clientId, onGenerate }: ProposalConfigPanelProps) {
  const { client } = useClientContext();
  const bundles = useMemo(() => repository.salesBundles.getAll().filter(b => b.active), []);
  const serviceLines = useMemo(() => repository.serviceLines.getAll().filter(sl => sl.status === 'active'), []);
  const allPackages = useMemo(() => repository.servicePackages.getAll().filter(p => p.active), []);
  const growthModel = useMemo(() => repository.growthModels.get(clientId) || null, [clientId]);

  const strategyChannelToSlId = useMemo(() => {
    const map: Record<string, string> = {};
    for (const sl of serviceLines) {
      const nameLower = sl.name.toLowerCase();
      if (nameLower.includes('paid media') || nameLower.includes('paid search') || nameLower.includes('ppc')) map['paid_media'] = sl.id;
      if (nameLower.includes('social media') || nameLower.includes('social')) map['social_media'] = sl.id;
      if (nameLower.includes('email') || nameLower.includes('retention')) map['email_marketing'] = sl.id;
      if (nameLower.includes('content') || nameLower.includes('seo')) map['content_development'] = sl.id;
      if (nameLower.includes('website') || nameLower.includes('web dev')) map['website_development'] = sl.id;
      if (nameLower.includes('brand') || nameLower.includes('creative')) map['brand_strategy'] = sl.id;
      if (nameLower.includes('strategic') || nameLower.includes('cmo') || nameLower.includes('consulting')) map['strategic_consulting'] = sl.id;
      if (nameLower.includes('analytics') || nameLower.includes('tracking')) map['analytics_tracking'] = sl.id;
      if (nameLower.includes('app') || nameLower.includes('development') || nameLower.includes('platform')) map['app_development'] = sl.id;
    }
    return map;
  }, [serviceLines]);

  const preSelectedSlIds = useMemo(() => {
    const ids: string[] = [];
    for (const section of client.strategySections) {
      const slId = strategyChannelToSlId[section.channel];
      if (slId && !ids.includes(slId)) ids.push(slId);
    }
    return ids;
  }, [client.strategySections, strategyChannelToSlId]);

  const [selectedBundleId, setSelectedBundleId] = useState<string | undefined>();
  const [selectedSlIds, setSelectedSlIds] = useState<string[]>(preSelectedSlIds);
  const [selectedPkgIds, setSelectedPkgIds] = useState<string[]>([]);
  const [selectedAddOnIds, setSelectedAddOnIds] = useState<string[]>([]);
  const [cmoHoursPerMonth, setCmoHoursPerMonth] = useState<number>(0);
  const [webDevPricingMode, setWebDevPricingMode] = useState<'hourly' | 'package'>('package');

  const selectedBundle = bundles.find(b => b.id === selectedBundleId);

  const handleBundleSelect = (bundleId: string) => {
    if (bundleId === '__none__') {
      setSelectedBundleId(undefined);
      return;
    }
    const bundle = bundles.find(b => b.id === bundleId);
    if (!bundle) return;
    setSelectedBundleId(bundleId);
    const slIds = bundle.includedServices.map(s => s.serviceLineId).filter(Boolean);
    const pkgIds = bundle.includedServices.map(s => s.packageId).filter(Boolean) as string[];
    setSelectedSlIds([...new Set(slIds)]);
    setSelectedPkgIds([...new Set(pkgIds)]);
    setSelectedAddOnIds([]);
  };

  const toggleServiceLine = (slId: string) => {
    setSelectedSlIds(prev =>
      prev.includes(slId) ? prev.filter(id => id !== slId) : [...prev, slId]
    );
    if (selectedSlIds.includes(slId)) {
      const pkgsToRemove = allPackages.filter(p => p.serviceLineId === slId).map(p => p.id);
      setSelectedPkgIds(prev => prev.filter(id => !pkgsToRemove.includes(id)));
      setSelectedAddOnIds(prev => prev.filter(id => !pkgsToRemove.includes(id)));
    }
  };

  const selectPackage = (slId: string, pkgId: string) => {
    const otherPkgs = allPackages.filter(p => p.serviceLineId === slId).map(p => p.id);
    setSelectedPkgIds(prev => [...prev.filter(id => !otherPkgs.includes(id)), pkgId]);
    if (!selectedSlIds.includes(slId)) setSelectedSlIds(prev => [...prev, slId]);
  };

  const toggleAddOn = (pkgId: string) => {
    setSelectedAddOnIds(prev =>
      prev.includes(pkgId) ? prev.filter(id => id !== pkgId) : [...prev, pkgId]
    );
  };

  const totalEstimate = useMemo(() => {
    let total = 0;
    for (const pkgId of [...selectedPkgIds, ...selectedAddOnIds]) {
      const pkg = allPackages.find(p => p.id === pkgId);
      if (pkg) total += pkg.basePrice;
    }
    for (const slId of selectedSlIds) {
      const hasPkg = [...selectedPkgIds, ...selectedAddOnIds].some(
        pkgId => allPackages.find(p => p.id === pkgId)?.serviceLineId === slId
      );
      if (!hasPkg) {
        // No rate on service line anymore; use 0
      }
    }
    return total;
  }, [selectedSlIds, selectedPkgIds, selectedAddOnIds, allPackages, serviceLines]);

  const canGenerate = selectedSlIds.length > 0 || selectedPkgIds.length > 0;

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <FileText className="h-7 w-7 text-primary" />
        </div>
        <h2 className="text-2xl font-serif font-semibold">Configure Proposal</h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Select services and packages to generate a proposal. You can edit all content after generation.
        </p>
      </div>

      {/* Bundle selector */}
      <div className="bg-card border rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2.5">
          <Package className="h-4.5 w-4.5 text-primary" />
          <h3 className="font-semibold text-sm">Start from a Bundle</h3>
          <span className="text-xs text-muted-foreground">(optional)</span>
        </div>
        <Select value={selectedBundleId || '__none__'} onValueChange={handleBundleSelect}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a bundle..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">No bundle — manual selection</SelectItem>
            {bundles.map(b => (
              <SelectItem key={b.id} value={b.id}>
                <div className="flex items-center gap-2">
                  <span>{b.name}</span>
                  {b.estimatedMonthlyPrice && (
                    <span className="text-xs text-muted-foreground">~{fmt(b.estimatedMonthlyPrice)}/mo</span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedBundle && (
          <div className="text-xs text-muted-foreground bg-muted/30 rounded-lg px-4 py-3">
            <div className="font-medium text-foreground mb-1">{selectedBundle.name}</div>
            {selectedBundle.description}
            {selectedBundle.optionalAddOns.length > 0 && (
              <div className="mt-2 pt-2 border-t border-border/50">
                <span className="font-medium text-foreground">Optional add-ons: </span>
                {selectedBundle.optionalAddOns.map(a => a.label || a.serviceLineId).join(', ')}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Service Lines & Packages */}
      <div className="bg-card border rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2.5">
          <Layers className="h-4.5 w-4.5 text-primary" />
          <h3 className="font-semibold text-sm">Services & Packages</h3>
        </div>
        {preSelectedSlIds.length > 0 && (
          <p className="text-xs text-primary bg-primary/5 rounded-md px-3 py-2">
            ✓ {preSelectedSlIds.length} service(s) pre-selected based on your strategy sections
          </p>
        )}
        <div className="space-y-3">
          {serviceLines.map(sl => {
            const isSelected = selectedSlIds.includes(sl.id);
            const pkgsForSl = allPackages.filter(p => p.serviceLineId === sl.id);
            const selectedPkg = pkgsForSl.find(p => selectedPkgIds.includes(p.id));

            return (
              <div key={sl.id} className={`rounded-lg border transition-colors ${isSelected ? 'border-primary/30 bg-primary/5' : 'border-border'}`}>
                <div className="flex items-center gap-3 px-4 py-3">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleServiceLine(sl.id)}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{sl.name}</div>
                    <div className="text-xs text-muted-foreground">{sl.description}</div>
                  </div>
                  {isSelected && pkgsForSl.length > 0 && (
                    <Select
                      value={selectedPkg?.id || '__none__'}
                      onValueChange={v => v !== '__none__' && selectPackage(sl.id, v)}
                    >
                      <SelectTrigger className="w-48 h-8 text-xs">
                        <SelectValue placeholder="Select tier..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">No package</SelectItem>
                        {pkgsForSl.map(pkg => (
                          <SelectItem key={pkg.id} value={pkg.id}>
                            {pkg.name} — {fmt(pkg.basePrice)}/mo
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                {isSelected && sl.name.toLowerCase().includes('strategic') && (
                  <div className="px-4 pb-3 pt-0 flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Hours/month:</span>
                    <Input
                      type="number"
                      value={cmoHoursPerMonth || ''}
                      onChange={(e) => setCmoHoursPerMonth(parseInt(e.target.value) || 0)}
                      className="h-7 w-24 text-xs"
                      placeholder="e.g., 20"
                    />
                  </div>
                )}
                {isSelected && (sl.name.toLowerCase().includes('website') || sl.name.toLowerCase().includes('web dev')) && (
                  <div className="px-4 pb-3 pt-0 flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Pricing:</span>
                    <div className="flex rounded-md border overflow-hidden">
                      <button
                        onClick={() => setWebDevPricingMode('hourly')}
                        className={`px-3 py-1 text-[11px] font-medium transition-colors ${webDevPricingMode === 'hourly' ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:text-foreground'}`}
                      >Hourly (T&M)</button>
                      <button
                        onClick={() => setWebDevPricingMode('package')}
                        className={`px-3 py-1 text-[11px] font-medium transition-colors ${webDevPricingMode === 'package' ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:text-foreground'}`}
                      >Package</button>
                    </div>
                  </div>
                )}
                {isSelected && selectedPkg && selectedPkg.deliverables.length > 0 && (
                  <div className="px-4 pb-3 pt-0">
                    <div className="flex flex-wrap gap-1.5">
                      {selectedPkg.deliverables
                        .filter(d => d.value !== false && d.value !== '0' && d.value !== 0)
                        .map(d => (
                          <span key={d.key} className="text-[11px] bg-muted rounded-md px-2 py-0.5">
                            {d.label}: <span className="font-medium">{String(d.value)}</span>
                          </span>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bundle Add-ons */}
      {selectedBundle && selectedBundle.optionalAddOns.length > 0 && (
        <div className="bg-card border rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2.5">
            <Plus className="h-4.5 w-4.5 text-primary" />
            <h3 className="font-semibold text-sm">Optional Add-ons</h3>
          </div>
          <div className="space-y-2">
            {selectedBundle.optionalAddOns.map((addon, i) => {
              const pkg = addon.packageId ? allPackages.find(p => p.id === addon.packageId) : null;
              const isChecked = pkg ? selectedAddOnIds.includes(pkg.id) : false;
              return (
                <div key={i} className="flex items-center gap-3 px-4 py-2.5 rounded-lg border">
                  <Checkbox
                    checked={isChecked}
                    disabled={!pkg}
                    onCheckedChange={() => pkg && toggleAddOn(pkg.id)}
                  />
                  <div className="flex-1">
                    <span className="text-sm">{addon.label || pkg?.name || addon.serviceLineId}</span>
                  </div>
                  {pkg && <span className="text-xs text-muted-foreground tabular-nums">{fmt(pkg.basePrice)}/mo</span>}
                  {!pkg && <span className="text-xs text-muted-foreground italic">Package not configured</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Growth Model status */}
      <div className="bg-card border rounded-xl p-6">
        <div className="flex items-center gap-2.5 mb-3">
          <BarChart3 className="h-4.5 w-4.5 text-primary" />
          <h3 className="font-semibold text-sm">Growth Model</h3>
        </div>
        {growthModel ? (
          <div className="flex items-center gap-2 text-sm">
            <Check className="h-4 w-4 text-emerald-500" />
            <span className="text-foreground/80">
              <span className="font-medium">{growthModel.name}</span> — projections will be included in the proposal.
            </span>
          </div>
        ) : (
          <div className="flex items-start gap-2 text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/20 rounded-md px-3 py-2.5">
            <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <span>No Growth Model found for this client. Projections will use placeholder values. Create a Growth Model to auto-populate forecasts.</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between bg-card border rounded-xl px-6 py-4">
        <div>
          <div className="text-xs text-muted-foreground">Estimated Monthly Total</div>
          <div className="text-xl font-bold tabular-nums">{fmt(totalEstimate)}</div>
        </div>
        <Button size="lg" onClick={() => onGenerate({
          bundleId: selectedBundleId,
          selectedServiceLineIds: selectedSlIds,
          selectedPackageIds: selectedPkgIds,
          selectedAddOnIds: selectedAddOnIds,
        })} disabled={!canGenerate} className="gap-2">
          <Sparkles className="h-4 w-4" /> Generate Proposal
        </Button>
      </div>
    </div>
  );
}
