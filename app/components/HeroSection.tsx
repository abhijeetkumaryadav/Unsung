// app/components/HeroSection.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Play, TrendingDown, TrendingUp, ChevronRight, Tv } from "lucide-react";
import { getTvChannels, getMarket } from "@/app/lib/dataService";
import { useTheme } from "@/app/context/ThemeContext";
import { useLanguage } from "@/app/context/LanguageContext";

interface TVChannel {
  id: string;
  name: string;
  logo: string;
  embedUrl?: string;
  urls?: string[];
  type: "youtube" | "hls" | "iframe";
  language?: string;
  featuredInAll?: boolean;
}

export default function HeroSection() {
  const { isDark } = useTheme();
  const { currentLanguage } = useLanguage();
  const [tvChannels, setTvChannels] = useState<TVChannel[]>([]);
  const [activeChannel, setActiveChannel] = useState<TVChannel | null>(null);
  const [market, setMarket] = useState<any>({ 
    usdInr: "", usdInrChange: "", goldRate: "", goldChange: "",
    sensex: "", sensexChange: "", nifty: "", niftyChange: ""
  });
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(3);
  const [isDesktop, setIsDesktop] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [channels, marketData] = await Promise.all([
        getTvChannels(),
        getMarket()
      ]);
      
      const channelList = (channels || []) as TVChannel[];
      setTvChannels(channelList);
      setMarket(marketData || { 
        usdInr: "83.36", usdInrChange: "-0.12 (0.14%)", 
        goldRate: "72,650", goldChange: "+1,250 (1.75%)",
        sensex: "72,854.21", sensexChange: "-520.36 (-0.71%)",
        nifty: "22,155.35", niftyChange: "-157.80 (-0.71%)"
      });
      
      setVisibleCount(3);
      
      const langChannels = filterChannelsByLanguage(channelList, currentLanguage);
      if (langChannels.length > 0 && !activeChannel) {
        setActiveChannel(langChannels[0]);
      } else if (channelList.length > 0 && !activeChannel) {
        setActiveChannel(channelList[0]);
      }
    } catch (error) {
      console.error("Error loading hero data:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const langChannels = filterChannelsByLanguage(tvChannels, currentLanguage);
    if (langChannels.length > 0) {
      if (!activeChannel || !langChannels.find(c => c.id === activeChannel.id)) {
        setActiveChannel(langChannels[0]);
      }
    }
    setVisibleCount(3);
  }, [currentLanguage]);

  const filterChannelsByLanguage = (channels: TVChannel[], lang: string): TVChannel[] => {
    if (!channels || channels.length === 0) return [];
    
    if (lang === 'all') {
      const featured = channels.filter(ch => ch.featuredInAll === true);
      return featured.length > 0 ? featured : channels;
    }
    
    const filtered = channels.filter(channel => {
      if (!channel.language) return true;
      return channel.language === lang;
    });
    
    if (filtered.length === 0) return channels;
    
    return filtered;
  };

  const filteredChannels = filterChannelsByLanguage(tvChannels, currentLanguage);

  useEffect(() => {
    const checkScreen = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  const handleLoadMore = () => {
    const nextCount = visibleCount + 3;
    setVisibleCount(Math.min(nextCount, filteredChannels.length));
  };

  const handleShowLess = () => {
    setVisibleCount(3);
  };

  const visibleChannels = filteredChannels.slice(0, visibleCount);
  const hasMore = visibleCount < filteredChannels.length;
  const showLess = visibleCount > 3 && visibleCount >= filteredChannels.length;

  const getEmbedUrl = (channel: TVChannel) => {
    let url = '';
    if (channel.urls && channel.urls.length > 0) {
      url = channel.urls[0];
    } else if (channel.embedUrl) {
      url = channel.embedUrl;
    }
    
    if (!url) return '';
    
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      url = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
    }
    if (url.includes('youtube.com/shorts/')) {
      const videoId = url.split('/shorts/')[1]?.split('?')[0];
      url = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      url = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
    }
    if (url.includes('youtube.com/embed/')) {
      if (!url.includes('autoplay')) {
        url = url.includes('?') ? `${url}&autoplay=1` : `${url}?autoplay=1`;
      }
    }
    return url;
  };

  const darkBg = '#1a1a1a';
  const darkCardBg = '#242424';
  const darkBorder = '#333333';
  const darkText = '#e8e8e8';
  const darkTextMuted = '#888888';

  if (loading) {
    return (
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
        <div className="lg:col-span-8 animate-pulse">
          <div className="w-full h-[500px] rounded-xl" style={{ backgroundColor: isDark ? '#2d2d2d' : '#e2e8f0' }}></div>
        </div>
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="p-5 rounded-xl border shadow-xs animate-pulse h-64" style={{ backgroundColor: isDark ? darkCardBg : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0' }}></div>
          <div className="p-5 rounded-xl border shadow-xs animate-pulse h-48" style={{ backgroundColor: isDark ? darkCardBg : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0' }}></div>
        </div>
      </section>
    );
  }

  if (!filteredChannels || filteredChannels.length === 0) {
    return (
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
        <div className="lg:col-span-8 relative group overflow-hidden rounded-xl shadow-lg bg-slate-900">
          <div className="w-full h-[500px] flex items-center justify-center" style={{ backgroundColor: isDark ? '#1a1a1a' : '#1e293b' }}>
            <div className="text-center text-white">
              <Tv className="w-16 h-16 mx-auto mb-4" style={{ color: isDark ? '#444444' : '#64748b' }} />
              <p className="text-lg font-bold">No TV Channels Available</p>
              <p className="text-sm" style={{ color: isDark ? '#888888' : '#94a3b8' }}>
                {tvChannels.length > 0 
                  ? 'Switch language or add channels in the admin panel.' 
                  : 'Add channels in the admin panel'}
              </p>
            </div>
          </div>
        </div>
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="p-5 rounded-xl border shadow-xs" style={{ backgroundColor: isDark ? darkCardBg : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0' }}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold" style={{ color: isDark ? darkText : '#0f172a' }}>Live TV Channels</h3>
            </div>
            <div className="text-center py-8 text-sm" style={{ color: isDark ? darkTextMuted : '#64748b' }}>No channels available</div>
          </div>
          <div className="p-5 rounded-xl border shadow-xs" style={{ backgroundColor: isDark ? darkCardBg : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0' }}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold" style={{ color: isDark ? darkText : '#0f172a' }}>Market Snapshot</h3>
            </div>
            <MarketSnapshot market={market} isDark={isDark} darkText={darkText} darkTextMuted={darkTextMuted} darkBorder={darkBorder} />
          </div>
        </div>
      </section>
    );
  }

  const currentChannel = activeChannel || filteredChannels[0];

  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
      
      <div className="lg:col-span-8 relative overflow-hidden rounded-xl shadow-lg bg-slate-900">
        <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
          <iframe
            src={getEmbedUrl(currentChannel)}
            className="absolute top-0 left-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={currentChannel.name}
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
          ></iframe>
        </div>
        <div className="absolute top-4 left-4 flex gap-2 z-10">
          <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 uppercase">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span> Live
          </span>
          <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded uppercase">
            {currentChannel.name}
          </span>
        </div>
      </div>

      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="p-5 rounded-xl border shadow-xs" style={{ backgroundColor: isDark ? darkCardBg : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0' }}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold" style={{ color: isDark ? darkText : '#0f172a' }}>Live TV Channels</h3>
            <span className="text-[10px]" style={{ color: isDark ? darkTextMuted : '#94a3b8' }}>{visibleCount} of {filteredChannels.length}</span>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {visibleChannels.map((channel) => (
              <button key={channel.id} onClick={() => setActiveChannel(channel)} className="flex flex-col items-center gap-1 transition cursor-pointer group">
                <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center overflow-hidden transition ${
                  activeChannel?.id === channel.id ? "border-red-500 bg-red-50 text-red-600" : isDark ? "border-[#333333] bg-[#2d2d2d] text-[#888888] hover:border-red-500 hover:bg-red-900/30" : "border-slate-200 bg-slate-100 text-slate-400 hover:border-red-500 hover:bg-red-50"
                }`}>
                  {channel.logo && channel.logo.startsWith('http') ? (
                    <img src={channel.logo} alt={channel.name} className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <span className={`text-[10px] font-bold ${activeChannel?.id === channel.id ? "text-red-600" : isDark ? "text-[#888888] group-hover:text-red-600" : "text-slate-500 group-hover:text-red-600"}`}>
                      {channel.logo || channel.name.substring(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>
                <span className={`text-[8px] font-bold text-center uppercase truncate w-full ${activeChannel?.id === channel.id ? "text-red-600" : isDark ? "text-[#a0a0a0] group-hover:text-red-600" : "text-slate-600 group-hover:text-red-600"}`}>
                  {channel.name}
                </span>
              </button>
            ))}
            {hasMore && (
              <button onClick={handleLoadMore} className="flex flex-col items-center gap-1 transition cursor-pointer group">
                <div className={`w-12 h-12 rounded-full border-2 border-dashed flex items-center justify-center transition ${isDark ? 'border-red-400 hover:border-red-500 bg-red-900/20 hover:bg-red-900/30' : 'border-red-400 hover:border-red-600 bg-red-50/50 hover:bg-red-50'}`}>
                  <span className="text-xl font-bold text-red-400 group-hover:text-red-600">+</span>
                </div>
                <span className="text-[8px] font-bold text-center text-red-400 group-hover:text-red-600">More</span>
              </button>
            )}
            {showLess && (
              <button onClick={handleShowLess} className="flex flex-col items-center gap-1 transition cursor-pointer group">
                <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition ${isDark ? 'border-red-400 hover:border-red-500 bg-red-900/20 hover:bg-red-900/30' : 'border-red-400 hover:border-red-600 bg-red-50 hover:bg-red-100'}`}>
                  <span className="text-xl font-bold text-red-400 group-hover:text-red-600">−</span>
                </div>
                <span className="text-[8px] font-bold text-center text-red-400 group-hover:text-red-600">Less</span>
              </button>
            )}
          </div>
        </div>

        <div className="p-5 rounded-xl border shadow-xs overflow-hidden" style={{ backgroundColor: isDark ? darkCardBg : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0' }}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold" style={{ color: isDark ? darkText : '#0f172a' }}>Market Snapshot</h3>
          </div>
          <MarketSnapshot market={market} isDark={isDark} darkText={darkText} darkTextMuted={darkTextMuted} darkBorder={darkBorder} />
        </div>
      </div>
    </section>
  );
}

function MarketSnapshot({ market, isDark, darkText, darkTextMuted, darkBorder }: { 
  market: any; isDark: boolean; darkText: string; darkTextMuted: string; darkBorder: string 
}) {
  return (
    <div className="flex gap-4 overflow-x-auto scrollbar-none pb-2">
      {[
        { label: 'SENSEX', value: market.sensex || "77,409.98", change: market.sensexChange || "+254.36 (+0.33%)" },
        { label: 'NIFTY 50', value: market.nifty || "24,168.00", change: market.niftyChange || "+82.30 (+0.34%)" },
        { label: 'USD/INR', value: '₹' + (market.usdInr || "83.50"), change: market.usdInrChange || "+0.14 (+0.17%)" },
        { label: 'GOLD', value: '₹' + (market.goldRate || "1,49,360"), change: market.goldChange || "+850 (+0.57%)" },
      ].map((item, idx) => (
        <React.Fragment key={item.label}>
          {idx > 0 && <div className="w-px flex-shrink-0" style={{ backgroundColor: isDark ? darkBorder : '#e2e8f0' }}></div>}
          <div className="flex-shrink-0 min-w-[140px]">
            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: isDark ? darkTextMuted : '#64748b' }}>{item.label}</p>
            <p className="text-lg font-black" style={{ color: isDark ? darkText : '#0f172a' }}>{item.value}</p>
            <p className={`text-xs font-bold flex items-center ${item.change.startsWith('-') ? 'text-red-500' : 'text-emerald-500'}`}>
              {item.change.startsWith('-') ? <TrendingDown className="w-3 h-3 mr-1" /> : <TrendingUp className="w-3 h-3 mr-1" />}
              {item.change}
            </p>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}