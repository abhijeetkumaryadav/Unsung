"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getTicker } from "@/app/lib/dataService";
import { useTheme } from "@/app/context/ThemeContext";

interface TickerItem {
  id: string;
  text: string;
  active?: boolean;
}

export default function TrendingTicker() {
  const router = useRouter();
  const { isDark } = useTheme();
  const [tickerItems, setTickerItems] = useState<TickerItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTicker = async () => {
    setLoading(true);
    try {
      const data = await getTicker();
      const activeItems = data?.filter(item => item.active !== false) || data || [];
      setTickerItems(activeItems);
    } catch (error) {
      console.error("Error loading ticker:", error);
      setTickerItems([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadTicker();
  }, []);

  // Refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(loadTicker, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleTickerClick = (text: string) => {
    router.push(`/?search=${encodeURIComponent(text)}`);
  };

  // Duplicate items for seamless scrolling
  const tickerDisplay = [...tickerItems, ...tickerItems];

  if (loading || tickerItems.length === 0) {
    return (
      <div className="w-full border-b overflow-hidden transition-colors duration-300" style={{ backgroundColor: isDark ? '#1e1e1e' : '#ffffff', borderColor: isDark ? '#333333' : '#e2e8f0' }}>
        <div className="max-w-7xl mx-auto flex items-center h-10 px-4">
          <div className="relative z-10 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-sm mr-4 shadow-sm flex-shrink-0">
            Trending
            <div className="absolute top-0 -right-2 w-0 h-0 border-t-[14px] border-t-transparent border-l-[10px] border-l-red-600 border-b-[14px] border-b-transparent"></div>
          </div>
          <div className="flex-1 overflow-hidden relative">
            <div className="flex items-center gap-8 whitespace-nowrap text-xs font-semibold" style={{ color: isDark ? '#666666' : '#94a3b8' }}>
              Loading ticker items...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full border-b overflow-hidden transition-colors duration-300" style={{ backgroundColor: isDark ? '#1e1e1e' : '#ffffff', borderColor: isDark ? '#333333' : '#e2e8f0' }}>
      <div className="max-w-7xl mx-auto flex items-center h-10 px-4">
        
        <div className="relative z-10 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-sm mr-4 shadow-sm flex-shrink-0">
          Trending
          <div className="absolute top-0 -right-2 w-0 h-0 border-t-[14px] border-t-transparent border-l-[10px] border-l-red-600 border-b-[14px] border-b-transparent"></div>
        </div>

        <div className="flex-1 overflow-hidden relative">
          <div className="flex items-center gap-8 whitespace-nowrap text-xs font-semibold animate-scroll hover:pause" style={{ color: isDark ? '#c8c8c8' : '#334155' }}>
            {tickerDisplay.map((item, index) => (
              <button
                key={`${item.id}-${index}`}
                onClick={() => handleTickerClick(item.text)}
                className="flex items-center gap-2 transition cursor-pointer flex-shrink-0 hover:text-red-600"
                style={{ color: isDark ? '#c8c8c8' : '#334155' }}
              >
                <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                {item.text}
              </button>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 30s linear infinite;
          width: max-content;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
        @media (max-width: 640px) {
          .animate-scroll {
            animation-duration: 20s;
          }
        }
      `}</style>
    </div>
  );
}