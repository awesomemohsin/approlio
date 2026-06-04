"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  Facebook,
  FileText,
  Globe,
  PlayCircle,
  RefreshCcw,
  Rss,
  Save,
  Send,
  XCircle,
  Youtube,
  AlertCircle,
  Loader2,
} from "lucide-react";
import type { Json, Post, PostStatus, SourcePlatform, Connection } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export interface DashboardPost extends Post {
  sources?: {
    name: string;
    url: string;
  } | null;
}

interface ContentCardProps {
  post: DashboardPost;
  onSaveCaption?: (caption: string) => void | Promise<void>;
  onApprove?: (connectionIds?: string[]) => void | Promise<void>;
  onReject?: () => void | Promise<void>;
  onPublish?: () => void | Promise<void>;
  onRetry?: () => void | Promise<void>;
}

function platformIcon(platform: SourcePlatform) {
  const className = "w-5 h-5";
  switch (platform) {
    case "facebook":
      return <Facebook className={cn(className, "text-blue-500")} />;
    case "youtube":
      return <Youtube className={cn(className, "text-red-500")} />;
    case "rss":
      return <Rss className={cn(className, "text-orange-500")} />;
    case "website":
      return <Globe className={cn(className, "text-emerald-500")} />;
    case "tiktok":
      return <PlayCircle className={cn(className, "text-cyan-400")} />;
    default:
      return <FileText className={className} />;
  }
}

function statusMeta(status: PostStatus) {
  switch (status) {
    case "pending":
      return { icon: Clock, label: "Pending", className: "bg-amber-500/10 text-amber-400 border-amber-500/30" };
    case "approved":
      return { icon: CheckCircle2, label: "Approved", className: "bg-green-500/10 text-green-400 border-green-500/30" };
    case "posted":
      return { icon: CheckCircle2, label: "Posted", className: "bg-blue-500/10 text-blue-400 border-blue-500/30" };
    case "rejected":
      return { icon: XCircle, label: "Rejected", className: "bg-zinc-500/10 text-zinc-400 border-zinc-500/30" };
    case "failed":
      return { icon: XCircle, label: "Failed", className: "bg-red-500/10 text-red-400 border-red-500/30" };
  }
}

function responseLink(response: Json | null) {
  if (!response || typeof response !== "object" || Array.isArray(response)) {
    return null;
  }

  const id = response.id;
  return typeof id === "string" ? id : null;
}

