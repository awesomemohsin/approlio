import type { Metadata } from 'next';
import { LandingNavbar } from '@/components/landing/navbar';
import { LandingHero } from '@/components/landing/hero';
import { LandingInteractivePipeline } from '@/components/landing/interactive-pipeline';
import { LandingFeatures } from '@/components/landing/features';
import { LandingRoiCalculator } from '@/components/landing/roi-calculator';
import { LandingServices } from '@/components/landing/services';
import { LandingCreator } from '@/components/landing/creator';
import { LandingContact } from '@/components/landing/contact-section';
import { LandingFooter } from '@/components/landing/footer';
import { FloatingContactBar } from '@/components/landing/floating-contact';

export const metadata: Metadata = {
  title: 'Approlio | Approval-First Social Media Automation & Publishing Platform',
  description:
    'Monitor Facebook, YouTube, TikTok and RSS feeds in real time. Eliminate duplicates with a 48-hour intelligence shield and approve viral content via 1-tap mobile Telegram bot before automated cross-posting. Built by Muhammad Mohsin.',
  keywords: [
    'Approlio',
    'Social Media Automation',
    'Telegram Approval Bot',
    'Cross-Posting Engine',
    'Facebook Reel Publisher',
    'YouTube Shorts Automation',
    'Content Ingestion Pipeline',
    'Muhammad Mohsin',
  ],
  openGraph: {
    title: 'Approlio | Approval-First Social Media Automation',
    description:
      'Human-in-the-loop social media curation, 1-tap Telegram mobile approvals, and multi-channel publishing.',
    images: ['/logo.png'],
  },
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-indigo-600 selection:text-white relative">
      {/* 1. Sticky Navigation Bar */}
      <LandingNavbar />

      <main className="flex-1">
        {/* 2. Hero Section with Interactive Telegram Bot Simulator */}
        <LandingHero />

        {/* 3. Interactive 4-Step Pipeline Walkthrough & Live Simulator */}
        <LandingInteractivePipeline />

        {/* 4. Core Capabilities & Architecture Features */}
        <LandingFeatures />

        {/* 5. Interactive ROI & Time Savings Calculator */}
        <LandingRoiCalculator />

        {/* 6. Turnkey Deployment & Service Packages */}
        <LandingServices />

        {/* 7. Creator & Engineering Spotlight (Muhammad Mohsin) */}
        <LandingCreator />

        {/* 8. Dedicated Contact & Fast Inquiry Hub */}
        <LandingContact />
      </main>

      {/* 9. Comprehensive Footer */}
      <LandingFooter />

      {/* 10. Persistent Quick Contact Floating Bar */}
      <FloatingContactBar />
    </div>
  );
}
