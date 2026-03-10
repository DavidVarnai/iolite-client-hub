import { Client, Meeting, SERVICE_CHANNEL_LABELS } from '@/types';
import { useState } from 'react';
import { format } from 'date-fns';

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

      {/* Meeting layout: sidebar + main + action panel */}
      <div className="flex min-h-[400px]">
        {/* Left: agenda nav */}
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

        {/* Center: notes */}
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

        {/* Right: action items */}
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

export default function MeetingHub({ client }: { client: Client }) {
  return (
    <div className="p-6 max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Meetings</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Meeting records, notes, and follow-up actions.</p>
        </div>
        <button className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:opacity-90 transition-opacity">
          New Meeting
        </button>
      </div>

      {client.meetings.length === 0 ? (
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
