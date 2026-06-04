'use client';

import React, { useState } from 'react';
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
  ChevronDown,
  Check,
  Plus,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProfiles } from '@/components/providers/profile-provider';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const pathname = usePathname();
  const { profiles, activeProfile, switchProfile, createProfile } = useProfiles();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [creating, setCreating] = useState(false);

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

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfileName.trim()) return;

    try {
      setCreating(true);
      await createProfile(newProfileName.trim());
      setNewProfileName('');
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
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
        {/* Header section with App Logo */}
        <div className="flex items-center justify-between p-4 md:p-6 pb-3 md:pb-4">
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

        {/* Profile Switcher dropdown */}
        <div className="px-4 mb-4 relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg border border-sidebar-border bg-sidebar-accent/5 hover:bg-sidebar-accent/10 transition-colors text-left"
          >
            <div className="min-w-0">
              <p className="text-[10px] uppercase font-bold tracking-wider text-sidebar-foreground/50">Workspace</p>
              <p className="font-semibold text-sm text-sidebar-foreground truncate">
                {activeProfile?.name || "Loading..."}
              </p>
            </div>
            <ChevronDown className="w-4 h-4 text-sidebar-foreground/60 ml-2 shrink-0" />
          </button>

          {dropdownOpen && (
            <div className="absolute left-4 right-4 top-full mt-1.5 z-50 rounded-lg border border-sidebar-border bg-card shadow-xl p-1.5 space-y-1">
              <div className="max-h-40 overflow-y-auto space-y-0.5">
                {profiles.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      switchProfile(p.id);
                      setDropdownOpen(false);
                    }}
                    className={cn(
                      "flex items-center justify-between w-full px-3 py-2 text-left rounded-md text-xs font-semibold hover:bg-muted transition-colors",
                      p.id === activeProfile?.id ? "text-primary bg-primary/5" : "text-foreground"
                    )}
                  >
                    <span className="truncate">{p.name}</span>
                    {p.id === activeProfile?.id && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
              <div className="border-t border-border mt-1 pt-1.5">
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    setIsModalOpen(true);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-left text-xs font-semibold text-primary hover:bg-primary/5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  New Workspace
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
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

        {/* Workspace info footer */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="text-xs text-sidebar-foreground/60">
            <p className="font-semibold mb-1">Active Business Profile</p>
            <p className="truncate font-medium text-foreground">{activeProfile?.name || "Default Workspace"}</p>
          </div>
        </div>
      </aside>

      {/* Create Workspace Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full max-w-sm rounded-xl shadow-xl overflow-hidden p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div>
              <h3 className="text-lg font-bold text-foreground">Create New Workspace</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Isolate monitoring sources and social connections for a new business or brand.
              </p>
            </div>

            <form onSubmit={handleCreateWorkspace} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Workspace Name</label>
                <input
                  type="text"
                  required
                  value={newProfileName}
                  onChange={(e) => setNewProfileName(e.target.value)}
                  placeholder="e.g. Parle Bangladesh"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setNewProfileName('');
                  }}
                  className="px-4 py-2 rounded-md border border-border text-xs font-semibold hover:bg-muted transition-colors text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !newProfileName.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  {creating && <Loader2 className="w-3 h-3 animate-spin" />}
                  Create Workspace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
