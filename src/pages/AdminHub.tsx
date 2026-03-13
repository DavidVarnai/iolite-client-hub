import { useState } from 'react';
import { Settings, Users, LayoutTemplate, Tags, Cpu, Plug } from 'lucide-react';
import AdminIntegrations from '@/components/admin/AdminIntegrations';
import AdminUsersRoles from '@/components/admin/AdminUsersRoles';
import AdminTemplates from '@/components/admin/AdminTemplates';
import AdminTaxonomy from '@/components/admin/AdminTaxonomy';
import AdminAutomation from '@/components/admin/AdminAutomation';
import AdminSystemSettings from '@/components/admin/AdminSystemSettings';

const sections = [
  { key: 'integrations', label: 'Integrations', icon: Plug },
  { key: 'users', label: 'Users & Roles', icon: Users },
  { key: 'templates', label: 'Templates', icon: LayoutTemplate },
  { key: 'taxonomy', label: 'Taxonomy & Defaults', icon: Tags },
  { key: 'automation', label: 'Automation & AI', icon: Cpu },
  { key: 'settings', label: 'System Settings', icon: Settings },
] as const;

type SectionKey = (typeof sections)[number]['key'];

export default function AdminHub() {
  const [activeSection, setActiveSection] = useState<SectionKey>('integrations');

  const renderSection = () => {
    switch (activeSection) {
      case 'integrations': return <AdminIntegrations />;
      case 'users': return <AdminUsersRoles />;
      case 'templates': return <AdminTemplates />;
      case 'taxonomy': return <AdminTaxonomy />;
      case 'automation': return <AdminAutomation />;
      case 'settings': return <AdminSystemSettings />;
    }
  };

  return (
    <div className="flex h-full">
      {/* Admin sub-navigation */}
      <nav className="w-56 shrink-0 border-r bg-muted/30 p-4 space-y-1">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium px-3 mb-3">
          Admin
        </p>
        {sections.map(s => {
          const Icon = s.icon;
          const active = activeSection === s.key;
          return (
            <button
              key={s.key}
              onClick={() => setActiveSection(s.key)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
                active
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {s.label}
            </button>
          );
        })}
      </nav>

      {/* Section content */}
      <div className="flex-1 overflow-y-auto p-6">
        {renderSection()}
      </div>
    </div>
  );
}
