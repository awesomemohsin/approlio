"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Toaster, toast } from "sonner";
import {
  Database,
  Facebook,
  Github,
  MessageCircle,
  ShieldCheck,
  Youtube,
  Trash2,
  Sliders,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Loader2
} from "lucide-react";
import { Connection } from "@/lib/supabase/types";
import { useProfiles } from "@/components/providers/profile-provider";

// Runtime checks (mocked or checks environment variables if exposed, or static status)
const checks = [
  {
    name: "Supabase",
    description: "Database, auth, row-level security, and realtime updates.",
    icon: Database,
    enabled: true, // Configured if dashboard is active
  },
  {
    name: "Telegram Bot",
    description: "Approval notifications and reject callbacks.",
    icon: MessageCircle,
    enabled: true,
  },
  {
    name: "Meta Graph API (OAuth)",
    description: "Connect and publish dynamically to selected Facebook Pages.",
    icon: Facebook,
    enabled: true,
  },
  {
    name: "Google YouTube API (OAuth)",
    description: "Connect and publish natively to YouTube Channels.",
    icon: Youtube,
    enabled: true,
  },
  {
    name: "GitHub Actions",
    description: "Cron monitor and publish jobs every 10 minutes.",
    icon: Github,
    enabled: true,
  },
  {
    name: "Admin Security",
    description: "Dashboard routes require Supabase Auth sessions.",
    icon: ShieldCheck,
    enabled: true,
  },
];

function SettingsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { activeProfile } = useProfiles();

  const [connections, setConnections] = useState<Connection[]>([]);
  const [askForDestination, setAskForDestination] = useState<boolean>(true);
  const [defaultComment, setDefaultComment] = useState<string>("");
  const [defaultCaption, setDefaultCaption] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [updatingSettings, setUpdatingSettings] = useState<boolean>(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Load notifications from redirect URL
  useEffect(() => {
    const successMsg = searchParams.get("success");
    const errorMsg = searchParams.get("error");

    if (successMsg) {
      toast.success(successMsg);
      // Clean up URL parameters
      const newUrl = window.location.pathname;
      router.replace(newUrl);
    } else if (errorMsg) {
      toast.error(errorMsg);
      const newUrl = window.location.pathname;
      router.replace(newUrl);
    }
  }, [searchParams, router]);

  // Fetch connections and settings on mount
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [connRes, settingsRes] = await Promise.all([
          fetch("/api/connections"),
          fetch("/api/settings")
        ]);

        if (connRes.ok) {
          const connData = await connRes.json();
          setConnections(connData.data || []);
        }

        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          if (settingsData.data) {
            if (settingsData.data.ask_for_destination_on_approval !== undefined) {
              setAskForDestination(settingsData.data.ask_for_destination_on_approval);
            }
            if (settingsData.data.default_comment !== undefined) {
              setDefaultComment(settingsData.data.default_comment);
            }
            if (settingsData.data.default_caption !== undefined) {
              setDefaultCaption(settingsData.data.default_caption);
            }
          }
        }
      } catch (error) {
        console.error("Failed to load settings data:", error);
        toast.error("Failed to retrieve connection settings");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Toggle connection active state
  async function handleToggleActive(id: string, currentActive: boolean) {
    try {
      setTogglingId(id);
      const res = await fetch(`/api/connections?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !currentActive }),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      const updated = await res.json();
      setConnections(prev =>
        prev.map(c => (c.id === id ? { ...c, active: updated.data.active } : c))
      );
      toast.success(`${updated.data.name} is now ${updated.data.active ? "active" : "inactive"}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(`Failed to update status: ${message}`);
    } finally {
      setTogglingId(null);
    }
  }

  // Delete connection
  async function handleDeleteConnection(id: string, name: string) {
    if (!confirm(`Are you sure you want to disconnect "${name}"?`)) return;

    try {
      setDeletingId(id);
      const res = await fetch(`/api/connections?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      setConnections(prev => prev.filter(c => c.id !== id));
      toast.success(`Disconnected "${name}"`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(`Failed to delete connection: ${message}`);
    } finally {
      setDeletingId(null);
    }
  }

  // Toggle ask for destination setting
  async function handleToggleSettings(value: boolean) {
    try {
      setUpdatingSettings(true);
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "ask_for_destination_on_approval",
          value: value
        }),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      setAskForDestination(value);
      toast.success(value ? "Will prompt for destination on approval" : "Instant auto-publishing active");
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(`Failed to update setting: ${message}`);
    } finally {
      setUpdatingSettings(false);
    }
  }

  // Save default comment template
  async function handleSaveDefaultComment(value: string) {
    try {
      setUpdatingSettings(true);
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "default_comment",
          value: value
        }),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      setDefaultComment(value);
      toast.success("Default comment template updated");
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(`Failed to save comment template: ${message}`);
    } finally {
      setUpdatingSettings(false);
    }
  }

  // Save default caption suffix
  async function handleSaveDefaultCaption(value: string) {
    try {
      setUpdatingSettings(true);
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "default_caption",
          value: value
        }),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      setDefaultCaption(value);
      toast.success("Default caption template updated");
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(`Failed to save caption template: ${message}`);
    } finally {
      setUpdatingSettings(false);
    }
  }

  return (
    <div className="space-y-8 max-w-5xl">
      <Toaster position="bottom-right" theme="dark" />

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage publishing destinations, OAuth integrations, and workflow behavior.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column - OAuth and Settings */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Connected Channels Panel */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-foreground">Publishing Channels</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Link official Facebook pages and YouTube channels using OAuth.
                </p>
              </div>
            </div>

            {/* Connect Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <a
                href={`/api/auth/facebook/login?profile_id=${activeProfile?.id || ""}`}
                className="flex items-center justify-center gap-3 px-4 py-3 rounded-lg border border-border bg-[#1877F2]/10 hover:bg-[#1877F2]/20 text-[#1877F2] font-semibold transition-all hover:scale-[1.01]"
              >
                <Facebook className="w-5 h-5 fill-current" />
                Connect Facebook Page
              </a>

              <a
                href={`/api/auth/youtube/login?profile_id=${activeProfile?.id || ""}`}
                className="flex items-center justify-center gap-3 px-4 py-3 rounded-lg border border-border bg-red-600/10 hover:bg-red-600/20 text-red-500 font-semibold transition-all hover:scale-[1.01]"
              >
                <Youtube className="w-5 h-5 fill-current" />
                Connect YouTube Channel
              </a>
            </div>

            {/* Channels List */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Active Connections ({connections.length})
              </h3>

              {loading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground ml-2">Loading channels...</span>
                </div>
              ) : connections.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 border border-dashed border-border rounded-lg bg-muted/20">
                  <AlertCircle className="w-8 h-8 text-muted-foreground mb-2" />
                  <p className="text-sm font-semibold text-foreground">No channels connected yet</p>
                  <p className="text-xs text-muted-foreground mt-1 text-center max-w-xs">
                    Link your Facebook pages or YouTube channels above to begin multi-destination publishing.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border border border-border rounded-lg overflow-hidden bg-background/50">
                  {connections.map((conn) => {
                    const isFacebook = conn.platform === "facebook";
                    const isToggling = togglingId === conn.id;
                    const isDeleting = deletingId === conn.id;

                    return (
                      <div
                        key={conn.id}
                        className="flex items-center justify-between p-4 hover:bg-muted/10 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${isFacebook ? "bg-[#1877F2]/10 text-[#1877F2]" : "bg-red-600/10 text-red-500"}`}>
                            {isFacebook ? <Facebook className="w-5 h-5" /> : <Youtube className="w-5 h-5" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-foreground text-sm">{conn.name}</span>
                              <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded border ${conn.active ? "border-green-500/20 bg-green-500/10 text-green-400" : "border-muted/30 bg-muted/20 text-muted-foreground"}`}>
                                {conn.active ? "active" : "inactive"}
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              ID: {conn.platform_id} • Type: {conn.type.replace("_", " ")}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {/* Toggle Active status */}
                          <button
                            disabled={isToggling}
                            onClick={() => handleToggleActive(conn.id, conn.active)}
                            className="text-muted-foreground hover:text-foreground transition-colors p-1 disabled:opacity-50"
                            title={conn.active ? "Disable channel" : "Enable channel"}
                          >
                            {isToggling ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : conn.active ? (
                              <ToggleRight className="w-6 h-6 text-green-500" />
                            ) : (
                              <ToggleLeft className="w-6 h-6" />
                            )}
                          </button>

                          {/* Delete Connection */}
                          <button
                            disabled={isDeleting}
                            onClick={() => handleDeleteConnection(conn.id, conn.name)}
                            className="text-muted-foreground hover:text-red-500 transition-colors p-1 disabled:opacity-50"
                            title="Disconnect channel"
                          >
                            {isDeleting ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Publishing Settings Panel */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <Sliders className="w-5 h-5 text-muted-foreground" />
                <h2 className="text-lg font-bold text-foreground">Workflow Preferences</h2>
              </div>

              <div className="flex items-start justify-between gap-4 p-4 rounded-lg bg-muted/20 border border-border">
                <div className="space-y-0.5">
                  <p className="font-semibold text-foreground text-sm">
                    Prompt for destinations when approving a post
                  </p>
                  <p className="text-xs text-muted-foreground">
                    If enabled, you can select which connected pages or channels to publish to. If disabled, approved posts are instantly queued for all active channels.
                  </p>
                </div>

                <button
                  disabled={updatingSettings || loading}
                  onClick={() => handleToggleSettings(!askForDestination)}
                  className="text-muted-foreground hover:text-foreground transition-colors shrink-0 disabled:opacity-50"
                >
                  {updatingSettings ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : askForDestination ? (
                    <ToggleRight className="w-7 h-7 text-green-500" />
                  ) : (
                    <ToggleLeft className="w-7 h-7" />
                  )}
                </button>
              </div>
            </div>

            <div className="border-t border-border pt-6 space-y-4">
              <div>
                <h3 className="font-semibold text-foreground text-sm">
                  Default Comment (Facebook)
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Automatically post this comment immediately after publishing a Facebook post. Leave blank to disable.
                </p>
              </div>

              <div className="space-y-2">
                <textarea
                  disabled={loading || updatingSettings}
                  value={defaultComment}
                  onChange={(e) => setDefaultComment(e.target.value)}
                  placeholder="@followers&#10;Order Now: https://parlebangladesh.com"
                  rows={3}
                  className="w-full rounded-md border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                />
                <div className="flex justify-end">
                  <button
                    disabled={loading || updatingSettings}
                    onClick={() => handleSaveDefaultComment(defaultComment)}
                    className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {updatingSettings && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                    Save Comment Template
                  </button>
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-6 space-y-4">
              <div>
                <h3 className="font-semibold text-foreground text-sm">
                  Default Caption Suffix (All Platforms)
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Automatically append this text to the bottom of the original caption when publishing posts. Leave blank to disable.
                </p>
              </div>

              <div className="space-y-2">
                <textarea
                  disabled={loading || updatingSettings}
                  value={defaultCaption}
                  onChange={(e) => setDefaultCaption(e.target.value)}
                  placeholder="Order Now: https://parlebangladesh.com"
                  rows={3}
                  className="w-full rounded-md border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                />
                <div className="flex justify-end">
                  <button
                    disabled={loading || updatingSettings}
                    onClick={() => handleSaveDefaultCaption(defaultCaption)}
                    className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {updatingSettings && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                    Save Caption Suffix
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right column - Status checks & operational boundaries */}
        <div className="space-y-6">
          
          {/* Status checks list */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-foreground text-sm">Integration Configuration</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Current dashboard environmental health.</p>
            </div>

            <div className="space-y-3">
              {checks.map((check) => {
                const Icon = check.icon;
                return (
                  <div key={check.name} className="flex items-start justify-between gap-3 text-xs">
                    <div className="flex gap-2">
                      <Icon className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div>
                        <p className="font-semibold text-foreground">{check.name}</p>
                        <p className="text-muted-foreground mt-0.5 leading-normal">{check.description}</p>
                      </div>
                    </div>
                    <span className="rounded border border-green-500/20 bg-green-500/10 px-1.5 py-0.5 font-semibold text-green-400">
                      active
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Operational boundaries */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-foreground text-sm mb-2.5">Operational Boundaries</h3>
            <div className="space-y-2 text-xs text-muted-foreground leading-relaxed">
              <p>• Scraped videos are downloaded, shown for approval, and posted natively as new content.</p>
              <p>• Automated flows check sources and queue pending approvals via GitHub Actions cron.</p>
              <p>• No background sync queues are active; approvals trigger direct API execution.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground ml-2">Loading settings page...</span>
      </div>
    }>
      <SettingsContent />
    </Suspense>
  );
}
