/**
 * ProposalHeader — title, status badge, version, and generated date.
 */
import { Badge } from '@/components/ui/badge';
import { repository } from '@/lib/repository';
import { PROPOSAL_STATUS_LABELS } from '@/types/proposal';
import type { Proposal } from '@/types/proposal';
import EditableText from './EditableText';
import { STATUS_COLORS } from './proposalHelpers';

interface ProposalHeaderProps {
  proposal: Proposal;
  onUpdate: (p: Proposal) => void;
  proposalMode: boolean;
}

export default function ProposalHeader({ proposal, onUpdate, proposalMode }: ProposalHeaderProps) {
  return (
    <div className="text-center space-y-4 py-8">
      {!proposalMode && (
        <div className="flex items-center justify-center gap-3 mb-2">
          <Badge className={`${STATUS_COLORS[proposal.status]} text-xs font-medium px-3 py-1`}>
            {PROPOSAL_STATUS_LABELS[proposal.status]}
          </Badge>
          <span className="text-xs text-muted-foreground">v{proposal.version}</span>
          {proposal.generatedAt && (
            <span className="text-xs text-muted-foreground">
              Generated {new Date(proposal.generatedAt).toLocaleDateString()}
            </span>
          )}
        </div>
      )}
      {proposalMode ? (
        <h1 className="text-3xl md:text-4xl font-serif font-semibold tracking-tight text-foreground">{proposal.name}</h1>
      ) : (
        <EditableText
          value={proposal.name}
          onChange={name => onUpdate({ ...proposal, name, updatedAt: new Date().toISOString() })}
          className="text-3xl md:text-4xl font-serif font-semibold tracking-tight text-foreground"
        />
      )}
      <p className="text-sm text-muted-foreground">
        Prepared for <span className="font-medium text-foreground">{repository.clients.getById(proposal.clientId)?.company || 'Client'}</span>
      </p>
    </div>
  );
}
