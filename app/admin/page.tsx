"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Lock, ArrowLeft, RefreshCw, Newspaper, 
  Tv, LineChart, Vote, CloudSun, Coins, Layers, Play, 
  Tag, Trash2, Edit2, Save, X, Plus, Home, 
  Trophy, DollarSign, Image as ImageIcon,
  Upload, Globe, Radio, Zap, 
  TrendingUp, TrendingDown, Languages,
  Check, Video, Activity,
  PlusCircle, MinusCircle
} from "lucide-react";
import {
  getTopStories,
  getLatestNews,
  getCricket,
  getMarket,
  getWeather,
  getElectionStates,
  getElectionConfig,
  getVideos,
  getTicker,
  getTvChannels,
  getElectionVisibility,
  getNoElectionMessage,
  getFooterDescription,
  getSports,
  getWeatherCities,
} from "@/app/lib/dataService";

async function saveToFile(section: string, data: any): Promise<boolean> {
  try {
    const response = await fetch('/api/update-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section, data })
    });
    const result = await response.json();
    if (result.success) {
      return true;
    } else {
      console.error('Save failed:', result.error);
      return false;
    }
  } catch (error) {
    console.error('Save error:', error);
    return false;
  }
}

const ALL_CATEGORIES = [
  "Latest",
  "India",
  "Politics",
  "Business",
  "Sports",
  "Entertainment",
  "Tech",
  "Lifestyle",
  "Web Stories",
  "Opinion",
  "Science",
  "Trends",
  "People",
  "Education",
  "Health",
  "Food"
];

const LANGUAGES = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "hi", name: "Hindi", nativeName: "हिंदी" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు" },
  { code: "mr", name: "Marathi", nativeName: "मराठी" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം" },
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ" }
];

interface SocialLink {
  platform: string;
  url: string;
}

