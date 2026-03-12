import { Client, SERVICE_CHANNEL_LABELS, ServiceChannel } from '@/types';
import { Campaign, CampaignObjective, OBJECTIVE_LABELS, MessageAngle, MESSAGE_ANGLE_LABELS, PlatformFocus, PLATFORM_LABELS } from '@/types/campaigns';
import { ArrowLeft } from 'lucide-react';

interface Props {
  client: Client;
  campaign: Campaign | null;
  onBack: () => void;
}

export default function CampaignBriefForm({ client, campaign, onBack }: Props) {
  // In V1, show read-only data for seeded campaigns or a form for new ones.
  const isExisting = !!campaign;

  return (
    <div className="p-6 max-w-3xl space-y-6">
      {/* Back */}
      <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      <div>
        <h2 className="text-lg font-semibold tracking-tight">{isExisting ? campaign.name : 'New Campaign Brief'}</h2>
        <p className="text-xs text-muted-foreground mt-0.5">{isExisting ? 'Campaign brief details' : 'Fill in the essentials — brand context is pulled automatically.'}</p>
      </div>

      {/* Auto-pulled context indicator */}
      <div className="panel p-4 space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Auto-pulled from Client Profile</p>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <p className="text-muted-foreground">Company</p>
            <p className="font-medium">{client.company}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Industry</p>
            <p className="font-medium">{client.industry}</p>
          </div>
          <div className="col-span-2">
            <p className="text-muted-foreground">Active Channels</p>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {client.activeChannels.map(ch => (
                <span key={ch} className="px-2 py-0.5 bg-muted rounded text-[10px] font-medium">{SERVICE_CHANNEL_LABELS[ch]}</span>
              ))}
            </div>
          </div>
          {client.notes && (
            <div className="col-span-2">
              <p className="text-muted-foreground">Notes</p>
              <p className="text-xs mt-0.5">{client.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Brief Form / Display */}
      <div className="space-y-4">
        <FormField label="Campaign Name" value={campaign?.name} placeholder="e.g., Spring Collection Launch" />

        <div className="grid grid-cols-2 gap-4">
          <SelectField label="Linked Strategic Channel" value={campaign?.strategySectionId ? client.strategySections.find(s => s.id === campaign.strategySectionId)?.channel : undefined} options={client.activeChannels.map(ch => ({ value: ch, label: SERVICE_CHANNEL_LABELS[ch] }))} />
          <SelectField label="Objective" value={campaign?.objective} options={Object.entries(OBJECTIVE_LABELS).map(([k, v]) => ({ value: k, label: v }))} />
        </div>

        <FormField label="Offer / Product / Service" value={campaign?.offer} placeholder="What are you promoting?" />
        <FormField label="Target Audience" value={campaign?.audience} placeholder="Who is this for?" />
        <FormField label="Main Pain Point" value={campaign?.painPoint} placeholder="What problem does your audience face?" />
        <FormField label="Desired Outcome" value={campaign?.desiredOutcome} placeholder="What should this campaign achieve?" />

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Primary CTA" value={campaign?.cta} placeholder="e.g., Shop Now" />
          <SelectField label="Message Angle" value={campaign?.angle} options={Object.entries(MESSAGE_ANGLE_LABELS).map(([k, v]) => ({ value: k, label: v }))} />
        </div>

        <FormField label="Landing Page URL" value={campaign?.landingPageUrl} placeholder="https://..." />

        <div className="grid grid-cols-2 gap-4">
          <SelectField label="Platform Focus" value={campaign?.platformFocus} options={Object.entries(PLATFORM_LABELS).map(([k, v]) => ({ value: k, label: v }))} />
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Start Date" value={campaign?.startDate} placeholder="YYYY-MM-DD" type="date" />
            <FormField label="End Date" value={campaign?.endDate} placeholder="YYYY-MM-DD" type="date" />
          </div>
        </div>

        <FormField label="Campaign Notes" value={campaign?.notes} placeholder="Optional notes..." multiline />
        <FormField label="Restrictions / Disclaimers" value={campaign?.restrictions} placeholder="Optional restrictions..." multiline />
      </div>

      {/* Actions */}
      {!isExisting && (
        <div className="flex gap-3 pt-2">
          <button className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
            Save Brief
          </button>
          <button onClick={onBack} className="px-4 py-2 rounded-md bg-muted text-muted-foreground text-sm font-medium hover:text-foreground transition-colors">
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

function FormField({ label, value, placeholder, multiline, type }: { label: string; value?: string; placeholder?: string; multiline?: boolean; type?: string }) {
  const cls = "w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium">{label}</label>
      {multiline ? (
        <textarea className={`${cls} min-h-[72px]`} defaultValue={value || ''} placeholder={placeholder} />
      ) : (
        <input type={type || 'text'} className={cls} defaultValue={value || ''} placeholder={placeholder} />
      )}
    </div>
  );
}

function SelectField({ label, value, options }: { label: string; value?: string; options: { value: string; label: string }[] }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium">{label}</label>
      <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" defaultValue={value || ''}>
        <option value="">Select...</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}
