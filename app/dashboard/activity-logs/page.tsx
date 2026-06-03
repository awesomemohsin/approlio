import ActivityLogsTable from "@/components/dashboard/activity-logs-table";

export default function ActivityLogsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Activity Logs</h1>
        <p className="text-muted-foreground mt-2">Audit trail for imports, approvals, rejects, publishes, retries, and failures.</p>
      </div>

      <ActivityLogsTable />
    </div>
  );
}
