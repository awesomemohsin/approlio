'use client';

import React from 'react';
import { 
  Bot, 
  Database, 
  ShieldCheck, 
  Edit3, 
  Share2, 
  Layers, 
  ArrowRight, 
  MessageCircle, 
  Zap, 
  CheckCircle2 
} from 'lucide-react';

export function LandingFeatures() {
  const features = [
    {
      title: '1-Tap Mobile Approval',
      description:
        'When a trending video is detected, your Telegram bot sends you a notification with a video preview. Tap [Approve] or [Reject] in 1 second right from your phone.',
      icon: Bot,
      color: 'bg-purple-100 text-purple-700',
      tag: 'Fast Mobile Control',
      badge: 'Zero Passwords Needed',
      highlights: ['Instant notification in 2 seconds', 'Simple Approve and Reject buttons', 'Do everything on your phone anywhere'],
    },
    {
      title: 'Watches All Major Platforms',
      description:
        'Approlio continuously monitors Facebook Pages & Reels, YouTube Shorts, YouTube Videos, and TikTok creators. You can add as many pages as you want.',
      icon: Database,
      color: 'bg-blue-100 text-blue-700',
      tag: 'Multi-Platform',
      badge: 'Facebook, YouTube, TikTok',
      highlights: ['Finds high-resolution video clips', 'Grabs original captions and titles', 'Runs automatically 24/7 in the cloud'],
    },
    {
      title: 'Blocks Duplicate Posts Automatically',
      description:
        'Never embarrass your page with duplicate content. Approlio checks everything posted in the last 48 hours to make sure every post is 100% fresh.',
      icon: ShieldCheck,
      color: 'bg-emerald-100 text-emerald-700',
      tag: 'Brand Safety',
      badge: '100% Spam Free',
      highlights: ['Smart text & caption checking', 'Removes duplicate cross-posts', 'Keeps your page looking professional'],
    },
    {
      title: 'Optional Caption & Hashtag Editor',
      description:
        'Want to tweak the words or add your own hashtags? Use the simple web review dashboard to edit text and preview videos before approving.',
      icon: Edit3,
      color: 'bg-amber-100 text-amber-700',
      tag: 'Easy Editing',
      badge: 'Full Editorial Control',
      highlights: ['Add custom hashtags easily', 'Edit captions side-by-side', 'Schedule posts or publish immediately'],
    },
    {
      title: 'Direct High-Quality Auto-Publishing',
      description:
        'Once approved, Approlio uploads the video directly to your Facebook Page as a Reel or video post, and can publish to YouTube Shorts at the same time.',
      icon: Share2,
      color: 'bg-cyan-100 text-cyan-700',
      tag: 'Instant Publishing',
      badge: 'No Manual Downloading',
      highlights: ['Uploads native HD videos', 'Auto-retries if internet disconnects', 'Full link history and view tracking'],
    },
    {
      title: 'Separate Workspaces for Multiple Brands',
      description:
        'Manage multiple businesses, client accounts, or niche pages. Keep each brand completely separate with its own Telegram alerts and settings.',
      icon: Layers,
      color: 'bg-indigo-100 text-indigo-700',
      tag: 'Agency & Multi-Page',
      badge: 'Unlimited Workspaces',
      highlights: ['Isolated Telegram bot channels', 'Separate social accounts per brand', 'Clean profile switcher in dashboard'],
    },
  ];

  return (
    <section id="features" className="py-20 md:py-24 bg-white text-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <Zap className="w-3.5 h-3.5 text-purple-600" />
            <span>Built For Real Page Owners</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">
            Everything You Need To Grow Your{' '}
            <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 bg-clip-text text-transparent">
              Social Media on Autopilot
            </span>
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Eliminate tedious manual downloading and re-uploading without the fear of blind auto-posting.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="group relative rounded-3xl bg-slate-50/70 hover:bg-white border border-slate-200 hover:border-indigo-300 p-6 sm:p-7 flex flex-col justify-between transition-all duration-200 hover:shadow-lg hover:shadow-slate-100"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl ${feature.color} flex items-center justify-center shadow-sm`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white text-slate-700 border border-slate-200 shadow-sm">
                      {feature.badge}
                    </span>
                  </div>

                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block mb-1">
                    {feature.tag}
                  </span>

                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
                    {feature.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                    {feature.description}
                  </p>
                </div>

                {/* Highlights List */}
                <div className="pt-4 border-t border-slate-200/80 space-y-2">
                  {feature.highlights.map((item, hIdx) => (
                    <div key={hIdx} className="flex items-center gap-2 text-xs text-slate-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Banner */}
        <div className="mt-14 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-50 via-indigo-50 to-cyan-50 border border-indigo-200 text-center max-w-4xl mx-auto shadow-sm">
          <div className="max-w-2xl mx-auto space-y-3">
            <h4 className="text-xl sm:text-2xl font-bold text-slate-900">
              Need a Custom Setup or Scraper for Other Websites?
            </h4>
            <p className="text-xs sm:text-sm text-slate-600">
              Muhammad Mohsin can build custom scrapers for any website or social network you need.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <a
                href="https://wa.me/+8801881169880?text=Hi%20Mohsin,%20I%20need%20a%20custom%20social%20media%20automation%20setup."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm shadow-md transition-all"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Chat with Mohsin on WhatsApp (+880 1881-169880)</span>
              </a>
              <a
                href="https://md-mohsin.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-5 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold border border-slate-200 shadow-sm transition-colors"
              >
                <span>View Portfolio</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
