"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { footerData } from "@/app/lib/data";
import { getFooterDescription } from "@/app/lib/dataService";
import { useTheme } from "@/app/context/ThemeContext";

interface SocialLink {
  platform: string;
  url: string;
}

export default function Footer() {
  const { isDark } = useTheme();
  const currentYear = new Date().getFullYear();
  const [footerDesc, setFooterDesc] = useState(footerData.description);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);

  useEffect(() => {
    const loadFooterData = async () => {
      try {
        const desc = await getFooterDescription();
        if (desc) setFooterDesc(desc);

        const response = await fetch('/api/get-data?key=socialLinks&t=' + Date.now());
        if (response.ok) {
          const data = await response.json();
          if (data && Array.isArray(data)) setSocialLinks(data);
        }
      } catch (error) {
        console.error("Error loading footer data:", error);
      }
    };

    loadFooterData();
  }, []);

  const getSocialIcon = (platform: string) => {
    const name = platform.toLowerCase();
    if (name.includes('youtube') || name.includes('you tube')) {
      return (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.108C19.53 3.5 12 3.5 12 3.5s-7.53 0-9.388.555A3.003 3.003 0 0 0 .502 6.163C0 8.07 0 12 0 12s0 3.93.502 5.837a3.003 3.003 0 0 0 2.11 2.108C4.47 20.5 12 20.5 12 20.5s7.53 0 9.388-.555a3.003 3.003 0 0 0 2.11-2.108C24 15.93 24 12 24 12s0-3.93-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      );
    }
    if (name.includes('facebook') || name.includes('fb')) {
      return (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.8z"/>
        </svg>
      );
    }
    if (name.includes('twitter') || name.includes('x ')) {
      return (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      );
    }
    if (name.includes('instagram') || name.includes('insta')) {
      return (
        <svg className="w-3.5 h-3.5 stroke-current fill-none stroke-2" viewBox="0 0 24 24">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
        </svg>
      );
    }
    if (name.includes('linkedin')) {
      return (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      );
    }
    if (name.includes('telegram')) {
      return (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18.606-.968 3.906-1.372 5.182-.168.535-.503.712-.826.732-.702.064-1.235-.464-1.915-.91-1.064-.697-1.665-1.132-2.698-1.812-1.193-.787-.42-1.22.261-1.926.178-.184 3.282-3.008 3.342-3.265.008-.032.015-.152-.056-.214-.071-.062-.176-.041-.252-.024-.107.024-1.814 1.152-5.12 3.384-.484.332-.923.494-1.316.485-.433-.009-1.267-.245-1.887-.446-.76-.247-1.364-.378-1.312-.797.027-.219.329-.443.905-.672 3.52-1.534 5.868-2.545 7.044-3.034 3.354-1.395 4.051-1.637 4.505-1.645.1-.002.323.023.468.14.121.098.155.23.172.337.017.107.038.349.021.54z"/>
        </svg>
      );
    }
    return (
      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
      </svg>
    );
  };

  const fixUrl = (url: string): string => {
    if (!url) return '#';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return 'https://' + url;
  };

  const darkBg = '#1e1e1e';
  const darkBorder = '#333333';
  const darkText = '#e8e8e8';
  const darkTextSecondary = '#a0a0a0';
  const darkTextMuted = '#888888';

  const half = Math.ceil(footerData.quickLinks.length / 2);
  const leftLinks = footerData.quickLinks.slice(0, half);
  const rightLinks = footerData.quickLinks.slice(half);

  return (
    <footer 
      className="w-full border-t mt-12 transition-colors duration-300"
      style={{ 
        backgroundColor: isDark ? darkBg : '#ffffff',
        borderColor: isDark ? darkBorder : '#e2e8f0',
        color: isDark ? darkTextSecondary : '#475569'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6">
        
        <div className="md:col-span-6 space-y-2">
          <div className="flex flex-col items-start leading-none select-none">
            <span className="text-xl sm:text-2xl font-black tracking-tighter flex items-center transition-colors duration-300" style={{ color: isDark ? darkText : '#0f172a' }}>
              UN<span className="text-red-600 underline decoration-4 decoration-red-600 pl-0.5">SUNG</span>
            </span>
            <span className="text-[8px] uppercase font-bold tracking-widest mt-0.5 pl-0.5 transition-colors duration-300" style={{ color: isDark ? darkTextMuted : '#64748b' }}>News Network</span>
          </div>
          <p className="text-xs leading-relaxed max-w-sm transition-colors duration-300" style={{ color: isDark ? darkTextSecondary : '#64748b' }}>
            {footerDesc}
          </p>
          
          {socialLinks.length > 0 && (
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              {socialLinks.map((link, index) => (
                <a 
                  key={index}
                  href={fixUrl(link.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={link.platform}
                  className={`p-1.5 rounded-full border transition cursor-pointer flex items-center justify-center ${
                    isDark 
                      ? 'border-[#333333] text-[#a0a0a0] hover:border-red-500 hover:text-red-400 hover:bg-red-900/20' 
                      : 'border-slate-200 text-slate-500 hover:border-red-400 hover:text-red-500 hover:bg-red-50'
                  }`}
                  style={{ backgroundColor: isDark ? '#2d2d2d' : '#f8fafc' }}
                >
                  {getSocialIcon(link.platform)}
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="md:col-span-6">
          <h5 className="text-[9px] uppercase tracking-wider font-extrabold mb-2 transition-colors duration-300" style={{ color: isDark ? darkTextMuted : '#94a3b8' }}>Quick Links</h5>
          <div className="grid grid-cols-2 gap-3 text-xs font-bold">
            <div className="space-y-1.5">
              {leftLinks.map((link) => (
                <Link 
                  key={link.name} 
                  href={link.link} 
                  className={`block transition-colors duration-300 text-[11px] ${isDark ? 'text-[#a0a0a0] hover:text-red-400' : 'text-slate-700 hover:text-red-600'}`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
            <div className="space-y-1.5">
              {rightLinks.map((link) => (
                <Link 
                  key={link.name} 
                  href={link.link} 
                  className={`block transition-colors duration-300 text-[11px] ${isDark ? 'text-[#a0a0a0] hover:text-red-400' : 'text-slate-700 hover:text-red-600'}`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

      </div>

      <div 
        className="border-t text-[10px] font-medium transition-colors duration-300"
        style={{ 
          backgroundColor: isDark ? '#1a1a1a' : '#f8fafc',
          borderColor: isDark ? darkBorder : '#e2e8f0',
          color: isDark ? darkTextMuted : '#64748b'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="transition-colors duration-300 text-[10px]" style={{ color: isDark ? darkTextMuted : '#64748b' }}>
              © {currentYear} {footerData.copyright}
            </div>
            <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap max-w-full scrollbar-none">
              <span className="font-bold text-[9px] transition-colors duration-300" style={{ color: isDark ? '#555555' : '#94a3b8' }}>News in 10 Indian Languages:</span>
              {footerData.languages.map((lang) => (
                <span key={lang} className="transition-colors duration-300 text-[10px]" style={{ color: isDark ? darkTextSecondary : '#64748b' }}>
                  {lang}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}