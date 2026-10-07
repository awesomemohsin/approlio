'use client';

import React, { useState } from 'react';
import { 
  MessageCircle, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  ArrowRight, 
  Play, 
  Share2, 
  Smartphone, 
  ExternalLink, 
  Bot, 
  Clock, 
  Check, 
  Flame, 
  Volume2, 
  Layers, 
  Radio
} from 'lucide-react';

export function LandingHero() {
  const [demoApproved, setDemoApproved] = useState<boolean | null>(null);

  return (
    <section id="about" className="relative overflow-hidden pt-8 pb-16 md:pt-14 md:pb-22 bg-white text-slate-900">
      
      {/* Subtle modern cyber-dot background */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-60 pointer-events-none -z-10" />

      {/* Atmospheric ambient pastel glow blooms */}
      <div className="absolute top-0 right-1/4 w-[550px] h-[400px] bg-gradient-to-tr from-purple-200/40 via-indigo-100/40 to-cyan-200/30 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-10 w-[450px] h-[350px] bg-gradient-to-tr from-emerald-100/30 via-teal-100/20 to-sky-100/30 blur-[100px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Two-Column Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* Left Column: Bold Copy, Badges & High-Converting CTAs */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            {/* Top Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-purple-50 via-indigo-50 to-cyan-50 text-indigo-800 border border-indigo-200/80 shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>100% Brand-Safe Social Media Automation</span>
              <span className="text-indigo-300">•</span>
              <span className="text-purple-700 font-extrabold">1-Tap Mobile Control</span>
            </div>

            {/* Giant Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 leading-[1.12]">
              Stop Posting Videos Manually.{' '}
              <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 bg-clip-text text-transparent">
                Approve With 1 Tap on Your Phone.
              </span>
            </h1>

            {/* Subtitle / Clear Explanation */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl font-normal">
              Approlio watches top Facebook pages, YouTube channels & TikTok creators 24/7. 
              When a viral video drops, it pings your{' '}
              <strong className="text-slate-900 font-semibold">Telegram with a video preview</strong>.{' '}
              You tap <strong>&ldquo;Approve&rdquo;</strong>, and it automatically cross-posts to your Facebook Page &amp; YouTube Shorts!
            </p>

            {/* Supported Platform Badges */}
            <div className="pt-1 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1">
                Supported:
              </span>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 text-blue-800 text-xs font-bold border border-blue-200">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                Facebook Reels & Pages
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-50 text-red-800 text-xs font-bold border border-red-200">
                <span className="w-2 h-2 rounded-full bg-red-600" />
                YouTube Shorts & Videos
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-bold border border-slate-300">
                <span className="w-2 h-2 rounded-full bg-slate-900" />
                TikTok Creators
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-sky-50 text-sky-800 text-xs font-bold border border-sky-200">
                <Bot className="w-3.5 h-3.5 text-sky-600" />
                Telegram Bot
              </div>
            </div>

            {/* High-Converting Primary CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* WhatsApp Primary Button */}
              <a
                href="https://wa.me/+8801881169880?text=Hello%20Mohsin!%20I%20want%20to%20get%20Approlio%20automation%20set%20up%20for%20my%20social%20media%20pages."
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-emerald-500/25 transition-all duration-200 hover:scale-[1.02] whitespace-nowrap"
              >
                <MessageCircle className="w-5 h-5 fill-white shrink-0" />
                <span>Chat on WhatsApp (+880 1881-169880)</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform shrink-0" />
              </a>

              {/* Facebook Button */}
              <a
                href="https://www.facebook.com/muhammad.mohsin.0033/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-4 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-sm sm:text-base border border-blue-200 transition-colors whitespace-nowrap"
              >
                <span className="font-bold text-xs bg-blue-600 text-white rounded w-4 h-4 flex items-center justify-center">f</span>
                <span>Message on Facebook</span>
              </a>
            </div>

            {/* Creator Trust & Availability Strip */}
            <div className="pt-1 flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-slate-500">
              <span className="flex items-center gap-1.5 text-emerald-700 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Fast WhatsApp Reply
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-700 font-medium">Turnkey Setup in 48 Hours</span>
              <span className="text-slate-300">•</span>
              <a 
                href="https://md-mohsin.vercel.app/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-800 font-bold underline underline-offset-4 flex items-center gap-1"
              >
                Created by Muhammad Mohsin <ExternalLink className="w-3 h-3 inline" />
              </a>
            </div>

          </div>

          {/* Right Column: High-End Photorealistic Smartphone Telegram Simulator */}
          <div className="lg:col-span-5 relative flex justify-center">
            
            {/* Ambient Device Backglow */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-purple-400/20 via-indigo-500/20 to-cyan-400/20 blur-2xl rounded-[40px] pointer-events-none" />

            {/* Floating Top Badge 1: Live Publish Alert */}
            <div className="absolute -top-4 -left-4 sm:-left-6 z-20 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-xl p-3 flex items-center gap-3 animate-bounce [animation-duration:4s]">
              <div className="w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center text-white font-bold text-base shadow-sm">
                f
              </div>
              <div>
                <p className="text-[11px] font-extrabold text-slate-900">Auto-Published Reel</p>
                <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Live on Facebook • 2s ago
                </p>
              </div>
            </div>

            {/* Floating Bottom Badge 2: Duplicate Shield Protected */}
            <div className="absolute -bottom-4 -right-2 sm:-right-4 z-20 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-xl p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-[11px] font-extrabold text-slate-900">48h Duplicate Shield</p>
                <p className="text-[10px] text-slate-500">100% Fresh Content Guarantee</p>
              </div>
            </div>

            {/* Smartphone Hardware Frame */}
            <div className="relative w-full max-w-[370px] rounded-[36px] bg-slate-900 p-3 shadow-2xl shadow-indigo-900/20 ring-1 ring-slate-800">
              
              {/* Outer bezel reflection */}
              <div className="rounded-[28px] bg-slate-50 border border-slate-200 overflow-hidden shadow-inner flex flex-col">
                
                {/* Phone Speaker Notch & Status Bar */}
                <div className="bg-slate-100/90 border-b border-slate-200 px-4 py-2 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700">9:41</span>
                  <div className="w-20 h-4 bg-slate-900 rounded-full flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-600">
                    <Radio className="w-3 h-3 text-emerald-600" />
                    <span>5G</span>
                  </div>
                </div>

                {/* Telegram App Header Bar */}
                <div className="bg-sky-500 px-4 py-2.5 flex items-center justify-between text-white shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-white text-sky-600 flex items-center justify-center font-bold text-xs shadow-sm">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold leading-none">Approlio Bot</span>
                        <span className="text-[8px] bg-white/30 text-white font-black px-1 rounded">PRO</span>
                      </div>
                      <span className="text-[10px] text-sky-100">online</span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-sky-600/60 px-2 py-0.5 rounded-full font-mono">Telegram</span>
                </div>

                {/* Telegram Message Bubble Container */}
                <div className="p-3.5 space-y-3 bg-gradient-to-b from-sky-50/40 via-slate-50 to-slate-100 min-h-[380px] flex flex-col justify-between">
                  
                  {/* Incoming Post Card */}
                  <div className="rounded-2xl bg-white border border-slate-200/90 shadow-sm p-3 space-y-2.5">
                    
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-800">
                        <Flame className="w-3 h-3 text-blue-600 fill-blue-600" />
                        Viral Reel Detected
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">10:42 AM</span>
                    </div>

                    <div className="text-[11px] text-slate-600 space-y-0.5">
                      <p><strong>From:</strong> Tech Innovations Page</p>
                      <p><strong>Target:</strong> My Facebook Page + YT Shorts</p>
                    </div>

                    {/* Rich Video Frame Preview Mockup */}
                    <div className="relative rounded-xl overflow-hidden aspect-video bg-gradient-to-br from-slate-900 to-indigo-950 flex flex-col justify-between p-2.5 text-white shadow-inner group">
                      <div className="flex items-center justify-between z-10">
                        <span className="px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-md text-[9px] font-bold text-cyan-300">
                          1080p HD
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-md text-[9px] font-mono text-white">
                          0:48
                        </span>
                      </div>

                      {/* Center Play Button */}
                      <div className="self-center flex flex-col items-center justify-center my-1 z-10">
                        <div className="w-10 h-10 rounded-full bg-white/30 backdrop-blur-md border border-white/40 flex items-center justify-center text-white shadow-lg transition-transform hover:scale-110">
                          <Play className="w-5 h-5 fill-white ml-0.5" />
                        </div>
                      </div>

                      <div className="z-10 bg-black/50 backdrop-blur-sm -mx-2.5 -mb-2.5 p-2 rounded-b-xl border-t border-white/10">
                        <p className="text-[11px] font-bold text-white truncate">
                          &ldquo;Top 5 AI Tools Saving 20 Hours a Week&rdquo;
                        </p>
                        <p className="text-[9px] text-slate-300">
                          2.4M Views on Original • High Engagement
                        </p>
                      </div>
                    </div>

                    {/* Caption Preview Box */}
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-[10px] text-slate-700 leading-snug">
                      <span className="font-bold text-slate-400 block mb-0.5">CAPTION PREVIEW:</span>
                      &ldquo;These 5 tools will completely transform your workflow! Save this clip before it&apos;s gone. #AI #TechHacks&rdquo;
                    </div>

                    {/* Interactive 1-Tap Action Decision */}
                    <div className="pt-1">
                      {demoApproved === null && (
                        <div className="space-y-1.5">
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => setDemoApproved(true)}
                              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-extrabold text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => setDemoApproved(false)}
                              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 font-bold text-xs border border-slate-200 active:scale-95 transition-all"
                            >
                              <XCircle className="w-4 h-4" />
                              <span>Reject</span>
                            </button>
                          </div>
                          <p className="text-[10px] text-center text-slate-400 font-medium">
                            👆 Click &ldquo;Approve&rdquo; to test interactive response!
                          </p>
                        </div>
                      )}

                      {demoApproved === true && (
                        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-1 animate-fade-in">
                          <div className="flex items-center justify-center gap-1.5 font-black text-xs text-emerald-800">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Post Approved! Uploading Now...</span>
                          </div>
                          <p className="text-[10px] text-emerald-700">
                            Cross-posted to your Facebook Page & YouTube Shorts!
                          </p>
                          <button
                            onClick={() => setDemoApproved(null)}
                            className="text-[10px] text-slate-500 hover:text-slate-800 underline block mx-auto pt-0.5"
                          >
                            ↺ Reset Demo
                          </button>
                        </div>
                      )}

                      {demoApproved === false && (
                        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-center space-y-1 animate-fade-in">
                          <div className="flex items-center justify-center gap-1.5 font-black text-xs text-rose-800">
                            <XCircle className="w-4 h-4 text-rose-600" />
                            <span>Post Rejected Safely</span>
                          </div>
                          <p className="text-[10px] text-rose-700">
                            Nothing was published. Your pages remain 100% clean.
                          </p>
                          <button
                            onClick={() => setDemoApproved(null)}
                            className="text-[10px] text-slate-500 hover:text-slate-800 underline block mx-auto pt-0.5"
                          >
                            ↺ Reset Demo
                          </button>
                        </div>
                      )}
                    </div>

                  </div>

                  <div className="text-center text-[10px] text-slate-400 font-medium pb-1">
                    🔒 Secured Telegram Bot Gateway
                  </div>

                </div>

              </div>
            </div>

          </div>

        </div>

        {/* Impressive Metrics Ribbon Directly Below the Split Hero */}
        <div className="mt-14 pt-8 border-t border-slate-200/80 grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 shadow-sm">
            <p className="text-3xl font-black text-slate-900">1 Tap</p>
            <p className="text-xs text-slate-500 mt-1 font-bold">Approval from Your Phone</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 shadow-sm">
            <p className="text-3xl font-black text-indigo-600">5+ Hours</p>
            <p className="text-xs text-slate-500 mt-1 font-bold">Saved Daily Per Page</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 shadow-sm">
            <p className="text-3xl font-black text-emerald-600">0 Dupes</p>
            <p className="text-xs text-slate-500 mt-1 font-bold">48h Duplicate Shield</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 shadow-sm">
            <p className="text-3xl font-black text-purple-600">100% Safe</p>
            <p className="text-xs text-slate-500 mt-1 font-bold">Zero Accidental Posts</p>
          </div>
        </div>

      </div>
    </section>
  );
}