export default function ContentCard({
  post,
  onSaveCaption,
  onApprove,
  onReject,
  onPublish,
  onRetry,
}: ContentCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(post.edited_caption ?? post.original_caption ?? "");
  const [busy, setBusy] = useState(false);

  // Destination selection modal state
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedConnections, setSelectedConnections] = useState<Record<string, boolean>>({});
  const [loadingConnections, setLoadingConnections] = useState(false);

  const meta = statusMeta(post.status);
  const StatusIcon = meta.icon;
  const publishedId = responseLink(post.published_response);

  async function run(action?: () => void | Promise<void>) {
    if (!action) {
      return;
    }

    setBusy(true);
    try {
      await action();
    } finally {
      setBusy(false);
    }
  }

  async function saveCaption() {
    await run(async () => {
      await onSaveCaption?.(editedContent);
      setIsEditing(false);
    });
  }

  async function handleApproveClick() {
    setBusy(true);
    try {
      const settingsRes = await fetch("/api/settings");
      let askForDestination = true;

      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        if (settingsData.data && settingsData.data.ask_for_destination_on_approval !== undefined) {
          askForDestination = settingsData.data.ask_for_destination_on_approval;
        }
      }

      if (askForDestination) {
        setLoadingConnections(true);
        setIsApproveModalOpen(true);

        const connRes = await fetch("/api/connections");
        if (connRes.ok) {
          const connData = await connRes.json();
          const activeConns = (connData.data || []).filter((c: Connection) => c.active);
          setConnections(activeConns);

          // Select all active by default
          const initialSelection: Record<string, boolean> = {};
          activeConns.forEach((c: Connection) => {
            initialSelection[c.id] = true;
          });
          setSelectedConnections(initialSelection);
        } else {
          toast.error("Failed to load active channels");
        }
        setLoadingConnections(false);
      } else {
        await run(() => onApprove?.());
      }
    } catch (error) {
      console.error("Failed to process approval step:", error);
      toast.error("An error occurred. Approving with default destinations.");
      await run(() => onApprove?.());
    } finally {
      setBusy(false);
    }
  }

  async function handleConfirmApprove() {
    const selectedIds = Object.keys(selectedConnections).filter(id => selectedConnections[id]);
    setIsApproveModalOpen(false);

    setBusy(true);
    try {
      await onApprove?.(selectedIds);
    } finally {
      setBusy(false);
    }
  }

  function handleConnectionCheck(id: string, checked: boolean) {
    setSelectedConnections(prev => ({
      ...prev,
      [id]: checked
    }));
  }

  return (
    <article className="bg-card border border-border rounded-lg p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {platformIcon(post.platform)}
          <div className="min-w-0">
            <p className="font-semibold text-foreground truncate">{post.sources?.name ?? post.platform}</p>
            <p className="text-xs text-muted-foreground">{new Date(post.created_at).toLocaleString()}</p>
          </div>
        </div>

        <span className={cn("inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium", meta.className)}>
          <StatusIcon className="w-3 h-3" />
          {meta.label}
        </span>
      </div>

      {post.thumbnail_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.thumbnail_url} alt="" className="h-44 w-full rounded-md object-cover border border-border" />
      )}

      <div>
        {isEditing ? (
          <textarea
            value={editedContent}
            onChange={(event) => setEditedContent(event.target.value)}
            className="w-full min-h-32 rounded-md border border-input bg-background p-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
          />
        ) : (
          <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
            {post.edited_caption || post.original_caption || "No caption detected."}
          </p>
        )}
      </div>

      {post.last_error && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
          {post.last_error}
        </div>
      )}

      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
        <a href={post.source_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-foreground">
          <ExternalLink className="w-3.5 h-3.5" />
          Source
        </a>
        {post.video_url && (
          <a href={post.video_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-foreground">
            <PlayCircle className="w-3.5 h-3.5" />
            Video
          </a>
        )}
        {publishedId && <span>Meta ID: {publishedId}</span>}
      </div>

      <div className="flex flex-wrap gap-2">
        {post.status === "pending" && (
          <>
            {isEditing ? (
              <button disabled={busy} onClick={saveCaption} className="inline-flex items-center gap-2 rounded-md bg-muted px-3 py-2 text-sm font-medium hover:bg-muted/80 disabled:opacity-50">
                <Save className="w-4 h-4" />
                Save
              </button>
            ) : (
              <button onClick={() => setIsEditing(true)} className="rounded-md bg-muted px-3 py-2 text-sm font-medium hover:bg-muted/80">
                Edit
              </button>
            )}
            <button disabled={busy} onClick={handleApproveClick} className="rounded-md bg-green-500/10 px-3 py-2 text-sm font-medium text-green-400 hover:bg-green-500/20 disabled:opacity-50">
              Approve
            </button>
            <button disabled={busy} onClick={() => run(onReject)} className="rounded-md bg-red-500/10 px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20 disabled:opacity-50">
              Reject
            </button>
          </>
        )}

        {post.status === "approved" && (
          <button disabled={busy} onClick={() => run(onPublish)} className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            <Send className="w-4 h-4" />
            Publish
          </button>
        )}

        {post.status === "failed" && (
          <button disabled={busy} onClick={() => run(onRetry)} className="inline-flex items-center gap-2 rounded-md bg-muted px-3 py-2 text-sm font-medium hover:bg-muted/80 disabled:opacity-50">
            <RefreshCcw className="w-4 h-4" />
            Retry
          </button>
        )}
      </div>

      {/* Destination Picker Modal */}
      {isApproveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full max-w-md rounded-xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-bold text-foreground">Select Posting Destinations</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Choose the social media channels to queue this post to.
              </p>
            </div>

            <div className="p-6 space-y-4 max-h-[300px] overflow-y-auto">
              {loadingConnections ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground ml-2">Loading channels...</span>
                </div>
              ) : connections.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <AlertCircle className="w-8 h-8 text-amber-500 mb-2" />
                  <p className="text-sm font-semibold text-foreground">No active channels connected</p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                    Please configure active Facebook Pages or YouTube Channels in Settings first.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {connections.map((conn) => {
                    const isFacebook = conn.platform === "facebook";
                    const isChecked = !!selectedConnections[conn.id];

                    return (
                      <label
                        key={conn.id}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-lg border border-border cursor-pointer transition-all hover:bg-muted/10",
                          isChecked ? "bg-muted/10 border-primary/50" : "bg-transparent"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => handleConnectionCheck(conn.id, e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary bg-background"
                          />
                          <div className="flex items-center gap-2">
                            <span className={isFacebook ? "text-[#1877F2]" : "text-red-500"}>
                              {isFacebook ? <Facebook className="w-4 h-4" /> : <Youtube className="w-4 h-4" />}
                            </span>
                            <span className="text-sm font-semibold text-foreground">{conn.name}</span>
                          </div>
                        </div>
                        <span className="text-[10px] text-muted-foreground uppercase font-bold px-1.5 py-0.5 rounded border border-border">
                          {conn.platform}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-border bg-muted/20">
              <button
                type="button"
                onClick={() => setIsApproveModalOpen(false)}
                className="px-4 py-2 rounded-md border border-border text-sm font-semibold hover:bg-muted transition-colors text-foreground"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={connections.length === 0 || !Object.values(selectedConnections).some(Boolean)}
                onClick={handleConfirmApprove}
                className="px-4 py-2 rounded-md bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
              >
                Approve & Queue
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
