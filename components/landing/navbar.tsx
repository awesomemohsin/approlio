'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  MessageCircle, 
  ExternalLink, 
  Menu, 
  X, 
  ArrowRight, 
  ChevronRight,
  UserCheck
} from 'lucide-react';

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Features', href: '#features' },
    { label: 'ROI Calculator', href: '#calculator' },
    { label: 'Setup Packages', href: '#services' },
    { label: 'About Creator', href: '#creator' },
  ];

  return (
    <header 
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-xl border-b border-slate-200/80 shadow-sm py-2.5' 
          : 'bg-white/80 backdrop-blur-md border-b border-slate-100 py-3.5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          
          {/* Logo & Brand Name (Zero wrapping!) */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 p-[1.5px] shadow-sm group-hover:scale-105 transition-transform duration-200">
              <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center overflow-hidden p-0.5">
                <img 
                  src="/logo.png" 
                  alt="Approlio Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xl font-black tracking-tight text-slate-900 whitespace-nowrap">
                Approlio
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide bg-purple-50 text-purple-700 border border-purple-200 whitespace-nowrap">
                1-Tap Automation
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links (Strictly whitespace-nowrap) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-3 py-1.5 rounded-lg text-xs xl:text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors whitespace-nowrap shrink-0"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right Action Buttons (Strictly whitespace-nowrap) */}
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            {/* Primary Action: Direct WhatsApp */}
            <a
              href="https://wa.me/+8801881169880?text=Hello%20Mohsin!%20I'm%20interested%20in%20the%20Approlio%20automation%20service."
              target="_blank"
              rel="noopener noreferrer"
              className="relative inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm transition-all duration-200 hover:scale-[1.02] whitespace-nowrap shrink-0"
              title="Chat directly on WhatsApp"
            >
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              <MessageCircle className="w-3.5 h-3.5 fill-white text-white shrink-0" />
              <span className="whitespace-nowrap">WhatsApp Me</span>
            </a>

            {/* Portfolio Link */}
            <a
              href="https://md-mohsin.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors whitespace-nowrap shrink-0"
              title="View Muhammad Mohsin's Portfolio"
            >
              <span className="whitespace-nowrap">Portfolio</span>
              <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
            </a>

            {/* Operator Dashboard / Login */}
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition-colors whitespace-nowrap shrink-0"
            >
              <span className="whitespace-nowrap">Login</span>
              <ArrowRight className="w-3 h-3 shrink-0" />
            </Link>
          </div>

          {/* Mobile Menu Hamburger */}
          <div className="flex sm:hidden items-center gap-2">
            <a
              href="https://wa.me/+8801881169880"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-emerald-500 text-white shadow-sm"
              aria-label="WhatsApp Contact"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
            </a>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 bg-white/95 backdrop-blur-2xl px-4 pt-3 pb-6 space-y-4 shadow-xl">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors flex items-center justify-between"
              >
                <span>{link.label}</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </a>
            ))}
          </nav>

          <div className="pt-2 border-t border-slate-100 space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 px-1">
              Contact Creator (Mohsin)
            </p>
            <a
              href="https://wa.me/+8801881169880?text=Hello%20Mohsin!%20I'm%20interested%20in%20the%20Approlio%20automation%20service."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between w-full px-4 py-3 rounded-xl bg-emerald-500 text-white font-bold text-sm shadow-md shadow-emerald-500/20"
            >
              <div className="flex items-center gap-2.5">
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>WhatsApp: +880 1881-169880</span>
              </div>
              <ArrowRight className="w-4 h-4" />
            </a>

            <a
              href="https://www.facebook.com/muhammad.mohsin.0033/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between w-full px-4 py-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 font-semibold text-sm"
            >
              <div className="flex items-center gap-2.5">
                <span className="font-bold text-xs bg-blue-600 text-white rounded w-4 h-4 flex items-center justify-center">f</span>
                <span>Facebook: Muhammad Mohsin</span>
              </div>
              <ExternalLink className="w-4 h-4 text-blue-400" />
            </a>

            <a
              href="https://md-mohsin.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-sm"
            >
              <div className="flex items-center gap-2.5">
                <UserCheck className="w-4 h-4 text-purple-600" />
                <span>Portfolio: md-mohsin.vercel.app</span>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-400" />
            </a>

            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-slate-900 text-white font-bold text-sm"
            >
              <span>Login to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
