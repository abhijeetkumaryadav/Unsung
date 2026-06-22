// app/category/[slug]/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Home } from "lucide-react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { getTopStories, getLatestNews, getVideos } from "../../lib/dataService";
import { useLanguage } from "../../context/LanguageContext";
import { useTheme } from "../../context/ThemeContext";

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

interface VideoItem {
  id: string;
  title: string;
  img: string;
  link: string;
  category?: string;
  language?: string;
  featuredInAll?: boolean;
  translations?: Record<string, { title: string }>;
}

const CATEGORY_MAP: Record<string, string> = {
  india: "India",
  politics: "Politics",
  business: "Business",
  sports: "Sports",
  entertainment: "Entertainment",
  tech: "Tech",
  lifestyle: "Lifestyle",
  "web-stories": "Web Stories",
  opinion: "Opinion",
  science: "Science",
  trends: "Trends",
  people: "People",
  education: "Education",
  health: "Health",
  food: "Food"
};

const CATEGORY_NAMES: Record<string, string> = {
  latest: "Latest News",
  india: "India",
  politics: "Politics",
  business: "Business",
  sports: "Sports",
  entertainment: "Entertainment",
  tech: "Tech",
  lifestyle: "Lifestyle",
  "web-stories": "Web Stories",
  opinion: "Opinion",
  science: "Science",
  trends: "Trends",
  people: "People",
  education: "Education",
  health: "Health",
  food: "Food"
};

