/**
 * ServicesConfig — dedicated tab for agency commercial setup.
 * Source of truth for proposed agency services and pricing.
 */
import { useClientContext } from '@/contexts/ClientContext';
import ProposedAgencyServices from './proposal/ProposedAgencyServices';
import type { ProposedAgencyService } from '@/types/commercialServices';

export default function ServicesConfig() {
  const { onboarding, updateOnboarding } = useClientContext();
  const services: ProposedAgencyService[] = (onboarding as any).proposedAgencyServices || [];

  const handleChange = (updated: ProposedAgencyService[]) => {
    updateOnboarding({ ...onboarding, proposedAgencyServices: updated } as any);
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Services Configuration</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Define the agency services, pricing models, and fee structures for this client. This is the source of truth for all commercial data shown in the Proposal and Growth Model.
        </p>
      </div>

      <ProposedAgencyServices services={services} onChange={handleChange} />
    </div>
  );
}
