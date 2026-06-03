import StatsCard from "@/components/dashboard/stats-card";
import ActivityFeed from "@/components/dashboard/activity-feed";
import Charts from "@/components/dashboard/charts";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { TrendingUp, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import type { Post } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

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

async function countRows(table: "sources" | "posts", filter?: { column: string; value: string }) {
  const supabase = createSupabaseAdmin();
  let query = supabase.from(table).select("*", { count: "exact", head: true });
  if (filter) {
    query = query.eq(filter.column, filter.value);
  }
  const { count, error } = await query;
  if (error) {
    throw error;
  }
  return count ?? 0;
}

export default async function DashboardPage() {
  const supabase = createSupabaseAdmin();
  const [totalSources, pendingApproval, approvedContent, failedPosts, recentPostsResult, recentLogsResult] =
    await Promise.all([
      countRows("sources"),
      countRows("posts", { column: "status", value: "pending" }),
      countRows("posts", { column: "status", value: "approved" }),
      countRows("posts", { column: "status", value: "failed" }),
      supabase.from("posts").select("*").order("created_at", { ascending: false }).limit(500),
      supabase.from("publish_logs").select("*").order("created_at", { ascending: false }).limit(5),
    ]);

  if (recentPostsResult.error) {
    throw recentPostsResult.error;
  }

  if (recentLogsResult.error) {
    throw recentLogsResult.error;
  }

  const stats = [
    {
      label: "Total Sources",
      value: totalSources,
      icon: TrendingUp,
      color: "from-blue-500/20 to-blue-600/20",
      trend: "Active monitor inputs",
    },
    {
      label: "Pending Approval",
      value: pendingApproval,
      icon: Clock,
      color: "from-amber-500/20 to-amber-600/20",
      trend: "Waiting for review",
    },
    {
      label: "Approved Content",
      value: approvedContent,
      icon: CheckCircle2,
      color: "from-green-500/20 to-green-600/20",
      trend: "Ready to publish",
    },
    {
      label: "Failed Posts",
      value: failedPosts,
      icon: AlertCircle,
      color: "from-red-500/20 to-red-600/20",
      trend: "Retry queue",
    },
  ];

  const posts = recentPostsResult.data ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Operational overview for monitoring, approvals, and publishing.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatsCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Charts activityData={buildActivityData(posts)} platformData={buildPlatformData(posts)} />
        </div>
        <div>
          <ActivityFeed logs={recentLogsResult.data ?? []} />
        </div>
      </div>
    </div>
  );
}
