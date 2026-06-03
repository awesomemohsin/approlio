import Link from "next/link";
import { ArrowLeft, ExternalLink, RotateCcw, TrendingUp } from "lucide-react";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function SourceDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createSupabaseAdmin();
  const [sourceResult, postsResult, logsResult] = await Promise.all([
    supabase.from("sources").select("*").eq("id", id).single(),
    supabase.from("posts").select("*", { count: "exact" }).eq("source_id", id).order("created_at", { ascending: false }).limit(10),
    supabase
      .from("publish_logs")
      .select("*")
      .contains("response", { source_id: id })
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  if (sourceResult.error) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Source not found</p>
        <Link href="/dashboard/sources" className="text-primary hover:underline">
          Back to Sources
        </Link>
      </div>
    );
  }

  const source = sourceResult.data;

  return (
    <div className="space-y-6">
      <Link href="/dashboard/sources" className="flex items-center gap-2 text-primary hover:underline w-fit">
        <ArrowLeft className="w-4 h-4" />
        Back to Sources
      </Link>

      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{source.name}</h1>
            <a href={source.url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              {source.url}
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
          <span className="rounded-md border border-border bg-muted px-3 py-1 text-sm">{source.active ? "active" : "paused"}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">Imported Posts</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{postsResult.count ?? 0}</p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <RotateCcw className="w-4 h-4" />
              <span className="text-sm">Last Sync</span>
            </div>
            <p className="text-sm font-medium text-foreground">
              {source.last_checked_at ? new Date(source.last_checked_at).toLocaleString() : "Never"}
            </p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Platform</p>
            <p className="text-2xl font-bold text-foreground">{source.platform}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Recent Imports</h2>
          <div className="space-y-3">
            {(postsResult.data ?? []).map((post) => (
              <a key={post.id} href={post.source_url} target="_blank" rel="noreferrer" className="block rounded-md bg-muted p-3 hover:bg-muted/80">
                <p className="truncate text-sm text-foreground">{post.edited_caption ?? post.original_caption ?? post.source_url}</p>
                <p className="mt-1 text-xs text-muted-foreground">{post.status} · {new Date(post.created_at).toLocaleString()}</p>
              </a>
            ))}
            {(postsResult.data ?? []).length === 0 && <p className="text-sm text-muted-foreground">No imports yet.</p>}
          </div>
        </section>

        <section className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Sync Activity</h2>
          <div className="space-y-3">
            {(logsResult.data ?? []).map((log) => (
              <div key={log.id} className="rounded-md bg-muted p-3">
                <p className="text-sm text-foreground">{log.action.replaceAll("_", " ")}</p>
                <p className="mt-1 text-xs text-muted-foreground">{log.status} · {new Date(log.created_at).toLocaleString()}</p>
              </div>
            ))}
            {(logsResult.data ?? []).length === 0 && <p className="text-sm text-muted-foreground">No source activity yet.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}
