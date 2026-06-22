"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  X, Home, Clock, Globe, Landmark, 
  Briefcase, Trophy, Film, Cpu, Heart, 
  Layout, MessageSquare, Microscope, Flame, 
  Users, GraduationCap, Activity, Utensils,
  Languages, Moon, Sun, Monitor,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { categories } from "@/app/lib/data";
import { useLanguage, LANGUAGES } from "@/app/context/LanguageContext";
import { useTheme } from "@/app/context/ThemeContext";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { currentLanguage, setLanguage } = useLanguage();
  const { theme, setTheme, isDark } = useTheme();

  const getIcon = (name: string) => {
    const icons: Record<string, any> = {
      Home: Home, Latest: Clock, India: Globe, Politics: Landmark,
      Business: Briefcase, Sports: Trophy, Entertainment: Film,
      Tech: Cpu, Lifestyle: Heart
    };
    return icons[name] || Home;
  };

  const isCategoryActive = (link: string) => {
    if (link === "/") return pathname === "/";
    return pathname === link || pathname?.startsWith(link);
  };

  const categoryItems = categories
    .filter(cat => cat.name !== "Home")
    .map(cat => ({
      label: cat.name,
      icon: getIcon(cat.name),
      path: cat.link
    }));

  const themeOptions = [
    { id: 'light', label: 'Light', icon: Sun },
    { id: 'dark', label: 'Dark', icon: Moon },
    { id: 'system', label: 'System', icon: Monitor },
  ];

  const isThemeActive = (themeId: string) => {
    if (themeId === 'system') return theme === 'system';
    return theme === themeId;
  };

  const darkBg = '#1e1e1e';
  const darkBorder = '#333333';
  const darkText = '#e8e8e8';
  const darkTextMuted = '#888888';

  const sidebarBg = isDark ? darkBg : '#ffffff';
  const textPrimary = isDark ? darkText : '#0f172a';
  const textMuted = isDark ? darkTextMuted : '#94a3b8';
  const borderColor = isDark ? darkBorder : '#e2e8f0';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-[60]"
          />

          <motion.div 
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 h-full w-[300px] z-[70] shadow-2xl flex flex-col overflow-hidden transition-colors duration-300"
            style={{ backgroundColor: sidebarBg }}
          >
            {/* Header */}
            <div className="p-6 flex items-center justify-between border-b" style={{ borderColor: borderColor }}>
              <div className="flex flex-col leading-none">
                <span className="text-2xl font-black tracking-tighter" style={{ color: textPrimary }}>
                  UN<span className="text-red-600 underline decoration-4 decoration-red-600 pl-0.5">SUNG</span>
                </span>
                <span className="text-[9px] uppercase font-bold tracking-widest mt-0.5 pl-0.5" style={{ color: textMuted }}>News Network</span>
              </div>
              <button onClick={onClose} className="p-2 rounded-full transition cursor-pointer" style={{ color: textPrimary }}>
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto scrollbar-none pb-4" style={{ backgroundColor: sidebarBg }}>
              
              {/* LANGUAGE SECTION */}
              <div className="px-6 py-4 border-b" style={{ borderColor: borderColor }}>
                <div className="flex items-center gap-3 mb-3">
                  <Languages className="w-4 h-4" style={{ color: textMuted }} />
                  <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: textMuted }}>Language</span>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => { setLanguage('all'); onClose(); }}
                    className={`text-xs font-bold px-3 py-1.5 rounded-md transition flex items-center gap-1.5 ${
                      currentLanguage === 'all' ? "bg-red-600 text-white" : isDark ? "bg-[#2d2d2d] text-[#c8c8c8] hover:bg-[#3d3d3d]" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <Globe className="w-3 h-3" /> All
                  </button>
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => { setLanguage(lang.code); onClose(); }}
                      className={`text-xs font-bold px-3 py-1.5 rounded-md transition ${
                        currentLanguage === lang.code ? "bg-red-600 text-white" : isDark ? "bg-[#2d2d2d] text-[#c8c8c8] hover:bg-[#3d3d3d]" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {lang.nativeName}
                    </button>
                  ))}
                </div>
              </div>

              {/* THEME TOGGLE */}
              <div className="px-6 py-4 border-b" style={{ borderColor: borderColor }}>
                <div className="flex items-center gap-3 mb-3">
                  <Moon className="w-4 h-4" style={{ color: textMuted }} />
                  <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: textMuted }}>Theme</span>
                </div>
                <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: borderColor }}>
                  {themeOptions.map((opt, index) => {
                    const Icon = opt.icon;
                    const isActive = isThemeActive(opt.id);
                    return (
                      <button
                        key={opt.id}
                        onClick={() => setTheme(opt.id as 'light' | 'dark' | 'system')}
                        className={`flex-1 flex items-center justify-center gap-1.5 text-[11px] font-bold px-3 py-2 transition-colors duration-200 ${
                          index < themeOptions.length - 1 ? 'border-r' : ''
                        } ${isActive ? 'bg-red-600 text-white' : isDark ? 'bg-[#2d2d2d] text-[#c8c8c8] hover:bg-[#3d3d3d]' : 'bg-white text-slate-700 hover:bg-slate-50'}`}
                        style={{ borderColor: borderColor }}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {opt.label}
                        {isActive && <Check className="w-3 h-3 ml-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* HOME BUTTON */}
              <div className="p-4">
                <Link 
                  href="/" 
                  className={`flex items-center gap-4 p-4 rounded-xl transition ${
                    pathname === "/" ? "bg-red-600 text-white shadow-lg shadow-red-600/20" : isDark ? "bg-[#2d2d2d] text-[#c8c8c8] hover:bg-[#3d3d3d] hover:text-white" : "bg-slate-100 text-slate-700 hover:bg-red-50 hover:text-red-600"
                  }`}
                  onClick={onClose}
                >
                  <Home className="w-6 h-6" />
                  <span className="font-black uppercase tracking-wider text-sm">Home</span>
                </Link>
              </div>

              {/* CATEGORIES */}
              <div className="py-4 border-b" style={{ borderColor: borderColor }}>
                <div className="space-y-0.5">
                  {categoryItems.map((item, idx) => {
                    const isActive = item.path ? isCategoryActive(item.path) : false;
                    return (
                      <Link 
                        key={idx} 
                        href={item.path || "#"} 
                        onClick={onClose}
                        className={`flex items-center gap-4 px-6 py-2.5 transition-colors rounded-lg mx-2 ${
                          isActive ? "bg-red-600 text-white" : isDark ? "hover:bg-[#2d2d2d] text-[#c8c8c8] hover:text-white" : "hover:bg-slate-100 text-slate-700 hover:text-slate-900"
                        }`}
                      >
                        <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : isDark ? 'text-[#888888]' : 'text-slate-500'}`} />
                        <span className={`text-sm font-bold ${isActive ? 'text-white' : isDark ? 'text-[#c8c8c8]' : 'text-slate-700'}`}>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* MORE CATEGORIES */}
              <div className="py-4">
                <h3 className="px-6 text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: textMuted }}>More Categories</h3>
                <div className="space-y-0.5">
                  {[
                    { label: "Web Stories", icon: Layout, path: "/category/web-stories" },
                    { label: "Opinion", icon: MessageSquare, path: "/category/opinion" },
                    { label: "Science", icon: Microscope, path: "/category/science" },
                    { label: "Trends", icon: Flame, path: "/category/trends" },
                    { label: "People", icon: Users, path: "/category/people" },
                    { label: "Education", icon: GraduationCap, path: "/category/education" },
                    { label: "Health", icon: Activity, path: "/category/health" },
                    { label: "Food", icon: Utensils, path: "/category/food" }
                  ].map((item, idx) => {
                    const isActive = item.path ? isCategoryActive(item.path) : false;
                    const Icon = item.icon;
                    return (
                      <Link 
                        key={idx} 
                        href={item.path || "#"} 
                        onClick={onClose}
                        className={`flex items-center gap-4 px-6 py-2.5 transition-colors rounded-lg mx-2 ${
                          isActive ? "bg-red-600 text-white" : isDark ? "hover:bg-[#2d2d2d] text-[#c8c8c8] hover:text-white" : "hover:bg-slate-100 text-slate-700 hover:text-slate-900"
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${isActive ? 'text-white' : isDark ? 'text-[#888888]' : 'text-slate-500'}`} />
                        <span className={`text-sm font-bold ${isActive ? 'text-white' : isDark ? 'text-[#c8c8c8]' : 'text-slate-700'}`}>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}