export default function CategoryPage() {
  const { t, currentLanguage } = useLanguage();
  const { isDark } = useTheme();
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  
  const [articles, setArticles] = useState<NewsItem[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter by language - same logic as homepage components
  const filterByLanguage = <T extends { language?: string; featuredInAll?: boolean }>(
    items: T[], 
    lang: string
  ): T[] => {
    if (!items || items.length === 0) return [];
    
    if (lang === 'all') {
      const featured = items.filter(item => item.featuredInAll === true);
      return featured.length > 0 ? featured : items;
    }
    
    const filtered = items.filter(item => {
      if (!item.language) return true;
      return item.language === lang;
    });
    
    if (filtered.length === 0) return items;
    return filtered;
  };

  const darkBg = '#1a1a1a';
  const darkCardBg = '#242424';
  const darkBorder = '#333333';
  const darkText = '#e8e8e8';
  const darkTextSecondary = '#a0a0a0';
  const darkTextMuted = '#888888';
  const darkHover = '#2d2d2d';

  const loadCategoryArticles = async () => {
    setLoading(true);
    try {
      const [top, latest, vid] = await Promise.all([
        getTopStories(),
        getLatestNews(),
        getVideos()
      ]);
      
      // Combine and filter by language
      const allArticles: NewsItem[] = [...top, ...latest];
      const allVideos: VideoItem[] = vid || [];
      
      const langFilteredArticles = filterByLanguage(allArticles, currentLanguage);
      const langFilteredVideos = filterByLanguage(allVideos, currentLanguage);
      
      const categorySlug = slug?.toLowerCase() || "";
      
      if (categorySlug === "latest") {
        setArticles(langFilteredArticles);
        setVideos(langFilteredVideos);
      } else {
        const category = CATEGORY_MAP[categorySlug] || "";
        const matchedArticles = langFilteredArticles.filter(item => 
          item.category?.toLowerCase() === category.toLowerCase()
        );
        const matchedVideos = langFilteredVideos.filter(v => 
          v.category?.toLowerCase() === category.toLowerCase()
        );
        setArticles(matchedArticles);
        setVideos(matchedVideos);
      }
    } catch (error) {
      console.error("Error loading category articles:", error);
      setArticles([]);
      setVideos([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (slug) {
      loadCategoryArticles();
    }
  }, [slug, currentLanguage]);

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      India: "text-orange-600 bg-orange-50",
      Tech: "text-sky-600 bg-sky-50",
      Entertainment: "text-pink-600 bg-pink-50",
      Business: "text-amber-600 bg-amber-50",
      World: "text-red-600 bg-red-50",
      Politics: "text-red-600 bg-red-50",
      Sports: "text-emerald-600 bg-emerald-50",
    };
    return colors[category] || "text-slate-600 bg-slate-50";
  };

  const formatCategoryName = (name: string): string => {
    return CATEGORY_NAMES[name.toLowerCase()] || name;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-between" style={{ backgroundColor: isDark ? darkBg : '#f8fafc' }}>
        <div>
          <Header />
          <main className="max-w-7xl mx-auto px-4 py-8">
            <div className="animate-pulse">
              <div className="h-8 rounded w-48 mb-6" style={{ backgroundColor: isDark ? darkHover : '#e2e8f0' }}></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="rounded-xl border overflow-hidden" style={{ backgroundColor: isDark ? darkCardBg : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0' }}>
                    <div className="h-48" style={{ backgroundColor: isDark ? darkHover : '#e2e8f0' }}></div>
                    <div className="p-4">
                      <div className="h-4 rounded w-20 mb-2" style={{ backgroundColor: isDark ? darkHover : '#e2e8f0' }}></div>
                      <div className="h-5 rounded w-full mb-2" style={{ backgroundColor: isDark ? darkHover : '#e2e8f0' }}></div>
                      <div className="h-4 rounded w-3/4" style={{ backgroundColor: isDark ? darkHover : '#e2e8f0' }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
        <Footer />
      </div>
    );
  }

  const totalItems = articles.length + videos.length;

  return (
    <div className="min-h-screen flex flex-col justify-between transition-colors duration-300" style={{ backgroundColor: isDark ? darkBg : '#f8fafc' }}>
      <div>
        <Header />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 rounded-lg transition"
                style={{ color: isDark ? darkTextSecondary : '#475569' }}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black transition-colors duration-300" style={{ color: isDark ? darkText : '#0f172a' }}>
                  {formatCategoryName(slug)}
                </h1>
                <p className="text-sm mt-1 transition-colors duration-300" style={{ color: isDark ? darkTextMuted : '#64748b' }}>
                  {totalItems} article{totalItems !== 1 ? 's' : ''} found
                </p>
              </div>
            </div>
            <Link
              href="/"
              className="flex items-center gap-2 text-xs font-bold transition"
              style={{ color: isDark ? darkTextMuted : '#64748b' }}
            >
              <Home className="w-4 h-4" />
              Back to Home
            </Link>
          </div>

          {totalItems === 0 ? (
            <div className="rounded-xl border p-12 text-center transition-colors duration-300" style={{ backgroundColor: isDark ? darkCardBg : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0' }}>
              <div className="text-6xl mb-4">📰</div>
              <h3 className="text-lg font-black transition-colors duration-300" style={{ color: isDark ? darkText : '#0f172a' }}>No articles found</h3>
              <p className="text-sm mt-2 transition-colors duration-300" style={{ color: isDark ? darkTextSecondary : '#64748b' }}>
                There are no articles in this category for the selected language.
              </p>
              <Link href="/" className="inline-block mt-4 text-red-600 font-bold text-sm hover:underline">Browse all news</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {articles.map((article) => (
                <Link
                  key={article.id}
                  href={article.link || "#"}
                  className="rounded-xl border overflow-hidden shadow-xs hover:shadow-md transition group cursor-pointer"
                  style={{ backgroundColor: isDark ? darkCardBg : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0' }}
                >
                  <div className="overflow-hidden h-48" style={{ backgroundColor: isDark ? darkHover : '#f1f5f9' }}>
                    <img
                      src={article.image || "https://images.unsplash.com/photo-1504370805625-d32c54b16100?auto=format&fit=crop&q=80&w=400"}
                      alt={t(article, 'title')}
                      className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                      onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1504370805625-d32c54b16100?auto=format&fit=crop&q=80&w=400"; }}
                    />
                  </div>
                  <div className="p-4">
                    <span className={`text-[10px] uppercase font-extrabold tracking-wider px-2 py-1 rounded ${getCategoryColor(article.category)}`}>
                      {article.category || "General"}
                    </span>
                    <h3 className="text-sm font-bold mt-2 transition line-clamp-2" style={{ color: isDark ? darkText : '#0f172a' }}>
                      {t(article, 'title')}
                    </h3>
                    <p className="text-xs mt-2 line-clamp-2 transition-colors duration-300" style={{ color: isDark ? darkTextSecondary : '#64748b' }}>
                      {t(article, 'description')}
                    </p>
                    <p className="text-[10px] mt-3 font-medium transition-colors duration-300" style={{ color: isDark ? darkTextMuted : '#94a3b8' }}>
                      {article.time || "Just now"}
                    </p>
                  </div>
                </Link>
              ))}

              {videos.map((video) => (
                <Link
                  key={video.id}
                  href={video.link || "#"}
                  className="rounded-xl border overflow-hidden shadow-xs hover:shadow-md transition group cursor-pointer"
                  style={{ backgroundColor: isDark ? darkCardBg : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0' }}
                >
                  <div className="overflow-hidden h-48 relative" style={{ backgroundColor: isDark ? darkHover : '#f1f5f9' }}>
                    <img
                      src={video.img || "https://images.unsplash.com/photo-1504370805625-d32c54b16100?auto=format&fit=crop&q=80&w=400"}
                      alt={t(video, 'title')}
                      className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                      onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1504370805625-d32c54b16100?auto=format&fit=crop&q=80&w=400"; }}
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-red-600/90 flex items-center justify-center">
                        <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[14px] border-l-white border-b-[8px] border-b-transparent ml-1"></div>
                      </div>
                    </div>
                    <span className="absolute top-2 right-2 bg-black/80 text-white text-[8px] font-bold px-2 py-0.5 rounded">Video</span>
                  </div>
                  <div className="p-4">
                    <span className={`text-[10px] uppercase font-extrabold tracking-wider px-2 py-1 rounded ${getCategoryColor(video.category || "Video")}`}>
                      {video.category || "Video"}
                    </span>
                    <h3 className="text-sm font-bold mt-2 transition line-clamp-2" style={{ color: isDark ? darkText : '#0f172a' }}>
                      {t(video, 'title')}
                    </h3>
                    <p className="text-[10px] mt-3 font-medium transition-colors duration-300" style={{ color: isDark ? darkTextMuted : '#94a3b8' }}>Watch now</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
}