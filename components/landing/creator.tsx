'use client';

import React from 'react';
import { 
  MessageCircle, 
  ExternalLink, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight,
  Globe,
  Award
} from 'lucide-react';

export function LandingCreator() {
  const capabilities = [
    'Private Approlio Setup (Deployed for your business in 48 hours)',
    'Custom video scrapers for any website or social network',
    'Custom caption, translation & hashtag rules',
    'Separate workspaces with private Telegram alerts for multiple brands',
    'Full setup and walkthrough — no technical experience needed on your end',
  ];

  return (
    <section id="creator" className="py-20 md:py-24 bg-slate-50 text-slate-900 border-t border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>Meet The Creator</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">
            Built & Supported by{' '}
            <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 bg-clip-text text-transparent">
              Muhammad Mohsin
            </span>
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Full-Stack Software Engineer & Automation Specialist ready to set up 
            this complete system for your pages.
          </p>
        </div>

        {/* Creator Showcase Card */}
        <div className="max-w-5xl mx-auto rounded-3xl bg-white border border-slate-200/90 shadow-xl shadow-slate-100 p-6 sm:p-8 lg:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Column: Portrait & Direct Contact Actions */}
            <div className="lg:col-span-5 flex flex-col items-center text-center">
              
              {/* Profile Image with Clean Frame */}
              <div className="relative group">
                <div className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-3xl overflow-hidden border-4 border-white shadow-xl bg-slate-100 ring-1 ring-slate-200">
                  <img
                    src="/profile.jpg"
                    alt="Muhammad Mohsin - Full Stack Engineer & Creator of Approlio"
                    className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                {/* Available for Hire Floating Badge */}
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[11px] font-bold bg-white text-emerald-700 border border-emerald-300 shadow-md whitespace-nowrap">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Available for Client Deployments</span>
                </div>
              </div>

              {/* Name & Title */}
              <div className="mt-7 space-y-1">
                <h3 className="text-2xl font-black text-slate-900">
                  Muhammad Mohsin
                </h3>
                <p className="text-xs sm:text-sm text-indigo-600 font-bold">
                  Full-Stack Software Engineer
                </p>
              </div>

              {/* Direct Quick-Contact Strip Under Photo */}
              <div className="mt-5 w-full flex flex-col gap-2">
                <a
                  href="https://wa.me/+8801881169880?text=Hello%20Mohsin!%20I'm%20reaching%20out%20regarding%20the%20Approlio%20automation%20service."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/20 transition-all active:scale-95"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Chat on WhatsApp: +880 1881-169880</span>
                </a>

                <div className="grid grid-cols-2 gap-2">
                  <a
                    href="https://www.facebook.com/muhammad.mohsin.0033/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold text-xs transition-colors"
                  >
                    <span className="font-bold text-[10px] bg-blue-600 text-white rounded w-3.5 h-3.5 flex items-center justify-center">f</span>
                    <span>Facebook Profile</span>
                  </a>

                  <a
                    href="https://md-mohsin.vercel.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-bold text-xs transition-colors"
                  >
                    <Globe className="w-3.5 h-3.5 text-indigo-600" />
                    <span>My Portfolio</span>
                  </a>
                </div>
              </div>

            </div>

            {/* Right Column: Bio & Simple Value Proposition */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                  A Personal Note From Mohsin
                </span>
                <p className="text-slate-800 text-base sm:text-lg font-semibold leading-relaxed">
                  "I created Approlio to solve a simple problem: running social media pages manually takes hours of copying links, downloading files, writing tags, and uploading every single day."
                </p>
                <p className="text-slate-600 text-sm leading-relaxed">
                  With Approlio, you never have to waste your time doing repetitive manual work. The bot monitors the best pages 24/7, sends you a notification on Telegram with a video preview, and lets you approve and post in 1 second.
                </p>
              </div>

              {/* What I can do for you */}
              <div className="space-y-2.5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  What I Can Build & Set Up For You:
                </p>
                <div className="space-y-2">
                  {capabilities.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                      <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Consultation CTA */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3">
                <a
                  href="https://wa.me/+8801881169880?text=Hi%20Mohsin,%20I%20would%20like%20to%20discuss%20deploying%20Approlio%20for%20my%20business."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/20 transition-all hover:scale-[1.01]"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Talk with Mohsin on WhatsApp (+880 1881-169880)</span>
                  <ArrowRight className="w-4 h-4" />
                </a>

                <a
                  href="https://md-mohsin.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold transition-colors"
                >
                  <span>See My Other Projects</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </a>
              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
