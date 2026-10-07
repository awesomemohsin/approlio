'use client';

import React, { useState, useEffect } from 'react';
import { 
  MessageCircle, 
  ExternalLink, 
  X, 
  Sparkles 
} from 'lucide-react';

export function FloatingContactBar() {
  const [visible, setVisible] = useState(false);
  const [minimized, setMinimized] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 150);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-5 right-4 sm:right-6 z-50 transition-all duration-300">
      {minimized ? (
        <button
          onClick={() => setMinimized(false)}
          className="relative flex items-center gap-2 px-4 py-3 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-xl shadow-emerald-500/30 transition-transform active:scale-95"
          aria-label="Open contact options"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
          </span>
          <MessageCircle className="w-4 h-4 fill-white" />
          <span>Chat with Mohsin</span>
        </button>
      ) : (
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white/95 border border-slate-200 shadow-2xl shadow-slate-300/60 backdrop-blur-md">
          
          {/* Main WhatsApp CTA */}
          <a
            href="https://wa.me/+8801881169880?text=Hello%20Mohsin!%20I'm%20on%20the%20Approlio%20website%20and%20want%20to%20ask%20about%20your%20services."
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-sm transition-all active:scale-95"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            <MessageCircle className="w-3.5 h-3.5 fill-white" />
            <span>WhatsApp (+880 1881-169880)</span>
          </a>

          {/* Facebook Link */}
          <a
            href="https://www.facebook.com/muhammad.mohsin.0033/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors"
            title="Facebook Messenger"
          >
            <span className="font-bold text-xs w-4 h-4 flex items-center justify-center">f</span>
          </a>

          {/* Portfolio Link */}
          <a
            href="https://md-mohsin.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            title="Creator Portfolio"
          >
            <span>Portfolio</span>
          </a>

          {/* Minimize button */}
          <button
            onClick={() => setMinimized(true)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="Minimize contact bar"
          >
            <X className="w-3.5 h-3.5" />
          </button>

        </div>
      )}
    </div>
  );
}
