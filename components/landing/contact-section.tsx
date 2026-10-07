'use client';

import React, { useState } from 'react';
import { 
  MessageCircle, 
  ExternalLink, 
  Check, 
  Copy, 
  ArrowRight,
  Globe
} from 'lucide-react';

export function LandingContact() {
  const [selectedService, setSelectedService] = useState('Starter Setup (1 Brand)');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);

  const servicesList = [
    'Starter Setup (1 Brand)',
    'Multi-Page Suite (Multiple Pages/Clients)',
    'Custom Website Scrapers',
    'General Question or Advice',
  ];

  const buildWhatsAppUrl = () => {
    let text = `Hello Mohsin!\nI am interested in: ${selectedService}`;
    if (name) text += `\nMy Name: ${name}`;
    if (company) text += `\nMy Page/Business: ${company}`;
    if (message) text += `\nMessage: ${message}`;
    return `https://wa.me/+8801881169880?text=${encodeURIComponent(text)}`;
  };

  const handleCopyMessage = () => {
    let text = `Hello Mohsin! I am interested in: ${selectedService}`;
    if (name) text += `\nMy Name: ${name}`;
    if (company) text += `\nMy Page/Business: ${company}`;
    if (message) text += `\nMessage: ${message}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section id="contact" className="py-20 md:py-24 bg-white text-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Ready To Get Started?</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">
            Contact Mohsin Directly on{' '}
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
              WhatsApp or Facebook
            </span>
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            I respond quickly to all questions and can set up Approlio for your accounts in 48 hours.
          </p>
        </div>

        {/* 3 Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          
          {/* Card 1: WhatsApp (Primary) */}
          <a
            href="https://wa.me/+8801881169880?text=Hello%20Mohsin!%20I'm%20interested%20in%20deploying%20Approlio%20for%20my%20business."
            target="_blank"
            rel="noopener noreferrer"
            className="group relative rounded-3xl bg-emerald-50/50 hover:bg-emerald-50 border border-emerald-200 hover:border-emerald-400 p-6 sm:p-7 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 shadow-sm hover:shadow-md"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                  <MessageCircle className="w-6 h-6 fill-white" />
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Fastest Reply
                </span>
              </div>

              <h3 className="text-xl font-black text-slate-900 mb-1">
                WhatsApp Chat
              </h3>
              <p className="text-xs text-slate-600 mb-4">
                Direct mobile messaging with Muhammad Mohsin. Get quick answers on your phone.
              </p>

              <div className="p-3 rounded-xl bg-white border border-emerald-200 font-mono text-xs text-emerald-700 font-bold">
                +880 1881-169880
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between text-xs font-bold text-emerald-700 group-hover:text-emerald-800">
              <span>Chat on WhatsApp Now</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </a>

          {/* Card 2: Facebook Profile */}
          <a
            href="https://www.facebook.com/muhammad.mohsin.0033/"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative rounded-3xl bg-blue-50/50 hover:bg-blue-50 border border-blue-200 hover:border-blue-300 p-6 sm:p-7 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 shadow-sm hover:shadow-md"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20 group-hover:scale-105 transition-transform">
                  <span className="text-2xl font-black">f</span>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                  Facebook Profile
                </span>
              </div>

              <h3 className="text-xl font-black text-slate-900 mb-1">
                Facebook Messenger
              </h3>
              <p className="text-xs text-slate-600 mb-4">
                Connect on Facebook for project details, social verification, or general questions.
              </p>

              <div className="p-3 rounded-xl bg-white border border-blue-200 font-mono text-xs text-blue-700 font-bold truncate">
                muhammad.mohsin.0033
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between text-xs font-bold text-blue-700 group-hover:text-blue-800">
              <span>Send Message on Facebook</span>
              <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </a>

          {/* Card 3: Portfolio Website */}
          <a
            href="https://md-mohsin.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative rounded-3xl bg-purple-50/50 hover:bg-purple-50 border border-purple-200 hover:border-purple-300 p-6 sm:p-7 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 shadow-sm hover:shadow-md"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-600/20 group-hover:scale-105 transition-transform">
                  <Globe className="w-6 h-6" />
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                  Creator Portfolio
                </span>
              </div>

              <h3 className="text-xl font-black text-slate-900 mb-1">
                Personal Portfolio
              </h3>
              <p className="text-xs text-slate-600 mb-4">
                Explore more web apps, APIs, and client systems built by Muhammad Mohsin.
              </p>

              <div className="p-3 rounded-xl bg-white border border-purple-200 font-mono text-xs text-purple-700 font-bold">
                md-mohsin.vercel.app
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between text-xs font-bold text-purple-700 group-hover:text-purple-800">
              <span>Visit My Portfolio</span>
              <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </a>

        </div>

        {/* Fast Inquiry Box */}
        <div className="max-w-3xl mx-auto rounded-3xl bg-slate-50 border border-slate-200/90 shadow-lg p-6 sm:p-8 lg:p-10">
          <div className="space-y-6">
            
            <div className="border-b border-slate-200 pb-4">
              <h3 className="text-xl font-black text-slate-900">
                Send a Fast Message via WhatsApp
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Choose what you need below, and click the green button to open WhatsApp with your message already typed!
              </p>
            </div>

            {/* Service Pills */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                1. What are you looking for?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {servicesList.map((service, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedService(service)}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold text-left border transition-all ${
                      selectedService === service
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {service}
                  </button>
                ))}
              </div>
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Your Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Alex"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 focus:border-indigo-500 focus:outline-none text-xs text-slate-900 placeholder-slate-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Page or Business Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. My Media Page"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 focus:border-indigo-500 focus:outline-none text-xs text-slate-900 placeholder-slate-400"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Any specific question or details? (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="e.g. I want to auto-post 3 reels daily to my Facebook page..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 focus:border-indigo-500 focus:outline-none text-xs text-slate-900 placeholder-slate-400 resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <a
                href={buildWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-emerald-500/25 transition-all hover:scale-[1.01]"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Open WhatsApp (+880 1881-169880)</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <button
                type="button"
                onClick={handleCopyMessage}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 py-3.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-400" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
