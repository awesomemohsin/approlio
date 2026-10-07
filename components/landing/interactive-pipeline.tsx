'use client';

import React, { useState } from 'react';
import { 
  Database, 
  ShieldCheck, 
  Bot, 
  Share2, 
  Play, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  RefreshCw, 
  MessageCircle,
  ExternalLink,
  Check
} from 'lucide-react';

export function LandingInteractivePipeline() {
  const [activeStep, setActiveStep] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simStep, setSimStep] = useState<number | null>(null);

  const steps = [
    {
      id: 'step1',
      number: 'Step 1',
      title: 'Watch Your Favorite Sources',
      badge: 'Checks Every 10 Mins',
      icon: Database,
      color: 'bg-blue-500 text-white',
      accentBorder: 'border-blue-500',
      simpleHeading: 'Approlio continuously monitors the creators you choose',
      simpleDescription:
        'You give Approlio the links of Facebook pages, YouTube channels, TikTok creators, or news websites you want to follow. Approlio checks them automatically in the background for newly posted viral reels and videos.',
      bullets: [
        'Works with Facebook Pages & Reels',
        'Works with YouTube Shorts & Long Videos',
        'Works with TikTok Creators & Profiles',
        'Works with RSS News Feeds & Blogs',
      ],
      previewSnippet: `[12:00 PM] Checking Facebook page 'Tech Media'...
[12:01 PM] Found 1 new trending video: '5 Productivity Hacks'
[12:01 PM] Downloaded HD video preview and caption ready for review.`,
    },
    {
      id: 'step2',
      number: 'Step 2',
      title: 'Block Duplicate Posts',
      badge: 'Zero Redundant Posts',
      icon: ShieldCheck,
      color: 'bg-cyan-600 text-white',
      accentBorder: 'border-cyan-500',
      simpleHeading: 'Never post the same video twice',
      simpleDescription:
        'Many viral creators post the exact same clip across multiple pages. Approlio checks the text and video against everything posted in the last 48 hours. If it is already on your page, it gets filtered out automatically.',
      bullets: [
        '48-hour smart memory prevents double-posting',
        'Checks captions and text similarity',
        'Stops spam and keeps your feed clean and professional',
        'Protects your brand reputation with followers',
      ],
      previewSnippet: `[12:02 PM] Comparing post with past 48 hours of published content...
[12:02 PM] Result: Unique post confirmed! No duplicate match found.
[12:02 PM] Moving post to your private approval queue.`,
    },
    {
      id: 'step3',
      number: 'Step 3',
      title: '1-Tap Approval on Your Phone',
      badge: 'Fast & Safe',
      icon: Bot,
      color: 'bg-purple-600 text-white',
      accentBorder: 'border-purple-500',
      simpleHeading: 'Review with a single tap on Telegram',
      simpleDescription:
        'Within 2 seconds, your phone buzzes with a Telegram notification. You see the video thumbnail, length, and caption. Tap [Approve] to post it, or tap [Reject] to discard it. You can also edit words or hashtags if you want!',
      bullets: [
        'Sent straight to your personal Telegram app',
        'Tap Approve or Reject in 1 second from your phone lockscreen',
        'Option to edit captions, add hashtags, or change title',
        'Zero passwords needed on mobile',
      ],
      previewSnippet: `[12:03 PM] Telegram message sent to your phone: 'New Reel Detected'
[12:03 PM] You tapped: '✅ Approve & Post Now'
[12:03 PM] Status updated: Ready for instant publishing.`,
    },
    {
      id: 'step4',
      number: 'Step 4',
      title: 'Auto-Publish to Your Pages',
      badge: 'Fully Automatic',
      icon: Share2,
      color: 'bg-emerald-600 text-white',
      accentBorder: 'border-emerald-500',
      simpleHeading: 'Published directly to your Facebook & YouTube',
      simpleDescription:
        'The moment you tap Approve, Approlio takes care of everything. It uploads the video in high definition natively to your Facebook Page as a Reel or video post, and can cross-post to your YouTube channel simultaneously.',
      bullets: [
        'Native Facebook Page Reels & Video publishing',
        'Direct YouTube Shorts cross-posting',
        'Automatic retry if internet has a temporary glitch',
        'Complete history log so you can see all posted links',
      ],
      previewSnippet: `[12:04 PM] Uploading video to your Facebook Page...
[12:04 PM] Success! Post is live on Facebook: fb.com/yourpage/posts/102
[12:04 PM] Cross-posted to YouTube Shorts successfully. Total time: 15s.`,
    },
  ];

  const handleRunSimulation = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setSimStep(0);
    setActiveStep(0);

    const timeouts = [
      setTimeout(() => { setSimStep(1); setActiveStep(1); }, 1400),
      setTimeout(() => { setSimStep(2); setActiveStep(2); }, 2800),
      setTimeout(() => { setSimStep(3); setActiveStep(3); }, 4200),
      setTimeout(() => { 
        setSimStep(4); 
        setIsSimulating(false); 
      }, 5600),
    ];

    return () => timeouts.forEach(clearTimeout);
  };

  const current = steps[activeStep];

  return (
    <section id="how-it-works" className="py-20 md:py-24 bg-slate-50 text-slate-900 border-t border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>How It Works In Simple Words</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">
            From Viral Video to Your Page in{' '}
            <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 bg-clip-text text-transparent">
              4 Simple Steps
            </span>
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Click any step below or tap the button to watch how Approlio handles content automatically.
          </p>

          {/* Simulation button */}
          <div className="pt-2">
            <button
              onClick={handleRunSimulation}
              disabled={isSimulating}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 shadow-md ${
                isSimulating
                  ? 'bg-purple-100 text-purple-700 border border-purple-300 cursor-wait'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20 active:scale-95'
              }`}
            >
              {isSimulating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-purple-700" />
                  <span>Simulating: {steps[Math.min(simStep ?? 0, 3)].title}...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white text-white" />
                  <span>Click to Watch 4-Step Simulation</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 4 Interactive Step Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isCurrent = activeStep === idx;
            return (
              <button
                key={step.id}
                onClick={() => setActiveStep(idx)}
                className={`text-left p-5 rounded-2xl border transition-all duration-200 ${
                  isCurrent
                    ? `bg-white border-indigo-600 shadow-lg shadow-indigo-100 ring-2 ring-indigo-600/20`
                    : 'bg-white/80 border-slate-200 hover:bg-white hover:border-slate-300 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-bold ${isCurrent ? 'text-indigo-600' : 'text-slate-400'}`}>
                    {step.number}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                    {step.badge}
                  </span>
                </div>

                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${step.color} shadow-sm shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className={`text-sm font-bold ${isCurrent ? 'text-slate-900' : 'text-slate-700'}`}>
                    {step.title}
                  </h3>
                </div>
              </button>
            );
          })}
        </div>

        {/* Deep Dive Card for Active Step */}
        <div className="rounded-3xl bg-white border border-slate-200/90 shadow-lg p-6 sm:p-8 lg:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left: Simple Explanation */}
            <div className="lg:col-span-7 space-y-5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-indigo-700 px-2.5 py-1 rounded-md bg-indigo-50 border border-indigo-200">
                  {current.number} Explanation
                </span>
                <span className="text-xs text-slate-500 font-medium">{current.badge}</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {current.simpleHeading}
              </h3>

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                {current.simpleDescription}
              </p>

              {/* Bullet list */}
              <div className="space-y-2 pt-1">
                {current.bullets.map((b, bIdx) => (
                  <div key={bIdx} className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span>{b}</span>
                  </div>
                ))}
              </div>

              {/* Quick Contact Link */}
              <div className="pt-4 flex flex-wrap items-center gap-3">
                <a
                  href="https://wa.me/+8801881169880?text=Hi%20Mohsin,%20I%20want%20to%20set%20up%20this%20exact%20social%20media%20pipeline%20for%20my%20pages."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-500/20 transition-all"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Ask Mohsin on WhatsApp (+880 1881-169880)</span>
                </a>
                <a
                  href="https://md-mohsin.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold transition-colors"
                >
                  <span>View Portfolio</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </a>
              </div>
            </div>

            {/* Right: Live Example Log */}
            <div className="lg:col-span-5 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>Live Action Preview:</span>
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Running smooth
                </span>
              </div>

              <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 font-mono text-xs leading-relaxed shadow-md text-emerald-400">
                <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-slate-800 text-[10px] text-slate-400">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  <span className="ml-2">approlio-live-monitor</span>
                </div>
                <pre className="whitespace-pre-wrap text-slate-200">
                  {current.previewSnippet}
                </pre>
              </div>

              <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600">
                <span className="font-bold text-slate-900">Summary: </span>
                You don&apos;t need to do any technical setup yourself. Muhammad Mohsin configures the entire bot and cloud server for you.
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
