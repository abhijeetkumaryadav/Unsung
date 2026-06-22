"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Header from "./components/Header";
import TrendingTicker from "./components/TrendingTicker";
import HeroSection from "./components/HeroSection";
import TopStories from "./components/TopStories";
import LatestNews from "./components/LatestNews";
import ElectionCenter from "./components/ElectionCenter";
import BottomPanels from "./components/BottomPanels";
import Footer from "./components/Footer";
import { 
  getElectionVisibility, 
  getNoElectionMessage,
  searchAllContent,
  getCricket,
  getMarket,
  getWeather,
  getVideos,
  getSports,
  getWeatherCities
} from "./lib/dataService";
import { useLanguage } from "./context/LanguageContext";
import { useTheme } from "./context/ThemeContext";

export default function Home() {
  const { currentLanguage } = useLanguage();
  const { isDark } = useTheme();
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get("search") || "";
  
  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showElection, setShowElection] = useState(true);
  const [noElectionMsg, setNoElectionMsg] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [prefetchedData, setPrefetchedData] = useState<any>(null);

  // Dark mode colors
  const darkBg = '#1a1a1a';
  const darkCardBg = '#242424';
  const darkBorder = '#333333';
  const darkText = '#e8e8e8';
  const darkTextSecondary = '#a0a0a0';
  const darkTextMuted = '#888888';

  const loadData = async () => {
    try {
      const [vis, msg, crick, mark, weath, vid, sportData, cityData] = await Promise.all([
        getElectionVisibility(),
        getNoElectionMessage(),
        getCricket(),
        getMarket(),
        getWeather(),
        getVideos(),
        getSports(),
        getWeatherCities()
      ]);
      
      setShowElection(vis);
      setNoElectionMsg(msg);
      
      setPrefetchedData({
        cricket: crick,
        market: mark,
        weather: weath,
        videos: vid,
        sports: sportData,
        weatherCities: cityData
      });
      
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading data:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    
    if (urlSearch) {
      handleSearch(urlSearch);
    }
  }, [urlSearch, currentLanguage]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setIsSearching(true);
    const results = await searchAllContent(query);
    setSearchResults(results);
    setIsSearching(false);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setIsSearching(false);
    window.history.pushState({}, "", "/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: isDark ? darkBg : '#f8fafc', color: isDark ? darkText : '#0f172a' }}>
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="w-8 h-8 border-4 border-t-red-600 rounded-full animate-spin mx-auto" style={{ borderColor: isDark ? '#333333' : '#e2e8f0' }}></div>
          <p className="text-sm mt-4" style={{ color: isDark ? darkTextMuted : '#64748b' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: isDark ? darkBg : '#f8fafc', color: isDark ? darkText : '#0f172a' }}>
      <Header searchQuery={searchQuery} onSearch={handleSearch} />
      <TrendingTicker />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        
        {searchQuery && (
          <div className="rounded-xl border p-6 shadow-xs transition-colors duration-300" style={{ 
            backgroundColor: isDark ? darkCardBg : '#ffffff',
            borderColor: isDark ? darkBorder : '#e2e8f0'
          }}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-black" style={{ color: isDark ? darkText : '#0f172a' }}>
                Results for "{searchQuery}"
              </h2>
              <button 
                onClick={clearSearch}
                className="text-red-600 text-xs font-bold hover:underline cursor-pointer"
              >
                Clear Search
              </button>
            </div>
            
            {isSearching ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-4 border-t-red-600 rounded-full animate-spin mx-auto" style={{ borderColor: isDark ? '#333333' : '#e2e8f0' }}></div>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-3">
                {searchResults.map((item, index) => (
                  <a
                    key={item.id || index}
                    href={item.link || "#"}
                    className="block p-3 border rounded-lg transition-colors duration-200 group hover:border-red-500 dark:hover:border-red-600"
                    style={{ 
                      borderColor: isDark ? darkBorder : '#e2e8f0',
                      backgroundColor: isDark ? 'transparent' : 'transparent',
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-20 h-16 object-cover rounded-lg flex-shrink-0"
                      />
                      <div>
                        <span className="text-[10px] uppercase font-extrabold tracking-wider text-red-600">
                          {item.category || "General"}
                        </span>
                        <h4 className="text-sm font-bold transition" style={{ color: isDark ? darkText : '#0f172a' }}>
                          {item.title}
                        </h4>
                        {item.description && (
                          <p className="text-xs mt-0.5 line-clamp-2" style={{ color: isDark ? darkTextSecondary : '#64748b' }}>{item.description}</p>
                        )}
                        <p className="text-[10px] font-medium mt-1" style={{ color: isDark ? darkTextMuted : '#94a3b8' }}>{item.time || "Just now"}</p>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm" style={{ color: isDark ? darkTextSecondary : '#64748b' }}>No results found for "{searchQuery}"</p>
                <p className="text-xs mt-1" style={{ color: isDark ? darkTextMuted : '#94a3b8' }}>Try different keywords or browse our categories</p>
              </div>
            )}
          </div>
        )}

        {!searchQuery && (
          <>
            <HeroSection />
            <TopStories key={`top-${currentLanguage}`} />
            <LatestNews key={`latest-${currentLanguage}`} />
            
            {showElection ? (
              <ElectionCenter />
            ) : (
              <div className="rounded-xl border p-8 text-center mt-8" style={{ 
                backgroundColor: isDark ? '#2d2d2d' : '#f1f5f9',
                borderColor: isDark ? darkBorder : '#e2e8f0'
              }}>
                <p className="text-sm font-medium" style={{ color: isDark ? darkTextSecondary : '#64748b' }}>{noElectionMsg || "No active elections at this time."}</p>
              </div>
            )}
            
            <BottomPanels initialData={prefetchedData} key={`bottom-${currentLanguage}`} />
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}