"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getTopStories } from "@/app/lib/dataService";
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

export default function TopStories() {
  const { t, currentLanguage } = useLanguage();
  const { isDark } = useTheme();
  const [allStories, setAllStories] = useState<NewsItem[]>([]);
  const [stories, setStories] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter stories by language - supports "all" for featured content
  const filterStoriesByLanguage = (storyList: NewsItem[], lang: string): NewsItem[] => {
    if (!storyList || storyList.length === 0) return [];
    
    // When "All Languages" is selected, show only featured stories
    if (lang === 'all') {
      const featured = storyList.filter(story => story.featuredInAll === true);
      return featured.length > 0 ? featured : storyList;
    }
    
    // For specific language, filter by language field
    const filtered = storyList.filter(story => {
      if (!story.language) return true;
      return story.language === lang;
    });
    
    if (filtered.length === 0) return storyList;
    
    return filtered;
  };

  const loadStories = async () => {
    setLoading(true);
    try {
      const data = await getTopStories();
      setAllStories(data || []);
      setStories(filterStoriesByLanguage(data || [], currentLanguage));
    } catch (error) {
      console.error("Error loading top stories:", error);
      setAllStories([]);
      setStories([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadStories();
  }, []);

  // Re-filter when language changes
  useEffect(() => {
    setStories(filterStoriesByLanguage(allStories, currentLanguage));
    setCurrentIndex(0);
  }, [currentLanguage, allStories]);

  useEffect(() => {
    if (stories.length === 0 || showAll) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % stories.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [stories.length, showAll]);

  const nextSlide = () => {
    if (stories.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % stories.length);
  };

  const prevSlide = () => {
    if (stories.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + stories.length) % stories.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setTranslateX(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX;
    setTranslateX(diff);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (translateX < -50) {
      nextSlide();
    } else if (translateX > 50) {
      prevSlide();
    }
    setTranslateX(0);
  };

  const darkBg = '#1a1a1a';
  const darkCardBg = '#242424';
  const darkBorder = '#333333';
  const darkText = '#e8e8e8';
  const darkTextMuted = '#888888';
  const darkHover = '#2d2d2d';

  if (loading) {
    return (
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-black tracking-tight" style={{ color: isDark ? darkText : '#0f172a' }}>Top Stories</h2>
          <button className="text-red-600 text-xs font-bold hover:underline cursor-pointer">View All</button>
        </div>
        <div className="relative overflow-hidden rounded-xl animate-pulse h-80" style={{ backgroundColor: isDark ? darkHover : '#e2e8f0' }}></div>
      </div>
    );
  }

  if (!stories || stories.length === 0) {
    return (
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-black tracking-tight" style={{ color: isDark ? darkText : '#0f172a' }}>Top Stories</h2>
          <button className="text-red-600 text-xs font-bold hover:underline cursor-pointer">View All</button>
        </div>
        <div className="rounded-xl border p-8 text-center" style={{ backgroundColor: isDark ? darkCardBg : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0' }}>
          <p className="text-sm" style={{ color: isDark ? darkTextMuted : '#64748b' }}>
            {allStories.length > 0 
              ? 'No top stories available for this language. Switch language to see more.'
              : 'No top stories available. Add some in the admin panel!'}
          </p>
        </div>
      </div>
    );
  }

  if (showAll) {
    return (
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-black tracking-tight" style={{ color: isDark ? darkText : '#0f172a' }}>All Top Stories</h2>
          <button 
            onClick={() => setShowAll(false)}
            className="text-red-600 text-xs font-bold hover:underline cursor-pointer"
          >
            Show Carousel
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {stories.map((story) => (
            <Link 
              key={story.id}
              href={story.link || "#"}
              className="rounded-xl border overflow-hidden shadow-xs hover:shadow-md transition group cursor-pointer"
              style={{ backgroundColor: isDark ? darkCardBg : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0' }}
            >
              <div className="overflow-hidden h-48" style={{ backgroundColor: isDark ? darkHover : '#f1f5f9' }}>
                <img 
                  src={story.image || "https://images.unsplash.com/photo-1504370805625-d32c54b16100?auto=format&fit=crop&q=80&w=400"} 
                  alt={t(story, 'title')}
                  className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1504370805625-d32c54b16100?auto=format&fit=crop&q=80&w=400";
                  }}
                />
              </div>
              <div className="p-4">
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-red-600">
                  {story.category || "General"}
                </span>
                <h4 className="text-sm font-bold mt-1 group-hover:text-red-600 transition" style={{ color: isDark ? darkText : '#0f172a' }}>
                  {t(story, 'title')}
                </h4>
                <p className="text-[11px] mt-2 font-medium" style={{ color: isDark ? darkTextMuted : '#94a3b8' }}>{story.time || "Just now"}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  const currentStory = stories[currentIndex];

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-black tracking-tight" style={{ color: isDark ? darkText : '#0f172a' }}>Top Stories</h2>
        <button 
          onClick={() => setShowAll(true)}
          className="text-red-600 text-xs font-bold hover:underline cursor-pointer"
        >
          View All
        </button>
      </div>

      <div 
        className="relative overflow-hidden rounded-xl shadow-lg bg-slate-900"
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translateX(${translateX}px)`,
          transition: isDragging ? 'none' : 'transform 0.3s ease'
        }}
      >
        <Link href={currentStory.link || "#"} className="block cursor-pointer group">
          <div className="relative h-[400px] sm:h-[450px]">
            <img 
              src={currentStory.image || "https://images.unsplash.com/photo-1504370805625-d32c54b16100?auto=format&fit=crop&q=80&w=800"} 
              alt={t(currentStory, 'title')}
              className="w-full h-full object-cover transition duration-700 group-hover:scale-105"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1504370805625-d32c54b16100?auto=format&fit=crop&q=80&w=800";
              }}
            />
            
            <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/30 to-transparent"></div>
            
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <span className="text-[10px] uppercase font-extrabold tracking-wider text-red-400 bg-black/50 px-3 py-1 rounded inline-block mb-2">
                {currentStory.category || "General"}
              </span>
              <h3 className="text-2xl sm:text-3xl font-black leading-tight group-hover:text-red-400 transition">
                {t(currentStory, 'title')}
              </h3>
              <p className="text-sm text-slate-300 mt-2 line-clamp-2">
                {t(currentStory, 'description')}
              </p>
              <p className="text-xs text-slate-400 mt-3 font-medium">{currentStory.time || "Just now"}</p>
            </div>
          </div>
        </Link>

        <button 
          onClick={prevSlide}
          className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition z-10"
          aria-label="Previous story"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button 
          onClick={nextSlide}
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition z-10"
          aria-label="Next story"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {stories.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition ${
                index === currentIndex ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Go to story ${index + 1}`}
            />
          ))}
        </div>

        <div className="absolute top-4 right-4 bg-black/50 text-white text-xs font-bold px-3 py-1 rounded-full z-10">
          {currentIndex + 1} / {stories.length}
        </div>
      </div>

      {/* Thumbnail Navigation */}
      <div className="flex gap-2 mt-3 overflow-x-auto pb-2 scrollbar-none">
        {stories.map((story, index) => (
          <button
            key={story.id}
            onClick={() => goToSlide(index)}
            className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition ${
              index === currentIndex ? 'border-red-500' : isDark ? 'border-[#333333] hover:border-red-300' : 'border-transparent hover:border-red-300'
            }`}
          >
            <img 
              src={story.image || "https://images.unsplash.com/photo-1504370805625-d32c54b16100?auto=format&fit=crop&q=80&w=100"} 
              alt={t(story, 'title')}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1504370805625-d32c54b16100?auto=format&fit=crop&q=80&w=100";
              }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}