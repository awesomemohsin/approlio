import SourcesTable from "@/components/dashboard/sources-table";

export default function SourcesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Sources</h1>
        <p className="text-muted-foreground mt-2">Manage monitored Facebook Pages and future pluggable sources.</p>
      </div>

      <SourcesTable />
    </div>
  );
}
