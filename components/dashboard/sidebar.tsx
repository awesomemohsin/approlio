'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Settings,
  Database,
  CheckCircle2,
  Clock,
  AlertCircle,
  Activity,
  Zap,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const pathname = usePathname();

  const navItems = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: BarChart3,
    },
    {
      label: 'Sources',
      href: '/dashboard/sources',
      icon: Database,
    },
    {
      label: 'Pending Queue',
      href: '/dashboard/pending-queue',
      icon: Clock,
    },
    {
      label: 'Approved Queue',
      href: '/dashboard/approved-queue',
      icon: CheckCircle2,
    },
    {
      label: 'Published',
      href: '/dashboard/published',
      icon: Zap,
    },
    {
      label: 'Failed Posts',
      href: '/dashboard/failed',
      icon: AlertCircle,
    },
    {
      label: 'Activity Logs',
      href: '/dashboard/activity-logs',
      icon: Activity,
    },
    {
      label: 'Settings',
      href: '/dashboard/settings',
      icon: Settings,
    },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed md:relative w-64 h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-transform duration-300 z-50 md:z-0',
          !open && '-translate-x-full md:translate-x-0'
        )}
      >
        <div className="flex items-center justify-between p-4 md:p-6">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Approlio Logo"
              className="w-8 h-8 rounded-lg object-contain bg-background p-1"
            />
            <span className="text-2xl font-bold text-sidebar-foreground tracking-tight">
              Approlio
            </span>
          </div>
          <button
            onClick={onClose}
            className="md:hidden p-2 hover:bg-sidebar-accent/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-sidebar-foreground" />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors group',
                  active
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/10'
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <div className="text-xs text-sidebar-foreground/60">
            <p className="font-semibold mb-1">Workspace</p>
            <p>Tech Company</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
