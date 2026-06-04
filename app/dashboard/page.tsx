"use client";

import React, { useEffect, useState } from "react";
import StatsCard from "@/components/dashboard/stats-card";
import ActivityFeed from "@/components/dashboard/activity-feed";
import Charts from "@/components/dashboard/charts";
import { TrendingUp, Clock, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import type { Post, PublishLog } from "@/lib/supabase/types";

function dayLabel(date: Date) {
  return date.toLocaleDateString("en-US", { weekday: "short" });
}

function buildActivityData(posts: Post[]) {
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    return { key: date.toISOString().slice(0, 10), date: dayLabel(date), posts: 0 };
  });

  for (const post of posts) {
    const key = (post.published_at ?? post.created_at).slice(0, 10);
    const day = days.find((item) => item.key === key);
    if (day) {
      day.posts += 1;
    }
  }

  return days.map(({ date, posts }) => ({ date, posts }));
}

function buildPlatformData(posts: Post[]) {
  const counts = posts.reduce<Record<string, number>>((acc, post) => {
    acc[post.platform] = (acc[post.platform] ?? 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts).map(([platform, posts]) => ({ platform, posts }));
}

interface DashboardStats {
  totalSources: number;
  pendingApproval: number;
  approvedContent: number;
  failedPosts: number;
  posts: Post[];
  logs: PublishLog[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch("/api/dashboard/stats");
        if (!res.ok) throw new Error("Failed to fetch stats");
        const body = await res.json();
        setStats(body.data);
      } catch (err) {
        console.error("Dashboard stats load failed:", err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Loading dashboard statistics...</span>
        </div>
      </div>
    );
  }

  const statsCards = [
    {
      label: "Total Sources",
      value: stats.totalSources,
      icon: TrendingUp,
      color: "from-blue-500/20 to-blue-600/20",
      trend: "Active monitor inputs",
      href: "/dashboard/sources",
    },
    {
      label: "Pending Approval",
      value: stats.pendingApproval,
      icon: Clock,
      color: "from-amber-500/20 to-amber-600/20",
      trend: "Waiting for review",
      href: "/dashboard/pending-queue",
    },
    {
      label: "Approved Content",
      value: stats.approvedContent,
      icon: CheckCircle2,
      color: "from-green-500/20 to-green-600/20",
      trend: "Ready to publish",
      href: "/dashboard/approved-queue",
    },
    {
      label: "Failed Posts",
      value: stats.failedPosts,
      icon: AlertCircle,
      color: "from-red-500/20 to-red-600/20",
      trend: "Retry queue",
      href: "/dashboard/failed",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Operational overview for monitoring, approvals, and publishing.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat) => (
          <StatsCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Charts activityData={buildActivityData(stats.posts)} platformData={buildPlatformData(stats.posts)} />
        </div>
        <div>
          <ActivityFeed logs={stats.logs} />
        </div>
      </div>
    </div>
  );
}
