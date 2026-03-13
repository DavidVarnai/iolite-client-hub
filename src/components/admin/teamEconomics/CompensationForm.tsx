/**
 * CompensationForm — add a new compensation component to a team member.
 */
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { repository } from '@/lib/repository';
import type { CompensationComponent, CompensationComponentType, RevenueCategory } from '@/domains/economics';
import { COMP_TYPE_LABELS, REVENUE_CATEGORY_LABELS } from '@/domains/economics';
import { FormRow } from '@/components/ui/common';

interface Props {
  memberId: string;
  onClose: () => void;
  onSaved: () => void;
}

export default function CompensationForm({ memberId, onClose, onSaved }: Props) {
  const [compType, setCompType] = useState<CompensationComponentType>('salary_allocation');
  const [amount, setAmount] = useState(0);
  const [sharePercent, setSharePercent] = useState(10);
  const [category, setCategory] = useState<RevenueCategory>('paid_media_management');
  const [capAmount, setCapAmount] = useState<string>('');
  const [thresholdAmount, setThresholdAmount] = useState<string>('');

  const isShareType = compType === 'revenue_share' || compType === 'profit_share';
  const isThresholdType = compType === 'threshold_share';

  const handleSave = () => {
    const comp: CompensationComponent = {
      id: `cc_${Date.now()}`,
      teamMemberId: memberId,
      componentType: compType,
      amount: (isShareType || isThresholdType) ? 0 : amount,
      sharePercent: (isShareType || isThresholdType) ? sharePercent / 100 : undefined,
      appliesToCategory: (isShareType || isThresholdType) ? category : undefined,
      capAmount: capAmount ? Number(capAmount) : undefined,
      thresholdAmount: isThresholdType ? Number(thresholdAmount) : undefined,
      isDefault: true,
    };
    repository.compensation.save(comp);
    toast.success('Compensation component added');
    onSaved();
  };

  return (
    <div className="bg-background border rounded-md p-4 mb-3 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <FormRow label="Component Type">
          <Select value={compType} onValueChange={v => setCompType(v as CompensationComponentType)}>
            <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(COMP_TYPE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
        </FormRow>
        {!isShareType && !isThresholdType && (
          <FormRow label={compType === 'hourly' ? 'Hourly Rate ($)' : compType === 'flat_client_fee' ? 'Default Monthly Fee ($)' : 'Monthly Salary ($)'}>
            <Input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} className="h-9" />
          </FormRow>
        )}
        {(isShareType || isThresholdType) && (
          <>
            <FormRow label="Share Percent (%)">
              <Input type="number" value={sharePercent} onChange={e => setSharePercent(Number(e.target.value))} className="h-9" />
            </FormRow>
            <FormRow label={isThresholdType ? 'Revenue Category' : compType === 'revenue_share' ? 'Revenue Category' : 'Profit Category'}>
              <Select value={category} onValueChange={v => setCategory(v as RevenueCategory)}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(REVENUE_CATEGORY_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </FormRow>
            {isThresholdType && (
              <FormRow label="Base Fee Threshold ($)">
                <Input type="number" value={thresholdAmount} onChange={e => setThresholdAmount(e.target.value)} placeholder="e.g. 3000" className="h-9" />
              </FormRow>
            )}
            <FormRow label="Cap Amount (optional)">
              <Input type="number" value={capAmount} onChange={e => setCapAmount(e.target.value)} placeholder="No cap" className="h-9" />
            </FormRow>
          </>
        )}
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
        <Button size="sm" onClick={handleSave}>Add Component</Button>
      </div>
    </div>
  );
}
