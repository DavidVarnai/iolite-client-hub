export default function InternalLibrary() {
  const items = [
    { name: 'CAC Reduction Framework', category: 'Strategy', author: 'Sarah Chen' },
    { name: 'Content Pillar Template', category: 'Content', author: 'Marcus Webb' },
    { name: 'Audience Research Template', category: 'Research', author: 'Priya Patel' },
    { name: 'Client Onboarding Checklist', category: 'Operations', author: 'Sarah Chen' },
    { name: 'Performance Narrative Guide', category: 'Reporting', author: 'Marcus Webb' },
    { name: 'Proposal Writing Guidelines', category: 'Sales', author: 'Sarah Chen' },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Internal Library</h1>
        <p className="text-sm text-muted-foreground mt-1">Shared knowledge, frameworks, and reference materials.</p>
      </div>
      <div className="space-y-2">
        {items.map(item => (
          <div key={item.name} className="panel p-4 flex items-center justify-between hover:border-primary/30 transition-colors cursor-pointer">
            <div>
              <p className="text-sm font-medium">{item.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{item.category} · {item.author}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
