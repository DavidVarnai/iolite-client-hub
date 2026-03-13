import { Meeting, SERVICE_CHANNEL_LABELS, ServiceChannel, ActionItem } from '@/types';
import { useState } from 'react';
import { format } from 'date-fns';
import { useClientContext } from '@/contexts/ClientContext';
import { Plus, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

function MeetingDetail({ meeting }: { meeting: Meeting }) {
  const [activeChannel, setActiveChannel] = useState(meeting.agenda[0]?.channel);
  const activeAgenda = meeting.agenda.find(a => a.channel === activeChannel);

  return (
    <div className="panel">
      <div className="p-5 border-b flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">{meeting.title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {format(new Date(meeting.date), 'EEEE, MMMM d, yyyy · h:mm a')} · {meeting.type}
          </p>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full ${
          meeting.status === 'completed' ? 'bg-muted text-muted-foreground' :
          meeting.status === 'in_progress' ? 'bg-primary/10 text-primary' :
          'bg-muted text-muted-foreground'
        }`}>
          {meeting.status}
        </span>
      </div>

      <div className="flex min-h-[400px]">
        <div className="w-52 border-r p-3 space-y-1 flex-shrink-0">
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider px-2 mb-2">Agenda</p>
          {meeting.agenda.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveChannel(item.channel)}
              className={`w-full text-left px-3 py-2 rounded-md text-xs transition-colors ${
                activeChannel === item.channel ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              {SERVICE_CHANNEL_LABELS[item.channel]}
            </button>
          ))}
          <button
            onClick={() => setActiveChannel(undefined as any)}
            className={`w-full text-left px-3 py-2 rounded-md text-xs transition-colors ${
              !activeChannel ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            General Notes
          </button>
        </div>

        <div className="flex-1 p-5 space-y-4">
          {activeAgenda ? (
            <>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Discussion Notes</p>
                <p className="prose-body text-sm">{activeAgenda.notes}</p>
              </div>
              {activeAgenda.clientInputs && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Client Inputs</p>
                  <p className="prose-body text-sm">{activeAgenda.clientInputs}</p>
                </div>
              )}
            </>
          ) : (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">General Notes</p>
              <p className="prose-body text-sm">{meeting.generalNotes}</p>
            </div>
          )}
        </div>

        <div className="w-64 border-l p-4 flex-shrink-0">
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-3">Action Items</p>
          {activeAgenda?.actionItems && activeAgenda.actionItems.length > 0 ? (
            <div className="space-y-3">
              {activeAgenda.actionItems.map(item => (
                <div key={item.id} className="space-y-1">
                  <p className="text-xs font-medium">{item.title}</p>
                  <p className="text-[11px] text-muted-foreground">{item.owner} · {format(new Date(item.dueDate), 'MMM d')}</p>
                  <span className={`inline-block text-[10px] px-1.5 py-0.5 rounded ${
                    item.status === 'done' ? 'bg-muted text-muted-foreground' :
                    item.status === 'in_progress' ? 'bg-primary/10 text-primary' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {item.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No action items for this section.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function NewMeetingForm({ onSave, onCancel }: { onSave: (meeting: Meeting) => void; onCancel: () => void }) {
  const { client } = useClientContext();
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 16));
  const [type, setType] = useState<Meeting['type']>('weekly');
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    if (!title.trim()) return;
    const meeting: Meeting = {
      id: `mtg-${Date.now()}`,
      clientId: client.id,
      date: new Date(date).toISOString(),
      type,
      title: title.trim(),
      agenda: [],
      generalNotes: notes,
      status: 'scheduled',
    };
    onSave(meeting);
  };

  return (
    <div className="panel p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">New Meeting</h3>
        <button onClick={onCancel} className="p-1.5 hover:bg-muted rounded-md transition-colors">
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Title *</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Meeting title" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Date & Time</label>
          <input type="datetime-local" value={date} onChange={e => setDate(e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Type</label>
          <select value={type} onChange={e => setType(e.target.value as Meeting['type'])}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
            <option value="weekly">Weekly</option>
            <option value="biweekly">Biweekly</option>
            <option value="monthly">Monthly</option>
            <option value="special">Special</option>
          </select>
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Notes</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Meeting notes or agenda" />
      </div>
      <div className="flex justify-end gap-2">
        <button onClick={onCancel} className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground">Cancel</button>
        <button onClick={handleSubmit} disabled={!title.trim()}
          className="px-4 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-md hover:opacity-90 disabled:opacity-40">
          Create Meeting
        </button>
      </div>
    </div>
  );
}

export default function MeetingHub() {
  const { client, updateClient } = useClientContext();
  const [showNewMeeting, setShowNewMeeting] = useState(false);

  const handleSaveMeeting = (meeting: Meeting) => {
    updateClient({ ...client, meetings: [...client.meetings, meeting] });
    setShowNewMeeting(false);
    toast({ title: 'Meeting created', description: meeting.title });
  };

  return (
    <div className="p-6 max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Meetings</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Meeting records, notes, and follow-up actions.</p>
        </div>
        <button
          onClick={() => setShowNewMeeting(!showNewMeeting)}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" /> New Meeting
        </button>
      </div>

      {showNewMeeting && (
        <NewMeetingForm onSave={handleSaveMeeting} onCancel={() => setShowNewMeeting(false)} />
      )}

      {client.meetings.length === 0 && !showNewMeeting ? (
        <div className="panel p-8 text-center">
          <p className="text-sm text-muted-foreground">No meetings recorded yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {client.meetings.map(m => (
            <MeetingDetail key={m.id} meeting={m} />
          ))}
        </div>
      )}
    </div>
  );
}
