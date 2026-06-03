import React from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Info,
} from 'lucide-react';
import type { PublishLog } from '@/lib/supabase/types';

interface ActivityFeedProps {
  logs: PublishLog[];
}

export default function ActivityFeed({ logs }: ActivityFeedProps) {
  const getIcon = (status: string) => {
    switch (status) {
      case 'success':
        return CheckCircle2;
      case 'error':
        return AlertCircle;
      default:
        return Info;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-500';
      case 'error':
        return 'text-red-500';
      default:
        return 'text-blue-500';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 h-full">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Recent Activity
      </h3>

      <div className="space-y-4">
        {logs.map((log) => {
          const Icon = getIcon(log.status);
          const colorClass = getStatusColor(log.status);

          return (
            <div
              key={log.id}
              className="flex gap-3 py-2 border-b border-border last:border-0"
            >
              <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${colorClass}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{log.action.replaceAll('_', ' ')}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {JSON.stringify(log.response)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {log.actor} · {new Date(log.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <button className="w-full mt-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors">
        View All Activity
      </button>
    </div>
  );
}
