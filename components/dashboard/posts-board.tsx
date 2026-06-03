"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import ContentCard, { DashboardPost } from "@/components/dashboard/content-card";
import { createSupabaseBrowser } from "@/lib/supabase/browser";
import type { PostStatus, SourcePlatform } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

interface PostsResponse {
  data: DashboardPost[];
  count: number;
  page: number;
  pageSize: number;
}

interface PostsBoardProps {
  title: string;
  description: string;
  defaultStatus?: PostStatus;
  lockStatus?: boolean;
  postId?: string;
}

const pageSize = 10;
const statuses: Array<"all" | PostStatus> = ["all", "pending", "approved", "posted", "rejected", "failed"];
const platforms: Array<"all" | SourcePlatform> = ["all", "facebook", "youtube", "tiktok", "rss", "website"];

export default function PostsBoard({ title, description, defaultStatus, lockStatus = false, postId }: PostsBoardProps) {
  const [posts, setPosts] = useState<DashboardPost[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<"all" | PostStatus>(defaultStatus ?? "all");
  const [platform, setPlatform] = useState<"all" | SourcePlatform>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  const queryString = useMemo(() => {
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
    });

    if (status !== "all") {
      params.set("status", status);
    }

    if (platform !== "all") {
      params.set("platform", platform);
    }

    if (search.trim()) {
      params.set("search", search.trim());
    }

    if (postId) {
      params.set("id", postId);
    }

    return params.toString();
  }, [page, platform, postId, search, status]);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    const response = await fetch(`/api/posts?${queryString}`);
    if (!response.ok) {
      setLoading(false);
      return;
    }

    const body = (await response.json()) as PostsResponse;
    setPosts(body.data);
    setCount(body.count);
    setLoading(false);
  }, [queryString]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  useEffect(() => {
    const supabase = createSupabaseBrowser();
    const channel = supabase
      .channel("dashboard-posts")
      .on("postgres_changes", { event: "*", schema: "public", table: "posts" }, () => {
        loadPosts();
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [loadPosts]);

  async function patchPost(id: string, payload: Record<string, unknown>) {
    await fetch(`/api/posts/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    await loadPosts();
  }

  async function postAction(id: string, action: "publish" | "retry") {
    await fetch(`/api/posts/${id}/${action}`, { method: "POST" });
    await loadPosts();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">{title}</h1>
        <p className="text-muted-foreground mt-2">
          {description} ({count} items)
        </p>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search captions or source URLs"
            className="w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {!lockStatus &&
            statuses.map((item) => (
              <button
                key={item}
                onClick={() => {
                  setStatus(item);
                  setPage(1);
                }}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  status === item ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                {item === "all" ? "All" : item}
              </button>
            ))}

          {platforms.map((item) => (
            <button
              key={item}
              onClick={() => {
                setPlatform(item);
                setPage(1);
              }}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                platform === item ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {item === "all" ? "All sources" : item}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="rounded-lg border border-border bg-card p-8 text-sm text-muted-foreground">Loading posts...</div>
      ) : posts.length > 0 ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {posts.map((post) => (
            <ContentCard
              key={post.id}
              post={post}
              onSaveCaption={(caption) => patchPost(post.id, { edited_caption: caption })}
              onApprove={() => patchPost(post.id, { status: "approved" })}
              onReject={() => patchPost(post.id, { status: "rejected" })}
              onPublish={() => postAction(post.id, "publish")}
              onRetry={() => postAction(post.id, "retry")}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-card border border-border rounded-lg">
          <p className="text-muted-foreground">No posts found.</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </p>
        <div className="flex gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            className="inline-flex items-center gap-2 rounded-md bg-muted px-3 py-2 text-sm disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            className="inline-flex items-center gap-2 rounded-md bg-muted px-3 py-2 text-sm disabled:opacity-40"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
