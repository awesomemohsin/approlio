"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ExternalLink, Facebook, Globe, Pause, Play, Plus, RefreshCcw, Rss, Search, Youtube, PlayCircle, Trash2 } from "lucide-react";
import type { Source, SourcePlatform } from "@/lib/supabase/types";
import { createSupabaseBrowser } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const platforms: Array<"all" | SourcePlatform> = ["all", "facebook", "youtube", "tiktok", "rss", "website"];

function platformIcon(platform: SourcePlatform) {
  const className = "w-5 h-5 text-muted-foreground";
  switch (platform) {
    case "facebook":
      return <Facebook className={className} />;
    case "youtube":
      return <Youtube className={className} />;
    case "tiktok":
      return <PlayCircle className={className} />;
    case "rss":
      return <Rss className={className} />;
    case "website":
      return <Globe className={className} />;
  }
}

export default function SourcesTable() {
  const [sources, setSources] = useState<Source[]>([]);
  const [platform, setPlatform] = useState<"all" | SourcePlatform>("all");
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", platform: "facebook" as SourcePlatform, url: "" });

  const loadSources = useCallback(async () => {
    const response = await fetch("/api/sources");
    if (!response.ok) {
      return;
    }
    const body = (await response.json()) as { data: Source[] };
    setSources(body.data);
  }, []);

  useEffect(() => {
    loadSources();
  }, [loadSources]);

  useEffect(() => {
    const supabase = createSupabaseBrowser();
    const channel = supabase
      .channel("dashboard-sources")
      .on("postgres_changes", { event: "*", schema: "public", table: "sources" }, loadSources)
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [loadSources]);

  const filteredSources = useMemo(
    () =>
      sources.filter((source) => {
        const matchesPlatform = platform === "all" || source.platform === platform;
        const needle = search.toLowerCase();
        const matchesSearch = !needle || source.name.toLowerCase().includes(needle) || source.url.toLowerCase().includes(needle);
        return matchesPlatform && matchesSearch;
      }),
    [platform, search, sources]
  );

  async function createSource(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    await fetch("/api/sources", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ name: "", platform: "facebook", url: "" });
    setSaving(false);
    await loadSources();
  }

  async function updateSource(id: string, payload: Record<string, unknown>) {
    await fetch(`/api/sources/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    await loadSources();
  }

  async function syncSource(id: string) {
    setSyncingId(id);
    toast.promise(
      (async () => {
        try {
          const response = await fetch(`/api/sources/${id}/sync`, { method: "POST" });
          const resBody = await response.json();
          if (!response.ok) {
            throw new Error(resBody.error || `Failed with status ${response.status}`);
          }
          await loadSources();
          return resBody;
        } finally {
          setSyncingId(null);
        }
      })(),
      {
        loading: "Syncing source (running background scraper, this may take up to 30 seconds)...",
        success: "Source synced successfully!",
        error: (err) => `Sync failed: ${err.message || String(err)}`,
      }
    );
  }
  
  async function deleteSource(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete the source "${name}"? This will unlink it from its posts but keep the posts in your dashboard.`)) {
      return;
    }
    
    toast.promise(
      (async () => {
        const response = await fetch(`/api/sources/${id}`, { method: "DELETE" });
        const resBody = await response.json();
        if (!response.ok) {
          throw new Error(resBody.error || `Failed with status ${response.status}`);
        }
        await loadSources();
        return resBody;
      })(),
      {
        loading: `Deleting source "${name}"...`,
        success: `Source "${name}" deleted successfully!`,
        error: (err) => `Failed to delete source: ${err.message || String(err)}`,
      }
    );
  }

  return (
    <div className="space-y-5">
      <form onSubmit={createSource} className="grid gap-3 rounded-lg border border-border bg-card p-4 lg:grid-cols-[1fr_160px_2fr_auto]">
        <input
          value={form.name}
          onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          placeholder="Source name"
          required
          className="rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
        />
        <select
          value={form.platform}
          onChange={(event) => setForm((current) => ({ ...current, platform: event.target.value as SourcePlatform }))}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
        >
          {platforms.filter((item) => item !== "all").map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <input
          value={form.url}
          onChange={(event) => setForm((current) => ({ ...current, url: event.target.value }))}
          placeholder="https://facebook.com/page"
          required
          type="url"
          className="rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
        />
        <button disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">
          <Plus className="h-4 w-4" />
          Add
        </button>
      </form>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search sources"
            className="w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {platforms.map((item) => (
            <button
              key={item}
              onClick={() => setPlatform(item)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                platform === item ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {item === "all" ? "All" : item}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-4 sm:px-6 py-3 text-xs font-semibold text-muted-foreground">Source</th>
                <th className="text-left px-4 sm:px-6 py-3 text-xs font-semibold text-muted-foreground">URL</th>
                <th className="text-left px-4 sm:px-6 py-3 text-xs font-semibold text-muted-foreground">Status</th>
                <th className="text-left px-4 sm:px-6 py-3 text-xs font-semibold text-muted-foreground">Last Sync</th>
                <th className="text-right px-4 sm:px-6 py-3 text-xs font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredSources.map((source) => (
                <tr key={source.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 sm:px-6 py-4">
                    <div className="flex items-center gap-3">
                      {platformIcon(source.platform)}
                      <span className="font-medium text-foreground">{source.name}</span>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 max-w-sm truncate text-sm text-muted-foreground">
                    <a href={source.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-foreground">
                      {source.url}
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    <span className={cn("inline-block rounded-md border px-2 py-1 text-xs font-medium", source.active ? "border-green-500/30 bg-green-500/10 text-green-400" : "border-amber-500/30 bg-amber-500/10 text-amber-400")}>
                      {source.active ? "active" : "paused"}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-sm text-muted-foreground">
                    {source.last_checked_at ? new Date(source.last_checked_at).toLocaleString() : "Never"}
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => syncSource(source.id)} 
                        disabled={syncingId !== null}
                        className="rounded-md p-2 hover:bg-muted disabled:opacity-50" 
                        title="Sync now"
                      >
                        <RefreshCcw className={cn("h-4 w-4", syncingId === source.id && "animate-spin")} />
                      </button>
                      <button onClick={() => updateSource(source.id, { active: !source.active })} className="rounded-md p-2 hover:bg-muted" title={source.active ? "Pause" : "Resume"}>
                        {source.active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </button>
                      <button 
                        onClick={() => deleteSource(source.id, source.name)} 
                        className="rounded-md p-2 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors" 
                        title="Delete source"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredSources.length === 0 && <div className="p-10 text-center text-sm text-muted-foreground">No sources found.</div>}
      </div>
    </div>
  );
}
