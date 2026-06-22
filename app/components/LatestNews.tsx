"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp } from "lucide-react";
import { getLatestNews } from "@/app/lib/dataService";
import { useLanguage } from "@/app/context/LanguageContext";
import { useTheme } from "@/app/context/ThemeContext";

interface NewsItem {
  id: string;
  title: string;
  category: string;
  time: string;
  image: string;
  link: string;
  description?: string;
  language?: string;
  featuredInAll?: boolean;
  translations?: Record<string, { title: string; description: string }>;
}

export default function LatestNews() {
  const { t, currentLanguage } = useLanguage();
  const { isDark } = useTheme();
  const [allNews, setAllNews] = useState<NewsItem[]>([]);
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(4);
  const [showAll, setShowAll] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  // Dark mode colors
  const darkBg = '#1a1a1a';
  const darkCardBg = '#242424';
  const darkBorder = '#333333';
  const darkText = '#e8e8e8';
  const darkTextMuted = '#888888';
  const darkHover = '#2d2d2d';

  // Filter news by language - supports "all" for featured content
  const filterNewsByLanguage = (newsList: NewsItem[], lang: string): NewsItem[] => {
    if (!newsList || newsList.length === 0) return [];
    
    // When "All Languages" is selected, show only featured items
    if (lang === 'all') {
      const featured = newsList.filter(item => item.featuredInAll === true);
      return featured.length > 0 ? featured : newsList;
    }
    
    // For specific language, filter by language field
    const filtered = newsList.filter(item => {
      if (!item.language) return true;
      return item.language === lang;
    });
    
    if (filtered.length === 0) return newsList;
    
    return filtered;
  };

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      India: "text-orange-600",
      Tech: "text-sky-600",
      Entertainment: "text-pink-600",
      Business: "text-amber-600",
      World: "text-red-600",
      Politics: "text-red-600",
      Sports: "text-emerald-600",
    };
    return colors[category] || "text-slate-600";
  };

  const loadNews = async () => {
    setLoading(true);
    try {
      const data = await getLatestNews();
      setAllNews(data || []);
      setNewsItems(filterNewsByLanguage(data || [], currentLanguage));
    } catch (error) {
      console.error("Error loading latest news:", error);
      setAllNews([]);
      setNewsItems([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadNews();
  }, []);

  // Re-filter when language changes
  useEffect(() => {
    setNewsItems(filterNewsByLanguage(allNews, currentLanguage));
    setShowAll(false);
  }, [currentLanguage, allNews]);

  useEffect(() => {
    const checkScreen = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);
      const initialCount = desktop ? 5 : 4;
      setVisibleCount(Math.min(initialCount, newsItems.length));
      setShowAll(false);
    };
    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, [newsItems]);

  const handleLoadMore = () => {
    if (showAll) {
      const initialCount = isDesktop ? 5 : 4;
      setVisibleCount(Math.min(initialCount, newsItems.length));
      setShowAll(false);
    } else {
      setVisibleCount(newsItems.length);
      setShowAll(true);
    }
  };

  const visibleItems = newsItems.slice(0, visibleCount);
  const hasMore = newsItems.length > (isDesktop ? 5 : 4);

  if (loading) {
    return (
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-black tracking-tight" style={{ color: isDark ? darkText : '#0f172a' }}>Latest News</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="rounded-xl border overflow-hidden shadow-xs animate-pulse h-full" style={{ backgroundColor: isDark ? darkCardBg : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0' }}>
              <div className="h-24 sm:h-28" style={{ backgroundColor: isDark ? '#2d2d2d' : '#e2e8f0' }}></div>
              <div className="p-2 sm:p-3">
                <div className="h-3 rounded w-12 mb-2" style={{ backgroundColor: isDark ? '#2d2d2d' : '#e2e8f0' }}></div>
                <div className="h-3 rounded w-full mb-1" style={{ backgroundColor: isDark ? '#2d2d2d' : '#e2e8f0' }}></div>
                <div className="h-3 rounded w-3/4" style={{ backgroundColor: isDark ? '#2d2d2d' : '#e2e8f0' }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!newsItems || newsItems.length === 0) {
    return (
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-black tracking-tight" style={{ color: isDark ? darkText : '#0f172a' }}>Latest News</h2>
        </div>
        <div className="rounded-xl border p-8 text-center" style={{ backgroundColor: isDark ? darkCardBg : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0' }}>
          <p className="text-sm" style={{ color: isDark ? darkTextMuted : '#64748b' }}>
            {allNews.length > 0 
              ? 'No latest news available for this language. Switch language to see more.'
              : 'No latest news available. Add some in the admin panel!'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-black tracking-tight" style={{ color: isDark ? darkText : '#0f172a' }}>Latest News</h2>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {visibleItems.map((item) => (
          <Link 
            href={item.link || "#"} 
            key={item.id} 
            className="rounded-xl border overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-md transition group cursor-pointer h-full"
            style={{ 
              backgroundColor: isDark ? darkCardBg : '#ffffff',
              borderColor: isDark ? darkBorder : '#e2e8f0'
            }}
          >
            <div>
              <div className="h-24 sm:h-28 overflow-hidden" style={{ backgroundColor: isDark ? '#2d2d2d' : '#f1f5f9' }}>
                <img 
                  src={item.image || "https://images.unsplash.com/photo-1504370805625-d32c54b16100?auto=format&fit=crop&q=80&w=300"} 
                  alt={t(item, 'title')} 
                  className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1504370805625-d32c54b16100?auto=format&fit=crop&q=80&w=300";
                  }}
                />
              </div>
              
              <div className="p-2 sm:p-3">
                <span className={`text-[8px] sm:text-[9px] uppercase font-extrabold tracking-wider ${getCategoryColor(item.category)}`}>
                  {item.category || "General"}
                </span>
                <h4 className="text-[10px] sm:text-xs font-bold mt-0.5 line-clamp-3 transition leading-snug" style={{ color: isDark ? darkText : '#0f172a' }}>
                  {t(item, 'title')}
                </h4>
              </div>
            </div>

            <div className="p-2 sm:p-3 pt-0">
              <p className="text-[9px] sm:text-[10px] font-medium" style={{ color: isDark ? darkTextMuted : '#94a3b8' }}>{item.time || "Just now"}</p>
            </div>
          </Link>
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center mt-6">
          <button
            onClick={handleLoadMore}
            className="flex items-center gap-2 px-6 py-2.5 border rounded-lg text-xs font-bold transition shadow-xs"
            style={{ 
              backgroundColor: isDark ? darkCardBg : '#ffffff',
              borderColor: isDark ? darkBorder : '#e2e8f0',
              color: isDark ? darkTextMuted : '#334155'
            }}
          >
            {showAll ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Load More ({newsItems.length - (isDesktop ? 5 : 4)} more)
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}