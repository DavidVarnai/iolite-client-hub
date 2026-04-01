interface PortalSidebarProps {
  activeSection: string;
  onNavigate: (section: string) => void;
  clientName?: string;
  status: string;
}

const navGroups = [
  {
    label: 'Overview',
    items: [{ id: 'overview', icon: '🏠', label: 'Overview' }],
  },
  {
    label: 'ICP & Audience',
    items: [
      { id: 'icp', icon: '🎯', label: 'ICP Profiles' },
      { id: 'personas', icon: '👥', label: 'Target Personas' },
    ],
  },
  {
    label: 'Strategy',
    items: [
      { id: 'insight', icon: '💡', label: 'Core Insight' },
      { id: 'messaging', icon: '✍️', label: 'Messaging Framework' },
      { id: 'structure', icon: '🗺️', label: 'Campaign Structure' },
      { id: 'channels', icon: '📡', label: 'Channel Strategy' },
      { id: 'creative', icon: '🎬', label: 'Creative Strategy' },
    ],
  },
  {
    label: 'Execution',
    items: [
      { id: 'execution', icon: '⚙️', label: 'Execution Options' },
      { id: 'bdoutreach', icon: '📤', label: 'BD Outreach Add-On' },
      { id: 'nextsteps', icon: '✅', label: 'Next Steps' },
    ],
  },
  {
    label: 'Working Session',
    items: [{ id: 'notes', icon: '📝', label: 'Notes & Feedback' }],
  },
];

const statusConfig: Record<string, { label: string; className: string }> = {
  draft: { label: '⚠ DRAFT', className: 'sp-status-draft' },
  review: { label: '👁 IN REVIEW', className: 'sp-status-review' },
  approved: { label: '✓ APPROVED', className: 'sp-status-approved' },
};

export default function PortalSidebar({ activeSection, onNavigate, clientName, status }: PortalSidebarProps) {
  const st = statusConfig[status] || statusConfig.draft;

  return (
    <div className="sp-sidebar">
      <div className="p-5 pb-4 border-b border-[hsl(215_14%_25%)]">
        <div className="text-lg font-bold text-[hsl(210_30%_92%)]">{clientName || 'Strategy Portal'}</div>
        <div className="text-[11px] text-[hsl(215_14%_57%)] uppercase tracking-wider mt-1">
          Strategy Document
        </div>
        <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide ${st.className}`}>
          {st.label}
        </span>
      </div>

      <nav className="py-3 flex-1 overflow-y-auto">
        {navGroups.map(group => (
          <div key={group.label}>
            <div className="sp-nav-section-label">{group.label}</div>
            {group.items.map(item => (
              <div
                key={item.id}
                className={`sp-nav-item ${activeSection === item.id ? 'active' : ''}`}
                onClick={() => onNavigate(item.id)}
              >
                <span className="sp-nav-icon">{item.icon}</span>
                {item.label}
              </div>
            ))}
          </div>
        ))}
      </nav>
    </div>
  );
}
