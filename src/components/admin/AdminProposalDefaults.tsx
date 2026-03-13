/**
 * AdminProposalDefaults — editable proposal generation defaults.
 */
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { repository } from '@/lib/repository';
import type { ProposalDefaults } from '@/domains/proposals';
import { PanelSection, FormRow } from '@/components/ui/common';

export default function AdminProposalDefaults() {
  const [defaults, setDefaults] = useState<ProposalDefaults>(() => repository.proposalDefaults.get());

  const handleSave = () => {
    repository.proposalDefaults.save(defaults);
    toast.success('Proposal defaults saved');
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Proposal Defaults</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Configure default content and display settings for generated client proposals.
        </p>
      </div>

      <PanelSection title="Title & Introduction">
        <div className="space-y-4">
          <FormRow label="Title Format" hint="Use {clientName} as placeholder">
            <Input
              value={defaults.titleFormat}
              onChange={e => setDefaults(d => ({ ...d, titleFormat: e.target.value }))}
              placeholder="e.g. {clientName} — Growth Partnership Proposal"
            />
          </FormRow>
          <FormRow label="Default Executive Summary Intro">
            <Textarea
              value={defaults.defaultExecutiveIntro}
              onChange={e => setDefaults(d => ({ ...d, defaultExecutiveIntro: e.target.value }))}
              rows={3}
            />
          </FormRow>
        </div>
      </PanelSection>

      <PanelSection title="Timeline Labels" description="Default labels for the 30/60/90-day milestones shown in proposals.">
        <div className="grid grid-cols-3 gap-4">
          <FormRow label="First 30 Days">
            <Input
              value={defaults.defaultTimelineLabels.first30}
              onChange={e => setDefaults(d => ({ ...d, defaultTimelineLabels: { ...d.defaultTimelineLabels, first30: e.target.value } }))}
            />
          </FormRow>
          <FormRow label="First 60 Days">
            <Input
              value={defaults.defaultTimelineLabels.first60}
              onChange={e => setDefaults(d => ({ ...d, defaultTimelineLabels: { ...d.defaultTimelineLabels, first60: e.target.value } }))}
            />
          </FormRow>
          <FormRow label="First 90 Days">
            <Input
              value={defaults.defaultTimelineLabels.first90}
              onChange={e => setDefaults(d => ({ ...d, defaultTimelineLabels: { ...d.defaultTimelineLabels, first90: e.target.value } }))}
            />
          </FormRow>
        </div>
      </PanelSection>

      <PanelSection title="Call to Action & Assumptions">
        <div className="space-y-4">
          <FormRow label="Default CTA / Next Step Language">
            <Textarea
              value={defaults.defaultCtaText}
              onChange={e => setDefaults(d => ({ ...d, defaultCtaText: e.target.value }))}
              rows={2}
            />
          </FormRow>
          <FormRow label="Default Assumptions Note">
            <Textarea
              value={defaults.defaultAssumptionsNote}
              onChange={e => setDefaults(d => ({ ...d, defaultAssumptionsNote: e.target.value }))}
              rows={3}
            />
          </FormRow>
        </div>
      </PanelSection>

      <PanelSection title="Display Settings" description="Control which sections appear in client-facing proposals by default.">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Show Pricing Breakdown</span>
            <Switch
              checked={defaults.showPricingBreakdown}
              onCheckedChange={v => setDefaults(d => ({ ...d, showPricingBreakdown: v }))}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Show Projections</span>
            <Switch
              checked={defaults.showProjections}
              onCheckedChange={v => setDefaults(d => ({ ...d, showProjections: v }))}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Show Timeline</span>
            <Switch
              checked={defaults.showTimeline}
              onCheckedChange={v => setDefaults(d => ({ ...d, showTimeline: v }))}
            />
          </div>
        </div>
      </PanelSection>

      <div className="flex justify-end">
        <Button onClick={handleSave}>Save Defaults</Button>
      </div>
    </div>
  );
}
