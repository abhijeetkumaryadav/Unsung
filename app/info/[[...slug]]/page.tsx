// app/info/[[...slug]]/page.tsx
"use client";

import React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ShieldAlert, MapPin, Mail, Lock } from "lucide-react";
import { useTheme } from "@/app/context/ThemeContext";

const INFO_PAGES_DATA: Record<string, { title: string; subtitle: string; content: React.ReactNode }> = {
  about: {
    title: "About Us",
    subtitle: "Corporate Profile & Mission",
    content: (
      <>
        <p>Welcome to UNSUNG Network, a premier multi-platform digital news architecture delivering breakneck coverage of Politics, Business, Sports, Entertainment, and emerging Technology ecosystems.</p>
        <p>Founded on principles of absolute verification, precision data metrics, and uncompromised speed, our independent newsrooms leverage real-time analytics engines to broadcast critical global developments around the clock.</p>
      </>
    )
  },
  advertise: {
    title: "Advertise With Us",
    subtitle: "Media Kit & Partnerships",
    content: (
      <>
        <p>Maximize your brand equity by anchoring your campaigns alongside high-velocity media streams. UNSUNG Network serves premium ad units, interactive live scoreboard takeovers, political election map sync options, and bespoke native programmatic content blocks.</p>
        <p>To acquire our 2026 Core Audience Metrics Deck and request placement inventory tiering, contact our media placement desk at: <strong className="text-slate-900 dark:text-white">Unsungnews@gmail.com</strong></p>
      </>
    )
  },
  contact: {
    title: "Contact Us",
    subtitle: "Bureau Communication Channels",
    content: (
      <>
        <p>Have a breaking news tip, a correction request regarding current assembly seat calculations, or general feedback about the live broadcast pipeline?</p>
        <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-2 font-bold text-slate-800 dark:text-slate-200 my-4">
          <p className="flex items-center gap-2"><span>📍</span> Editorial Headquarters: Open Source Network</p>
          <p className="flex items-center gap-2"><span>📧</span> News Desk Terminal: Unsungnews@gmail.com</p>
          <p className="flex items-center gap-2"><span>🔒</span> Secure Encrypted Tips: Unsungnews@gmail.com</p>
        </div>
      </>
    )
  },
  privacy: {
    title: "Privacy Policy",
    subtitle: "Data Protocols & Encryption",
    content: (
      <>
        <p>Your privacy vectors are integral to secure browsing dynamics. This documentation outlines the rigid rules under which UNSUNG Network captures, caches, or interacts with local analytics sequences across our app domains.</p>
        <p>We operate transparent caching architectures. Custom settings adjusted via localized operational control configurations (such as dark mode preferences or terminal auth state saves) are processed securely without third-party exposure.</p>
      </>
    )
  },
  terms: {
    title: "Terms of Use",
    subtitle: "Network Syndication Parameters",
    content: (
      <>
        <p>By accessing any dynamic content pipelines, live election grids, or streaming infrastructure controlled under the UNSUNG Network registry, you consent to these binding architectural terms.</p>
        <p>Automated scraping, programmatic extraction of our live cricket vectors, or uncredited republication of broadcast wire assets is strictly prohibited without explicit licensing certificates from our legal council desk.</p>
      </>
    )
  },
  disclaimer: {
    title: "Disclaimer",
    subtitle: "Real-time Content Index Limitations",
    content: (
      <>
        <p>All data sequences—including live cricket runs, financial exchange ticks, market snapshot summaries, weather updates, and immediate election counts—are retrieved via active software API layers for informative, rapid evaluation.</p>
        <p>While we execute automated internal protocols to verify all streaming variables, numbers should be evaluated alongside officially certified regulatory state declaration outputs before definitive commercial action.</p>
      </>
    )
  }
};

export default function UnifiedDynamicCMSPages() {
  const { isDark } = useTheme();
  const router = useRouter();
  const params = useParams();
  
  const slugArray = params?.slug as string[] | undefined;
  const currentKey = slugArray && slugArray.length > 0 ? slugArray[0].toLowerCase() : "";

  const pageData = INFO_PAGES_DATA[currentKey];

  const darkBg = '#1a1a1a';
  const darkCardBg = '#242424';
  const darkBorder = '#333333';
  const darkText = '#e8e8e8';
  const darkTextSecondary = '#a0a0a0';
  const darkTextMuted = '#888888';

  // If page not found, show error state instead of calling notFound()
  if (!pageData) {
    return (
      <div className="min-h-screen p-6 md:p-12 flex items-center justify-center transition-colors duration-300" style={{ backgroundColor: isDark ? darkBg : '#f8fafc', color: isDark ? darkText : '#0f172a' }}>
        <div className="w-full max-w-3xl rounded-2xl p-6 md:p-10 shadow-2xs border transition-colors duration-300 text-center" style={{ backgroundColor: isDark ? darkCardBg : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0' }}>
          <h1 className="text-2xl font-black mb-4" style={{ color: isDark ? darkText : '#0f172a' }}>Page Not Found</h1>
          <p className="text-sm mb-6" style={{ color: isDark ? darkTextSecondary : '#64748b' }}>The information page you're looking for doesn't exist.</p>
          <Link href="/" className="inline-flex items-center gap-2 text-red-600 font-bold text-sm hover:underline">
            <ArrowLeft className="w-4 h-4" /> Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-12 flex items-center justify-center transition-colors duration-300" style={{ backgroundColor: isDark ? darkBg : '#f8fafc', color: isDark ? darkText : '#0f172a' }}>
      <div className="w-full max-w-3xl rounded-2xl p-6 md:p-10 shadow-2xs border transition-colors duration-300" style={{ backgroundColor: isDark ? darkCardBg : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0' }}>
        
        {/* Back Link */}
        <div className="mb-8">
          <button 
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 text-xs font-bold transition group cursor-pointer"
            style={{ color: isDark ? darkTextSecondary : '#64748b' }}
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            Return to Newsroom
          </button>
        </div>

        {/* Header */}
        <div className="pb-6 mb-6 border-b transition-colors duration-300" style={{ borderColor: isDark ? darkBorder : '#f1f5f9' }}>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight mb-2 transition-colors duration-300" style={{ color: isDark ? darkText : '#0f172a' }}>
            {pageData.title}
          </h1>
          <p className="text-[10px] font-black uppercase tracking-widest transition-colors duration-300" style={{ color: isDark ? darkTextMuted : '#94a3b8' }}>
            {pageData.subtitle}
          </p>
        </div>

        {/* Content */}
        <div className="text-xs leading-relaxed font-medium space-y-4 transition-colors duration-300" style={{ color: isDark ? darkTextSecondary : '#475569' }}>
          {pageData.content}
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] font-bold uppercase tracking-wider transition-colors duration-300" style={{ borderColor: isDark ? darkBorder : '#f1f5f9', color: isDark ? darkTextMuted : '#94a3b8' }}>
          <span>© 2026 UNSUNG Network Media</span>
          <span className="flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5" style={{ color: isDark ? '#555555' : '#cbd5e1' }} /> 
            Editorial Integrity Verified
          </span>
        </div>

      </div>
    </div>
  );
}