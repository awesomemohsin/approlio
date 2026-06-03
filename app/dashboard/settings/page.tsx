import { Database, Facebook, Github, MessageCircle, ShieldCheck, Zap } from "lucide-react";
import { metaEnabled, telegramEnabled } from "@/lib/env";

export const dynamic = "force-dynamic";

const checks = [
  {
    name: "Supabase",
    description: "Database, auth, row-level security, and realtime updates.",
    icon: Database,
    enabled: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY),
  },
  {
    name: "Telegram Bot",
    description: "Approval notifications and reject callbacks.",
    icon: MessageCircle,
    enabled: telegramEnabled(),
  },
  {
    name: "Meta Graph API",
    description: "Publishing approved posts to the destination Facebook Page.",
    icon: Facebook,
    enabled: metaEnabled(),
  },
  {
    name: "GitHub Actions",
    description: "Cron monitor and publish jobs every 10 minutes.",
    icon: Github,
    enabled: Boolean(process.env.CRON_SECRET),
  },
  {
    name: "Admin Security",
    description: "Dashboard routes require Supabase Auth sessions.",
    icon: ShieldCheck,
    enabled: true,
  },
  {
    name: "No Paid AI Services",
    description: "No AI rewriting or credit overage path is enabled.",
    icon: Zap,
    enabled: true,
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-2">Runtime configuration status. Secrets are managed through environment variables.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {checks.map((check) => {
          const Icon = check.icon;
          return (
            <div key={check.name} className="bg-card border border-border rounded-lg p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-semibold text-foreground">{check.name}</p>
                    <p className="text-sm text-muted-foreground mt-1">{check.description}</p>
                  </div>
                </div>
                <span className={`rounded-md border px-2 py-1 text-xs font-medium ${check.enabled ? "border-green-500/30 bg-green-500/10 text-green-400" : "border-red-500/30 bg-red-500/10 text-red-400"}`}>
                  {check.enabled ? "configured" : "missing"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-lg font-semibold text-foreground mb-3">Operational Boundaries</h2>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>Monitoring runs through GitHub Actions and calls protected Next.js API routes.</p>
          <p>Publishing uses the configured Facebook Page access token only after a post is approved.</p>
          <p>No VPS, paid queues, or AI credit-consuming services are part of this implementation.</p>
        </div>
      </div>
    </div>
  );
}