// Each state now holds its own parties
interface ElectionState {
  name: string;
  totalSeats?: number;
  notes?: string;
  links?: { title: string; url: string }[];
  parties: { key: string; name: string; color: string }[];
  [key: string]: any; // for seat counts
}

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [savedMessage, setSavedMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [translating, setTranslating] = useState(false);

  // Data states
  const [topStories, setTopStoriesState] = useState<any[]>([]);
  const [latestNews, setLatestNewsState] = useState<any[]>([]);
  const [cricket, setCricketState] = useState<any>({ match: "", score: "", overs: "" });
  const [market, setMarketState] = useState<any>({ 
    usdInr: "", usdInrChange: "", goldRate: "", goldChange: "",
    sensex: "", sensexChange: "", nifty: "", niftyChange: "" 
  });
  const [weather, setWeatherState] = useState<any>({ temp: "", city: "", condition: "" });
  const [weatherCities, setWeatherCitiesState] = useState<any[]>([]);
  const [sports, setSportsState] = useState<any[]>([]);
  const [electionStates, setElectionStatesState] = useState<ElectionState[]>([]);
  const [electionConfig, setElectionConfigState] = useState<any>({ title: "", liveMapTitle: "", totalSeats: 0 });
  const [videos, setVideosState] = useState<any[]>([]);
  const [ticker, setTickerState] = useState<any[]>([]);
  const [tvChannels, setTvChannelsState] = useState<any[]>([]);
  const [electionVisible, setElectionVisible] = useState(true);
  const [noElectionMessage, setNoElectionMessageState] = useState("");
  const [footerDesc, setFooterDesc] = useState("");
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);

  // Dashboard language filter
  const [dashboardLangFilter, setDashboardLangFilter] = useState("all");

  // Edit states
  const [editingNews, setEditingNews] = useState<any>(null);
  const [newsForm, setNewsForm] = useState({
    title: "",
    category: "India",
    image: "",
    link: "",
    description: "",
    language: "en",
    featuredInAll: false,
    translations: {} as Record<string, { title: string; description: string }>
  });
  const [newsType, setNewsType] = useState("latest");
  
  const [editingTranslation, setEditingTranslation] = useState<{ lang: string; title: string; description: string } | null>(null);

  const [editingVideo, setEditingVideo] = useState<any>(null);
  const [videoForm, setVideoForm] = useState({
    title: "",
    img: "",
    link: "",
    category: "Latest",
    language: "en",
    featuredInAll: false,
    translations: {} as Record<string, { title: string }>
  });

  const [editingChannel, setEditingChannel] = useState<any>(null);
  const [channelForm, setChannelForm] = useState({ 
    name: "", 
    logo: "", 
    urls: [""] as string[],
    type: "youtube" as "youtube" | "hls" | "iframe",
    language: "en",
    featuredInAll: false,
    translations: {} as Record<string, { name: string; urls: string[] }>
  });

  const [editingTicker, setEditingTicker] = useState<any>(null);
  const [tickerForm, setTickerForm] = useState({
    text: "",
    active: true,
    linkedStories: [] as string[],
    linkedLatest: [] as string[],
    linkedVideos: [] as string[],
    translations: {} as Record<string, { text: string }>
  });
  const [newTickerText, setNewTickerText] = useState("");
  
  const [tickerLinkLang, setTickerLinkLang] = useState("en");
  const [tickerLinkCat, setTickerLinkCat] = useState("");

  const [translationTargetLang, setTranslationTargetLang] = useState("hi");
  const [extractUrl, setExtractUrl] = useState("");
  const [extractedLang, setExtractedLang] = useState("en");
  const [extracting, setExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [videoExtractLoading, setVideoExtractLoading] = useState(false);
  const [isTranslatingNews, setIsTranslatingNews] = useState(false);

  // Helper for election colors
  const fillColorMap: Record<string, string> = {
    orange: "#f97316", red: "#dc2626", sky: "#0ea5e9", slate: "#64748b",
    green: "#10b981", purple: "#8b5cf6", yellow: "#eab308", pink: "#ec4899", blue: "#3b82f6",
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadAllData();
    }
  }, [isAuthenticated]);

  // Helper: count items by language
  const countByLanguage = (items: any[], lang: string) => {
    return items.filter(item => item.language === lang).length;
  };

  const countWithoutLanguage = (items: any[]) => {
    return items.filter(item => !item.language).length;
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [top, latest, crick, mark, weath, electStates, electConfig, vid, tick, channels, vis, msg, footer, sp, wc] = await Promise.all([
        getTopStories(),
        getLatestNews(),
        getCricket(),
        getMarket(),
        getWeather(),
        getElectionStates(),
        getElectionConfig(),
        getVideos(),
        getTicker(),
        getTvChannels(),
        getElectionVisibility(),
        getNoElectionMessage(),
        getFooterDescription(),
        getSports(),
        getWeatherCities()
      ]);
      setTopStoriesState(top);
      setLatestNewsState(latest);
      setCricketState(crick);
      setMarketState(mark);
      setWeatherState(weath);
      
      // --- Per‑state parties: ensure each state has a `parties` array ---
      let loadedStates = electStates || [];
      loadedStates = loadedStates.map((state: any) => {
        if (!state.parties || !Array.isArray(state.parties) || state.parties.length === 0) {
          // Assign default parties if missing
          return {
            ...state,
            parties: [
              { key: "bjp", name: "BJP", color: "orange" },
              { key: "sp", name: "SP", color: "red" },
              { key: "cong", name: "CONG", color: "sky" },
              { key: "oth", name: "OTH", color: "slate" }
            ]
          };
        }
        return state;
      });
      // Ensure the loadedStates matches the expected ElectionState[] type (may lack required 'parties' in source types)
      setElectionStatesState(loadedStates as any as ElectionState[]);
      
      setElectionConfigState(electConfig);
      setVideosState(vid);
      setTickerState(tick);
      setTvChannelsState(channels);
      setElectionVisible(vis);
      setNoElectionMessageState(msg);
      setFooterDesc(footer);
      setSportsState(sp);
      setWeatherCitiesState(wc);
      
      // Load social links
      try {
        const response = await fetch('/api/get-data?key=socialLinks&t=' + Date.now());
        if (response.ok) {
          const data = await response.json();
          if (data && Array.isArray(data)) {
            setSocialLinks(data);
          } else {
            setSocialLinks([
              { platform: "YouTube", url: "https://www.youtube.com/@Unsung-v2l" },
              { platform: "Facebook", url: "#" },
              { platform: "X (Twitter)", url: "#" },
              { platform: "Instagram", url: "#" }
            ]);
          }
        }
      } catch {
        setSocialLinks([
          { platform: "YouTube", url: "https://www.youtube.com/@Unsung-v2l" },
          { platform: "Facebook", url: "#" },
          { platform: "X (Twitter)", url: "#" },
          { platform: "Instagram", url: "#" }
        ]);
      }
    } catch (error) {
      console.error('Load error:', error);
      showMessage('Failed to load data');
    }
    setLoading(false);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === "admin" && password === "@Kalavathi devi01") {
      setIsAuthenticated(true);
      setAuthError("");
      loadAllData();
    } else {
      setAuthError("Invalid username or password.");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername("");
    setPassword("");
  };

  const showMessage = (msg: string) => {
    setSavedMessage(msg);
    setTimeout(() => setSavedMessage(""), 4000);
  };

  const handleTranslate = async (text: string, targetLang: string, sourceLang?: string): Promise<string> => {
    if (!text.trim()) return text;
    setTranslating(true);
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, targetLang, sourceLang: sourceLang || undefined })
      });
      const data = await response.json();
      if (data.translatedText) return data.translatedText;
      return text;
    } catch (error) {
      console.error("Translation error:", error);
      return text;
    } finally {
      setTranslating(false);
    }
  };

  const detectStreamType = (url: string): "youtube" | "hls" | "iframe" => {
    if (!url) return "iframe";
    const lower = url.toLowerCase();
    if (lower.includes("youtube.com") || lower.includes("youtu.be")) return "youtube";
    if (lower.includes(".m3u8")) return "hls";
    return "iframe";
  };

  const handleTranslateNews = async () => {
    if (!editingNews || isTranslatingNews) return;
    const lang = translationTargetLang;
    if (lang === newsForm.language) {
      showMessage(`⚠️ Target language is same as primary language.`);
      return;
    }
    setIsTranslatingNews(true);
    try {
      const [translatedTitle, translatedDescription] = await Promise.all([
        handleTranslate(newsForm.title, lang, newsForm.language),
        handleTranslate(newsForm.description, lang, newsForm.language)
      ]);
      setNewsForm({
        ...newsForm,
        translations: { ...newsForm.translations, [lang]: { title: translatedTitle, description: translatedDescription } }
      });
      showMessage(`✅ Added ${LANGUAGES.find(l => l.code === lang)?.nativeName || lang} translation`);
    } catch {
      showMessage('Translation failed.');
    }
    setIsTranslatingNews(false);
  };

  const openTranslationEditor = (lang: string) => {
    const trans = newsForm.translations[lang];
    if (trans) {
      setEditingTranslation({ lang, title: trans.title, description: trans.description });
    }
  };

  const saveTranslationEdit = () => {
    if (!editingTranslation) return;
    setNewsForm({
      ...newsForm,
      translations: {
        ...newsForm.translations,
        [editingTranslation.lang]: {
          title: editingTranslation.title,
          description: editingTranslation.description
        }
      }
    });
    setEditingTranslation(null);
    showMessage(`✅ Updated ${LANGUAGES.find(l => l.code === editingTranslation.lang)?.nativeName} translation`);
  };

  const removeTranslation = (type: 'story' | 'video' | 'channel' | 'ticker', lang: string) => {
    if (type === 'story') {
      const { [lang]: removed, ...rest } = newsForm.translations;
      setNewsForm({ ...newsForm, translations: rest });
    } else if (type === 'video') {
      const { [lang]: removed, ...rest } = videoForm.translations;
      setVideoForm({ ...videoForm, translations: rest });
    } else if (type === 'channel') {
      const { [lang]: removed, ...rest } = channelForm.translations;
      setChannelForm({ ...channelForm, translations: rest });
    } else if (type === 'ticker') {
      const { [lang]: removed, ...rest } = tickerForm.translations;
      setTickerForm({ ...tickerForm, translations: rest });
    }
    showMessage(`Removed ${LANGUAGES.find(l => l.code === lang)?.nativeName || lang} translation`);
  };

  const extractVideoTitle = async () => {
    if (!videoForm.link.trim()) { showMessage('Please enter a video URL first.'); return; }
    setVideoExtractLoading(true);
    try {
      const response = await fetch('/api/extract', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: videoForm.link }) });
      const data = await response.json();
      if (data.title) {
        setVideoForm({ ...videoForm, title: data.title });
        showMessage(`✅ Title extracted: ${data.title.substring(0, 50)}${data.title.length > 50 ? '...' : ''}`);
      } else {
        showMessage('Could not extract title. Please enter manually.');
      }
    } catch (error) { showMessage('Failed to extract title.'); }
    setVideoExtractLoading(false);
  };

  const handleExtract = async () => {
    if (!extractUrl.trim()) return;
    setExtracting(true);
    try {
      const response = await fetch("/api/extract", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: extractUrl }) });
      const data = await response.json();
      if (data.error) { showMessage(data.error); }
      else {
        const newsId = `auto-${Date.now()}`;
        setExtractedData(data);
        setNewsForm({
          title: data.title || "", category: "India", image: data.image || "",
          link: `/news/${newsId}`, description: data.content || data.description || "",
          language: extractedLang, featuredInAll: false, translations: {}
        });
        showMessage(`✅ Extracted! Language: ${LANGUAGES.find(l => l.code === extractedLang)?.nativeName}.`);
      }
    } catch (error) { showMessage("Extraction failed!"); }
    setExtracting(false);
  };

  const saveSection = async (section: string, data: any, successMsg: string) => {
    setLoading(true);
    const success = await saveToFile(section, data);
    if (success) showMessage(successMsg);
    else showMessage('Failed to save!');
    setLoading(false);
    return success;
  };

  const handleAddNews = async () => {
    if (!newsForm.title.trim()) return;
    const newsId = `auto-${Date.now()}`;
    const entry = {
      id: newsId, title: newsForm.title, category: newsForm.category,
      time: "Just now", image: newsForm.image || "https://images.unsplash.com/photo-1504370805625-d32c54b16100?auto=format&fit=crop&q=80&w=300",
      link: `/news/${newsId}`, description: newsForm.description || "",
      language: newsForm.language, featuredInAll: newsForm.featuredInAll,
      translations: newsForm.translations || {}
    };
    let updated;
    if (newsType === "top") { updated = [entry, ...topStories]; setTopStoriesState(updated); }
    else { updated = [entry, ...latestNews]; setLatestNewsState(updated); }
    const section = newsType === "top" ? "topStories" : "latestNews";
    await saveSection(section, updated, "Story added!");
    resetNewsForm();
  };

  const handleEditNews = (item: any, type: string) => {
    setEditingNews(item); setNewsType(type);
    setNewsForm({
      title: item.title || "", category: item.category || "India", image: item.image || "",
      link: item.link || "", description: item.description || "",
      language: item.language || "en", featuredInAll: item.featuredInAll || false,
      translations: item.translations || {}
    });
  };

  const handleUpdateNews = async () => {
    if (!editingNews) return;
    const updates = {
      title: newsForm.title, category: newsForm.category, image: newsForm.image,
      link: newsForm.link || `/news/${editingNews.id}`, description: newsForm.description,
      language: newsForm.language, featuredInAll: newsForm.featuredInAll,
      translations: newsForm.translations
    };
    let updated;
    if (newsType === "top") { updated = topStories.map((s: any) => s.id === editingNews.id ? { ...s, ...updates } : s); setTopStoriesState(updated); }
    else { updated = latestNews.map((s: any) => s.id === editingNews.id ? { ...s, ...updates } : s); setLatestNewsState(updated); }
    const section = newsType === "top" ? "topStories" : "latestNews";
    await saveSection(section, updated, "Story updated!");
    resetNewsForm();
  };

  const handleDeleteNews = async (id: string, type: string) => {
    if (!confirm("Delete this story?")) return;
    let updated;
    if (type === "top") { updated = topStories.filter((s: any) => s.id !== id); setTopStoriesState(updated); }
    else { updated = latestNews.filter((s: any) => s.id !== id); setLatestNewsState(updated); }
    const section = type === "top" ? "topStories" : "latestNews";
    await saveSection(section, updated, "Story deleted!");
  };

  const resetNewsForm = () => {
    setEditingNews(null); setExtractedData(null); setEditingTranslation(null);
    setNewsForm({ title: "", category: "India", image: "", link: "", description: "", language: "en", featuredInAll: false, translations: {} });
  };

  const handleAddVideo = async () => {
    if (!videoForm.title.trim() || !videoForm.link.trim()) return;
    const entry = {
      id: `vid-${Date.now()}`, title: videoForm.title,
      img: videoForm.img || "https://images.unsplash.com/photo-1504370805625-d32c54b16100?auto=format&fit=crop&q=80&w=300",
      link: videoForm.link, category: videoForm.category || "Latest",
      language: videoForm.language, featuredInAll: videoForm.featuredInAll,
      translations: videoForm.translations || {}
    };
    const updated = [...videos, entry]; setVideosState(updated);
    await saveSection("videos", updated, "Video added!");
    resetVideoForm();
  };

  const handleEditVideo = (item: any) => {
    setEditingVideo(item);
    setVideoForm({
      title: item.title || "", img: item.img || "", link: item.link || "",
      category: item.category || "Latest", language: item.language || "en",
      featuredInAll: item.featuredInAll || false, translations: item.translations || {}
    });
  };

  const handleUpdateVideo = async () => {
    if (!editingVideo) return;
    const updated = videos.map((v: any) => v.id === editingVideo.id ? { ...v, ...videoForm } : v);
    setVideosState(updated);
    await saveSection("videos", updated, "Video updated!");
    resetVideoForm();
  };

  const handleDeleteVideo = async (id: string) => {
    if (!confirm("Delete this video?")) return;
    const updated = videos.filter((v: any) => v.id !== id); setVideosState(updated);
    await saveSection("videos", updated, "Video deleted!");
  };

  const resetVideoForm = () => {
    setEditingVideo(null);
    setVideoForm({ title: "", img: "", link: "", category: "Latest", language: "en", featuredInAll: false, translations: {} });
  };

  const handleAddChannel = async () => {
    if (!channelForm.name.trim() || !channelForm.urls[0]?.trim()) return;
    const validUrls = channelForm.urls.filter(u => u.trim());
    if (validUrls.length === 0) { showMessage("Please add at least one URL."); return; }
    const detectedType = detectStreamType(validUrls[0]);
    const entry = {
      id: `ch-${Date.now()}`, name: channelForm.name,
      logo: channelForm.logo || channelForm.name.substring(0, 2).toUpperCase(),
      urls: validUrls, type: channelForm.type || detectedType,
      language: channelForm.language, featuredInAll: channelForm.featuredInAll,
      translations: channelForm.translations || {}
    };
    const updated = [...tvChannels, entry]; setTvChannelsState(updated);
    await saveSection("tvChannels", updated, "Channel added!");
    resetChannelForm();
  };

  const handleEditChannel = (item: any) => {
    setEditingChannel(item);
    setChannelForm({
      name: item.name || "", logo: item.logo || "",
      urls: item.urls && item.urls.length > 0 ? [...item.urls] : [item.embedUrl || ""],
      type: item.type || "youtube", language: item.language || "en",
      featuredInAll: item.featuredInAll || false, translations: item.translations || {}
    });
  };

  const handleUpdateChannel = async () => {
    if (!editingChannel) return;
    const validUrls = channelForm.urls.filter(u => u.trim());
    if (validUrls.length === 0) { showMessage("Please add at least one URL."); return; }
    const detectedType = detectStreamType(validUrls[0]);
    const updated = tvChannels.map((c: any) => c.id === editingChannel.id ? { ...c, name: channelForm.name, urls: validUrls, logo: channelForm.logo, type: channelForm.type || detectedType, language: channelForm.language, featuredInAll: channelForm.featuredInAll, translations: channelForm.translations } : c);
    setTvChannelsState(updated);
    await saveSection("tvChannels", updated, "Channel updated!");
    resetChannelForm();
  };

  const handleDeleteChannel = async (id: string) => {
    if (!confirm("Delete this channel?")) return;
    const updated = tvChannels.filter((c: any) => c.id !== id); setTvChannelsState(updated);
    await saveSection("tvChannels", updated, "Channel deleted!");
  };

  const addChannelUrl = () => { setChannelForm({ ...channelForm, urls: [...channelForm.urls, ""] }); };
  const removeChannelUrl = (index: number) => {
    if (channelForm.urls.length <= 1) { showMessage("At least one URL is required."); return; }
    const newUrls = channelForm.urls.filter((_, i) => i !== index);
    setChannelForm({ ...channelForm, urls: newUrls });
  };
  const updateChannelUrl = (index: number, value: string) => {
    const newUrls = [...channelForm.urls]; newUrls[index] = value;
    setChannelForm({ ...channelForm, urls: newUrls, type: index === 0 ? detectStreamType(value) : channelForm.type });
  };
  const resetChannelForm = () => {
    setEditingChannel(null);
    setChannelForm({ name: "", logo: "", urls: [""], type: "youtube", language: "en", featuredInAll: false, translations: {} });
  };

  const handleAddTicker = async () => {
    if (!newTickerText.trim()) return;
    const entry = { id: `tick-${Date.now()}`, text: newTickerText, active: true, linkedStories: [], linkedLatest: [], linkedVideos: [], translations: {} };
    const updated = [...ticker, entry]; setTickerState(updated);
    await saveSection("ticker", updated, "Ticker added!");
    setNewTickerText("");
  };

  const handleEditTicker = (item: any) => {
    setEditingTicker(item);
    setTickerForm({ text: item.text || "", active: item.active !== false, linkedStories: item.linkedStories || [], linkedLatest: item.linkedLatest || [], linkedVideos: item.linkedVideos || [], translations: item.translations || {} });
  };

  const handleUpdateTicker = async () => {
    if (!editingTicker) return;
    const updated = ticker.map((t: any) => t.id === editingTicker.id ? { ...t, ...tickerForm } : t);
    setTickerState(updated);
    await saveSection("ticker", updated, "Ticker updated!");
    resetTickerForm();
  };

  const handleDeleteTicker = async (id: string) => {
    if (!confirm("Delete this ticker?")) return;
    const updated = ticker.filter((t: any) => t.id !== id); setTickerState(updated);
    await saveSection("ticker", updated, "Ticker deleted!");
  };

  const resetTickerForm = () => {
    setEditingTicker(null);
    setTickerForm({ text: "", active: true, linkedStories: [], linkedLatest: [], linkedVideos: [], translations: {} });
  };

  const toggleLinkedItem = (type: 'stories' | 'latest' | 'videos', id: string) => {
    const key = type === 'stories' ? 'linkedStories' : type === 'latest' ? 'linkedLatest' : 'linkedVideos';
    const current = tickerForm[key] as string[];
    if (current.includes(id)) setTickerForm({ ...tickerForm, [key]: current.filter((i: string) => i !== id) });
    else setTickerForm({ ...tickerForm, [key]: [...current, id] });
  };

  const getFilteredTopStories = () => topStories.filter(s => { if (tickerLinkLang && s.language !== tickerLinkLang) return false; if (tickerLinkCat && s.category !== tickerLinkCat) return false; return true; });
  const getFilteredLatestNews = () => latestNews.filter(s => { if (tickerLinkLang && s.language !== tickerLinkLang) return false; if (tickerLinkCat && s.category !== tickerLinkCat) return false; return true; });
  const getFilteredVideos = () => videos.filter(v => { if (tickerLinkLang && v.language !== tickerLinkLang) return false; if (tickerLinkCat && v.category !== tickerLinkCat) return false; return true; });

  const addSport = () => { setSportsState([...sports, { sport: "New Sport", match: "", score: "", detail: "", show: true }]); showMessage("New sport added."); };
  const removeSport = (index: number) => { setSportsState(sports.filter((_, i) => i !== index)); };
  const updateSport = (index: number, field: string, value: any) => { const updated = [...sports]; updated[index][field] = value; setSportsState(updated); };
  const toggleSportShow = (index: number) => { const updated = [...sports]; updated[index].show = !updated[index].show; setSportsState(updated); };
  const saveSports = async () => { await saveSection("sports", sports, "Sports saved!"); };

  const addCity = () => { setWeatherCitiesState([...weatherCities, { city: "New City", temp: "0°C", condition: "Unknown" }]); };
  const removeCity = (index: number) => { setWeatherCitiesState(weatherCities.filter((_, i) => i !== index)); };
  const updateCity = (index: number, field: string, value: any) => { const updated = [...weatherCities]; updated[index][field] = value; setWeatherCitiesState(updated); };
  const saveCities = async () => { await saveSection("weatherCities", weatherCities, "Cities saved!"); };

  // ---------- ELECTION: PER-STATE PARTIES ----------
  const addElectionState = () => {
    const defaultParties = [
      { key: "bjp", name: "BJP", color: "orange" },
      { key: "sp", name: "SP", color: "red" },
      { key: "cong", name: "CONG", color: "sky" },
      { key: "oth", name: "OTH", color: "slate" }
    ];
    const newState: ElectionState = {
      name: "New State",
      totalSeats: 0,
      parties: defaultParties,
      notes: "",
      links: []
    };
    // Initialize seat counts for each party
    defaultParties.forEach(p => { newState[p.key] = 0; });
    setElectionStatesState([...electionStates, newState]);
    showMessage("New state added. Edit name, parties and seats, then save.");
  };

  const removeElectionState = (index: number) => {
    if (!confirm(`Remove "${electionStates[index].name}"?`)) return;
    const updated = electionStates.filter((_, i) => i !== index);
    setElectionStatesState(updated);
    showMessage("State removed.");
  };

  // Update a seat count for a specific state and party
  const updateElectionStateSeat = (stateIndex: number, partyKey: string, value: number) => {
    const updated = [...electionStates];
    updated[stateIndex][partyKey] = value;
    setElectionStatesState(updated);
  };

  // Update a state's field (name, totalSeats, notes)
  const updateElectionStateField = (stateIndex: number, field: string, value: any) => {
    const updated = [...electionStates];
    updated[stateIndex][field] = value;
    setElectionStatesState(updated);
  };

  // Add a party to a specific state
  const addPartyToState = (stateIndex: number) => {
    const state = electionStates[stateIndex];
    const newKey = `party${Date.now()}`;
    const newParty = { key: newKey, name: "NEW", color: "slate" };
    const updated = [...electionStates];
    updated[stateIndex].parties = [...updated[stateIndex].parties, newParty];
    updated[stateIndex][newKey] = 0;
    setElectionStatesState(updated);
    showMessage(`New party added to ${state.name}.`);
  };

  // Remove a party from a specific state
  const removePartyFromState = (stateIndex: number, partyIndex: number) => {
    const state = electionStates[stateIndex];
    if (state.parties.length <= 1) {
      showMessage("Each state must have at least one party.");
      return;
    }
    const removed = state.parties[partyIndex];
    if (!confirm(`Remove "${removed.name}" from ${state.name}?`)) return;
    const updated = [...electionStates];
    // Remove from parties array
    updated[stateIndex].parties = updated[stateIndex].parties.filter((_, i) => i !== partyIndex);
    // Remove seat data
    delete updated[stateIndex][removed.key];
    setElectionStatesState(updated);
    showMessage(`Party "${removed.name}" removed from ${state.name}.`);
  };

  // Update party details (name, color, key) for a specific state
  const updatePartyInState = (stateIndex: number, partyIndex: number, field: 'key' | 'name' | 'color', value: string) => {
    const updated = [...electionStates];
    const party = updated[stateIndex].parties[partyIndex];
    if (field === 'key') {
      const newKey = value.trim().toLowerCase().replace(/\s+/g, '_');
      if (newKey && newKey !== party.key) {
        // Check if key already exists
        if (updated[stateIndex].parties.some(p => p.key === newKey)) {
          showMessage(`Party key "${newKey}" already exists in this state.`);
          return;
        }
        // Move seat data from old key to new key
        const seatValue = updated[stateIndex][party.key] || 0;
        updated[stateIndex][newKey] = seatValue;
        delete updated[stateIndex][party.key];
        updated[stateIndex].parties[partyIndex].key = newKey;
      }
    } else if (field === 'name') {
      updated[stateIndex].parties[partyIndex].name = value.trim().toUpperCase() || party.name;
    } else if (field === 'color') {
      updated[stateIndex].parties[partyIndex].color = value;
    }
    setElectionStatesState(updated);
  };

  // Add a link to a state
  const addLinkToState = (stateIndex: number) => {
    const updated = [...electionStates];
    if (!updated[stateIndex].links) updated[stateIndex].links = [];
    updated[stateIndex].links!.push({ title: "", url: "" });
    setElectionStatesState(updated);
  };

  const updateStateLink = (stateIndex: number, linkIndex: number, field: 'title' | 'url', value: string) => {
    const updated = [...electionStates];
    if (updated[stateIndex].links) {
      updated[stateIndex].links![linkIndex][field] = value;
      setElectionStatesState(updated);
    }
  };

  const removeStateLink = (stateIndex: number, linkIndex: number) => {
    const updated = [...electionStates];
    if (updated[stateIndex].links) {
      updated[stateIndex].links = updated[stateIndex].links!.filter((_, i) => i !== linkIndex);
      setElectionStatesState(updated);
    }
  };

  // Save all election states (including per‑state parties)
  const saveElectionStates = async () => {
    await saveSection("electionStates", electionStates, "Election states saved!");
  };

  const toggleElectionVisibility = async () => {
    const nv = !electionVisible;
    setElectionVisible(nv);
    await saveSection("electionVisible", nv, nv ? "Election visible" : "Election hidden");
  };

  const saveNoElectionMessage = async () => {
    await saveSection("noElectionMessage", noElectionMessage, "Message saved!");
  };

  const saveElectionConfig = async () => {
    await saveSection("electionConfig", electionConfig, "Election config saved!");
  };

  const autoFetchElection = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/election");
      const data = await response.json();
      if (data && data.hasElection !== false && data.states?.length > 0) {
        // Convert fetched data to per‑state party format
        const fetchedStates = data.states.map((state: any) => {
          const commonParties = ['bjp', 'sp', 'cong', 'oth', 'dmk', 'aap', 'tdp', 'ycp', 'trs', 'jd', 'rjd'];
          const colorMap: Record<string, string> = {
            'bjp': 'orange', 'sp': 'red', 'cong': 'sky', 'oth': 'slate',
            'dmk': 'red', 'aap': 'blue', 'tdp': 'yellow', 'ycp': 'green',
            'trs': 'pink', 'jd': 'green', 'rjd': 'purple'
          };
          const parties: { key: string; name: string; color: string }[] = [];
          const seatData: Record<string, number> = {};
          for (const key of commonParties) {
            if (state[key] !== undefined) {
              parties.push({ key, name: key.toUpperCase(), color: colorMap[key] || 'slate' });
              seatData[key] = state[key];
            }
          }
          if (parties.length === 0) {
            // fallback defaults
            const defaults = [
              { key: "bjp", name: "BJP", color: "orange" },
              { key: "sp", name: "SP", color: "red" },
              { key: "cong", name: "CONG", color: "sky" },
              { key: "oth", name: "OTH", color: "slate" }
            ];
            defaults.forEach(p => { seatData[p.key] = state[p.key] || 0; });
            return {
              name: state.name || "Unknown",
              totalSeats: state.totalSeats || data.totalSeats || 0,
              parties: defaults,
              notes: state.notes || "",
              links: state.links || [],
              ...seatData
            };
          }
          return {
            name: state.name || "Unknown",
            totalSeats: state.totalSeats || data.totalSeats || 0,
            parties,
            notes: state.notes || "",
            links: state.links || [],
            ...seatData
          };
        });
        setElectionStatesState(fetchedStates);
        await saveSection("electionStates", fetchedStates, "Election states fetched!");
        if (data.totalSeats) {
          const config = { ...electionConfig, totalSeats: data.totalSeats };
          setElectionConfigState(config);
          await saveSection("electionConfig", config, "Election config updated!");
        }
      } else {
        showMessage(data.message || "No active elections");
        setElectionVisible(false);
        await saveSection("electionVisible", false, "Election hidden - no active elections");
      }
    } catch {
      showMessage("Failed to fetch election data");
    }
    setLoading(false);
  };

  // ---------- SOCIAL LINKS ----------
  const addSocialLink = () => { setSocialLinks([...socialLinks, { platform: "", url: "" }]); };
  const removeSocialLink = (index: number) => { setSocialLinks(socialLinks.filter((_, i) => i !== index)); };
  const updateSocialLink = (index: number, field: 'platform' | 'url', value: string) => { const updated = [...socialLinks]; updated[index][field] = value; setSocialLinks(updated); };
  const saveSocialLinks = async () => { const valid = socialLinks.filter(s => s.platform.trim() && s.url.trim()); await saveSection("socialLinks", valid, "Social links saved!"); setSocialLinks(valid); };

  const saveMarket = async () => { await saveSection("marketData", market, "Market saved!"); };
  const saveWeather = async () => { await saveSection("weatherData", weather, "Weather saved!"); };
  const saveFooter = async () => { await saveSection("footerDescription", footerDesc, "Footer saved!"); };

  const autoFetchMarket = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/market"); const data = await response.json();
      if (data && data.usdInr) { setMarketState(data); await saveSection("marketData", data, "Market fetched!"); }
      else showMessage("No market data available");
    } catch { showMessage("Failed to fetch market data"); }
    setLoading(false);
  };

  const autoFetchWeather = async () => {
    setLoading(true);
    try {
      const city = weather.city || "New Delhi";
      const response = await fetch(`/api/weather?city=${encodeURIComponent(city)}`); const data = await response.json();
      if (data && data.temp) { setWeatherState(data); await saveSection("weatherData", data, "Weather fetched!"); }
      else showMessage("No weather data available");
    } catch { showMessage("Failed to fetch weather data"); }
    setLoading(false);
  };

  // ============ LOGIN SCREEN ============
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-center items-center px-4">
        <form onSubmit={handleLogin} className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-4">
          <div className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-red-950 border border-red-800 rounded-xl flex items-center justify-center text-red-500 mb-2"><Lock className="w-5 h-5" /></div>
            <h1 className="text-xl font-black tracking-tight">UNSUNG Network CMS</h1>
            <p className="text-xs text-slate-500">Complete Content Management System</p>
          </div>
          <div><label className="block text-[10px] font-bold tracking-wider uppercase text-slate-400 mb-1">User ID</label><input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full text-xs p-3 rounded-lg border border-slate-800 bg-slate-900 focus:outline-none focus:border-red-600 text-white" required /></div>
          <div><label className="block text-[10px] font-bold tracking-wider uppercase text-slate-400 mb-1">Access Password</label><input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full text-xs p-3 rounded-lg border border-slate-800 bg-slate-900 focus:outline-none focus:border-red-600 text-white" required /></div>
          {authError && <p className="text-[11px] font-bold text-rose-500 text-center bg-rose-950/30 py-2 rounded-md">{authError}</p>}
          <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs h-11 rounded-lg transition cursor-pointer">Unlock Full Terminal</button>
        </form>
        <Link href="/" className="text-xs font-bold text-slate-600 hover:text-slate-400 mt-6 flex items-center gap-1"><ArrowLeft className="w-3 h-3" /> Cancel and Go Home</Link>
      </div>
    );
  }

  // ============ ADMIN PANEL ============
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      {/* TOP HEADER */}
      <div className="bg-slate-900 text-white sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center font-black text-sm">UN</div>
            <div><h1 className="text-sm font-black tracking-tight">CMS Admin</h1><p className="text-[10px] text-slate-400 font-medium">Multi-Language</p></div>
          </div>
          <div className="flex items-center gap-3">
            {savedMessage && <span className="text-xs text-emerald-400 font-bold bg-emerald-900/30 px-3 py-1 rounded-full">{savedMessage}</span>}
            {loading && <div className="w-4 h-4 border-2 border-slate-600 border-t-white rounded-full animate-spin"></div>}
            <button onClick={loadAllData} className="text-xs font-bold bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition flex items-center gap-1"><RefreshCw className="w-3 h-3" /> Reload</button>
            <button onClick={handleLogout} className="text-xs font-bold bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg transition">Logout</button>
          </div>
        </div>
      </div>

      {/* TAB NAVIGATION */}
      <div className="bg-white border-b border-slate-200 overflow-x-auto scrollbar-none sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 flex gap-1 h-12 items-center">
          {[
            { id: "dashboard", label: "Dashboard", icon: Home },
            { id: "stories", label: "Stories", icon: Newspaper },
            { id: "videos", label: "Videos", icon: Play },
            { id: "sports", label: "Sports", icon: Activity },
            { id: "market", label: "Market", icon: DollarSign },
            { id: "weather", label: "Weather", icon: CloudSun },
            { id: "election", label: "Election", icon: Vote },
            { id: "ticker", label: "Ticker", icon: Tag },
            { id: "tv", label: "TV Channels", icon: Tv },
            { id: "footer", label: "Footer", icon: Layers }
          ].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${activeTab === tab.id ? "bg-red-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}>
              <tab.icon className="w-3.5 h-3.5" />{tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Translation Edit Modal */}
      {editingTranslation && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900">Edit {LANGUAGES.find(l => l.code === editingTranslation.lang)?.nativeName} Translation</h3>
              <button onClick={() => setEditingTranslation(null)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <div><label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Title</label><input type="text" value={editingTranslation.title} onChange={(e) => setEditingTranslation({...editingTranslation, title: e.target.value})} className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-red-500" /></div>
            <div><label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Description</label><textarea value={editingTranslation.description} onChange={(e) => setEditingTranslation({...editingTranslation, description: e.target.value})} className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-red-500 h-32" /></div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setEditingTranslation(null)} className="bg-slate-600 hover:bg-slate-700 text-white font-bold text-xs px-4 py-2 rounded-lg transition">Cancel</button>
              <button onClick={saveTranslationEdit} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-lg transition flex items-center gap-1"><Save className="w-3 h-3" /> Save</button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* ==================== DASHBOARD ==================== */}
        {activeTab === "dashboard" && (
          <div>
            <h2 className="text-xl font-black text-slate-900 mb-1">Dashboard Overview</h2>
            <p className="text-xs text-slate-500 mb-4">Monitor content across all languages</p>

            {/* Language Filter for Dashboard */}
            <div className="flex items-center gap-3 mb-6 flex-wrap">
              <span className="text-xs font-bold text-slate-600">Filter by Language:</span>
              <div className="flex flex-wrap gap-1.5">
                <button onClick={() => setDashboardLangFilter("all")} className={`text-xs font-bold px-3 py-1.5 rounded-md transition ${dashboardLangFilter === "all" ? "bg-red-600 text-white" : "bg-white text-slate-600 border border-slate-200 hover:border-red-300"}`}>
                  🌐 All
                </button>
                {LANGUAGES.map(lang => (
                  <button key={lang.code} onClick={() => setDashboardLangFilter(lang.code)} className={`text-xs font-bold px-3 py-1.5 rounded-md transition ${dashboardLangFilter === lang.code ? "bg-red-600 text-white" : "bg-white text-slate-600 border border-slate-200 hover:border-red-300"}`}>
                    {lang.nativeName}
                  </button>
                ))}
              </div>
            </div>

            {/* Featured Content Management - Only in "All" view */}
            {dashboardLangFilter === "all" && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Globe className="w-4 h-4 text-amber-600" />
                  <h3 className="text-sm font-bold text-amber-800">"All Languages" View Content</h3>
                  <span className="text-[10px] text-amber-600 ml-auto">
                    Check items to show in the default All Languages view for new visitors
                  </span>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Top Stories Featured */}
                  <div className="bg-white rounded-lg border border-amber-200 p-3">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">
                      Top Stories ({topStories.filter((s: any) => s.featuredInAll).length} featured)
                    </h4>
                    <div className="space-y-1 max-h-60 overflow-y-auto">
                      {topStories.length === 0 && <p className="text-xs text-slate-400 text-center py-4">No top stories</p>}
                      {topStories.map((story: any) => (
                        <label key={story.id} className="flex items-center gap-2 p-1.5 hover:bg-slate-50 rounded text-xs cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={story.featuredInAll === true}
                            onChange={async () => {
                              const updated = topStories.map((s: any) => 
                                s.id === story.id ? { ...s, featuredInAll: !s.featuredInAll } : s
                              );
                              setTopStoriesState(updated);
                              await saveSection("topStories", updated, `"${story.title.substring(0, 30)}..." ${story.featuredInAll ? 'removed from' : 'added to'} All Languages`);
                            }}
                            className="w-3.5 h-3.5 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                          />
                          <span className="truncate flex-1">{story.title}</span>
                          <span className="text-[9px] text-slate-400 whitespace-nowrap">{LANGUAGES.find(l => l.code === story.language)?.nativeName || '?'}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Latest News Featured */}
                  <div className="bg-white rounded-lg border border-amber-200 p-3">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">
                      Latest News ({latestNews.filter((s: any) => s.featuredInAll).length} featured)
                    </h4>
                    <div className="space-y-1 max-h-60 overflow-y-auto">
                      {latestNews.length === 0 && <p className="text-xs text-slate-400 text-center py-4">No latest news</p>}
                      {latestNews.map((story: any) => (
                        <label key={story.id} className="flex items-center gap-2 p-1.5 hover:bg-slate-50 rounded text-xs cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={story.featuredInAll === true}
                            onChange={async () => {
                              const updated = latestNews.map((s: any) => 
                                s.id === story.id ? { ...s, featuredInAll: !s.featuredInAll } : s
                              );
                              setLatestNewsState(updated);
                              await saveSection("latestNews", updated, `"${story.title.substring(0, 30)}..." ${story.featuredInAll ? 'removed from' : 'added to'} All Languages`);
                            }}
                            className="w-3.5 h-3.5 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                          />
                          <span className="truncate flex-1">{story.title}</span>
                          <span className="text-[9px] text-slate-400 whitespace-nowrap">{LANGUAGES.find(l => l.code === story.language)?.nativeName || '?'}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Videos + Channels Featured */}
                  <div className="space-y-3">
                    <div className="bg-white rounded-lg border border-amber-200 p-3">
                      <h4 className="text-xs font-bold text-slate-700 mb-2">
                        Videos ({videos.filter((v: any) => v.featuredInAll).length} featured)
                      </h4>
                      <div className="space-y-1 max-h-28 overflow-y-auto">
                        {videos.length === 0 && <p className="text-xs text-slate-400 text-center py-4">No videos</p>}
                        {videos.map((vid: any) => (
                          <label key={vid.id} className="flex items-center gap-2 p-1.5 hover:bg-slate-50 rounded text-xs cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={vid.featuredInAll === true}
                              onChange={async () => {
                                const updated = videos.map((v: any) => 
                                  v.id === vid.id ? { ...v, featuredInAll: !v.featuredInAll } : v
                                );
                                setVideosState(updated);
                                await saveSection("videos", updated, `"${vid.title.substring(0, 30)}..." ${vid.featuredInAll ? 'removed from' : 'added to'} All Languages`);
                              }}
                              className="w-3.5 h-3.5 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                            />
                            <span className="truncate flex-1">{vid.title}</span>
                            <span className="text-[9px] text-slate-400 whitespace-nowrap">{LANGUAGES.find(l => l.code === vid.language)?.nativeName || '?'}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="bg-white rounded-lg border border-amber-200 p-3">
                      <h4 className="text-xs font-bold text-slate-700 mb-2">
                        TV Channels ({tvChannels.filter((c: any) => c.featuredInAll).length} featured)
                      </h4>
                      <div className="space-y-1 max-h-28 overflow-y-auto">
                        {tvChannels.length === 0 && <p className="text-xs text-slate-400 text-center py-4">No channels</p>}
                        {tvChannels.map((ch: any) => (
                          <label key={ch.id} className="flex items-center gap-2 p-1.5 hover:bg-slate-50 rounded text-xs cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={ch.featuredInAll === true}
                              onChange={async () => {
                                const updated = tvChannels.map((c: any) => 
                                  c.id === ch.id ? { ...c, featuredInAll: !c.featuredInAll } : c
                                );
                                setTvChannelsState(updated);
                                await saveSection("tvChannels", updated, `"${ch.name}" ${ch.featuredInAll ? 'removed from' : 'added to'} All Languages`);
                              }}
                              className="w-3.5 h-3.5 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                            />
                            <span className="truncate flex-1">{ch.name}</span>
                            <span className="text-[9px] text-slate-400 whitespace-nowrap">{LANGUAGES.find(l => l.code === ch.language)?.nativeName || '?'}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ALL LANGUAGES VIEW */}
            {dashboardLangFilter === "all" ? (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Top Stories</p>
                    <p className="text-2xl font-black text-slate-900">{topStories.length}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{countWithoutLanguage(topStories)} unassigned</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Latest News</p>
                    <p className="text-2xl font-black text-slate-900">{latestNews.length}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{countWithoutLanguage(latestNews)} unassigned</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Videos</p>
                    <p className="text-2xl font-black text-slate-900">{videos.length}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{countWithoutLanguage(videos)} unassigned</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">TV Channels</p>
                    <p className="text-2xl font-black text-slate-900">{tvChannels.length}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{countWithoutLanguage(tvChannels)} unassigned</p>
                  </div>
                </div>

                {/* Language Breakdown Table */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                  <div className="p-4 border-b border-slate-200">
                    <h3 className="text-sm font-bold text-slate-800">Content by Language</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="text-left p-3 font-bold text-slate-500 uppercase">Language</th>
                          <th className="text-center p-3 font-bold text-slate-500 uppercase">Top Stories</th>
                          <th className="text-center p-3 font-bold text-slate-500 uppercase">Latest News</th>
                          <th className="text-center p-3 font-bold text-slate-500 uppercase">Videos</th>
                          <th className="text-center p-3 font-bold text-slate-500 uppercase">TV Channels</th>
                          <th className="text-center p-3 font-bold text-slate-500 uppercase">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {LANGUAGES.map(lang => {
                          const ts = countByLanguage(topStories, lang.code);
                          const ln = countByLanguage(latestNews, lang.code);
                          const vd = countByLanguage(videos, lang.code);
                          const ch = countByLanguage(tvChannels, lang.code);
                          const total = ts + ln + vd + ch;
                          return (
                            <tr key={lang.code} className="border-b border-slate-100 hover:bg-slate-50 transition">
                              <td className="p-3 font-bold text-slate-700">{lang.nativeName} <span className="text-[10px] text-slate-400">({lang.name})</span></td>
                              <td className="p-3 text-center">{ts > 0 ? <span className="bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded">{ts}</span> : <span className="text-slate-300">0</span>}</td>
                              <td className="p-3 text-center">{ln > 0 ? <span className="bg-green-50 text-green-700 font-bold px-2 py-0.5 rounded">{ln}</span> : <span className="text-slate-300">0</span>}</td>
                              <td className="p-3 text-center">{vd > 0 ? <span className="bg-purple-50 text-purple-700 font-bold px-2 py-0.5 rounded">{vd}</span> : <span className="text-slate-300">0</span>}</td>
                              <td className="p-3 text-center">{ch > 0 ? <span className="bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded">{ch}</span> : <span className="text-slate-300">0</span>}</td>
                              <td className="p-3 text-center font-black text-slate-800">{total}</td>
                            </tr>
                          );
                        })}
                        <tr className="bg-slate-50 font-bold">
                          <td className="p-3 text-slate-600">TOTAL</td>
                          <td className="p-3 text-center text-slate-800">{topStories.length}</td>
                          <td className="p-3 text-center text-slate-800">{latestNews.length}</td>
                          <td className="p-3 text-center text-slate-800">{videos.length}</td>
                          <td className="p-3 text-center text-slate-800">{tvChannels.length}</td>
                          <td className="p-3 text-center text-slate-800">{topStories.length + latestNews.length + videos.length + tvChannels.length}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Single Language View */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 mb-4">
                  <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-red-500" />
                    {LANGUAGES.find(l => l.code === dashboardLangFilter)?.nativeName} ({LANGUAGES.find(l => l.code === dashboardLangFilter)?.name}) Content
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-blue-50 rounded-lg p-3 text-center">
                      <p className="text-[10px] font-bold text-blue-600 uppercase">Top Stories</p>
                      <p className="text-xl font-black text-blue-800">{countByLanguage(topStories, dashboardLangFilter)}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3 text-center">
                      <p className="text-[10px] font-bold text-green-600 uppercase">Latest News</p>
                      <p className="text-xl font-black text-green-800">{countByLanguage(latestNews, dashboardLangFilter)}</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3 text-center">
                      <p className="text-[10px] font-bold text-purple-600 uppercase">Videos</p>
                      <p className="text-xl font-black text-purple-800">{countByLanguage(videos, dashboardLangFilter)}</p>
                    </div>
                    <div className="bg-amber-50 rounded-lg p-3 text-center">
                      <p className="text-[10px] font-bold text-amber-600 uppercase">TV Channels</p>
                      <p className="text-xl font-black text-amber-800">{countByLanguage(tvChannels, dashboardLangFilter)}</p>
                    </div>
                  </div>
                </div>

                {/* Content lists for selected language */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4">
                    <h4 className="text-sm font-bold text-slate-800 mb-3">Stories</h4>
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {[...topStories, ...latestNews].filter((s: any) => s.language === dashboardLangFilter).slice(0, 20).map((story: any) => (
                        <div key={story.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg text-xs">
                          <span className="font-medium truncate flex-1">{story.title}</span>
                          <span className="text-[10px] text-slate-400 whitespace-nowrap">{story.category}</span>
                        </div>
                      ))}
                      {[...topStories, ...latestNews].filter((s: any) => s.language === dashboardLangFilter).length === 0 && (
                        <p className="text-xs text-slate-400 text-center py-4">No stories in this language</p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4">
                      <h4 className="text-sm font-bold text-slate-800 mb-3">Videos</h4>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {videos.filter((v: any) => v.language === dashboardLangFilter).slice(0, 10).map((vid: any) => (
                          <div key={vid.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg text-xs">
                            <span className="font-medium truncate flex-1">{vid.title}</span>
                          </div>
                        ))}
                        {videos.filter((v: any) => v.language === dashboardLangFilter).length === 0 && (
                          <p className="text-xs text-slate-400 text-center py-4">No videos in this language</p>
                        )}
                      </div>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4">
                      <h4 className="text-sm font-bold text-slate-800 mb-3">TV Channels</h4>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {tvChannels.filter((c: any) => c.language === dashboardLangFilter).slice(0, 10).map((ch: any) => (
                          <div key={ch.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg text-xs">
                            <span className="font-medium truncate flex-1">{ch.name}</span>
                            <span className="text-[10px] text-slate-400">{ch.type}</span>
                          </div>
                        ))}
                        {tvChannels.filter((c: any) => c.language === dashboardLangFilter).length === 0 && (
                          <p className="text-xs text-slate-400 text-center py-4">No channels in this language</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <p className="text-xs font-bold text-slate-400 uppercase">Ticker Items</p>
                <p className="text-2xl font-black text-slate-900">{ticker.length}</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <p className="text-xs font-bold text-slate-400 uppercase">Election States</p>
                <p className="text-2xl font-black text-slate-900">{electionStates.length}</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <p className="text-xs font-bold text-slate-400 uppercase">Sports</p>
                <p className="text-2xl font-black text-slate-900">{sports.length}</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <p className="text-xs font-bold text-slate-400 uppercase">Weather Cities</p>
                <p className="text-2xl font-black text-slate-900">{weatherCities.length}</p>
              </div>
            </div>
          </div>
        )}

        {/* ==================== STORIES ==================== */}
        {activeTab === "stories" && (
          <div>
            <h2 className="text-xl font-black text-slate-900 mb-4">Manage Stories</h2>
            <div className="bg-gradient-to-r from-blue-50 to-slate-50 p-4 rounded-xl border border-blue-200 shadow-xs mb-6">
              <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2"><Globe className="w-4 h-4 text-blue-600" />News Extractor</h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <input type="url" placeholder="Paste news article URL..." value={extractUrl} onChange={(e) => setExtractUrl(e.target.value)} className="flex-1 text-xs p-2 border border-blue-200 rounded-lg focus:outline-none focus:border-blue-500 bg-white" />
                <select value={extractedLang} onChange={(e) => setExtractedLang(e.target.value)} className="text-xs p-2 border border-blue-200 rounded-lg focus:outline-none focus:border-blue-500 bg-white">
                  {LANGUAGES.map(lang => (<option key={lang.code} value={lang.code}>{lang.nativeName} ({lang.name})</option>))}
                </select>
                <button onClick={handleExtract} disabled={extracting} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-lg transition flex items-center gap-1 disabled:opacity-50 whitespace-nowrap">
                  {extracting ? <><div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Extracting</> : <><Upload className="w-3 h-3" /> Extract</>}
                </button>
              </div>
              <p className="text-[10px] text-slate-500 mt-2">Select the language of the source article before extracting.</p>
              {extractedData && (
                <div className="mt-3 p-3 bg-white rounded-lg border border-blue-100 text-xs">
                  <p className="font-bold text-green-600">✅ Extracted: {extractedData.title || "Unknown title"}</p>
                  <p className="text-slate-500 mt-1">🌐 Language: {LANGUAGES.find(l => l.code === extractedLang)?.nativeName}</p>
                </div>
              )}
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs mb-6">
              <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center justify-between">
                {editingNews ? "Edit Story" : "Add New Story"}
                <div className="flex items-center gap-3">
                  {/* Featured in All toggle */}
                  <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={newsForm.featuredInAll}
                      onChange={(e) => setNewsForm({...newsForm, featuredInAll: e.target.checked})}
                      className="w-3 h-3 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                    />
                    Show in All Languages
                  </label>
                  <span className="text-[10px] font-bold text-slate-500">Primary Language:</span>
                  <select value={newsForm.language} onChange={(e) => setNewsForm({...newsForm, language: e.target.value})} className="text-xs p-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-red-500 bg-white">
                    {LANGUAGES.map(lang => (<option key={lang.code} value={lang.code}>{lang.nativeName}</option>))}
                  </select>
                </div>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input type="text" placeholder="Story title..." value={newsForm.title} onChange={(e) => setNewsForm({...newsForm, title: e.target.value})} className="text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-red-500 sm:col-span-2" />
                <select value={newsForm.category} onChange={(e) => setNewsForm({...newsForm, category: e.target.value})} className="text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-red-500">
                  {ALL_CATEGORIES.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
                </select>
                <input type="text" placeholder="Image URL..." value={newsForm.image} onChange={(e) => setNewsForm({...newsForm, image: e.target.value})} className="text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-red-500 sm:col-span-3" />
                <textarea placeholder="Full description / content..." value={newsForm.description} onChange={(e) => setNewsForm({...newsForm, description: e.target.value})} className="text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-red-500 sm:col-span-3 h-40" />
                {editingNews && (
                  <div className="sm:col-span-3 border-t border-slate-200 pt-3 mt-2">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-bold text-slate-500">Add Translation:</span>
                      <select value={translationTargetLang} onChange={(e) => setTranslationTargetLang(e.target.value)} className="text-xs p-1.5 border border-slate-200 rounded">
                        {LANGUAGES.filter(l => l.code !== newsForm.language).map(lang => (<option key={lang.code} value={lang.code}>{lang.nativeName}</option>))}
                      </select>
                      <button onClick={handleTranslateNews} disabled={isTranslatingNews || translating} className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-3 py-1 rounded transition flex items-center gap-1 disabled:opacity-50">
                        <Languages className="w-3 h-3" />{isTranslatingNews ? 'Translating...' : 'Translate'}
                      </button>
                    </div>
                    {Object.keys(newsForm.translations || {}).length > 0 && (
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Saved Translations</label>
                        <div className="flex flex-wrap gap-2 p-2 border border-green-200 rounded-lg bg-green-50">
                          {Object.keys(newsForm.translations).map((code) => {
                            const lang = LANGUAGES.find(l => l.code === code);
                            return (
                              <div key={code} className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-green-300">
                                <span className="text-xs font-bold">{lang?.nativeName || code}</span>
                                <button onClick={() => openTranslationEditor(code)} className="text-blue-500 hover:text-blue-700 text-[10px]" title="Edit"><Edit2 className="w-3 h-3" /></button>
                                <button onClick={() => removeTranslation('story', code)} className="text-red-500 hover:text-red-700 text-[10px]" title="Remove"><X className="w-3 h-3" /></button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <div className="flex gap-2 sm:col-span-3">
                  <select value={newsType} onChange={(e) => setNewsType(e.target.value)} className="text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-red-500">
                    <option value="latest">Latest News</option><option value="top">Top Stories</option>
                  </select>
                  {editingNews ? (
                    <><button onClick={handleUpdateNews} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-lg transition flex items-center gap-1"><Save className="w-3 h-3" /> Update</button>
                    <button onClick={resetNewsForm} className="bg-slate-600 hover:bg-slate-700 text-white font-bold text-xs px-4 py-2 rounded-lg transition">Cancel</button></>
                  ) : (
                    <button onClick={handleAddNews} className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2 rounded-lg transition flex items-center gap-1"><Plus className="w-3 h-3" /> Add Story</button>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs mb-4">
              <h3 className="text-sm font-bold text-slate-800 mb-3">Top Stories ({topStories.length})</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {topStories.map((story) => (
                  <div key={story.id} className="flex items-center justify-between p-2 bg-slate-50 border border-slate-100 rounded-lg text-xs">
                    <span className="font-medium flex-1 truncate">{story.title}</span>
                    <span className="text-slate-400 mx-2 hidden sm:inline">{story.category}</span>
                    <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded mr-1">{LANGUAGES.find(l => l.code === story.language)?.nativeName || story.language || 'en'}</span>
                    {story.featuredInAll && <span className="text-[8px] font-bold text-amber-500 mr-1">⭐</span>}
                    {story.translations && Object.keys(story.translations).length > 0 && <span className="text-[8px] font-bold text-green-500 mr-2">+{Object.keys(story.translations).length}</span>}
                    <div className="flex gap-1">
                      <button onClick={() => handleEditNews(story, "top")} className="text-blue-500 hover:text-blue-700"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDeleteNews(story.id, "top")} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <h3 className="text-sm font-bold text-slate-800 mb-3">Latest News ({latestNews.length})</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {latestNews.map((story) => (
                  <div key={story.id} className="flex items-center justify-between p-2 bg-slate-50 border border-slate-100 rounded-lg text-xs">
                    <span className="font-medium flex-1 truncate">{story.title}</span>
                    <span className="text-slate-400 mx-2 hidden sm:inline">{story.category}</span>
                    <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded mr-1">{LANGUAGES.find(l => l.code === story.language)?.nativeName || story.language || 'en'}</span>
                    {story.featuredInAll && <span className="text-[8px] font-bold text-amber-500 mr-1">⭐</span>}
                    {story.translations && Object.keys(story.translations).length > 0 && <span className="text-[8px] font-bold text-green-500 mr-2">+{Object.keys(story.translations).length}</span>}
                    <div className="flex gap-1">
                      <button onClick={() => handleEditNews(story, "latest")} className="text-blue-500 hover:text-blue-700"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDeleteNews(story.id, "latest")} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================== VIDEOS ==================== */}
        {activeTab === "videos" && (
          <div>
            <h2 className="text-xl font-black text-slate-900 mb-4">Manage Videos</h2>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs mb-6">
              <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center justify-between">
                {editingVideo ? "Edit Video" : "Add New Video"}
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={videoForm.featuredInAll}
                      onChange={(e) => setVideoForm({...videoForm, featuredInAll: e.target.checked})}
                      className="w-3 h-3 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                    />
                    Show in All Languages
                  </label>
                  <span className="text-[10px] font-bold text-slate-500">Language:</span>
                  <select value={videoForm.language} onChange={(e) => setVideoForm({...videoForm, language: e.target.value})} className="text-xs p-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-red-500 bg-white">
                    {LANGUAGES.map(lang => (<option key={lang.code} value={lang.code}>{lang.nativeName}</option>))}
                  </select>
                </div>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 flex gap-2">
                  <input type="text" placeholder="Video Link..." value={videoForm.link} onChange={(e) => setVideoForm({...videoForm, link: e.target.value})} className="flex-1 text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-red-500" />
                  <button onClick={extractVideoTitle} disabled={videoExtractLoading || !videoForm.link.trim()} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3 py-2 rounded-lg transition flex items-center gap-1 whitespace-nowrap disabled:opacity-50"><Video className="w-3 h-3" />{videoExtractLoading ? '...' : 'Extract Title'}</button>
                </div>
                <input type="text" placeholder="Video title..." value={videoForm.title} onChange={(e) => setVideoForm({...videoForm, title: e.target.value})} className="text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-red-500" />
                <input type="text" placeholder="Image URL (optional)" value={videoForm.img} onChange={(e) => setVideoForm({...videoForm, img: e.target.value})} className="text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-red-500 sm:col-span-2" />
                <select value={videoForm.category} onChange={(e) => setVideoForm({...videoForm, category: e.target.value})} className="text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-red-500">
                  {ALL_CATEGORIES.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
                </select>
                <div className="sm:col-span-3 flex gap-2">
                  {editingVideo ? (
                    <><button onClick={handleUpdateVideo} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-lg transition flex items-center gap-1"><Save className="w-3 h-3" /> Update</button>
                    <button onClick={resetVideoForm} className="bg-slate-600 hover:bg-slate-700 text-white font-bold text-xs px-4 py-2 rounded-lg transition">Cancel</button></>
                  ) : (
                    <button onClick={handleAddVideo} className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2 rounded-lg transition flex items-center gap-1"><Plus className="w-3 h-3" /> Add Video</button>
                  )}
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <h3 className="text-sm font-bold text-slate-800 mb-3">Videos ({videos.length})</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {videos.map((video) => (
                  <div key={video.id} className="flex flex-col gap-2 p-3 bg-slate-50 border border-slate-100 rounded-lg">
                    <img src={video.img} alt={video.title} className="w-full h-24 object-cover rounded-lg" />
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-medium line-clamp-1 flex-1">{video.title}</span>
                      {video.featuredInAll && <span className="text-[10px]" title="Featured in All Languages">⭐</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-bold text-slate-400 uppercase">{video.category || "Latest"}</span>
                      <span className="text-[9px] font-bold text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded">{LANGUAGES.find(l => l.code === video.language)?.nativeName || video.language || 'en'}</span>
                    </div>
                    <div className="flex gap-1 justify-end">
                      <button onClick={() => handleEditVideo(video)} className="text-blue-500 hover:text-blue-700"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDeleteVideo(video.id)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================== SPORTS ==================== */}
        {activeTab === "sports" && (
          <div>
            <h2 className="text-xl font-black text-slate-900 mb-4">Manage Sports Scores</h2>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs mb-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-800">Sport Entries</h3>
                <div className="flex gap-2">
                  <button onClick={addSport} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition flex items-center gap-1"><Plus className="w-3 h-3" /> Add Sport</button>
                  <button onClick={saveSports} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1 rounded-lg transition flex items-center gap-1"><Save className="w-3 h-3" /> Save All</button>
                </div>
              </div>
              {sports.map((sport, idx) => (
                <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-lg mb-3">
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                    <div><label className="block text-[8px] font-black text-slate-500 uppercase">Sport</label><input type="text" value={sport.sport || ""} onChange={(e) => updateSport(idx, 'sport', e.target.value)} className="w-full text-xs p-1 border border-slate-200 rounded" /></div>
                    <div><label className="block text-[8px] font-black text-slate-500 uppercase">Match</label><input type="text" value={sport.match || ""} onChange={(e) => updateSport(idx, 'match', e.target.value)} className="w-full text-xs p-1 border border-slate-200 rounded" /></div>
                    <div><label className="block text-[8px] font-black text-slate-500 uppercase">Score</label><input type="text" value={sport.score || ""} onChange={(e) => updateSport(idx, 'score', e.target.value)} className="w-full text-xs p-1 border border-slate-200 rounded" /></div>
                    <div><label className="block text-[8px] font-black text-slate-500 uppercase">Detail</label><input type="text" value={sport.detail || ""} onChange={(e) => updateSport(idx, 'detail', e.target.value)} className="w-full text-xs p-1 border border-slate-200 rounded" /></div>
                    <div className="flex flex-col items-center justify-center">
                      <label className="block text-[8px] font-black text-slate-500 uppercase">Show</label>
                      <button onClick={() => toggleSportShow(idx)} className={`px-3 py-1 rounded text-xs font-bold transition ${sport.show !== false ? "bg-emerald-600 text-white" : "bg-slate-300 text-slate-600"}`}>{sport.show !== false ? "ON" : "OFF"}</button>
                    </div>
                  </div>
                  <button onClick={() => removeSport(idx)} className="mt-2 text-red-500 hover:text-red-700 text-xs font-bold flex items-center gap-1"><Trash2 className="w-3 h-3" /> Remove</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== MARKET ==================== */}
        {activeTab === "market" && (
          <div>
            <h2 className="text-xl font-black text-slate-900 mb-4">Market Data</h2>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex justify-between items-center mb-4">
                <p className="text-xs text-slate-500">Manual entry or auto-fetch</p>
                <button onClick={autoFetchMarket} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition flex items-center gap-1 disabled:opacity-50"><Radio className="w-3 h-3" /> Fetch Live</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Sensex Price</label><input type="text" value={market.sensex || ""} onChange={(e) => setMarketState({...market, sensex: e.target.value})} className="w-full text-sm p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-red-500" /></div>
                <div><label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Sensex Change</label><input type="text" value={market.sensexChange || ""} onChange={(e) => setMarketState({...market, sensexChange: e.target.value})} className="w-full text-sm p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-red-500" /></div>
                <div><label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Nifty 50 Price</label><input type="text" value={market.nifty || ""} onChange={(e) => setMarketState({...market, nifty: e.target.value})} className="w-full text-sm p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-red-500" /></div>
                <div><label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Nifty Change</label><input type="text" value={market.niftyChange || ""} onChange={(e) => setMarketState({...market, niftyChange: e.target.value})} className="w-full text-sm p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-red-500" /></div>
                <div><label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">USD/INR</label><input type="text" value={market.usdInr} onChange={(e) => setMarketState({...market, usdInr: e.target.value})} className="w-full text-sm p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-red-500" /></div>
                <div><label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">USD Change</label><input type="text" value={market.usdInrChange} onChange={(e) => setMarketState({...market, usdInrChange: e.target.value})} className="w-full text-sm p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-red-500" /></div>
                <div><label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Gold Rate</label><input type="text" value={market.goldRate} onChange={(e) => setMarketState({...market, goldRate: e.target.value})} className="w-full text-sm p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-red-500" /></div>
                <div><label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Gold Change</label><input type="text" value={market.goldChange} onChange={(e) => setMarketState({...market, goldChange: e.target.value})} className="w-full text-sm p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-red-500" /></div>
              </div>
              <button onClick={saveMarket} className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-lg transition flex items-center gap-1"><Save className="w-3 h-3" /> Save Market Data</button>
            </div>
          </div>
        )}

        {/* ==================== WEATHER ==================== */}
        {activeTab === "weather" && (
          <div>
            <h2 className="text-xl font-black text-slate-900 mb-4">Weather Data</h2>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex justify-between items-center mb-4">
                <p className="text-xs text-slate-500">Manage weather for multiple cities.</p>
                <button onClick={autoFetchWeather} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition flex items-center gap-1 disabled:opacity-50"><Radio className="w-3 h-3" /> Fetch Live</button>
              </div>
              <div className="border-b border-slate-200 pb-4 mb-4">
                <h3 className="text-sm font-bold text-slate-800 mb-3">Default City</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div><label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Temperature</label><input type="text" value={weather.temp} onChange={(e) => setWeatherState({...weather, temp: e.target.value})} className="w-full text-sm p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-red-500" /></div>
                  <div><label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">City</label><input type="text" value={weather.city} onChange={(e) => setWeatherState({...weather, city: e.target.value})} className="w-full text-sm p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-red-500" /></div>
                  <div><label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Condition</label><input type="text" value={weather.condition} onChange={(e) => setWeatherState({...weather, condition: e.target.value})} className="w-full text-sm p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-red-500" /></div>
                </div>
                <button onClick={saveWeather} className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-lg transition flex items-center gap-1"><Save className="w-3 h-3" /> Save Default City</button>
              </div>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-slate-800">City-wise Weather</h3>
                  <div className="flex gap-2">
                    <button onClick={addCity} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition flex items-center gap-1"><Plus className="w-3 h-3" /> Add City</button>
                    <button onClick={saveCities} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1 rounded-lg transition flex items-center gap-1"><Save className="w-3 h-3" /> Save Cities</button>
                  </div>
                </div>
                {weatherCities.map((city, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-2 bg-slate-50 border border-slate-100 rounded-lg mb-2">
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input type="text" placeholder="City name" value={city.city || ""} onChange={(e) => updateCity(idx, 'city', e.target.value)} className="text-xs p-1 border border-slate-200 rounded" />
                      <input type="text" placeholder="Temperature" value={city.temp || ""} onChange={(e) => updateCity(idx, 'temp', e.target.value)} className="text-xs p-1 border border-slate-200 rounded" />
                      <input type="text" placeholder="Condition" value={city.condition || ""} onChange={(e) => updateCity(idx, 'condition', e.target.value)} className="text-xs p-1 border border-slate-200 rounded" />
                    </div>
                    <button onClick={() => removeCity(idx)} className="text-red-500 hover:text-red-700 text-xs"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================== ELECTION (PER‑STATE PARTIES) ==================== */}
        {activeTab === "election" && (
          <div>
            <h2 className="text-xl font-black text-slate-900 mb-4">Election Data</h2>
            <p className="text-xs text-slate-500 mb-4">
              Each state has its own independent party list. Parties can be added, removed, or renamed per state.
            </p>

            {/* Visibility Toggle */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs mb-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-slate-700">Show Election Section:</label>
                  <button onClick={toggleElectionVisibility} className={`px-3 py-1 rounded-lg text-xs font-bold transition ${electionVisible ? "bg-emerald-600 text-white" : "bg-slate-300 text-slate-600"}`}>
                    {electionVisible ? "ON" : "OFF"}
                  </button>
                </div>
                {!electionVisible && (
                  <div className="flex-1 flex items-center gap-2">
                    <input type="text" placeholder="No election message..." value={noElectionMessage} onChange={(e) => setNoElectionMessageState(e.target.value)} className="flex-1 text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-red-500" />
                    <button onClick={saveNoElectionMessage} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-2 rounded-lg transition">Save Message</button>
                  </div>
                )}
                <button onClick={autoFetchElection} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition flex items-center gap-1 disabled:opacity-50">
                  <Radio className="w-3 h-3" /> Fetch Live
                </button>
              </div>
            </div>

            {/* Election Config */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs mb-4">
              <h3 className="text-sm font-bold text-slate-800 mb-3">Election Settings</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Title</label>
                  <input type="text" value={electionConfig.title} onChange={(e) => setElectionConfigState({...electionConfig, title: e.target.value})} className="w-full text-sm p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-red-500" placeholder="e.g., Election Center 2026" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Map Title</label>
                  <input type="text" value={electionConfig.liveMapTitle} onChange={(e) => setElectionConfigState({...electionConfig, liveMapTitle: e.target.value})} className="w-full text-sm p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-red-500" placeholder="e.g., Live Results Map" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Default Total Seats</label>
                  <input type="number" value={electionConfig.totalSeats} onChange={(e) => setElectionConfigState({...electionConfig, totalSeats: Number(e.target.value)})} className="w-full text-sm p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-red-500" placeholder="e.g., 403" />
                </div>
              </div>
              <button onClick={saveElectionConfig} className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-lg transition flex items-center gap-1"><Save className="w-3 h-3" /> Save Config</button>
            </div>

            {/* State-wise Management with Per‑State Parties */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-800">State-wise Management</h3>
                <div className="flex gap-2">
                  <button onClick={addElectionState} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition flex items-center gap-1"><Plus className="w-3 h-3" /> Add State</button>
                  <button onClick={saveElectionStates} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1 rounded-lg transition flex items-center gap-1"><Save className="w-3 h-3" /> Save All States</button>
                </div>
              </div>

              <div className="space-y-6 max-h-[600px] overflow-y-auto">
                {electionStates.map((state, stateIdx) => {
                  const totalSeats = state.totalSeats || electionConfig.totalSeats || 0;
                  return (
                    <div key={stateIdx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                      {/* State Header */}
                      <div className="flex items-center gap-3 mb-4">
                        <input 
                          type="text" 
                          value={state.name || ""} 
                          onChange={(e) => updateElectionStateField(stateIdx, 'name', e.target.value)} 
                          className="text-sm font-black p-2 border border-slate-300 rounded-lg focus:outline-none focus:border-red-500 flex-1" 
                          placeholder="State name (e.g., Uttar Pradesh)" 
                        />
                        <div className="flex items-center gap-2">
                          <label className="text-[10px] font-bold text-slate-500">Total Seats:</label>
                          <input 
                            type="number" 
                            value={state.totalSeats || 0} 
                            onChange={(e) => updateElectionStateField(stateIdx, 'totalSeats', Number(e.target.value))} 
                            className="text-xs font-bold p-2 border border-slate-300 rounded-lg w-20 text-center focus:outline-none focus:border-red-500" 
                            placeholder="Total"
                          />
                        </div>
                        <button 
                          onClick={() => removeElectionState(stateIdx)} 
                          className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition"
                          title="Remove state"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Per‑State Party Management */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Parties &amp; Seats</label>
                          <button 
                            onClick={() => addPartyToState(stateIdx)}
                            className="text-blue-600 hover:text-blue-700 text-[10px] font-bold flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" /> Add Party
                          </button>
                        </div>
                        <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(auto-fill, minmax(120px, 1fr))` }}>
                          {state.parties.map((party, partyIdx) => {
                            const seats = state[party.key] || 0;
                            return (
                              <div key={party.key} className="bg-white border border-slate-200 rounded-lg p-3">
                                <div className="flex items-center justify-between mb-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: fillColorMap[party.color] || '#94a3b8' }}></span>
                                    <input 
                                      type="text" 
                                      value={party.name} 
                                      onChange={(e) => updatePartyInState(stateIdx, partyIdx, 'name', e.target.value)}
                                      className="text-[10px] font-bold p-0.5 border border-slate-200 rounded w-14 focus:outline-none focus:border-red-500 bg-transparent"
                                    />
                                  </div>
                                  {state.parties.length > 1 && (
                                    <button 
                                      onClick={() => removePartyFromState(stateIdx, partyIdx)}
                                      className="text-red-500 hover:text-red-700"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                                <input 
                                  type="number" 
                                  value={seats} 
                                  onChange={(e) => updateElectionStateSeat(stateIdx, party.key, Number(e.target.value))}
                                  className="w-full text-lg font-black text-center p-1 border border-slate-200 rounded focus:outline-none focus:border-red-500" 
                                  min="0"
                                />
                                <select
                                  value={party.color}
                                  onChange={(e) => updatePartyInState(stateIdx, partyIdx, 'color', e.target.value)}
                                  className="text-[8px] w-full mt-1 p-0.5 border border-slate-200 rounded"
                                >
                                  <option value="orange">🟠 Orange</option>
                                  <option value="red">🔴 Red</option>
                                  <option value="sky">🔵 Sky</option>
                                  <option value="slate">⚫ Slate</option>
                                  <option value="green">🟢 Green</option>
                                  <option value="purple">🟣 Purple</option>
                                  <option value="yellow">🟡 Yellow</option>
                                  <option value="pink">🌸 Pink</option>
                                  <option value="blue">💙 Blue</option>
                                </select>
                                <div className="text-[9px] font-bold text-slate-400 mt-1 text-center">
                                  {totalSeats > 0 ? ((seats / totalSeats) * 100).toFixed(1) : 0}%
                                </div>
                                <div className="mt-1">
                                  <input 
                                    type="text" 
                                    value={party.key} 
                                    onChange={(e) => updatePartyInState(stateIdx, partyIdx, 'key', e.target.value)}
                                    className="text-[8px] w-full p-0.5 border border-slate-200 rounded text-slate-400 bg-slate-50 focus:outline-none focus:border-red-500"
                                    placeholder="key"
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* State Notes */}
                      <div className="mb-3">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">State Notes</label>
                        <textarea 
                          value={state.notes || ""} 
                          onChange={(e) => updateElectionStateField(stateIdx, 'notes', e.target.value)} 
                          className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:outline-none focus:border-red-500 h-16" 
                          placeholder="Add notes about this state (e.g., Key battleground regions, historical context...)"
                        />
                      </div>

                      {/* External Links */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase">Reference Links</label>
                          <button 
                            onClick={() => addLinkToState(stateIdx)}
                            className="text-blue-600 hover:text-blue-700 text-[10px] font-bold flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" /> Add Link
                          </button>
                        </div>
                        {(state.links || []).map((link: any, linkIdx: number) => (
                          <div key={linkIdx} className="flex items-center gap-2 mb-2">
                            <input 
                              type="text" 
                              value={link.title || ""} 
                              onChange={(e) => updateStateLink(stateIdx, linkIdx, 'title', e.target.value)}
                              className="flex-1 text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-red-500" 
                              placeholder="Link title (e.g., Official Results)" 
                            />
                            <input 
                              type="text" 
                              value={link.url || ""} 
                              onChange={(e) => updateStateLink(stateIdx, linkIdx, 'url', e.target.value)}
                              className="flex-1 text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-red-500" 
                              placeholder="URL (https://...)" 
                            />
                            <button 
                              onClick={() => removeStateLink(stateIdx, linkIdx)}
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        {(state.links || []).length === 0 && (
                          <p className="text-[10px] text-slate-400">No reference links added for this state.</p>
                        )}
                      </div>
                    </div>
                  );
                })}
                
                {electionStates.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-sm text-slate-400">No states added yet.</p>
                    <button onClick={addElectionState} className="mt-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-lg transition flex items-center gap-1 mx-auto"><Plus className="w-3 h-3" /> Add First State</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==================== TICKER ==================== */}
        {activeTab === "ticker" && (
          <div>
            <h2 className="text-xl font-black text-slate-900 mb-4">Manage Ticker Items</h2>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs mb-6">
              <h3 className="text-sm font-bold text-slate-800 mb-3">Add Ticker</h3>
              <div className="flex gap-3">
                <input type="text" placeholder="Ticker text..." value={newTickerText} onChange={(e) => setNewTickerText(e.target.value)} className="flex-1 text-xs p-2 border border-slate-200 rounded-lg" />
                <button onClick={handleAddTicker} className="bg-red-600 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1"><Plus className="w-3 h-3" /> Add</button>
              </div>
            </div>
            {editingTicker && (
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs mb-6">
                <h3 className="text-sm font-bold text-slate-800 mb-3">Edit: {editingTicker.text}</h3>
                <div className="space-y-4">
                  <div><label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Text</label><input type="text" value={tickerForm.text} onChange={(e) => setTickerForm({...tickerForm, text: e.target.value})} className="w-full text-xs p-2 border border-slate-200 rounded-lg" /></div>
                  <div><label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Active</label><button onClick={() => setTickerForm({...tickerForm, active: !tickerForm.active})} className={`px-3 py-1 rounded text-xs font-bold ${tickerForm.active ? "bg-emerald-600 text-white" : "bg-slate-300 text-slate-600"}`}>{tickerForm.active ? "ON" : "OFF"}</button></div>
                  <div className="border-t pt-3">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Filter Content</label>
                    <div className="flex gap-3 mb-3">
                      <select value={tickerLinkLang} onChange={(e) => setTickerLinkLang(e.target.value)} className="text-xs p-2 border border-slate-200 rounded-lg"><option value="">All Languages</option>{LANGUAGES.map(l => (<option key={l.code} value={l.code}>{l.nativeName}</option>))}</select>
                      <select value={tickerLinkCat} onChange={(e) => setTickerLinkCat(e.target.value)} className="text-xs p-2 border border-slate-200 rounded-lg"><option value="">All Categories</option>{ALL_CATEGORIES.map(c => (<option key={c} value={c}>{c}</option>))}</select>
                    </div>
                  </div>
                  {['stories','latest','videos'].map(type => (
                    <div key={type}>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Linked {type === 'stories' ? 'Top Stories' : type === 'latest' ? 'Latest News' : 'Videos'}</label>
                      <div className="flex flex-wrap gap-2 p-2 border border-slate-200 rounded-lg max-h-40 overflow-y-auto">
                        {(type === 'stories' ? getFilteredTopStories() : type === 'latest' ? getFilteredLatestNews() : getFilteredVideos()).map((item: any) => (
                          <button key={item.id} onClick={() => toggleLinkedItem(type as 'stories'|'latest'|'videos', item.id)} className={`text-xs px-3 py-1 rounded-full transition ${tickerForm[type === 'stories' ? 'linkedStories' : type === 'latest' ? 'linkedLatest' : 'linkedVideos'].includes(item.id) ? "bg-red-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                            {item.title?.substring(0,25)}{item.title?.length > 25 ? '...' : ''}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <button onClick={handleUpdateTicker} className="bg-emerald-600 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1"><Save className="w-3 h-3" /> Update</button>
                    <button onClick={resetTickerForm} className="bg-slate-600 text-white font-bold text-xs px-4 py-2 rounded-lg">Cancel</button>
                  </div>
                </div>
              </div>
            )}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <h3 className="text-sm font-bold text-slate-800 mb-3">Ticker Items ({ticker.length})</h3>
              <div className="flex flex-wrap gap-2">
                {ticker.map((item) => (
                  <div key={item.id} className="flex items-center gap-1 bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5 text-xs">
                    <span className={item.active === false ? 'text-slate-400 line-through' : ''}>{item.text}</span>
                    {item.linkedStories?.length > 0 && <span className="text-[8px] font-bold text-blue-500 bg-blue-50 px-1 rounded">📰{item.linkedStories.length}</span>}
                    <button onClick={() => handleEditTicker(item)} className="text-blue-500 ml-1"><Edit2 className="w-3 h-3" /></button>
                    <button onClick={() => handleDeleteTicker(item.id)} className="text-red-500"><Trash2 className="w-3 h-3" /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================== TV CHANNELS ==================== */}
        {activeTab === "tv" && (
          <div>
            <h2 className="text-xl font-black text-slate-900 mb-4">TV Channels</h2>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs mb-6">
              <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center justify-between">
                {editingChannel ? "Edit Channel" : "Add TV Channel"}
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={channelForm.featuredInAll}
                      onChange={(e) => setChannelForm({...channelForm, featuredInAll: e.target.checked})}
                      className="w-3 h-3 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                    />
                    Show in All Languages
                  </label>
                  <span className="text-[10px] font-bold text-slate-500">Language:</span>
                  <select value={channelForm.language} onChange={(e) => setChannelForm({...channelForm, language: e.target.value})} className="text-xs p-1.5 border border-slate-200 rounded-lg bg-white">
                    {LANGUAGES.map(lang => (<option key={lang.code} value={lang.code}>{lang.nativeName}</option>))}
                  </select>
                </div>
              </h3>
              <div className="grid grid-cols-1 gap-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input type="text" placeholder="Channel name..." value={channelForm.name} onChange={(e) => setChannelForm({...channelForm, name: e.target.value})} className="text-xs p-2 border border-slate-200 rounded-lg" />
                  <input type="text" placeholder="Logo URL..." value={channelForm.logo} onChange={(e) => setChannelForm({...channelForm, logo: e.target.value})} className="text-xs p-2 border border-slate-200 rounded-lg" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Stream URLs</label>
                  {channelForm.urls.map((url, i) => (
                    <div key={i} className="flex items-center gap-2 mb-2">
                      <input type="text" placeholder={`URL ${i + 1}...`} value={url} onChange={(e) => updateChannelUrl(i, e.target.value)} className="flex-1 text-xs p-2 border border-slate-200 rounded-lg" />
                      {i === 0 && <span className="text-[8px] font-bold text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded">Primary</span>}
                      {channelForm.urls.length > 1 && <button onClick={() => removeChannelUrl(i)} className="text-red-500"><MinusCircle className="w-4 h-4" /></button>}
                    </div>
                  ))}
                  <button onClick={addChannelUrl} className="text-blue-600 text-xs font-bold flex items-center gap-1 mt-1"><PlusCircle className="w-3 h-3" /> Add Backup URL</button>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Type (auto-detected)</label>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${channelForm.type === 'youtube' ? 'bg-red-100 text-red-700' : channelForm.type === 'hls' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                    {channelForm.type === 'youtube' ? '🎬 YouTube' : channelForm.type === 'hls' ? '📡 HLS' : '🌐 Iframe'}
                  </span>
                </div>
                <div className="flex gap-2">
                  {editingChannel ? (
                    <><button onClick={handleUpdateChannel} className="bg-emerald-600 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1"><Save className="w-3 h-3" /> Update</button>
                    <button onClick={resetChannelForm} className="bg-slate-600 text-white font-bold text-xs px-4 py-2 rounded-lg">Cancel</button></>
                  ) : (
                    <button onClick={handleAddChannel} className="bg-red-600 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1"><Plus className="w-3 h-3" /> Add Channel</button>
                  )}
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <h3 className="text-sm font-bold text-slate-800 mb-3">Channels ({tvChannels.length})</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {tvChannels.map((channel) => (
                  <div key={channel.id} className="flex flex-col items-center p-3 bg-slate-50 border border-slate-100 rounded-lg">
                    {channel.logo?.startsWith('http') ? <img src={channel.logo} alt={channel.name} className="w-14 h-14 rounded-full object-cover border-2 border-slate-200" /> : <div className="w-14 h-14 bg-slate-200 rounded-full flex items-center justify-center font-black text-sm">{channel.logo || channel.name?.substring(0,2).toUpperCase()}</div>}
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-xs font-medium text-center">{channel.name}</span>
                      {channel.featuredInAll && <span className="text-[10px]">⭐</span>}
                    </div>
                    <span className="text-[9px] font-bold text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded mt-1">{LANGUAGES.find(l => l.code === channel.language)?.nativeName || channel.language || 'en'}</span>
                    <span className="text-[8px] text-slate-400 uppercase">{channel.type}</span>
                    {channel.urls?.length > 1 && <span className="text-[8px] font-bold text-amber-500">🔗 +{channel.urls.length - 1}</span>}
                    <div className="flex gap-1 mt-1">
                      <button onClick={() => handleEditChannel(channel)} className="text-blue-500"><Edit2 className="w-3 h-3" /></button>
                      <button onClick={() => handleDeleteChannel(channel.id)} className="text-red-500"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================== FOOTER ==================== */}
        {activeTab === "footer" && (
          <div>
            <h2 className="text-xl font-black text-slate-900 mb-4">Footer Settings</h2>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs mb-6">
              <h3 className="text-sm font-bold text-slate-800 mb-3">Description</h3>
              <div><label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Footer Description</label><textarea value={footerDesc} onChange={(e) => setFooterDesc(e.target.value)} className="w-full text-sm p-2 border border-slate-200 rounded-lg h-24" /></div>
              <button onClick={saveFooter} className="mt-4 bg-emerald-600 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1"><Save className="w-3 h-3" /> Save</button>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-800">Social Media Links</h3>
                <button onClick={addSocialLink} className="bg-blue-600 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1"><Plus className="w-3 h-3" /> Add Link</button>
              </div>
              {socialLinks.map((link, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2 bg-slate-50 border border-slate-100 rounded-lg mb-2">
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input type="text" placeholder="Platform name" value={link.platform} onChange={(e) => updateSocialLink(idx, 'platform', e.target.value)} className="text-xs p-2 border border-slate-200 rounded-lg" />
                    <input type="text" placeholder="URL" value={link.url} onChange={(e) => updateSocialLink(idx, 'url', e.target.value)} className="text-xs p-2 border border-slate-200 rounded-lg" />
                  </div>
                  <button onClick={() => removeSocialLink(idx)} className="text-red-500"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
              <button onClick={saveSocialLinks} className="mt-4 bg-emerald-600 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1"><Save className="w-3 h-3" /> Save Links</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}