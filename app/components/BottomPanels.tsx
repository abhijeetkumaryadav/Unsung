"use client";

import React, { useState, useEffect, useRef } from "react";
import { Coins, CloudSun, DollarSign, Play, ChevronLeft, ChevronRight, Plus, Trophy, X } from "lucide-react";
import { getMarket, getWeather, getVideos, getSports, getWeatherCities } from "@/app/lib/dataService";
import { marketData as defaultMarket, weatherData as defaultWeather } from "@/app/lib/data";
import { useLanguage } from "@/app/context/LanguageContext";
import { useTheme } from "@/app/context/ThemeContext";

interface VideoData {
  id: string;
  title: string;
  img: string;
  link: string;
  category?: string;
  language?: string;
  featuredInAll?: boolean;
  translations?: Record<string, { title: string; category?: string }>;
}

interface SportItem {
  sport: string;
  match: string;
  score: string;
  detail: string;
  show?: boolean;
  translations?: Record<string, { sport: string; match: string; detail: string }>;
}

interface WeatherCity {
  city: string;
  temp: string;
  condition: string;
  translations?: Record<string, { city: string; condition: string }>;
}

interface BottomPanelsProps {
  initialData?: {
    cricket: any;
    market: any;
    weather: any;
    videos: any[];
    sports: any[];
    weatherCities: any[];
  };
}

