export default function Templates() {
  const templates = [
    { name: 'Paid Media Strategy', type: 'Channel Framework', channels: 'Paid Media' },
    { name: 'Email Marketing Playbook', type: 'Channel Framework', channels: 'Email Marketing' },
    { name: 'Social Media Content Plan', type: 'Channel Framework', channels: 'Social Media' },
    { name: 'Growth Proposal — Standard', type: 'Proposal Block', channels: 'Multi-channel' },
    { name: 'Weekly Meeting Agenda', type: 'Meeting Agenda', channels: 'All' },
    { name: 'Monthly Performance Review', type: 'Meeting Agenda', channels: 'All' },
    { name: 'E-commerce Growth Framework', type: 'Industry Template', channels: 'Multi-channel' },
    { name: 'Professional Services Digital', type: 'Industry Template', channels: 'Multi-channel' },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Templates</h1>
        <p className="text-sm text-muted-foreground mt-1">Reusable frameworks for strategy, proposals, and meetings.</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {templates.map(t => (
          <div key={t.name} className="panel p-5 hover:border-primary/30 transition-colors cursor-pointer">
            <p className="text-sm font-medium">{t.name}</p>
            <p className="text-xs text-muted-foreground mt-1">{t.type} · {t.channels}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
