'use client';

import React from 'react';
import Link from 'next/link';
import { 
  MessageCircle, 
  ExternalLink, 
  ArrowUp, 
  Globe
} from 'lucide-react';

export function LandingFooter() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-50 border-t border-slate-200 text-slate-600 py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10 pb-12 border-b border-slate-200">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 p-[1.5px] shadow-sm">
                <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center overflow-hidden p-1">
                  <img 
                    src="/logo.png" 
                    alt="Approlio Logo" 
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
              <span className="text-xl font-extrabold text-slate-900 tracking-tight">
                Approlio
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm">
              Social media monitoring and auto-publishing with 1-tap mobile Telegram approval. 
              Built to help creators, businesses, and agency owners save hours every day.
            </p>

            <div className="flex items-center gap-2 pt-1 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                Service Ready & Active
              </span>
              <span>•</span>
              <span className="font-semibold text-slate-700">100% Brand Safe</span>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Navigation
            </p>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#about" className="hover:text-slate-900 transition-colors">
                  What is Approlio?
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-slate-900 transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-slate-900 transition-colors">
                  Key Features
                </a>
              </li>
              <li>
                <a href="#calculator" className="hover:text-slate-900 transition-colors">
                  Time Saved Calculator
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-slate-900 transition-colors">
                  Get This Service
                </a>
              </li>
              <li>
                <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-700 font-bold">
                  Operator Login &rarr;
                </Link>
              </li>
            </ul>
          </div>

          {/* Obvious Contact Sources */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Contact Creator
            </p>
            <ul className="space-y-2.5 text-xs">
              <li>
                <a
                  href="https://wa.me/+8801881169880?text=Hello%20Mohsin!%20I'm%20contacting%20you%20from%20the%20Approlio%20website."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-bold"
                >
                  <MessageCircle className="w-3.5 h-3.5 fill-emerald-600" />
                  <span>WhatsApp: +880 1881-169880</span>
                </a>
              </li>
              <li>
                <a
                  href="https://www.facebook.com/muhammad.mohsin.0033/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-bold"
                >
                  <span className="font-bold text-xs bg-blue-600 text-white rounded w-3.5 h-3.5 flex items-center justify-center">f</span>
                  <span>Facebook Profile</span>
                </a>
              </li>
              <li>
                <a
                  href="https://md-mohsin.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-bold"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Portfolio: md-mohsin.vercel.app</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Creator Profile Box */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Built By
            </p>
            <div className="flex items-center gap-3">
              <img
                src="/profile.jpg"
                alt="Muhammad Mohsin"
                className="w-11 h-11 rounded-xl object-cover border border-slate-200 shadow-sm"
              />
              <div>
                <p className="text-xs font-bold text-slate-900">Muhammad Mohsin</p>
                <p className="text-[11px] text-indigo-600 font-medium">Software Engineer</p>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 leading-normal">
              Available for custom automation setups, scrapers, and full-stack software development.
            </p>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            <span>© {new Date().getFullYear()} Approlio. Designed & Created by Muhammad Mohsin.</span>
          </div>

          <div className="flex items-center gap-4">
            <a 
              href="https://md-mohsin.vercel.app/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-slate-600 hover:text-slate-900 font-medium"
            >
              md-mohsin.vercel.app
            </a>
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors shadow-sm font-semibold"
            >
              <span>Back to Top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
