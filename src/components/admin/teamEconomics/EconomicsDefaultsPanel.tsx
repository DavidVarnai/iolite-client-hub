/**
 * EconomicsDefaultsPanel — global economics defaults editor.
 */
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { repository } from '@/lib/repository';
import type { EconomicsDefaults } from '@/domains/economics';
import { REVENUE_CATEGORY_LABELS, COMP_TYPE_LABELS } from '@/domains/economics';
import { PanelSection, FormRow, BadgeList } from '@/components/ui/common';

export default function EconomicsDefaultsPanel() {
  const [defaults, setDefaults] = useState<EconomicsDefaults>(() => repository.economicsDefaults.get());

  const handleSave = () => {
    repository.economicsDefaults.save(defaults);
    toast.success('Economics defaults saved');
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h3 className="text-base font-medium mb-4">Economics Defaults</h3>
        <p className="text-xs text-muted-foreground mb-4">Global settings for margin targets and economic modeling.</p>
      </div>

      <PanelSection title="General">
        <div className="grid grid-cols-2 gap-4">
          <FormRow label="Default Currency">
            <Input value={defaults.currency} onChange={e => setDefaults(d => ({ ...d, currency: e.target.value }))} />
          </FormRow>
          <FormRow label="Margin Target (%)">
            <Input type="number" value={defaults.marginTarget} onChange={e => setDefaults(d => ({ ...d, marginTarget: Number(e.target.value) }))} />
          </FormRow>
        </div>
      </PanelSection>

      <PanelSection title="Active Revenue Categories" description="Service categories used for revenue tracking and share-based compensation.">
        <BadgeList
          items={defaults.defaultRevenueCategories.map(cat => ({ key: cat, label: REVENUE_CATEGORY_LABELS[cat] }))}
        />
      </PanelSection>

      <PanelSection title="Compensation Types" description="Supported compensation component types for team cost modeling.">
        <BadgeList
          items={defaults.defaultCompensationCategories.map(comp => ({ key: comp, label: COMP_TYPE_LABELS[comp] }))}
        />
      </PanelSection>

      <Button onClick={handleSave}>Save Defaults</Button>
    </div>
  );
}
