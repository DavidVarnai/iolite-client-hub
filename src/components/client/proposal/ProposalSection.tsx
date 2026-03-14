/**
 * ProposalSection — reusable animated section wrapper for proposal content.
 */
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

export function ProposalSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-card border rounded-xl p-6 md:p-8 ${className}`}
    >
      {children}
    </motion.div>
  );
}

export function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <h2 className="text-lg font-serif font-semibold tracking-tight">{title}</h2>
    </div>
  );
}

export function PlaceholderNotice({ text }: { text: string }) {
  if (!text.startsWith('[')) return null;
  return (
    <div className="flex items-start gap-2 text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/20 rounded-md px-3 py-2 mt-2">
      <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
      <span>This section contains placeholder content. Connect the relevant data to auto-populate.</span>
    </div>
  );
}
