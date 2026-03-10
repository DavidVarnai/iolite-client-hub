import { Client, SERVICE_CHANNEL_LABELS, StrategySection } from '@/types';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

function StrategySectionCard({ section, proposalMode }: { section: StrategySection; proposalMode: boolean }) {
  const [showInternal, setShowInternal] = useState(false);
  const s = section.clientSummary;
  const i = section.internal;

  return (
    <div className="panel">
      <div className="p-5 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">{SERVICE_CHANNEL_LABELS[section.channel]}</h3>
          {!proposalMode && (
            <button
              onClick={() => setShowInternal(!showInternal)}
              className="text-xs text-primary font-medium hover:underline"
            >
              {showInternal ? 'Show Summary' : 'Show Internal Details'}
            </button>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {(!showInternal || proposalMode) ? (
          <motion.div
            key="summary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="p-5 space-y-4"
          >
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Objective</p>
              <p className="prose-body text-sm">{s.objective}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Key Priorities</p>
              <ul className="space-y-1">
                {s.priorities.map((p, idx) => (
                  <li key={idx} className="text-sm flex items-start gap-2">
                    <span className="text-muted-foreground mt-1.5 w-1 h-1 rounded-full bg-foreground flex-shrink-0" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Plan</p>
              <p className="prose-body text-sm">{s.plan}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Expected Outcomes</p>
              <ul className="space-y-1">
                {s.expectedOutcomes.map((o, idx) => (
                  <li key={idx} className="text-sm flex items-start gap-2">
                    <span className="text-muted-foreground mt-1.5 w-1 h-1 rounded-full bg-primary flex-shrink-0" />
                    {o}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="internal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="p-5 space-y-4"
          >
            <div className="internal-indicator mb-2">Internal Only</div>

            {[
              { label: 'Diagnosis', value: i.diagnosis },
              { label: 'Strategic Approach', value: i.approach },
              { label: 'Target Audience', value: i.targetAudience },
              { label: 'Timeline', value: i.timeline },
              { label: 'Internal Notes', value: i.internalNotes },
              { label: 'Resourcing', value: i.resourcing },
            ].map(field => (
              <div key={field.label}>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">{field.label}</p>
                <p className="prose-body text-sm">{field.value}</p>
              </div>
            ))}

            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Deliverables</p>
              <ul className="space-y-1">
                {i.deliverables.map((d, idx) => (
                  <li key={idx} className="text-sm flex items-start gap-2">
                    <span className="mt-1.5 w-1 h-1 rounded-full bg-foreground flex-shrink-0" />
                    {d}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Dependencies</p>
              <ul className="space-y-1">
                {i.dependencies.map((d, idx) => (
                  <li key={idx} className="text-sm flex items-start gap-2">
                    <span className="mt-1.5 w-1 h-1 rounded-full bg-amber flex-shrink-0" />
                    {d}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Success Metrics</p>
              <ul className="space-y-1">
                {i.successMetrics.map((m, idx) => (
                  <li key={idx} className="text-sm flex items-start gap-2">
                    <span className="mt-1.5 w-1 h-1 rounded-full bg-primary flex-shrink-0" />
                    {m}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ClientStrategy({ client, proposalMode }: { client: Client; proposalMode: boolean }) {
  return (
    <div className="p-6 max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Strategy</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {proposalMode ? 'Client-facing strategy summary' : 'Full strategic documentation by channel'}
          </p>
        </div>
        {proposalMode && (
          <span className="status-proposal">Proposal View</span>
        )}
      </div>

      {client.strategySections.length === 0 ? (
        <div className="panel p-8 text-center">
          <p className="text-sm text-muted-foreground">No strategy sections yet. Add channels to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {client.strategySections.map(section => (
            <StrategySectionCard key={section.id} section={section} proposalMode={proposalMode} />
          ))}
        </div>
      )}
    </div>
  );
}
