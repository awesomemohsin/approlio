"use client";

import React, { useCallback, useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, Filter, Info } from "lucide-react";
import type { PublishLog } from "@/lib/supabase/types";
import { createSupabaseBrowser } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";

interface LogsResponse {
  data: PublishLog[];
  count: number;
}

const pageSize = 25;

export default function ActivityLogsTable() {
  const [logs, setLogs] = useState<PublishLog[]>([]);
  const [count, setCount] = useState(0);
  const [status, setStatus] = useState<"all" | "success" | "failed">("all");
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  const loadLogs = useCallback(async () => {
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (status !== "all") {
      params.set("status", status);
    }

    const response = await fetch(`/api/logs?${params.toString()}`);
    if (!response.ok) {
      return;
    }

    const body = (await response.json()) as LogsResponse;
    setLogs(body.data);
    setCount(body.count);
  }, [page, status]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  useEffect(() => {
    const supabase = createSupabaseBrowser();
    const channel = supabase
      .channel("dashboard-logs")
      .on("postgres_changes", { event: "*", schema: "public", table: "publish_logs" }, loadLogs)
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [loadLogs]);

  function icon(statusValue: string) {
    if (statusValue === "success") {
      return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    }
    if (statusValue === "failed") {
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
    return <Info className="w-4 h-4 text-blue-500" />;
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {["all", "success", "failed"].map((item) => (
          <button
            key={item}
            onClick={() => {
              setStatus(item as "all" | "success" | "failed");
              setPage(1);
            }}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
              status === item ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            <Filter className="w-3 h-3" />
            {item}
          </button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-4 sm:px-6 py-3 text-xs font-semibold text-muted-foreground">Status</th>
                <th className="text-left px-4 sm:px-6 py-3 text-xs font-semibold text-muted-foreground">Action</th>
                <th className="text-left px-4 sm:px-6 py-3 text-xs font-semibold text-muted-foreground">Actor</th>
                <th className="text-left px-4 sm:px-6 py-3 text-xs font-semibold text-muted-foreground">Response</th>
                <th className="text-left px-4 sm:px-6 py-3 text-xs font-semibold text-muted-foreground">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 sm:px-6 py-4">{icon(log.status)}</td>
                  <td className="px-4 sm:px-6 py-4 text-sm font-medium text-foreground">{log.action.replaceAll("_", " ")}</td>
                  <td className="px-4 sm:px-6 py-4 text-sm text-muted-foreground">{log.actor}</td>
                  <td className="px-4 sm:px-6 py-4 max-w-md truncate text-sm text-muted-foreground">{JSON.stringify(log.response)}</td>
                  <td className="px-4 sm:px-6 py-4 text-sm text-muted-foreground">{new Date(log.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {logs.length === 0 && <div className="p-10 text-center text-sm text-muted-foreground">No activity logs found.</div>}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </p>
        <div className="flex gap-2">
          <button disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className="inline-flex items-center gap-2 rounded-md bg-muted px-3 py-2 text-sm disabled:opacity-40">
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>
          <button disabled={page >= totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))} className="inline-flex items-center gap-2 rounded-md bg-muted px-3 py-2 text-sm disabled:opacity-40">
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
