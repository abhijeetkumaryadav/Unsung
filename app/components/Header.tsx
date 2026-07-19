// app/components/Header.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Menu, Search, Tv, ChevronDown, X, Globe, Check } from "lucide-react";
import Sidebar from "./Sidebar";
import { categories } from "@/app/lib/data";
import { useLanguage, LANGUAGES } from "@/app/context/LanguageContext";
import { useTheme } from "@/app/context/ThemeContext";

interface HeaderProps {
  searchQuery?: string;
  onSearch?: (query: string) => void;
}

export default function Header({ searchQuery = "", onSearch }: HeaderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { currentLanguage, setLanguage } = useLanguage();
  const { isDark } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [query, setQuery] = useState(searchQuery);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const today = new Date();
  const dateString = today.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Sync query with URL search params
  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    if (urlSearch) {
      setQuery(urlSearch);
    }
  }, [searchParams]);

  // Sync query with prop
  useEffect(() => {
    setQuery(searchQuery);
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && onSearch) {
      onSearch(query.trim());
      setIsSearchOpen(false);
    }
  };

  const handleMobileSearch = () => {
    if (query.trim() && onSearch) {
      onSearch(query.trim());
      setIsSearchOpen(false);
    }
  };

  const clearSearch = () => {
    setQuery("");
    if (onSearch) onSearch("");
  };

  const isCategoryActive = (link: string) => {
    if (link === "/") return pathname === "/";
    return pathname === link || pathname?.startsWith(link);
  };

  const currentLang = LANGUAGES.find(l => l.code === currentLanguage);
  
  const getLanguageDisplay = () => {
    if (currentLanguage === 'all') return 'All';
    return currentLang?.nativeName || 'English';
  };

  // YouTube URL from environment or hardcoded
  const YOUTUBE_URL = process.env.NEXT_PUBLIC_YOUTUBE_URL || "https://www.youtube.com/@Unsung-v2l";

  return (
    <>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* TOP MINI UTILITY BAR - FIXED (DESKTOP ONLY) */}
      <div 
        className={`hidden md:block fixed top-0 left-0 right-0 z-50 border-b transition-colors duration-300 ${
          isDark ? 'bg-[#1e1e1e] border-[#333333] text-[#a0a0a0]' : 'bg-[#f8fafc] border-[#e2e8f0] text-[#475569]'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 h-10 flex items-center justify-between text-xs font-medium">
          <div className={`font-bold ${isDark ? 'text-[#888888]' : 'text-[#64748b]'}`}>{dateString}</div>
          
          <div className="flex items-center gap-6">
            <nav className={`flex items-center gap-4 pr-6 ${isDark ? 'border-r border-[#333333]' : 'border-r border-[#e2e8f0]'}`}>
              <Link href="/info/about" className={`transition ${isDark ? 'hover:text-red-400' : 'hover:text-red-500'}`}>About Us</Link>
              <Link href="/info/advertise" className={`transition ${isDark ? 'hover:text-red-400' : 'hover:text-red-500'}`}>Advertise</Link>
              <Link href="/info/contact" className={`transition ${isDark ? 'hover:text-red-400' : 'hover:text-red-500'}`}>Contact Us</Link>
            </nav>
            
            <div className="flex items-center gap-4">
              {/* LANGUAGE SELECTOR */}
              <div className="relative">
                <button 
                  onClick={() => setIsLangOpen(!isLangOpen)}
                  className={`flex items-center gap-1.5 cursor-pointer font-bold transition px-2 py-1 rounded-md ${
                    isDark ? 'text-[#e8e8e8] bg-[#2d2d2d] hover:bg-[#3d3d3d]' : 'text-[#0f172a] bg-[#f1f5f9] hover:bg-[#e2e8f0]'
                  }`}
                >
                  {currentLanguage === 'all' && <Globe className="w-3.5 h-3.5" />}
                  <span>{getLanguageDisplay()}</span>
                  <ChevronDown className={`w-3 h-3 transition ${isLangOpen ? 'rotate-180' : ''}`} />
                </button>

                {isLangOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsLangOpen(false)} />
                    <div 
                      className={`absolute right-0 mt-2 w-56 border rounded-xl shadow-xl py-2 z-50 max-h-72 overflow-y-auto ${
                        isDark ? 'bg-[#242424] border-[#333333]' : 'bg-white border-[#e2e8f0]'
                      }`}
                    >
                      <div className={`px-3 py-1.5 border-b mb-1 ${isDark ? 'border-[#333333]' : 'border-[#e2e8f0]'}`}>
                        <p className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-[#888888]' : 'text-[#94a3b8]'}`}>Select Language</p>
                      </div>
                      
                      <button
                        onClick={() => { setLanguage('all'); setIsLangOpen(false); }}
                        className={`w-full text-left px-4 py-2.5 text-xs font-medium transition flex items-center justify-between ${
                          currentLanguage === 'all' 
                            ? (isDark ? 'bg-red-600 text-white' : 'text-red-600 bg-red-50') 
                            : (isDark ? 'text-[#c8c8c8] hover:bg-[#2d2d2d]' : 'text-slate-700 hover:bg-slate-50')
                        }`}
                      >
                        <div className="flex items-center gap-2"><Globe className="w-3.5 h-3.5" /><span>All Languages</span></div>
                        {currentLanguage === 'all' && <Check className="w-3.5 h-3.5" />}
                      </button>
                      
                      <div className={`border-t my-1 ${isDark ? 'border-[#333333]' : 'border-[#e2e8f0]'}`} />
                      
                      {LANGUAGES.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => { setLanguage(lang.code); setIsLangOpen(false); }}
                          className={`w-full text-left px-4 py-2.5 text-xs font-medium transition flex items-center justify-between ${
                            currentLanguage === lang.code 
                              ? (isDark ? 'bg-red-600 text-white' : 'text-red-600 bg-red-50') 
                              : (isDark ? 'text-[#c8c8c8] hover:bg-[#2d2d2d]' : 'text-slate-700 hover:bg-slate-50')
                          }`}
                        >
                          <span>{lang.nativeName}</span>
                          <span className="text-[10px] opacity-60">{lang.name}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN HEADER */}
      <div className={`md:pt-10 sticky top-0 md:relative z-40 transition-colors duration-300 ${isDark ? 'bg-[#1e1e1e]' : 'bg-white'}`}>
        <div className={`border-b shadow-xs transition-colors duration-300 ${isDark ? 'bg-[#1e1e1e] border-[#333333]' : 'bg-white border-[#e2e8f0]'}`}>
          <div className="max-w-7xl mx-auto px-4 h-16 sm:h-20 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-4">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className={`p-2 rounded-md transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center ${
                  isDark ? 'text-[#e8e8e8] hover:bg-[#2d2d2d]' : 'text-[#334155] hover:bg-slate-100'
                }`}
                aria-label="Open Navigation Menu"
              >
                <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              
              <Link href="/" className="flex flex-col items-start leading-none select-none group" onClick={clearSearch}>
                <span className={`text-2xl sm:text-3xl font-black tracking-tighter flex items-center transition-colors duration-300 ${isDark ? 'text-[#e8e8e8]' : 'text-[#0f172a]'}`}>
                  UN<span className="text-red-600 underline decoration-4 decoration-red-600 pl-0.5 group-hover:no-underline transition-all">SUNG</span>
                </span>
                <span className={`text-[8px] sm:text-[10px] uppercase font-bold tracking-widest mt-0.5 pl-0.5 transition-colors duration-300 ${isDark ? 'text-[#888888]' : 'text-[#64748b]'}`}>News Network</span>
              </Link>
            </div>

            {/* MOBILE LANGUAGE SELECTOR */}
            <div className="sm:hidden relative">
              <button 
                onClick={() => setIsLangOpen(!isLangOpen)}
                className={`flex items-center gap-1 px-2 py-1.5 rounded-md text-xs font-bold min-h-[44px] ${
                  isDark ? 'text-[#e8e8e8] bg-[#2d2d2d] hover:bg-[#3d3d3d]' : 'text-[#334155] bg-[#f1f5f9] hover:bg-[#e2e8f0]'
                }`}
              >
                {currentLanguage === 'all' && <Globe className="w-3.5 h-3.5" />}
                {getLanguageDisplay()}
              </button>
              
              {isLangOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsLangOpen(false)} />
                  <div className={`absolute right-0 mt-2 w-48 border rounded-xl shadow-xl py-2 z-50 max-h-60 overflow-y-auto ${
                    isDark ? 'bg-[#242424] border-[#333333]' : 'bg-white border-[#e2e8f0]'
                  }`}>
                    <button onClick={() => { setLanguage('all'); setIsLangOpen(false); }} className={`w-full text-left px-3 py-2 text-xs font-medium transition ${
                      currentLanguage === 'all' ? 'text-red-600 bg-red-50' : isDark ? 'text-[#c8c8c8] hover:bg-[#2d2d2d]' : 'text-slate-700 hover:bg-slate-50'
                    }`}>🌐 All Languages</button>
                    <div className={`border-t my-1 ${isDark ? 'border-[#333333]' : 'border-[#e2e8f0]'}`} />
                    {LANGUAGES.map((lang) => (
                      <button key={lang.code} onClick={() => { setLanguage(lang.code); setIsLangOpen(false); }} className={`w-full text-left px-3 py-2 text-xs font-medium transition ${
                        currentLanguage === lang.code ? 'text-red-600 bg-red-50' : isDark ? 'text-[#c8c8c8] hover:bg-[#2d2d2d]' : 'text-slate-700 hover:bg-slate-50'
                      }`}>{lang.nativeName} <span className="text-[10px] opacity-50">({lang.name})</span></button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              {/* DESKTOP SEARCH */}
              <form onSubmit={handleSearch} className="relative w-full max-w-xs hidden sm:block">
                <input 
                  type="search" 
                  placeholder="Search news, topics..." 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className={`w-full pr-9 pl-4 h-10 rounded-full text-sm transition-all focus:outline-none focus:ring-2 focus:ring-red-500/10 ${
                    isDark ? 'bg-[#2d2d2d] border border-[#333333] text-[#e8e8e8] placeholder:text-[#666666]' : 'bg-[#f8fafc] border border-[#e2e8f0] text-[#0f172a] placeholder:text-[#94a3b8]'
                  }`}
                />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer">
                  <Search className={`w-4 h-4 transition ${isDark ? 'text-[#666666] hover:text-red-400' : 'text-[#94a3b8] hover:text-red-500'}`} />
                </button>
              </form>

              {/* MOBILE SEARCH */}
              <div className="sm:hidden flex items-center">
                {isSearchOpen ? (
                  <div className={`flex items-center gap-2 absolute left-0 right-0 top-[60px] px-4 py-3 border-b z-50 shadow-md ${
                    isDark ? 'bg-[#1e1e1e] border-[#333333]' : 'bg-white border-[#e2e8f0]'
                  }`}>
                    <input 
                      type="search" 
                      placeholder="Search..." 
                      value={query} 
                      onChange={(e) => setQuery(e.target.value)} 
                      className={`flex-1 pr-9 pl-4 h-10 rounded-full text-sm transition-all focus:outline-none ${
                        isDark ? 'bg-[#2d2d2d] text-[#e8e8e8] placeholder:text-[#666666]' : 'bg-[#f8fafc] text-[#0f172a] placeholder:text-[#94a3b8]'
                      }`} 
                      autoFocus 
                    />
                    <button onClick={handleMobileSearch} className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2 rounded-full transition">Search</button>
                    <button onClick={() => setIsSearchOpen(false)} className={`transition ${isDark ? 'text-[#888888] hover:text-red-400' : 'text-[#94a3b8] hover:text-red-500'}`}>
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setIsSearchOpen(true)} 
                    className={`p-2 rounded-full min-h-[44px] min-w-[44px] flex items-center justify-center transition ${
                      isDark ? 'text-[#e8e8e8] hover:bg-[#2d2d2d]' : 'text-[#334155] hover:bg-slate-100'
                    }`}
                  >
                    <Search className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* LIVE TV BUTTON */}
              <a 
                href={YOUTUBE_URL} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="bg-red-600 hover:bg-red-700 text-white font-black rounded-lg px-3 sm:px-5 h-9 sm:h-10 flex items-center gap-1 sm:gap-2 shadow-lg shadow-red-600/20 transition-all active:scale-95 cursor-pointer relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform" />
                <Tv className="w-3 h-3 sm:w-4 sm:h-4 fill-white relative z-10" />
                <span className="tracking-widest text-[9px] sm:text-[11px] uppercase relative z-10">Live</span>
                <span className="absolute top-1.5 right-1.5 w-1 h-1 bg-white rounded-full animate-ping" />
              </a>
            </div>
          </div>
        </div>

        {/* CATEGORY NAVIGATION BAR */}
        <div className={`border-b shadow-sm overflow-hidden transition-colors duration-300 ${
          isDark ? 'bg-[#1e1e1e] border-[#333333]' : 'bg-white border-[#e2e8f0]'
        }`}>
          <div className="max-w-7xl mx-auto px-4 overflow-x-auto scrollbar-none">
            <nav className="flex items-center h-10 sm:h-12 text-[11px] sm:text-[13px] font-bold whitespace-nowrap">
              {categories.map((cat, index) => {
                const isActive = isCategoryActive(cat.link);
                return (
                  <Link 
                    key={cat.name}
                    href={cat.link}
                    onClick={() => {
                      clearSearch();
                    }}
                    className={`transition-colors h-full flex items-center px-1 sm:px-1 border-b-2 ${
                      isActive 
                        ? "text-red-600 border-red-600" 
                        : isDark 
                          ? "border-transparent hover:border-red-600/30 text-[#c8c8c8] hover:text-white" 
                          : "border-transparent hover:border-red-600/30 text-slate-700 hover:text-red-600"
                    }`}
                    style={{ marginRight: index < categories.length - 1 ? '1.5rem' : '0' }}
                  >
                    {cat.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>
    </>
  );
}