export default function BottomPanels({ initialData }: BottomPanelsProps) {
  const { t, currentLanguage } = useLanguage();
  const { isDark } = useTheme();
  const [cricket, setCricket] = useState<any>(initialData?.cricket || { match: "", score: "", overs: "" });
  const [market, setMarket] = useState<any>(initialData?.market || { usdInr: "", usdInrChange: "", goldRate: "", goldChange: "" });
  const [weather, setWeather] = useState<any>(initialData?.weather || { temp: "", city: "", condition: "" });
  const [weatherCities, setWeatherCities] = useState<WeatherCity[]>(initialData?.weatherCities || []);
  const [sports, setSports] = useState<SportItem[]>(initialData?.sports || []);
  const [allVideos, setAllVideos] = useState<VideoData[]>(initialData?.videos || []);
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [loading, setLoading] = useState(!initialData);
  const [visibleCount, setVisibleCount] = useState(4);
  const [isDesktop, setIsDesktop] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [userCity, setUserCity] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hlsInstance, setHlsInstance] = useState<any>(null);

  // Filter videos by language - supports "all" for featured content
  const filterVideosByLanguage = (videoList: VideoData[], lang: string): VideoData[] => {
    if (!videoList || videoList.length === 0) return [];
    
    // When "All Languages" is selected, show only featured videos
    if (lang === 'all') {
      const featured = videoList.filter(v => v.featuredInAll === true);
      return featured.length > 0 ? featured : videoList;
    }
    
    // For specific language, filter by language field
    const filtered = videoList.filter(video => {
      if (!video.language) return true;
      return video.language === lang;
    });
    
    if (filtered.length === 0) return videoList;
    
    return filtered;
  };

  // Dark mode colors
  const darkBg = '#1e1e1e';
  const darkCardBg = '#242424';
  const darkBorder = '#333333';
  const darkText = '#e8e8e8';
  const darkTextSecondary = '#a0a0a0';
  const darkTextMuted = '#888888';

  useEffect(() => {
    if (!initialData) {
      loadData();
    } else {
      const videoList = initialData.videos || [];
      setAllVideos(videoList);
      setVideos(filterVideosByLanguage(videoList, currentLanguage));
      
      if (initialData.weatherCities && initialData.weatherCities.length > 0) {
        detectAndSetCity(initialData.weatherCities);
      }
    }
  }, []);

  useEffect(() => {
    setVideos(filterVideosByLanguage(allVideos, currentLanguage));
    setVisibleCount(4);
    setSelectedVideo(null);
  }, [currentLanguage, allVideos]);

  useEffect(() => {
    if (typeof window !== 'undefined' && selectedVideo && isHLSStream(selectedVideo.link)) {
      import('hls.js').then((module) => {
        const HLS = module.default;
        if (HLS.isSupported() && videoRef.current) {
          const hls = new HLS({
            enableWorker: true,
            lowLatencyMode: true,
          });
          hls.loadSource(selectedVideo.link);
          hls.attachMedia(videoRef.current);
          setHlsInstance(hls);
        }
      }).catch((err) => {
        console.error('Failed to load HLS.js:', err);
      });
    }
    
    return () => {
      if (hlsInstance) {
        hlsInstance.destroy();
        setHlsInstance(null);
      }
    };
  }, [selectedVideo]);

  const detectAndSetCity = async (cities: WeatherCity[]) => {
    try {
      let detectedCity = "New Delhi";
      try {
        const ipResponse = await fetch('https://ipapi.co/city/');
        if (ipResponse.ok) {
          detectedCity = await ipResponse.text();
        }
      } catch (e) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
          });
          const { latitude, longitude } = position.coords;
          const geoResponse = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          if (geoResponse.ok) {
            const geoData = await geoResponse.json();
            detectedCity = geoData.city || geoData.locality || "New Delhi";
          }
        } catch (e) {}
      }
      
      setUserCity(detectedCity);
      
      const userCityWeather = cities.find(c => 
        c.city.toLowerCase() === detectedCity.toLowerCase() ||
        c.city.toLowerCase().includes(detectedCity.toLowerCase()) ||
        detectedCity.toLowerCase().includes(c.city.toLowerCase())
      );
      
      if (userCityWeather) {
        setWeather(userCityWeather);
      } else if (cities.length > 0) {
        setWeather(cities[0]);
      }
    } catch (error) {
      console.error("Error detecting city:", error);
      if (cities.length > 0) {
        setWeather(cities[0]);
      }
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [mark, weath, vid, sportData, cityData] = await Promise.all([
        getMarket(),
        getWeather(),
        getVideos(),
        getSports(),
        getWeatherCities()
      ]);
      
      setMarket(mark || { usdInr: "", usdInrChange: "", goldRate: "", goldChange: "" });
      
      const cities = cityData || [];
      setWeatherCities(cities);
      await detectAndSetCity(cities);
      
      const sportsList = sportData || [];
      setSports(sportsList.filter((s: SportItem) => s.show !== false));
      
      const videoList = vid || [];
      setAllVideos(videoList);
      setVideos(filterVideosByLanguage(videoList, currentLanguage));
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    const checkScreen = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);
      const initialCount = desktop ? 6 : 4;
      setVisibleCount(Math.min(initialCount, videos.length));
    };
    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, [videos.length]);

  const visibleSport = sports.find(s => s.show !== false) || sports[0];

  const getInitialCount = () => isDesktop ? 6 : 4;

  const visibleVideos = videos.slice(0, visibleCount);
  const hasMore = videos.length > visibleCount;

  const handleLoadMore = () => {
    const nextCount = visibleCount + getInitialCount();
    setVisibleCount(Math.min(nextCount, videos.length));
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -280, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 280, behavior: 'smooth' });
    }
  };

  const playVideo = (video: VideoData) => setSelectedVideo(video);

  const closePlayer = () => {
    setSelectedVideo(null);
    if (hlsInstance) {
      hlsInstance.destroy();
      setHlsInstance(null);
    }
  };

  const isHLSStream = (link: string): boolean => {
    if (!link) return false;
    return link.includes('.m3u8') || link.includes('manifest') || link.includes('hls') || 
           link.includes('mpegts') || link.includes('akamaized') || link.includes('cloudfront');
  };

  const isYouTube = (link: string): boolean => {
    if (!link) return false;
    return link.includes('youtube.com') || link.includes('youtu.be');
  };

  const getEmbedUrl = (link: string): string => {
    if (!link) return "";
    if (link.includes('youtube.com/watch?v=')) {
      const videoId = link.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
    }
    if (link.includes('youtube.com/shorts/')) {
      const videoId = link.split('/shorts/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
    }
    if (link.includes('youtube.com/embed/')) {
      return link.includes('?') ? `${link}&autoplay=1&rel=0` : `${link}?autoplay=1&rel=0`;
    }
    if (link.includes('youtu.be/')) {
      const videoId = link.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
    }
    if (link.includes('vimeo.com/')) {
      const videoId = link.split('vimeo.com/')[1]?.split('?')[0];
      return `https://player.vimeo.com/video/${videoId}?autoplay=1`;
    }
    if (link.includes('dailymotion.com/video/')) {
      const videoId = link.split('/video/')[1]?.split('_')[0];
      return `https://www.dailymotion.com/embed/video/${videoId}?autoplay=1`;
    }
    return link;
  };

  const isPlayable = (link: string): boolean => {
    if (!link) return false;
    return link.includes('youtube.com') || link.includes('youtu.be') || 
           link.includes('vimeo.com') || link.includes('dailymotion.com') || 
           link.includes('embed') || link.includes('.m3u8') || link.includes('manifest') || 
           link.includes('akamaized') || link.includes('cloudfront') || link.startsWith('http');
  };

  const formatGoldRate = (rate: string) => {
    if (!rate) return "N/A";
    const cleanRate = rate.replace(/[₹,]/g, '').trim();
    if (!cleanRate) return "N/A";
    return `₹${cleanRate.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  };

  const weatherWidget = {
    title: "Weather Update",
    detail: weather.temp || "N/A",
    subDetail: weather.city ? `${t(weather, 'city') || weather.city} • ${t(weather, 'condition') || weather.condition}` : "No data",
    status: "Sun",
    statusColor: "bg-amber-500",
    icon: <CloudSun className="w-5 h-5 text-amber-500" />
  };

  const goldWidget = {
    title: "Gold Rate",
    detail: market.goldRate ? formatGoldRate(market.goldRate) : "N/A",
    subDetail: market.goldChange || "No data",
    status: "Up",
    statusColor: "bg-emerald-500",
    icon: <Coins className="w-5 h-5 text-amber-600" />
  };

  const usdWidget = {
    title: "USD / INR",
    detail: market.usdInr ? `₹${market.usdInr}` : "N/A",
    subDetail: market.usdInrChange || "No data",
    status: "Down",
    statusColor: "bg-rose-500",
    icon: <DollarSign className="w-5 h-5 text-emerald-600" />
  };

  const widgets = [weatherWidget, goldWidget, usdWidget];

  if (visibleSport && visibleSport.show !== false) {
    widgets.push({
      title: t(visibleSport, 'sport') || visibleSport.sport || "Sports",
      detail: visibleSport.score || "N/A",
      subDetail: visibleSport.match ? `${t(visibleSport, 'match') || visibleSport.match} • ${t(visibleSport, 'detail') || visibleSport.detail}` : "No match",
      status: "Live",
      statusColor: "bg-green-500 animate-pulse",
      icon: <Trophy className="w-5 h-5 text-green-600" />
    });
  }

  if (loading) {
    return (
      <div className="space-y-6 sm:space-y-8 mt-6 sm:mt-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl border p-3 sm:p-4 animate-pulse" style={{ backgroundColor: isDark ? darkCardBg : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0' }}>
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: isDark ? '#2d2d2d' : '#e2e8f0' }}></div>
                <div className="flex-1">
                  <div className="h-3 rounded w-16 mb-2" style={{ backgroundColor: isDark ? '#2d2d2d' : '#e2e8f0' }}></div>
                  <div className="h-4 rounded w-20 mb-1" style={{ backgroundColor: isDark ? '#2d2d2d' : '#e2e8f0' }}></div>
                  <div className="h-3 rounded w-24" style={{ backgroundColor: isDark ? '#2d2d2d' : '#e2e8f0' }}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="animate-pulse">
          <div className="h-6 rounded w-40 mb-4" style={{ backgroundColor: isDark ? '#2d2d2d' : '#e2e8f0' }}></div>
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex-shrink-0 w-36 h-52 rounded-xl" style={{ backgroundColor: isDark ? '#2d2d2d' : '#e2e8f0' }}></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 mt-6 sm:mt-8">
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {widgets.map((w, idx) => (
          <div 
            key={idx} 
            className="rounded-xl border p-3 sm:p-4 flex items-start gap-3 sm:gap-4 shadow-xs transition-colors duration-300"
            style={{ backgroundColor: isDark ? darkCardBg : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0' }}
          >
            <div className="p-2 rounded-lg border flex-shrink-0" style={{ backgroundColor: isDark ? '#2d2d2d' : '#f8fafc', borderColor: isDark ? '#333333' : '#e2e8f0' }}>
              {w.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[8px] sm:text-[10px] uppercase font-extrabold tracking-wider truncate" style={{ color: isDark ? darkTextMuted : '#94a3b8' }}>{w.title}</span>
                <span className={`w-1.5 h-1.5 rounded-full ${w.statusColor} flex-shrink-0`}></span>
              </div>
              <p className="text-sm sm:text-base font-black mt-0.5 truncate transition-colors duration-300" style={{ color: isDark ? darkText : '#0f172a' }}>{w.detail}</p>
              <p className="text-[10px] sm:text-xs font-semibold mt-0.5 truncate transition-colors duration-300" style={{ color: isDark ? darkTextSecondary : '#64748b' }}>{w.subDetail}</p>
            </div>
          </div>
        ))}
      </div>

      {selectedVideo && isPlayable(selectedVideo.link) && (
        <div className="bg-black rounded-xl overflow-hidden shadow-lg">
          <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
            {isHLSStream(selectedVideo.link) ? (
              <video ref={videoRef} className="absolute top-0 left-0 w-full h-full" controls autoPlay playsInline />
            ) : isYouTube(selectedVideo.link) ? (
              <iframe src={getEmbedUrl(selectedVideo.link)} className="absolute top-0 left-0 w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title={t(selectedVideo, 'title')} />
            ) : (
              <video className="absolute top-0 left-0 w-full h-full" controls autoPlay playsInline src={selectedVideo.link} />
            )}
          </div>
          <div className="p-4 flex items-start justify-between transition-colors duration-300" style={{ backgroundColor: isDark ? darkCardBg : '#ffffff' }}>
            <div>
              <h3 className="text-sm font-bold transition-colors duration-300" style={{ color: isDark ? darkText : '#0f172a' }}>{t(selectedVideo, 'title')}</h3>
              <p className="text-xs transition-colors duration-300" style={{ color: isDark ? darkTextSecondary : '#64748b' }}>{t(selectedVideo, 'category') || "Video"}</p>
            </div>
            <button onClick={closePlayer} className="transition text-sm font-bold flex items-center gap-1" style={{ color: isDark ? darkTextMuted : '#94a3b8' }}><X className="w-4 h-4" /> Close</button>
          </div>
        </div>
      )}

      {videos.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg sm:text-xl font-black tracking-tight transition-colors duration-300" style={{ color: isDark ? darkText : '#0f172a' }}>Trending Videos</h2>
            <span className="text-[10px]" style={{ color: isDark ? darkTextMuted : '#94a3b8' }}>{visibleCount} of {videos.length}</span>
          </div>

          <div className="relative">
            {isDesktop && visibleCount > getInitialCount() && (
              <>
                <button onClick={scrollLeft} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 shadow-lg rounded-full p-2 border transition" style={{ backgroundColor: isDark ? '#2d2d2d' : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0', color: isDark ? darkText : '#334155' }}><ChevronLeft className="w-5 h-5" /></button>
                <button onClick={scrollRight} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 shadow-lg rounded-full p-2 border transition" style={{ backgroundColor: isDark ? '#2d2d2d' : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0', color: isDark ? darkText : '#334155' }}><ChevronRight className="w-5 h-5" /></button>
              </>
            )}

            <div ref={scrollContainerRef} className="flex gap-4 overflow-x-auto scrollbar-none pb-2" style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}>
              {visibleVideos.map((vid) => (
                <button key={vid.id} onClick={() => playVideo(vid)} className={`flex-shrink-0 group cursor-pointer rounded-xl overflow-hidden border-2 transition w-[140px] sm:w-[180px] ${selectedVideo?.id === vid.id ? 'border-red-500 shadow-lg shadow-red-500/20' : isDark ? 'border-[#333333] hover:border-red-300' : 'border-slate-200 hover:border-red-300'}`} style={{ scrollSnapAlign: 'start' }}>
                  <div className="relative aspect-[9/14] overflow-hidden bg-slate-900">
                    <img src={vid.img || "https://images.unsplash.com/photo-1504370805625-d32c54b16100?auto=format&fit=crop&q=80&w=300"} alt={t(vid, 'title')} className="w-full h-full object-cover transition duration-500 group-hover:scale-105" onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1504370805625-d32c54b16100?auto=format&fit=crop&q=80&w=300"; }} />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center transition group-hover:bg-black/20">
                      <div className="w-10 h-10 rounded-full bg-red-600/90 flex items-center justify-center group-hover:scale-110 transition"><Play className="w-5 h-5 text-white fill-white ml-0.5" /></div>
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[8px] font-bold px-2 py-0.5 rounded">{t(vid, 'category') || vid.category || "Video"}</div>
                  </div>
                  <div className="p-2 transition-colors duration-300" style={{ backgroundColor: isDark ? darkCardBg : '#ffffff' }}>
                    <p className="text-[10px] font-bold line-clamp-2 group-hover:text-red-600 transition" style={{ color: isDark ? darkText : '#1e293b' }}>{t(vid, 'title')}</p>
                  </div>
                </button>
              ))}
              {hasMore && (
                <button onClick={handleLoadMore} className="flex-shrink-0 group cursor-pointer rounded-xl overflow-hidden border-2 border-dashed border-red-400 hover:border-red-600 transition w-[140px] sm:w-[180px] flex flex-col items-center justify-center gap-3" style={{ backgroundColor: isDark ? '#2d2d2d' : '#fef2f2' }}>
                  <Plus className="w-10 h-10 text-red-400 group-hover:text-red-600" />
                  <span className="text-xs font-bold text-red-400 group-hover:text-red-600">Load More</span>
                  <span className="text-[9px]" style={{ color: isDark ? darkTextMuted : '#94a3b8' }}>{videos.length - visibleCount} more</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {videos.length === 0 && allVideos.length > 0 && (
        <div className="text-center py-8 rounded-xl border" style={{ backgroundColor: isDark ? darkCardBg : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0' }}>
          <p className="text-sm font-medium" style={{ color: isDark ? darkTextSecondary : '#64748b' }}>No videos available for this language</p>
          <p className="text-xs mt-1" style={{ color: isDark ? darkTextMuted : '#94a3b8' }}>Switch language to see videos in other languages</p>
        </div>
      )}
    </div>
  );
}