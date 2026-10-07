'use client';

import React from 'react';
import { 
  Check, 
  MessageCircle, 
  ArrowRight, 
  Server, 
  Sparkles 
} from 'lucide-react';

export function LandingServices() {
  const plans = [
    {
      name: 'Starter Setup',
      badge: 'For 1 Brand or Creator',
      tagline: 'Your own private Approlio instance running in 48 hours.',
      features: [
        'Complete cloud setup (you don’t need any technical skills)',
        'Private Telegram bot connected directly to your phone',
        'Automatic posting to your Facebook Page (Reels & Videos)',
        'Watch up to 10 creator pages or YouTube channels',
        '48-hour duplicate post blocker included',
        'Easy web dashboard to edit captions and preview videos',
        '1-on-1 personal setup & walkthrough with Mohsin',
      ],
      whatsappPrefill: 'Hi Mohsin, I want to get the Starter Setup of Approlio for my social page.',
      popular: false,
    },
    {
      name: 'Multi-Page Suite',
      badge: 'Most Popular',
      tagline: 'Manage multiple pages, brands, or client accounts effortlessly.',
      features: [
        'Everything in the Starter Setup',
        'Unlimited separate workspaces for all your pages/clients',
        'Separate Telegram bot channels for each page',
        'Auto-post to Facebook AND YouTube Shorts',
        'Watch up to 50 creator pages across Facebook, YouTube, TikTok',
        'Add custom hashtags and caption rules automatically',
        'Priority technical support & maintenance by Mohsin',
      ],
      whatsappPrefill: 'Hi Mohsin, I am interested in the Multi-Page Suite of Approlio for multiple accounts.',
      popular: true,
    },
    {
      name: 'Custom Tailored Setup',
      badge: 'Custom Architecture',
      tagline: 'Custom scrapers, unique websites & specialized workflows.',
      features: [
        'Everything in the Multi-Page Suite',
        'Custom scrapers for any website or platform you want',
        'High-resolution video re-encoding & storage',
        'Automated AI caption rewrite & hashtag generator',
        'Custom posting targets (Facebook, YouTube, TikTok, Telegram)',
        'Ongoing maintenance & direct 1-on-1 engineering support',
      ],
      whatsappPrefill: 'Hi Mohsin, I need a Custom Tailored Approlio setup with unique requirements.',
      popular: false,
    },
  ];

  return (
    <section id="services" className="py-20 md:py-24 bg-white text-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full text-xs font-bold bg-cyan-50 text-cyan-700 border border-cyan-200">
            <Server className="w-3.5 h-3.5 text-cyan-600" />
            <span>How You Can Get This Service</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">
            I Set Everything Up For You{' '}
            <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 bg-clip-text text-transparent">
              From Start to Finish
            </span>
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            You don&apos;t have to code or configure servers. I handle the entire installation, 
            telegram bot authorization, and testing for your brand.
          </p>
        </div>

        {/* 3 Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`relative rounded-3xl bg-white border p-6 sm:p-8 flex flex-col justify-between transition-all duration-200 ${
                plan.popular
                  ? 'border-indigo-600 shadow-xl shadow-indigo-100 ring-2 ring-indigo-600/20'
                  : 'border-slate-200 hover:border-slate-300 shadow-sm'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-indigo-600 text-white shadow-sm">
                  ★ Most Popular
                </div>
              )}

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 block mb-2">
                  {plan.badge}
                </span>

                <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">
                  {plan.name}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                  {plan.tagline}
                </p>

                <div className="h-px bg-slate-100 mb-6" />

                {/* Features List */}
                <div className="space-y-3 mb-8">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    What You Get:
                  </p>
                  {plan.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                      <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3" />
                      </div>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Package CTA */}
              <div className="pt-4 border-t border-slate-100">
                <a
                  href={`https://wa.me/+8801881169880?text=${encodeURIComponent(plan.whatsappPrefill)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-sm whitespace-nowrap ${
                    plan.popular
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20'
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  <MessageCircle className="w-4 h-4 fill-white shrink-0" />
                  <span className="whitespace-nowrap">Inquire on WhatsApp</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Free Consultation Callout */}
        <div className="mt-12 text-center text-xs sm:text-sm text-slate-600">
          <span>Not sure which package is right for your pages? </span>
          <a
            href="https://wa.me/+8801881169880?text=Hi%20Mohsin,%20can%20we%20have%20a%20free%20quick%20chat%20about%20Approlio?"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-600 hover:text-emerald-700 font-bold underline underline-offset-4 ml-1 inline-flex items-center gap-1"
          >
            <span>Have a free quick consultation with Mohsin on WhatsApp</span>
            <ArrowRight className="w-3.5 h-3.5 inline" />
          </a>
        </div>

      </div>
    </section>
  );
}
