'use client';

import React, { useState } from 'react';
import { 
  Calculator, 
  Clock, 
  Zap, 
  Sparkles, 
  MessageCircle, 
  ArrowRight 
} from 'lucide-react';

export function LandingRoiCalculator() {
  const [sourcesCount, setSourcesCount] = useState(5);
  const [destinationsCount, setDestinationsCount] = useState(2);
  const [postsPerWeek, setPostsPerWeek] = useState(20);

  // Time calculations
  // Manual: ~25 mins to browse, download, re-encode, open FB studio, post, repeat
  const manualMinutesPerPost = 20 + destinationsCount * 5;
  const manualMonthlyHours = Math.round(((postsPerWeek * 4.3) * manualMinutesPerPost) / 60);

  // Approlio: ~1 minute per post on Telegram
  const approlioMinutesPerPost = 1.2;
  const approlioMonthlyHours = Math.round(((postsPerWeek * 4.3) * approlioMinutesPerPost) / 60);

  const hoursSavedMonthly = Math.max(0, manualMonthlyHours - approlioMonthlyHours);
  const percentSaved = Math.round(((manualMonthlyHours - approlioMonthlyHours) / manualMonthlyHours) * 100);

  return (
    <section id="calculator" className="py-20 md:py-24 bg-slate-50 text-slate-900 border-t border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Calculator className="w-3.5 h-3.5 text-emerald-600" />
            <span>Time Saved Calculator</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">
            See How Many Hours You Save{' '}
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
              Every Single Month
            </span>
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Move the sliders below to see how much manual work Approlio replaces with simple 1-tap phone approvals.
          </p>
        </div>

        {/* Calculator Box */}
        <div className="max-w-4xl mx-auto rounded-3xl bg-white border border-slate-200/90 shadow-xl shadow-slate-100 p-6 sm:p-8 lg:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Easy Sliders */}
            <div className="lg:col-span-6 space-y-6">
              
              {/* Slider 1 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <label className="font-bold text-slate-800">
                    Pages or Channels You Watch:
                  </label>
                  <span className="font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-200">
                    {sourcesCount} sources
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={sourcesCount}
                  onChange={(e) => setSourcesCount(Number(e.target.value))}
                  className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>1 page</span>
                  <span>10 pages</span>
                  <span>20 pages</span>
                </div>
              </div>

              {/* Slider 2 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <label className="font-bold text-slate-800">
                    Your Pages Where Posts Go Live:
                  </label>
                  <span className="font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-lg border border-purple-200">
                    {destinationsCount} target pages
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={destinationsCount}
                  onChange={(e) => setDestinationsCount(Number(e.target.value))}
                  className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>1 page</span>
                  <span>5 pages</span>
                  <span>10 pages</span>
                </div>
              </div>

              {/* Slider 3 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <label className="font-bold text-slate-800">
                    Videos or Posts Per Week:
                  </label>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                    {postsPerWeek} posts / week
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="70"
                  step="5"
                  value={postsPerWeek}
                  onChange={(e) => setPostsPerWeek(Number(e.target.value))}
                  className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>5 posts</span>
                  <span>35 posts</span>
                  <span>70 posts</span>
                </div>
              </div>

            </div>

            {/* Right Column: Calculated Results */}
            <div className="lg:col-span-6 space-y-4">
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <span className="text-xs uppercase tracking-wider font-bold text-slate-500">
                    Your Monthly Time Savings
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                    {percentSaved}% Less Work
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-xs text-slate-500 font-medium">Total Time You Save:</span>
                  <div className="text-4xl sm:text-5xl font-black text-emerald-600">
                    +{hoursSavedMonthly} Hours
                    <span className="text-sm font-normal text-slate-500 ml-1">/ month</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-3 rounded-xl bg-white border border-slate-200">
                    <div className="flex items-center gap-1.5 text-xs text-rose-600 font-bold mb-0.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Doing It Manually</span>
                    </div>
                    <p className="text-xl font-bold text-slate-900">{manualMonthlyHours} hours</p>
                    <p className="text-[10px] text-slate-400">Wasted in front of screen</p>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                    <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold mb-0.5">
                      <Zap className="w-3.5 h-3.5" />
                      <span>With Approlio</span>
                    </div>
                    <p className="text-xl font-bold text-emerald-800">{approlioMonthlyHours} hours</p>
                    <p className="text-[10px] text-emerald-600">Just tapping on Telegram</p>
                  </div>
                </div>

                {/* Direct WhatsApp CTA */}
                <a
                  href={`https://wa.me/+8801881169880?text=Hi%20Mohsin,%20I%20used%20your%20calculator.%20I%20want%20to%20save%20${hoursSavedMonthly}%20hours/month%20for%20my%20${sourcesCount}%20sources%20and%20${destinationsCount}%20pages.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-md transition-all hover:scale-[1.01]"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Get Approlio & Save These Hours (WhatsApp)</span>
                  <ArrowRight className="w-4 h-4" />
                </a>

              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
