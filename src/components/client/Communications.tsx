export default function ClientCommunications() {
  return (
    <div className="p-6 max-w-4xl space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Communications</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Email threads, Slack activity, and key contact log.</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="panel p-5 space-y-3">
          <h3 className="text-sm font-semibold">Email Threads</h3>
          <p className="text-xs text-muted-foreground">Email sync not yet active. This section will display threaded email conversations once connected.</p>
          <div className="border border-dashed rounded-md p-4 text-center">
            <p className="text-xs text-muted-foreground">Connect email integration</p>
          </div>
        </div>

        <div className="panel p-5 space-y-3">
          <h3 className="text-sm font-semibold">Slack Activity</h3>
          <p className="text-xs text-muted-foreground">Recent Slack messages and notifications from mapped channels.</p>
          <div className="border border-dashed rounded-md p-4 text-center">
            <p className="text-xs text-muted-foreground">Connect Slack workspace</p>
          </div>
        </div>

        <div className="panel p-5 space-y-3">
          <h3 className="text-sm font-semibold">Key Contact Log</h3>
          <p className="text-xs text-muted-foreground">Important communications and touchpoints.</p>
          <div className="border border-dashed rounded-md p-4 text-center">
            <p className="text-xs text-muted-foreground">No entries yet</p>
          </div>
        </div>
      </div>
    </div>
  );
}
