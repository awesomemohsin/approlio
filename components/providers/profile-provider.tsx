"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Profile } from "@/lib/supabase/types";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface ProfileContextType {
  profiles: Profile[];
  activeProfile: Profile | null;
  loading: boolean;
  switchProfile: (id: string) => void;
  createProfile: (name: string) => Promise<Profile>;
  deleteProfile: (id: string) => Promise<void>;
  renameProfile: (id: string, name: string) => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // 1. Fetch profiles on mount
  const loadProfiles = async () => {
    try {
      const res = await fetch("/api/profiles");
      if (!res.ok) throw new Error("Failed to load profiles");
      const { data } = await res.json();
      setProfiles(data || []);

      // Determine active profile from localStorage
      const savedId = localStorage.getItem("approlio_profile_id");
      const active = data?.find((p: Profile) => p.id === savedId) || data?.[0] || null;
      
      if (active) {
        setActiveProfile(active);
        localStorage.setItem("approlio_profile_id", active.id);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load business profiles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfiles();
  }, []);

  // 2. Intercept fetch globally to inject x-profile-id header
  useEffect(() => {
    if (typeof window === "undefined" || !activeProfile?.id) return;

    const originalFetch = window.fetch;
    window.fetch = async function (input, init) {
      const headers = new Headers(init?.headers);
      if (!headers.has("x-profile-id")) {
        headers.set("x-profile-id", activeProfile.id);
      }
      return originalFetch(input, { ...init, headers });
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [activeProfile?.id]);

  // 3. Switch active profile
  const switchProfile = (id: string) => {
    const next = profiles.find(p => p.id === id);
    if (next) {
      setActiveProfile(next);
      localStorage.setItem("approlio_profile_id", next.id);
      toast.success(`Switched workspace to "${next.name}"`);
      // Reload page to reset states and refetch dashboard data
      window.location.reload();
    }
  };

  // 4. Create new profile
  const createProfile = async (name: string): Promise<Profile> => {
    const res = await fetch("/api/profiles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || "Failed to create profile");
    }

    const { data } = await res.json();
    setProfiles(prev => [...prev, data]);
    
    // Auto switch to new profile
    setActiveProfile(data);
    localStorage.setItem("approlio_profile_id", data.id);
    toast.success(`Created and switched to workspace "${name}"`);
    window.location.reload();
    
    return data;
  };

  // 5. Delete profile
  const deleteProfile = async (id: string) => {
    const res = await fetch(`/api/profiles?id=${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || "Failed to delete profile");
    }

    const remaining = profiles.filter(p => p.id !== id);
    setProfiles(remaining);

    // If active profile was deleted, switch to the first remaining
    if (activeProfile?.id === id) {
      const next = remaining[0] || null;
      setActiveProfile(next);
      if (next) {
        localStorage.setItem("approlio_profile_id", next.id);
      } else {
        localStorage.removeItem("approlio_profile_id");
      }
      window.location.reload();
    }
  };

  // 6. Rename profile
  const renameProfile = async (id: string, name: string) => {
    const res = await fetch(`/api/profiles?id=${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || "Failed to rename profile");
    }

    const { data } = await res.json();
    setProfiles(prev => prev.map(p => (p.id === id ? data : p)));
    if (activeProfile?.id === id) {
      setActiveProfile(data);
    }
    toast.success(`Workspace renamed to "${name}"`);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Loading workspace...</span>
        </div>
      </div>
    );
  }

  return (
    <ProfileContext.Provider
      value={{
        profiles,
        activeProfile,
        loading,
        switchProfile,
        createProfile,
        deleteProfile,
        renameProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfiles() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error("useProfiles must be used within a ProfileProvider");
  }
  return context;
}
