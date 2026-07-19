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
  saveToWorker,
} from "@/app/lib/dataService";
import { useTheme } from "@/app/context/ThemeContext";

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

interface ElectionState {
  name: string;
  totalSeats?: number;
  notes?: string;
  links?: { title: string; url: string }[];
  parties: { key: string; name: string; color: string }[];
  [key: string]: any;
}

export default function AdminPanel() {
  const { isDark } = useTheme();
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

  const [dashboardLangFilter, setDashboardLangFilter] = useState("all");

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

  const fillColorMap: Record<string, string> = {
    orange: "#f97316", red: "#dc2626", sky: "#0ea5e9", slate: "#64748b",
    green: "#10b981", purple: "#8b5cf6", yellow: "#eab308", pink: "#ec4899", blue: "#3b82f6",
  };

  // Dark mode colors
  const darkBg = '#1a1a1a';
  const darkCardBg = '#242424';
  const darkBorder = '#333333';
  const darkText = '#e8e8e8';
  const darkTextSecondary = '#a0a0a0';
  const darkTextMuted = '#888888';
  const darkHover = '#2d2d2d';

  useEffect(() => {
    if (isAuthenticated) {
      loadAllData();
    }
  }, [isAuthenticated]);

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

      let loadedStates = electStates || [];
      loadedStates = loadedStates.map((state: any) => {
        if (!state.parties || !Array.isArray(state.parties) || state.parties.length === 0) {
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
    if (username === "admin" && password === "kalavathi devi") {
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
    const success = await saveToWorker(section, data);
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

  const updateElectionStateSeat = (stateIndex: number, partyKey: string, value: number) => {
    const updated = [...electionStates];
    updated[stateIndex][partyKey] = value;
    setElectionStatesState(updated);
  };

  const updateElectionStateField = (stateIndex: number, field: string, value: any) => {
    const updated = [...electionStates];
    updated[stateIndex][field] = value;
    setElectionStatesState(updated);
  };

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

  const removePartyFromState = (stateIndex: number, partyIndex: number) => {
    const state = electionStates[stateIndex];
    if (state.parties.length <= 1) {
      showMessage("Each state must have at least one party.");
      return;
    }
    const removed = state.parties[partyIndex];
    if (!confirm(`Remove "${removed.name}" from ${state.name}?`)) return;
    const updated = [...electionStates];
    updated[stateIndex].parties = updated[stateIndex].parties.filter((_, i) => i !== partyIndex);
    delete updated[stateIndex][removed.key];
    setElectionStatesState(updated);
    showMessage(`Party "${removed.name}" removed from ${state.name}.`);
  };

  const updatePartyInState = (stateIndex: number, partyIndex: number, field: 'key' | 'name' | 'color', value: string) => {
    const updated = [...electionStates];
    const party = updated[stateIndex].parties[partyIndex];
    if (field === 'key') {
      const newKey = value.trim().toLowerCase().replace(/\s+/g, '_');
      if (newKey && newKey !== party.key) {
        if (updated[stateIndex].parties.some(p => p.key === newKey)) {
          showMessage(`Party key "${newKey}" already exists in this state.`);
          return;
        }
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
      <div className="min-h-screen flex flex-col justify-center items-center px-4 transition-colors duration-300" style={{ backgroundColor: isDark ? darkBg : '#f8fafc', color: isDark ? darkText : '#0f172a' }}>
        <form onSubmit={handleLogin} className="w-full max-w-md rounded-2xl p-8 shadow-2xl space-y-4 border transition-colors duration-300" style={{ backgroundColor: isDark ? darkCardBg : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0' }}>
          <div className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 rounded-xl flex items-center justify-center mb-2" style={{ backgroundColor: isDark ? '#2d2d2d' : '#fef2f2', borderColor: isDark ? darkBorder : '#fca5a5' }}>
              <Lock className="w-5 h-5" style={{ color: isDark ? '#f87171' : '#dc2626' }} />
            </div>
            <h1 className="text-xl font-black tracking-tight transition-colors duration-300" style={{ color: isDark ? darkText : '#0f172a' }}>UNSUNG Network CMS</h1>
            <p className="text-xs transition-colors duration-300" style={{ color: isDark ? darkTextMuted : '#64748b' }}>Complete Content Management System</p>
          </div>
          <div>
            <label className="block text-[10px] font-bold tracking-wider uppercase mb-1 transition-colors duration-300" style={{ color: isDark ? darkTextMuted : '#64748b' }}>User ID</label>
            <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full text-xs p-3 rounded-lg border focus:outline-none focus:border-red-600 transition-colors duration-300" style={{ backgroundColor: isDark ? '#2d2d2d' : '#f8fafc', borderColor: isDark ? darkBorder : '#e2e8f0', color: isDark ? darkText : '#0f172a' }} required />
          </div>
          <div>
            <label className="block text-[10px] font-bold tracking-wider uppercase mb-1 transition-colors duration-300" style={{ color: isDark ? darkTextMuted : '#64748b' }}>Access Password</label>
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full text-xs p-3 rounded-lg border focus:outline-none focus:border-red-600 transition-colors duration-300" style={{ backgroundColor: isDark ? '#2d2d2d' : '#f8fafc', borderColor: isDark ? darkBorder : '#e2e8f0', color: isDark ? darkText : '#0f172a' }} required />
          </div>
          {authError && <p className="text-[11px] font-bold text-rose-500 text-center py-2 rounded-md" style={{ backgroundColor: isDark ? '#2d2d2d' : '#fef2f2' }}>{authError}</p>}
          <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs h-11 rounded-lg transition cursor-pointer">Unlock Full Terminal</button>
        </form>
        <Link href="/" className="text-xs font-bold mt-6 flex items-center gap-1 transition-colors duration-300" style={{ color: isDark ? darkTextMuted : '#64748b' }}><ArrowLeft className="w-3 h-3" /> Cancel and Go Home</Link>
      </div>
    );
  }

  // ============ ADMIN PANEL ============
  return (
    <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: isDark ? darkBg : '#f8fafc', color: isDark ? darkText : '#0f172a' }}>
      {/* TOP HEADER */}
      <div className="sticky top-0 z-50 shadow-lg transition-colors duration-300" style={{ backgroundColor: isDark ? '#1e1e1e' : '#0f172a', color: isDark ? darkText : '#ffffff' }}>
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center font-black text-sm text-white">UN</div>
            <div>
              <h1 className="text-sm font-black tracking-tight" style={{ color: isDark ? darkText : '#ffffff' }}>CMS Admin</h1>
              <p className="text-[10px] font-medium" style={{ color: isDark ? darkTextMuted : '#94a3b8' }}>Multi-Language</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {savedMessage && <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ backgroundColor: isDark ? '#065f46' : '#064e3b', color: isDark ? '#34d399' : '#6ee7b7' }}>{savedMessage}</span>}
            {loading && <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: isDark ? '#333333' : '#e2e8f0', borderTopColor: '#ffffff' }}></div>}
            <button onClick={loadAllData} className="text-xs font-bold px-3 py-1.5 rounded-lg transition flex items-center gap-1" style={{ backgroundColor: isDark ? '#2d2d2d' : '#1e293b', color: isDark ? darkText : '#cbd5e1' }}><RefreshCw className="w-3 h-3" /> Reload</button>
            <button onClick={handleLogout} className="text-xs font-bold px-3 py-1.5 rounded-lg transition bg-red-600 hover:bg-red-700 text-white">Logout</button>
          </div>
        </div>
      </div>

      {/* TAB NAVIGATION */}
      <div className="border-b overflow-x-auto scrollbar-none sticky top-16 z-40 transition-colors duration-300" style={{ backgroundColor: isDark ? '#1e1e1e' : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0' }}>
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
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${activeTab === tab.id ? "bg-red-600 text-white" : isDark ? "text-[#c8c8c8] hover:bg-[#2d2d2d]" : "text-slate-600 hover:bg-slate-100"}`}>
              <tab.icon className="w-3.5 h-3.5" />{tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Translation Edit Modal */}
      {editingTranslation && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="rounded-xl shadow-2xl w-full max-w-lg p-6 space-y-4 transition-colors duration-300" style={{ backgroundColor: isDark ? darkCardBg : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0' }}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black transition-colors duration-300" style={{ color: isDark ? darkText : '#0f172a' }}>Edit {LANGUAGES.find(l => l.code === editingTranslation.lang)?.nativeName} Translation</h3>
              <button onClick={() => setEditingTranslation(null)} className="transition-colors duration-300" style={{ color: isDark ? darkTextMuted : '#64748b' }}><X className="w-5 h-5" /></button>
            </div>
            <div><label className="block text-[10px] font-bold uppercase mb-1 transition-colors duration-300" style={{ color: isDark ? darkTextMuted : '#64748b' }}>Title</label><input type="text" value={editingTranslation.title} onChange={(e) => setEditingTranslation({...editingTranslation, title: e.target.value})} className="w-full text-xs p-2 border rounded-lg focus:outline-none focus:border-red-500 transition-colors duration-300" style={{ backgroundColor: isDark ? '#2d2d2d' : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0', color: isDark ? darkText : '#0f172a' }} /></div>
            <div><label className="block text-[10px] font-bold uppercase mb-1 transition-colors duration-300" style={{ color: isDark ? darkTextMuted : '#64748b' }}>Description</label><textarea value={editingTranslation.description} onChange={(e) => setEditingTranslation({...editingTranslation, description: e.target.value})} className="w-full text-xs p-2 border rounded-lg focus:outline-none focus:border-red-500 h-32 transition-colors duration-300" style={{ backgroundColor: isDark ? '#2d2d2d' : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0', color: isDark ? darkText : '#0f172a' }} /></div>
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
            <h2 className="text-xl font-black mb-1 transition-colors duration-300" style={{ color: isDark ? darkText : '#0f172a' }}>Dashboard Overview</h2>
            <p className="text-xs mb-4 transition-colors duration-300" style={{ color: isDark ? darkTextMuted : '#64748b' }}>Monitor content across all languages</p>

            <div className="flex items-center gap-3 mb-6 flex-wrap">
              <span className="text-xs font-bold transition-colors duration-300" style={{ color: isDark ? darkTextSecondary : '#475569' }}>Filter by Language:</span>
              <div className="flex flex-wrap gap-1.5">
                <button onClick={() => setDashboardLangFilter("all")} className={`text-xs font-bold px-3 py-1.5 rounded-md transition ${dashboardLangFilter === "all" ? "bg-red-600 text-white" : isDark ? "bg-[#2d2d2d] text-[#c8c8c8] border border-[#333333] hover:border-red-300" : "bg-white text-slate-600 border border-slate-200 hover:border-red-300"}`}>🌐 All</button>
                {LANGUAGES.map(lang => (
                  <button key={lang.code} onClick={() => setDashboardLangFilter(lang.code)} className={`text-xs font-bold px-3 py-1.5 rounded-md transition ${dashboardLangFilter === lang.code ? "bg-red-600 text-white" : isDark ? "bg-[#2d2d2d] text-[#c8c8c8] border border-[#333333] hover:border-red-300" : "bg-white text-slate-600 border border-slate-200 hover:border-red-300"}`}>{lang.nativeName}</button>
                ))}
              </div>
            </div>

            {dashboardLangFilter === "all" && (
              <div className="rounded-xl p-4 mb-6 border transition-colors duration-300" style={{ backgroundColor: isDark ? '#2d2d2d' : '#fffbeb', borderColor: isDark ? '#3d3d3d' : '#fcd34d' }}>
                <div className="flex items-center gap-2 mb-3">
                  <Globe className="w-4 h-4" style={{ color: isDark ? '#fbbf24' : '#d97706' }} />
                  <h3 className="text-sm font-bold" style={{ color: isDark ? '#fbbf24' : '#92400e' }}>"All Languages" View Content</h3>
                  <span className="text-[10px] ml-auto transition-colors duration-300" style={{ color: isDark ? darkTextMuted : '#b45309' }}>Check items to show in the default All Languages view for new visitors</span>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Top Stories Featured */}
                  <div className="rounded-lg border p-3 transition-colors duration-300" style={{ backgroundColor: isDark ? darkCardBg : '#ffffff', borderColor: isDark ? darkBorder : '#fcd34d' }}>
                    <h4 className="text-xs font-bold mb-2 transition-colors duration-300" style={{ color: isDark ? darkTextSecondary : '#374151' }}>Top Stories ({topStories.filter((s: any) => s.featuredInAll).length} featured)</h4>
                    <div className="space-y-1 max-h-60 overflow-y-auto">
                      {topStories.length === 0 && <p className="text-xs text-center py-4 transition-colors duration-300" style={{ color: isDark ? darkTextMuted : '#9ca3af' }}>No top stories</p>}
                      {topStories.map((story: any) => (
                        <label key={story.id} className="flex items-center gap-2 p-1.5 rounded text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-[#2d2d2d] transition-colors duration-300">
                          <input type="checkbox" checked={story.featuredInAll === true} onChange={async () => {
                            const updated = topStories.map((s: any) => s.id === story.id ? { ...s, featuredInAll: !s.featuredInAll } : s);
                            setTopStoriesState(updated);
                            await saveSection("topStories", updated, `"${story.title.substring(0, 30)}..." ${story.featuredInAll ? 'removed from' : 'added to'} All Languages`);
                          }} className="w-3.5 h-3.5 rounded border-slate-300 dark:border-[#333333] text-amber-600 focus:ring-amber-500" />
                          <span className="truncate flex-1 transition-colors duration-300" style={{ color: isDark ? darkText : '#1f2937' }}>{story.title}</span>
                          <span className="text-[9px] whitespace-nowrap transition-colors duration-300" style={{ color: isDark ? darkTextMuted : '#9ca3af' }}>{LANGUAGES.find(l => l.code === story.language)?.nativeName || '?'}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  {/* Latest News Featured */}
                  <div className="rounded-lg border p-3 transition-colors duration-300" style={{ backgroundColor: isDark ? darkCardBg : '#ffffff', borderColor: isDark ? darkBorder : '#fcd34d' }}>
                    <h4 className="text-xs font-bold mb-2 transition-colors duration-300" style={{ color: isDark ? darkTextSecondary : '#374151' }}>Latest News ({latestNews.filter((s: any) => s.featuredInAll).length} featured)</h4>
                    <div className="space-y-1 max-h-60 overflow-y-auto">
                      {latestNews.length === 0 && <p className="text-xs text-center py-4 transition-colors duration-300" style={{ color: isDark ? darkTextMuted : '#9ca3af' }}>No latest news</p>}
                      {latestNews.map((story: any) => (
                        <label key={story.id} className="flex items-center gap-2 p-1.5 rounded text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-[#2d2d2d] transition-colors duration-300">
                          <input type="checkbox" checked={story.featuredInAll === true} onChange={async () => {
                            const updated = latestNews.map((s: any) => s.id === story.id ? { ...s, featuredInAll: !s.featuredInAll } : s);
                            setLatestNewsState(updated);
                            await saveSection("latestNews", updated, `"${story.title.substring(0, 30)}..." ${story.featuredInAll ? 'removed from' : 'added to'} All Languages`);
                          }} className="w-3.5 h-3.5 rounded border-slate-300 dark:border-[#333333] text-amber-600 focus:ring-amber-500" />
                          <span className="truncate flex-1 transition-colors duration-300" style={{ color: isDark ? darkText : '#1f2937' }}>{story.title}</span>
                          <span className="text-[9px] whitespace-nowrap transition-colors duration-300" style={{ color: isDark ? darkTextMuted : '#9ca3af' }}>{LANGUAGES.find(l => l.code === story.language)?.nativeName || '?'}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  {/* Videos + Channels Featured */}
                  <div className="space-y-3">
                    <div className="rounded-lg border p-3 transition-colors duration-300" style={{ backgroundColor: isDark ? darkCardBg : '#ffffff', borderColor: isDark ? darkBorder : '#fcd34d' }}>
                      <h4 className="text-xs font-bold mb-2 transition-colors duration-300" style={{ color: isDark ? darkTextSecondary : '#374151' }}>Videos ({videos.filter((v: any) => v.featuredInAll).length} featured)</h4>
                      <div className="space-y-1 max-h-28 overflow-y-auto">
                        {videos.length === 0 && <p className="text-xs text-center py-4 transition-colors duration-300" style={{ color: isDark ? darkTextMuted : '#9ca3af' }}>No videos</p>}
                        {videos.map((vid: any) => (
                          <label key={vid.id} className="flex items-center gap-2 p-1.5 rounded text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-[#2d2d2d] transition-colors duration-300">
                            <input type="checkbox" checked={vid.featuredInAll === true} onChange={async () => {
                              const updated = videos.map((v: any) => v.id === vid.id ? { ...v, featuredInAll: !v.featuredInAll } : v);
                              setVideosState(updated);
                              await saveSection("videos", updated, `"${vid.title.substring(0, 30)}..." ${vid.featuredInAll ? 'removed from' : 'added to'} All Languages`);
                            }} className="w-3.5 h-3.5 rounded border-slate-300 dark:border-[#333333] text-amber-600 focus:ring-amber-500" />
                            <span className="truncate flex-1 transition-colors duration-300" style={{ color: isDark ? darkText : '#1f2937' }}>{vid.title}</span>
                            <span className="text-[9px] whitespace-nowrap transition-colors duration-300" style={{ color: isDark ? darkTextMuted : '#9ca3af' }}>{LANGUAGES.find(l => l.code === vid.language)?.nativeName || '?'}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-lg border p-3 transition-colors duration-300" style={{ backgroundColor: isDark ? darkCardBg : '#ffffff', borderColor: isDark ? darkBorder : '#fcd34d' }}>
                      <h4 className="text-xs font-bold mb-2 transition-colors duration-300" style={{ color: isDark ? darkTextSecondary : '#374151' }}>TV Channels ({tvChannels.filter((c: any) => c.featuredInAll).length} featured)</h4>
                      <div className="space-y-1 max-h-28 overflow-y-auto">
                        {tvChannels.length === 0 && <p className="text-xs text-center py-4 transition-colors duration-300" style={{ color: isDark ? darkTextMuted : '#9ca3af' }}>No channels</p>}
                        {tvChannels.map((ch: any) => (
                          <label key={ch.id} className="flex items-center gap-2 p-1.5 rounded text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-[#2d2d2d] transition-colors duration-300">
                            <input type="checkbox" checked={ch.featuredInAll === true} onChange={async () => {
                              const updated = tvChannels.map((c: any) => c.id === ch.id ? { ...c, featuredInAll: !c.featuredInAll } : c);
                              setTvChannelsState(updated);
                              await saveSection("tvChannels", updated, `"${ch.name}" ${ch.featuredInAll ? 'removed from' : 'added to'} All Languages`);
                            }} className="w-3.5 h-3.5 rounded border-slate-300 dark:border-[#333333] text-amber-600 focus:ring-amber-500" />
                            <span className="truncate flex-1 transition-colors duration-300" style={{ color: isDark ? darkText : '#1f2937' }}>{ch.name}</span>
                            <span className="text-[9px] whitespace-nowrap transition-colors duration-300" style={{ color: isDark ? darkTextMuted : '#9ca3af' }}>{LANGUAGES.find(l => l.code === ch.language)?.nativeName || '?'}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {dashboardLangFilter === "all" ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                  <div className="rounded-xl border p-4 shadow-xs transition-colors duration-300" style={{ backgroundColor: isDark ? darkCardBg : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0' }}>
                    <p className="text-[10px] font-bold uppercase transition-colors duration-300" style={{ color: isDark ? darkTextMuted : '#94a3b8' }}>Top Stories</p>
                    <p className="text-2xl font-black transition-colors duration-300" style={{ color: isDark ? darkText : '#0f172a' }}>{topStories.length}</p>
                    <p className="text-[10px] mt-1 transition-colors duration-300" style={{ color: isDark ? darkTextMuted : '#94a3b8' }}>{countWithoutLanguage(topStories)} unassigned</p>
                  </div>
                  <div className="rounded-xl border p-4 shadow-xs transition-colors duration-300" style={{ backgroundColor: isDark ? darkCardBg : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0' }}>
                    <p className="text-[10px] font-bold uppercase transition-colors duration-300" style={{ color: isDark ? darkTextMuted : '#94a3b8' }}>Latest News</p>
                    <p className="text-2xl font-black transition-colors duration-300" style={{ color: isDark ? darkText : '#0f172a' }}>{latestNews.length}</p>
                    <p className="text-[10px] mt-1 transition-colors duration-300" style={{ color: isDark ? darkTextMuted : '#94a3b8' }}>{countWithoutLanguage(latestNews)} unassigned</p>
                  </div>
                  <div className="rounded-xl border p-4 shadow-xs transition-colors duration-300" style={{ backgroundColor: isDark ? darkCardBg : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0' }}>
                    <p className="text-[10px] font-bold uppercase transition-colors duration-300" style={{ color: isDark ? darkTextMuted : '#94a3b8' }}>Videos</p>
                    <p className="text-2xl font-black transition-colors duration-300" style={{ color: isDark ? darkText : '#0f172a' }}>{videos.length}</p>
                    <p className="text-[10px] mt-1 transition-colors duration-300" style={{ color: isDark ? darkTextMuted : '#94a3b8' }}>{countWithoutLanguage(videos)} unassigned</p>
                  </div>
                  <div className="rounded-xl border p-4 shadow-xs transition-colors duration-300" style={{ backgroundColor: isDark ? darkCardBg : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0' }}>
                    <p className="text-[10px] font-bold uppercase transition-colors duration-300" style={{ color: isDark ? darkTextMuted : '#94a3b8' }}>TV Channels</p>
                    <p className="text-2xl font-black transition-colors duration-300" style={{ color: isDark ? darkText : '#0f172a' }}>{tvChannels.length}</p>
                    <p className="text-[10px] mt-1 transition-colors duration-300" style={{ color: isDark ? darkTextMuted : '#94a3b8' }}>{countWithoutLanguage(tvChannels)} unassigned</p>
                  </div>
                </div>
                <div className="rounded-xl border shadow-xs overflow-hidden transition-colors duration-300" style={{ backgroundColor: isDark ? darkCardBg : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0' }}>
                  <div className="p-4 border-b transition-colors duration-300" style={{ borderColor: isDark ? darkBorder : '#e2e8f0' }}>
                    <h3 className="text-sm font-bold transition-colors duration-300" style={{ color: isDark ? darkText : '#0f172a' }}>Content by Language</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b transition-colors duration-300" style={{ backgroundColor: isDark ? darkHover : '#f8fafc', borderColor: isDark ? darkBorder : '#e2e8f0' }}>
                          <th className="text-left p-3 font-bold uppercase transition-colors duration-300" style={{ color: isDark ? darkTextMuted : '#64748b' }}>Language</th>
                          <th className="text-center p-3 font-bold uppercase transition-colors duration-300" style={{ color: isDark ? darkTextMuted : '#64748b' }}>Top Stories</th>
                          <th className="text-center p-3 font-bold uppercase transition-colors duration-300" style={{ color: isDark ? darkTextMuted : '#64748b' }}>Latest News</th>
                          <th className="text-center p-3 font-bold uppercase transition-colors duration-300" style={{ color: isDark ? darkTextMuted : '#64748b' }}>Videos</th>
                          <th className="text-center p-3 font-bold uppercase transition-colors duration-300" style={{ color: isDark ? darkTextMuted : '#64748b' }}>TV Channels</th>
                          <th className="text-center p-3 font-bold uppercase transition-colors duration-300" style={{ color: isDark ? darkTextMuted : '#64748b' }}>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {LANGUAGES.map(lang => {
                          const ts = countByLanguage(topStories, lang.code);
                          const ln = countByLanguage(latestNews, lang.code);
                          const vd = countByLanguage(videos, lang.code);
                          const ch = countByLanguage(tvChannels, lang.code);
                          const total = ts + ln + vd + ch;
                          return <tr key={lang.code} className="border-b transition-colors duration-300 hover:bg-slate-50 dark:hover:bg-[#2d2d2d]" style={{ borderColor: isDark ? darkBorder : '#f1f5f9' }}>
                            <td className="p-3 font-bold transition-colors duration-300" style={{ color: isDark ? darkText : '#334155' }}>{lang.nativeName} <span className="text-[10px] transition-colors duration-300" style={{ color: isDark ? darkTextMuted : '#94a3b8' }}>({lang.name})</span></td>
                            <td className="p-3 text-center">{ts > 0 ? <span className="font-bold px-2 py-0.5 rounded" style={{ backgroundColor: isDark ? '#1e3a5f' : '#eff6ff', color: isDark ? '#60a5fa' : '#1d4ed8' }}>{ts}</span> : <span className="transition-colors duration-300" style={{ color: isDark ? darkTextMuted : '#cbd5e1' }}>0</span>}</td>
                            <td className="p-3 text-center">{ln > 0 ? <span className="font-bold px-2 py-0.5 rounded" style={{ backgroundColor: isDark ? '#064e3b' : '#ecfdf5', color: isDark ? '#34d399' : '#065f46' }}>{ln}</span> : <span className="transition-colors duration-300" style={{ color: isDark ? darkTextMuted : '#cbd5e1' }}>0</span>}</td>
                            <td className="p-3 text-center">{vd > 0 ? <span className="font-bold px-2 py-0.5 rounded" style={{ backgroundColor: isDark ? '#4c1d95' : '#f5f3ff', color: isDark ? '#a78bfa' : '#5b21b6' }}>{vd}</span> : <span className="transition-colors duration-300" style={{ color: isDark ? darkTextMuted : '#cbd5e1' }}>0</span>}</td>
                            <td className="p-3 text-center">{ch > 0 ? <span className="font-bold px-2 py-0.5 rounded" style={{ backgroundColor: isDark ? '#78350f' : '#fffbeb', color: isDark ? '#fbbf24' : '#92400e' }}>{ch}</span> : <span className="transition-colors duration-300" style={{ color: isDark ? darkTextMuted : '#cbd5e1' }}>0</span>}</td>
                            <td className="p-3 text-center font-black transition-colors duration-300" style={{ color: isDark ? darkText : '#0f172a' }}>{total}</td>
                          </tr>;
                        })}
                        <tr className="font-bold transition-colors duration-300" style={{ backgroundColor: isDark ? darkHover : '#f8fafc' }}>
                          <td className="p-3 transition-colors duration-300" style={{ color: isDark ? darkTextSecondary : '#475569' }}>TOTAL</td>
                          <td className="p-3 text-center transition-colors duration-300" style={{ color: isDark ? darkText : '#0f172a' }}>{topStories.length}</td>
                          <td className="p-3 text-center transition-colors duration-300" style={{ color: isDark ? darkText : '#0f172a' }}>{latestNews.length}</td>
                          <td className="p-3 text-center transition-colors duration-300" style={{ color: isDark ? darkText : '#0f172a' }}>{videos.length}</td>
                          <td className="p-3 text-center transition-colors duration-300" style={{ color: isDark ? darkText : '#0f172a' }}>{tvChannels.length}</td>
                          <td className="p-3 text-center transition-colors duration-300" style={{ color: isDark ? darkText : '#0f172a' }}>{topStories.length + latestNews.length + videos.length + tvChannels.length}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="rounded-xl border shadow-xs p-6 mb-4 transition-colors duration-300" style={{ backgroundColor: isDark ? darkCardBg : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0' }}>
                  <h3 className="text-sm font-bold mb-4 flex items-center gap-2 transition-colors duration-300" style={{ color: isDark ? darkText : '#0f172a' }}>
                    <Globe className="w-4 h-4 text-red-500" />
                    {LANGUAGES.find(l => l.code === dashboardLangFilter)?.nativeName} ({LANGUAGES.find(l => l.code === dashboardLangFilter)?.name}) Content
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="rounded-lg p-3 text-center transition-colors duration-300" style={{ backgroundColor: isDark ? '#1e3a5f' : '#eff6ff' }}>
                      <p className="text-[10px] font-bold uppercase transition-colors duration-300" style={{ color: isDark ? '#60a5fa' : '#1d4ed8' }}>Top Stories</p>
                      <p className="text-xl font-black transition-colors duration-300" style={{ color: isDark ? '#93c5fd' : '#1e3a8a' }}>{countByLanguage(topStories, dashboardLangFilter)}</p>
                    </div>
                    <div className="rounded-lg p-3 text-center transition-colors duration-300" style={{ backgroundColor: isDark ? '#064e3b' : '#ecfdf5' }}>
                      <p className="text-[10px] font-bold uppercase transition-colors duration-300" style={{ color: isDark ? '#34d399' : '#065f46' }}>Latest News</p>
                      <p className="text-xl font-black transition-colors duration-300" style={{ color: isDark ? '#6ee7b7' : '#064e3b' }}>{countByLanguage(latestNews, dashboardLangFilter)}</p>
                    </div>
                    <div className="rounded-lg p-3 text-center transition-colors duration-300" style={{ backgroundColor: isDark ? '#4c1d95' : '#f5f3ff' }}>
                      <p className="text-[10px] font-bold uppercase transition-colors duration-300" style={{ color: isDark ? '#a78bfa' : '#5b21b6' }}>Videos</p>
                      <p className="text-xl font-black transition-colors duration-300" style={{ color: isDark ? '#c4b5fd' : '#4c1d95' }}>{countByLanguage(videos, dashboardLangFilter)}</p>
                    </div>
                    <div className="rounded-lg p-3 text-center transition-colors duration-300" style={{ backgroundColor: isDark ? '#78350f' : '#fffbeb' }}>
                      <p className="text-[10px] font-bold uppercase transition-colors duration-300" style={{ color: isDark ? '#fbbf24' : '#92400e' }}>TV Channels</p>
                      <p className="text-xl font-black transition-colors duration-300" style={{ color: isDark ? '#fcd34d' : '#78350f' }}>{countByLanguage(tvChannels, dashboardLangFilter)}</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="rounded-xl border shadow-xs p-4 transition-colors duration-300" style={{ backgroundColor: isDark ? darkCardBg : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0' }}>
                    <h4 className="text-sm font-bold mb-3 transition-colors duration-300" style={{ color: isDark ? darkText : '#0f172a' }}>Stories</h4>
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {[...topStories, ...latestNews].filter((s: any) => s.language === dashboardLangFilter).slice(0, 20).map((story: any) => (
                        <div key={story.id} className="flex items-center gap-2 p-2 rounded-lg text-xs transition-colors duration-300" style={{ backgroundColor: isDark ? darkHover : '#f8fafc' }}>
                          <span className="font-medium truncate flex-1 transition-colors duration-300" style={{ color: isDark ? darkText : '#1f2937' }}>{story.title}</span>
                          <span className="text-[10px] whitespace-nowrap transition-colors duration-300" style={{ color: isDark ? darkTextMuted : '#9ca3af' }}>{story.category}</span>
                        </div>
                      ))}
                      {[...topStories, ...latestNews].filter((s: any) => s.language === dashboardLangFilter).length === 0 && <p className="text-xs text-center py-4 transition-colors duration-300" style={{ color: isDark ? darkTextMuted : '#9ca3af' }}>No stories in this language</p>}
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="rounded-xl border shadow-xs p-4 transition-colors duration-300" style={{ backgroundColor: isDark ? darkCardBg : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0' }}>
                      <h4 className="text-sm font-bold mb-3 transition-colors duration-300" style={{ color: isDark ? darkText : '#0f172a' }}>Videos</h4>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {videos.filter((v: any) => v.language === dashboardLangFilter).slice(0, 10).map((vid: any) => (
                          <div key={vid.id} className="flex items-center gap-2 p-2 rounded-lg text-xs transition-colors duration-300" style={{ backgroundColor: isDark ? darkHover : '#f8fafc' }}>
                            <span className="font-medium truncate flex-1 transition-colors duration-300" style={{ color: isDark ? darkText : '#1f2937' }}>{vid.title}</span>
                          </div>
                        ))}
                        {videos.filter((v: any) => v.language === dashboardLangFilter).length === 0 && <p className="text-xs text-center py-4 transition-colors duration-300" style={{ color: isDark ? darkTextMuted : '#9ca3af' }}>No videos in this language</p>}
                      </div>
                    </div>
                    <div className="rounded-xl border shadow-xs p-4 transition-colors duration-300" style={{ backgroundColor: isDark ? darkCardBg : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0' }}>
                      <h4 className="text-sm font-bold mb-3 transition-colors duration-300" style={{ color: isDark ? darkText : '#0f172a' }}>TV Channels</h4>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {tvChannels.filter((c: any) => c.language === dashboardLangFilter).slice(0, 10).map((ch: any) => (
                          <div key={ch.id} className="flex items-center gap-2 p-2 rounded-lg text-xs transition-colors duration-300" style={{ backgroundColor: isDark ? darkHover : '#f8fafc' }}>
                            <span className="font-medium truncate flex-1 transition-colors duration-300" style={{ color: isDark ? darkText : '#1f2937' }}>{ch.name}</span>
                            <span className="text-[10px] transition-colors duration-300" style={{ color: isDark ? darkTextMuted : '#9ca3af' }}>{ch.type}</span>
                          </div>
                        ))}
                        {tvChannels.filter((c: any) => c.language === dashboardLangFilter).length === 0 && <p className="text-xs text-center py-4 transition-colors duration-300" style={{ color: isDark ? darkTextMuted : '#9ca3af' }}>No channels in this language</p>}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              <div className="rounded-xl border p-4 shadow-xs transition-colors duration-300" style={{ backgroundColor: isDark ? darkCardBg : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0' }}>
                <p className="text-xs font-bold uppercase transition-colors duration-300" style={{ color: isDark ? darkTextMuted : '#94a3b8' }}>Ticker Items</p>
                <p className="text-2xl font-black transition-colors duration-300" style={{ color: isDark ? darkText : '#0f172a' }}>{ticker.length}</p>
              </div>
              <div className="rounded-xl border p-4 shadow-xs transition-colors duration-300" style={{ backgroundColor: isDark ? darkCardBg : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0' }}>
                <p className="text-xs font-bold uppercase transition-colors duration-300" style={{ color: isDark ? darkTextMuted : '#94a3b8' }}>Election States</p>
                <p className="text-2xl font-black transition-colors duration-300" style={{ color: isDark ? darkText : '#0f172a' }}>{electionStates.length}</p>
              </div>
              <div className="rounded-xl border p-4 shadow-xs transition-colors duration-300" style={{ backgroundColor: isDark ? darkCardBg : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0' }}>
                <p className="text-xs font-bold uppercase transition-colors duration-300" style={{ color: isDark ? darkTextMuted : '#94a3b8' }}>Sports</p>
                <p className="text-2xl font-black transition-colors duration-300" style={{ color: isDark ? darkText : '#0f172a' }}>{sports.length}</p>
              </div>
              <div className="rounded-xl border p-4 shadow-xs transition-colors duration-300" style={{ backgroundColor: isDark ? darkCardBg : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0' }}>
                <p className="text-xs font-bold uppercase transition-colors duration-300" style={{ color: isDark ? darkTextMuted : '#94a3b8' }}>Weather Cities</p>
                <p className="text-2xl font-black transition-colors duration-300" style={{ color: isDark ? darkText : '#0f172a' }}>{weatherCities.length}</p>
              </div>
            </div>
          </div>
        )}

        {/* ==================== STORIES ==================== */}
        {activeTab === "stories" && (
          <div>
            <h2 className="text-xl font-black mb-4 transition-colors duration-300" style={{ color: isDark ? darkText : '#0f172a' }}>Manage Stories</h2>
            <div className="rounded-xl border shadow-xs p-4 mb-6 transition-colors duration-300" style={{ backgroundColor: isDark ? darkCardBg : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0' }}>
              <h3 className="text-sm font-bold mb-3 flex items-center gap-2 transition-colors duration-300" style={{ color: isDark ? darkText : '#0f172a' }}><Globe className="w-4 h-4 text-blue-600" />News Extractor</h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <input type="url" placeholder="Paste news article URL..." value={extractUrl} onChange={(e) => setExtractUrl(e.target.value)} className="flex-1 text-xs p-2 border rounded-lg focus:outline-none focus:border-blue-500 transition-colors duration-300" style={{ backgroundColor: isDark ? '#2d2d2d' : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0', color: isDark ? darkText : '#0f172a' }} />
                <select value={extractedLang} onChange={(e) => setExtractedLang(e.target.value)} className="text-xs p-2 border rounded-lg focus:outline-none focus:border-blue-500 transition-colors duration-300" style={{ backgroundColor: isDark ? '#2d2d2d' : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0', color: isDark ? darkText : '#0f172a' }}>
                  {LANGUAGES.map(lang => (<option key={lang.code} value={lang.code}>{lang.nativeName} ({lang.name})</option>))}
                </select>
                <button onClick={handleExtract} disabled={extracting} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-lg transition flex items-center gap-1 disabled:opacity-50 whitespace-nowrap">
                  {extracting ? <><div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Extracting</> : <><Upload className="w-3 h-3" /> Extract</>}
                </button>
              </div>
              <p className="text-[10px] mt-2 transition-colors duration-300" style={{ color: isDark ? darkTextMuted : '#64748b' }}>Select the language of the source article before extracting.</p>
              {extractedData && (
                <div className="mt-3 p-3 rounded-lg border text-xs transition-colors duration-300" style={{ backgroundColor: isDark ? '#1e293b' : '#eff6ff', borderColor: isDark ? darkBorder : '#93c5fd' }}>
                  <p className="font-bold text-green-600">✅ Extracted: {extractedData.title || "Unknown title"}</p>
                  <p className="mt-1 transition-colors duration-300" style={{ color: isDark ? darkTextSecondary : '#475569' }}>🌐 Language: {LANGUAGES.find(l => l.code === extractedLang)?.nativeName}</p>
                </div>
              )}
            </div>

            <div className="rounded-xl border shadow-xs p-4 mb-6 transition-colors duration-300" style={{ backgroundColor: isDark ? darkCardBg : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0' }}>
              <h3 className="text-sm font-bold mb-3 flex items-center justify-between transition-colors duration-300" style={{ color: isDark ? darkText : '#0f172a' }}>
                {editingNews ? "Edit Story" : "Add New Story"}
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 text-[10px] font-bold cursor-pointer transition-colors duration-300" style={{ color: isDark ? darkTextMuted : '#64748b' }}>
                    <input type="checkbox" checked={newsForm.featuredInAll} onChange={(e) => setNewsForm({...newsForm, featuredInAll: e.target.checked})} className="w-3 h-3 rounded border-slate-300 dark:border-[#333333] text-amber-600 focus:ring-amber-500" />
                    Show in All Languages
                  </label>
                  <span className="text-[10px] font-bold transition-colors duration-300" style={{ color: isDark ? darkTextMuted : '#64748b' }}>Primary Language:</span>
                  <select value={newsForm.language} onChange={(e) => setNewsForm({...newsForm, language: e.target.value})} className="text-xs p-1.5 border rounded-lg focus:outline-none focus:border-red-500 transition-colors duration-300" style={{ backgroundColor: isDark ? '#2d2d2d' : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0', color: isDark ? darkText : '#0f172a' }}>
                    {LANGUAGES.map(lang => (<option key={lang.code} value={lang.code}>{lang.nativeName}</option>))}
                  </select>
                </div>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input type="text" placeholder="Story title..." value={newsForm.title} onChange={(e) => setNewsForm({...newsForm, title: e.target.value})} className="text-xs p-2 border rounded-lg focus:outline-none focus:border-red-500 sm:col-span-2 transition-colors duration-300" style={{ backgroundColor: isDark ? '#2d2d2d' : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0', color: isDark ? darkText : '#0f172a' }} />
                <select value={newsForm.category} onChange={(e) => setNewsForm({...newsForm, category: e.target.value})} className="text-xs p-2 border rounded-lg focus:outline-none focus:border-red-500 transition-colors duration-300" style={{ backgroundColor: isDark ? '#2d2d2d' : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0', color: isDark ? darkText : '#0f172a' }}>
                  {ALL_CATEGORIES.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
                </select>
                <input type="text" placeholder="Image URL..." value={newsForm.image} onChange={(e) => setNewsForm({...newsForm, image: e.target.value})} className="text-xs p-2 border rounded-lg focus:outline-none focus:border-red-500 sm:col-span-3 transition-colors duration-300" style={{ backgroundColor: isDark ? '#2d2d2d' : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0', color: isDark ? darkText : '#0f172a' }} />
                <textarea placeholder="Full description / content..." value={newsForm.description} onChange={(e) => setNewsForm({...newsForm, description: e.target.value})} className="text-xs p-2 border rounded-lg focus:outline-none focus:border-red-500 sm:col-span-3 h-40 transition-colors duration-300" style={{ backgroundColor: isDark ? '#2d2d2d' : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0', color: isDark ? darkText : '#0f172a' }} />
                {editingNews && (
                  <div className="sm:col-span-3 border-t pt-3 mt-2 transition-colors duration-300" style={{ borderColor: isDark ? darkBorder : '#e2e8f0' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-bold transition-colors duration-300" style={{ color: isDark ? darkTextMuted : '#64748b' }}>Add Translation:</span>
                      <select value={translationTargetLang} onChange={(e) => setTranslationTargetLang(e.target.value)} className="text-xs p-1.5 border rounded transition-colors duration-300" style={{ backgroundColor: isDark ? '#2d2d2d' : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0', color: isDark ? darkText : '#0f172a' }}>
                        {LANGUAGES.filter(l => l.code !== newsForm.language).map(lang => (<option key={lang.code} value={lang.code}>{lang.nativeName}</option>))}
                      </select>
                      <button onClick={handleTranslateNews} disabled={isTranslatingNews || translating} className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-3 py-1 rounded transition flex items-center gap-1 disabled:opacity-50">
                        <Languages className="w-3 h-3" />{isTranslatingNews ? 'Translating...' : 'Translate'}
                      </button>
                    </div>
                    {Object.keys(newsForm.translations || {}).length > 0 && (
                      <div>
                        <label className="block text-[10px] font-bold uppercase mb-1 transition-colors duration-300" style={{ color: isDark ? darkTextMuted : '#64748b' }}>Saved Translations</label>
                        <div className="flex flex-wrap gap-2 p-2 rounded-lg border transition-colors duration-300" style={{ backgroundColor: isDark ? '#064e3b' : '#f0fdf4', borderColor: isDark ? darkBorder : '#86efac' }}>
                          {Object.keys(newsForm.translations).map((code) => {
                            const lang = LANGUAGES.find(l => l.code === code);
                            return <div key={code} className="flex items-center gap-1 px-2 py-1 rounded border transition-colors duration-300" style={{ backgroundColor: isDark ? darkCardBg : '#ffffff', borderColor: isDark ? darkBorder : '#86efac' }}>
                              <span className="text-xs font-bold transition-colors duration-300" style={{ color: isDark ? darkText : '#0f172a' }}>{lang?.nativeName || code}</span>
                              <button onClick={() => openTranslationEditor(code)} className="text-blue-500 hover:text-blue-700 text-[10px]"><Edit2 className="w-3 h-3" /></button>
                              <button onClick={() => removeTranslation('story', code)} className="text-red-500 hover:text-red-700 text-[10px]"><X className="w-3 h-3" /></button>
                            </div>;
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <div className="flex gap-2 sm:col-span-3">
                  <select value={newsType} onChange={(e) => setNewsType(e.target.value)} className="text-xs p-2 border rounded-lg focus:outline-none focus:border-red-500 transition-colors duration-300" style={{ backgroundColor: isDark ? '#2d2d2d' : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0', color: isDark ? darkText : '#0f172a' }}>
                    <option value="latest">Latest News</option><option value="top">Top Stories</option>
                  </select>
                  {editingNews ? (
                    <><button onClick={handleUpdateNews} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-lg transition flex items-center gap-1"><Save className="w-3 h-3" /> Update</button><button onClick={resetNewsForm} className="bg-slate-600 hover:bg-slate-700 text-white font-bold text-xs px-4 py-2 rounded-lg transition">Cancel</button></>
                  ) : (
                    <button onClick={handleAddNews} className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2 rounded-lg transition flex items-center gap-1"><Plus className="w-3 h-3" /> Add Story</button>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-xl border shadow-xs p-4 mb-4 transition-colors duration-300" style={{ backgroundColor: isDark ? darkCardBg : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0' }}>
              <h3 className="text-sm font-bold mb-3 transition-colors duration-300" style={{ color: isDark ? darkText : '#0f172a' }}>Top Stories ({topStories.length})</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {topStories.map((story) => (
                  <div key={story.id} className="flex items-center justify-between p-2 border rounded-lg text-xs transition-colors duration-300" style={{ backgroundColor: isDark ? darkHover : '#f8fafc', borderColor: isDark ? darkBorder : '#f1f5f9' }}>
                    <span className="font-medium flex-1 truncate transition-colors duration-300" style={{ color: isDark ? darkText : '#1f2937' }}>{story.title}</span>
                    <span className="mx-2 hidden sm:inline transition-colors duration-300" style={{ color: isDark ? darkTextMuted : '#94a3b8' }}>{story.category}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded mr-1 transition-colors duration-300" style={{ backgroundColor: isDark ? '#1e3a5f' : '#eff6ff', color: isDark ? '#60a5fa' : '#2563eb' }}>{LANGUAGES.find(l => l.code === story.language)?.nativeName || story.language || 'en'}</span>
                    {story.featuredInAll && <span className="text-[8px] font-bold mr-1 transition-colors duration-300" style={{ color: isDark ? '#fbbf24' : '#d97706' }}>⭐</span>}
                    {story.translations && Object.keys(story.translations).length > 0 && <span className="text-[8px] font-bold mr-2 transition-colors duration-300" style={{ color: isDark ? '#34d399' : '#10b981' }}>+{Object.keys(story.translations).length}</span>}
                    <div className="flex gap-1">
                      <button onClick={() => handleEditNews(story, "top")} className="text-blue-500 hover:text-blue-700"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDeleteNews(story.id, "top")} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border shadow-xs p-4 transition-colors duration-300" style={{ backgroundColor: isDark ? darkCardBg : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0' }}>
              <h3 className="text-sm font-bold mb-3 transition-colors duration-300" style={{ color: isDark ? darkText : '#0f172a' }}>Latest News ({latestNews.length})</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {latestNews.map((story) => (
                  <div key={story.id} className="flex items-center justify-between p-2 border rounded-lg text-xs transition-colors duration-300" style={{ backgroundColor: isDark ? darkHover : '#f8fafc', borderColor: isDark ? darkBorder : '#f1f5f9' }}>
                    <span className="font-medium flex-1 truncate transition-colors duration-300" style={{ color: isDark ? darkText : '#1f2937' }}>{story.title}</span>
                    <span className="mx-2 hidden sm:inline transition-colors duration-300" style={{ color: isDark ? darkTextMuted : '#94a3b8' }}>{story.category}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded mr-1 transition-colors duration-300" style={{ backgroundColor: isDark ? '#1e3a5f' : '#eff6ff', color: isDark ? '#60a5fa' : '#2563eb' }}>{LANGUAGES.find(l => l.code === story.language)?.nativeName || story.language || 'en'}</span>
                    {story.featuredInAll && <span className="text-[8px] font-bold mr-1 transition-colors duration-300" style={{ color: isDark ? '#fbbf24' : '#d97706' }}>⭐</span>}
                    {story.translations && Object.keys(story.translations).length > 0 && <span className="text-[8px] font-bold mr-2 transition-colors duration-300" style={{ color: isDark ? '#34d399' : '#10b981' }}>+{Object.keys(story.translations).length}</span>}
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
            <h2 className="text-xl font-black mb-4 transition-colors duration-300" style={{ color: isDark ? darkText : '#0f172a' }}>Manage Videos</h2>
            <div className="rounded-xl border shadow-xs p-4 mb-6 transition-colors duration-300" style={{ backgroundColor: isDark ? darkCardBg : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0' }}>
              <h3 className="text-sm font-bold mb-3 flex items-center justify-between transition-colors duration-300" style={{ color: isDark ? darkText : '#0f172a' }}>
                {editingVideo ? "Edit Video" : "Add New Video"}
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 text-[10px] font-bold cursor-pointer transition-colors duration-300" style={{ color: isDark ? darkTextMuted : '#64748b' }}>
                    <input type="checkbox" checked={videoForm.featuredInAll} onChange={(e) => setVideoForm({...videoForm, featuredInAll: e.target.checked})} className="w-3 h-3 rounded border-slate-300 dark:border-[#333333] text-amber-600 focus:ring-amber-500" />
                    Show in All Languages
                  </label>
                  <span className="text-[10px] font-bold transition-colors duration-300" style={{ color: isDark ? darkTextMuted : '#64748b' }}>Language:</span>
                  <select value={videoForm.language} onChange={(e) => setVideoForm({...videoForm, language: e.target.value})} className="text-xs p-1.5 border rounded-lg focus:outline-none focus:border-red-500 transition-colors duration-300" style={{ backgroundColor: isDark ? '#2d2d2d' : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0', color: isDark ? darkText : '#0f172a' }}>
                    {LANGUAGES.map(lang => (<option key={lang.code} value={lang.code}>{lang.nativeName}</option>))}
                  </select>
                </div>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 flex gap-2">
                  <input type="text" placeholder="Video Link..." value={videoForm.link} onChange={(e) => setVideoForm({...videoForm, link: e.target.value})} className="flex-1 text-xs p-2 border rounded-lg focus:outline-none focus:border-red-500 transition-colors duration-300" style={{ backgroundColor: isDark ? '#2d2d2d' : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0', color: isDark ? darkText : '#0f172a' }} />
                  <button onClick={extractVideoTitle} disabled={videoExtractLoading || !videoForm.link.trim()} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3 py-2 rounded-lg transition flex items-center gap-1 whitespace-nowrap disabled:opacity-50"><Video className="w-3 h-3" />{videoExtractLoading ? '...' : 'Extract Title'}</button>
                </div>
                <input type="text" placeholder="Video title..." value={videoForm.title} onChange={(e) => setVideoForm({...videoForm, title: e.target.value})} className="text-xs p-2 border rounded-lg focus:outline-none focus:border-red-500 transition-colors duration-300" style={{ backgroundColor: isDark ? '#2d2d2d' : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0', color: isDark ? darkText : '#0f172a' }} />
                <input type="text" placeholder="Image URL (optional)" value={videoForm.img} onChange={(e) => setVideoForm({...videoForm, img: e.target.value})} className="text-xs p-2 border rounded-lg focus:outline-none focus:border-red-500 sm:col-span-2 transition-colors duration-300" style={{ backgroundColor: isDark ? '#2d2d2d' : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0', color: isDark ? darkText : '#0f172a' }} />
                <select value={videoForm.category} onChange={(e) => setVideoForm({...videoForm, category: e.target.value})} className="text-xs p-2 border rounded-lg focus:outline-none focus:border-red-500 transition-colors duration-300" style={{ backgroundColor: isDark ? '#2d2d2d' : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0', color: isDark ? darkText : '#0f172a' }}>
                  {ALL_CATEGORIES.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
                </select>
                <div className="sm:col-span-3 flex gap-2">
                  {editingVideo ? (
                    <><button onClick={handleUpdateVideo} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-lg transition flex items-center gap-1"><Save className="w-3 h-3" /> Update</button><button onClick={resetVideoForm} className="bg-slate-600 hover:bg-slate-700 text-white font-bold text-xs px-4 py-2 rounded-lg transition">Cancel</button></>
                  ) : (
                    <button onClick={handleAddVideo} className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2 rounded-lg transition flex items-center gap-1"><Plus className="w-3 h-3" /> Add Video</button>
                  )}
                </div>
              </div>
            </div>
            <div className="rounded-xl border shadow-xs p-4 transition-colors duration-300" style={{ backgroundColor: isDark ? darkCardBg : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0' }}>
              <h3 className="text-sm font-bold mb-3 transition-colors duration-300" style={{ color: isDark ? darkText : '#0f172a' }}>Videos ({videos.length})</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {videos.map((video) => (
                  <div key={video.id} className="flex flex-col gap-2 p-3 border rounded-lg transition-colors duration-300" style={{ backgroundColor: isDark ? darkHover : '#f8fafc', borderColor: isDark ? darkBorder : '#f1f5f9' }}>
                    <img src={video.img} alt={video.title} className="w-full h-24 object-cover rounded-lg" />
                    <div className="flex items-center gap-1"><span className="text-xs font-medium line-clamp-1 flex-1 transition-colors duration-300" style={{ color: isDark ? darkText : '#1f2937' }}>{video.title}</span>{video.featuredInAll && <span className="text-[10px]" title="Featured in All Languages">⭐</span>}</div>
                    <div className="flex items-center gap-2"><span className="text-[9px] font-bold uppercase transition-colors duration-300" style={{ color: isDark ? darkTextMuted : '#94a3b8' }}>{video.category || "Latest"}</span><span className="text-[9px] font-bold px-1.5 py-0.5 rounded transition-colors duration-300" style={{ backgroundColor: isDark ? '#1e3a5f' : '#eff6ff', color: isDark ? '#60a5fa' : '#2563eb' }}>{LANGUAGES.find(l => l.code === video.language)?.nativeName || video.language || 'en'}</span></div>
                    <div className="flex gap-1 justify-end"><button onClick={() => handleEditVideo(video)} className="text-blue-500 hover:text-blue-700"><Edit2 className="w-4 h-4" /></button><button onClick={() => handleDeleteVideo(video.id)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================== SPORTS ==================== */}
        {activeTab === "sports" && (
          <div>
            <h2 className="text-xl font-black mb-4 transition-colors duration-300" style={{ color: isDark ? darkText : '#0f172a' }}>Manage Sports Scores</h2>
            <div className="rounded-xl border shadow-xs p-4 mb-4 transition-colors duration-300" style={{ backgroundColor: isDark ? darkCardBg : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0' }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold transition-colors duration-300" style={{ color: isDark ? darkText : '#0f172a' }}>Sport Entries</h3>
                <div className="flex gap-2"><button onClick={addSport} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition flex items-center gap-1"><Plus className="w-3 h-3" /> Add Sport</button><button onClick={saveSports} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1 rounded-lg transition flex items-center gap-1"><Save className="w-3 h-3" /> Save All</button></div>
              </div>
              {sports.map((sport, idx) => (
                <div key={idx} className="p-3 border rounded-lg mb-3 transition-colors duration-300" style={{ backgroundColor: isDark ? darkHover : '#f8fafc', borderColor: isDark ? darkBorder : '#f1f5f9' }}>
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                    <div><label className="block text-[8px] font-black uppercase transition-colors duration-300" style={{ color: isDark ? darkTextMuted : '#64748b' }}>Sport</label><input type="text" value={sport.sport || ""} onChange={(e) => updateSport(idx, 'sport', e.target.value)} className="w-full text-xs p-1 border rounded transition-colors duration-300" style={{ backgroundColor: isDark ? '#2d2d2d' : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0', color: isDark ? darkText : '#0f172a' }} /></div>
                    <div><label className="block text-[8px] font-black uppercase transition-colors duration-300" style={{ color: isDark ? darkTextMuted : '#64748b' }}>Match</label><input type="text" value={sport.match || ""} onChange={(e) => updateSport(idx, 'match', e.target.value)} className="w-full text-xs p-1 border rounded transition-colors duration-300" style={{ backgroundColor: isDark ? '#2d2d2d' : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0', color: isDark ? darkText : '#0f172a' }} /></div>
                    <div><label className="block text-[8px] font-black uppercase transition-colors duration-300" style={{ color: isDark ? darkTextMuted : '#64748b' }}>Score</label><input type="text" value={sport.score || ""} onChange={(e) => updateSport(idx, 'score', e.target.value)} className="w-full text-xs p-1 border rounded transition-colors duration-300" style={{ backgroundColor: isDark ? '#2d2d2d' : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0', color: isDark ? darkText : '#0f172a' }} /></div>
                    <div><label className="block text-[8px] font-black uppercase transition-colors duration-300" style={{ color: isDark ? darkTextMuted : '#64748b' }}>Detail</label><input type="text" value={sport.detail || ""} onChange={(e) => updateSport(idx, 'detail', e.target.value)} className="w-full text-xs p-1 border rounded transition-colors duration-300" style={{ backgroundColor: isDark ? '#2d2d2d' : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0', color: isDark ? darkText : '#0f172a' }} /></div>
                    <div className="flex flex-col items-center justify-center"><label className="block text-[8px] font-black uppercase transition-colors duration-300" style={{ color: isDark ? darkTextMuted : '#64748b' }}>Show</label><button onClick={() => toggleSportShow(idx)} className={`px-3 py-1 rounded text-xs font-bold transition ${sport.show !== false ? "bg-emerald-600 text-white" : isDark ? "bg-slate-700 text-slate-300" : "bg-slate-300 text-slate-600"}`}>{sport.show !== false ? "ON" : "OFF"}</button></div>
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
            <h2 className="text-xl font-black mb-4 transition-colors duration-300" style={{ color: isDark ? darkText : '#0f172a' }}>Market Data</h2>
            <div className="rounded-xl border shadow-xs p-4 transition-colors duration-300" style={{ backgroundColor: isDark ? darkCardBg : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0' }}>
              <div className="flex justify-between items-center mb-4"><p className="text-xs transition-colors duration-300" style={{ color: isDark ? darkTextMuted : '#64748b' }}>Manual entry or auto-fetch</p><button onClick={autoFetchMarket} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition flex items-center gap-1 disabled:opacity-50"><Radio className="w-3 h-3" /> Fetch Live</button></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="block text-[10px] font-bold uppercase mb-1 transition-colors duration-300" style={{ color: isDark ? darkTextMuted : '#64748b' }}>Sensex Price</label><input type="text" value={market.sensex || ""} onChange={(e) => setMarketState({...market, sensex: e.target.value})} className="w-full text-sm p-2 border rounded-lg focus:outline-none focus:border-red-500 transition-colors duration-300" style={{ backgroundColor: isDark ? '#2d2d2d' : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0', color: isDark ? darkText : '#0f172a' }} /></div>
                <div><label className="block text-[10px] font-bold uppercase mb-1 transition-colors duration-300" style={{ color: isDark ? darkTextMuted : '#64748b' }}>Sensex Change</label><input type="text" value={market.sensexChange || ""} onChange={(e) => setMarketState({...market, sensexChange: e.target.value})} className="w-full text-sm p-2 border rounded-lg focus:outline-none focus:border-red-500 transition-colors duration-300" style={{ backgroundColor: isDark ? '#2d2d2d' : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0', color: isDark ? darkText : '#0f172a' }} /></div>
                <div><label className="block text-[10px] font-bold uppercase mb-1 transition-colors duration-300" style={{ color: isDark ? darkTextMuted : '#64748b' }}>Nifty 50 Price</label><input type="text" value={market.nifty || ""} onChange={(e) => setMarketState({...market, nifty: e.target.value})} className="w-full text-sm p-2 border rounded-lg focus:outline-none focus:border-red-500 transition-colors duration-300" style={{ backgroundColor: isDark ? '#2d2d2d' : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0', color: isDark ? darkText : '#0f172a' }} /></div>
                <div><label className="block text-[10px] font-bold uppercase mb-1 transition-colors duration-300" style={{ color: isDark ? darkTextMuted : '#64748b' }}>Nifty Change</label><input type="text" value={market.niftyChange || ""} onChange={(e) => setMarketState({...market, niftyChange: e.target.value})} className="w-full text-sm p-2 border rounded-lg focus:outline-none focus:border-red-500 transition-colors duration-300" style={{ backgroundColor: isDark ? '#2d2d2d' : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0', color: isDark ? darkText : '#0f172a' }} /></div>
                <div><label className="block text-[10px] font-bold uppercase mb-1 transition-colors duration-300" style={{ color: isDark ? darkTextMuted : '#64748b' }}>USD/INR</label><input type="text" value={market.usdInr} onChange={(e) => setMarketState({...market, usdInr: e.target.value})} className="w-full text-sm p-2 border rounded-lg focus:outline-none focus:border-red-500 transition-colors duration-300" style={{ backgroundColor: isDark ? '#2d2d2d' : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0', color: isDark ? darkText : '#0f172a' }} /></div>
                <div><label className="block text-[10px] font-bold uppercase mb-1 transition-colors duration-300" style={{ color: isDark ? darkTextMuted : '#64748b' }}>USD Change</label><input type="text" value={market.usdInrChange} onChange={(e) => setMarketState({...market, usdInrChange: e.target.value})} className="w-full text-sm p-2 border rounded-lg focus:outline-none focus:border-red-500 transition-colors duration-300" style={{ backgroundColor: isDark ? '#2d2d2d' : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0', color: isDark ? darkText : '#0f172a' }} /></div>
                <div><label className="block text-[10px] font-bold uppercase mb-1 transition-colors duration-300" style={{ color: isDark ? darkTextMuted : '#64748b' }}>Gold Rate</label><input type="text" value={market.goldRate} onChange={(e) => setMarketState({...market, goldRate: e.target.value})} className="w-full text-sm p-2 border rounded-lg focus:outline-none focus:border-red-500 transition-colors duration-300" style={{ backgroundColor: isDark ? '#2d2d2d' : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0', color: isDark ? darkText : '#0f172a' }} /></div>
                <div><label className="block text-[10px] font-bold uppercase mb-1 transition-colors duration-300" style={{ color: isDark ? darkTextMuted : '#64748b' }}>Gold Change</label><input type="text" value={market.goldChange} onChange={(e) => setMarketState({...market, goldChange: e.target.value})} className="w-full text-sm p-2 border rounded-lg focus:outline-none focus:border-red-500 transition-colors duration-300" style={{ backgroundColor: isDark ? '#2d2d2d' : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0', color: isDark ? darkText : '#0f172a' }} /></div>
              </div>
              <button onClick={saveMarket} className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-lg transition flex items-center gap-1"><Save className="w-3 h-3" /> Save Market Data</button>
            </div>
          </div>
        )}

        {/* ==================== WEATHER ==================== */}
        {activeTab === "weather" && (
          <div>
            <h2 className="text-xl font-black mb-4 transition-colors duration-300" style={{ color: isDark ? darkText : '#0f172a' }}>Weather Data</h2>
            <div className="rounded-xl border shadow-xs p-4 transition-colors duration-300" style={{ backgroundColor: isDark ? darkCardBg : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0' }}>
              <div className="flex justify-between items-center mb-4"><p className="text-xs transition-colors duration-300" style={{ color: isDark ? darkTextMuted : '#64748b' }}>Manage weather for multiple cities.</p><button onClick={autoFetchWeather} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition flex items-center gap-1 disabled:opacity-50"><Radio className="w-3 h-3" /> Fetch Live</button></div>
              <div className="border-b pb-4 mb-4 transition-colors duration-300" style={{ borderColor: isDark ? darkBorder : '#e2e8f0' }}>
                <h3 className="text-sm font-bold mb-3 transition-colors duration-300" style={{ color: isDark ? darkText : '#0f172a' }}>Default City</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div><label className="block text-[10px] font-bold uppercase mb-1 transition-colors duration-300" style={{ color: isDark ? darkTextMuted : '#64748b' }}>Temperature</label><input type="text" value={weather.temp} onChange={(e) => setWeatherState({...weather, temp: e.target.value})} className="w-full text-sm p-2 border rounded-lg focus:outline-none focus:border-red-500 transition-colors duration-300" style={{ backgroundColor: isDark ? '#2d2d2d' : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0', color: isDark ? darkText : '#0f172a' }} /></div>
                  <div><label className="block text-[10px] font-bold uppercase mb-1 transition-colors duration-300" style={{ color: isDark ? darkTextMuted : '#64748b' }}>City</label><input type="text" value={weather.city} onChange={(e) => setWeatherState({...weather, city: e.target.value})} className="w-full text-sm p-2 border rounded-lg focus:outline-none focus:border-red-500 transition-colors duration-300" style={{ backgroundColor: isDark ? '#2d2d2d' : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0', color: isDark ? darkText : '#0f172a' }} /></div>
                  <div><label className="block text-[10px] font-bold uppercase mb-1 transition-colors duration-300" style={{ color: isDark ? darkTextMuted : '#64748b' }}>Condition</label><input type="text" value={weather.condition} onChange={(e) => setWeatherState({...weather, condition: e.target.value})} className="w-full text-sm p-2 border rounded-lg focus:outline-none focus:border-red-500 transition-colors duration-300" style={{ backgroundColor: isDark ? '#2d2d2d' : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0', color: isDark ? darkText : '#0f172a' }} /></div>
                </div>
                <button onClick={saveWeather} className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-lg transition flex items-center gap-1"><Save className="w-3 h-3" /> Save Default City</button>
              </div>
              <div>
                <div className="flex items-center justify-between mb-3"><h3 className="text-sm font-bold transition-colors duration-300" style={{ color: isDark ? darkText : '#0f172a' }}>City-wise Weather</h3><div className="flex gap-2"><button onClick={addCity} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition flex items-center gap-1"><Plus className="w-3 h-3" /> Add City</button><button onClick={saveCities} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1 rounded-lg transition flex items-center gap-1"><Save className="w-3 h-3" /> Save Cities</button></div></div>
                {weatherCities.map((city, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-2 border rounded-lg mb-2 transition-colors duration-300" style={{ backgroundColor: isDark ? darkHover : '#f8fafc', borderColor: isDark ? darkBorder : '#f1f5f9' }}>
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input type="text" placeholder="City name" value={city.city || ""} onChange={(e) => updateCity(idx, 'city', e.target.value)} className="text-xs p-1 border rounded transition-colors duration-300" style={{ backgroundColor: isDark ? '#2d2d2d' : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0', color: isDark ? darkText : '#0f172a' }} />
                      <input type="text" placeholder="Temperature" value={city.temp || ""} onChange={(e) => updateCity(idx, 'temp', e.target.value)} className="text-xs p-1 border rounded transition-colors duration-300" style={{ backgroundColor: isDark ? '#2d2d2d' : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0', color: isDark ? darkText : '#0f172a' }} />
                      <input type="text" placeholder="Condition" value={city.condition || ""} onChange={(e) => updateCity(idx, 'condition', e.target.value)} className="text-xs p-1 border rounded transition-colors duration-300" style={{ backgroundColor: isDark ? '#2d2d2d' : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0', color: isDark ? darkText : '#0f172a' }} />
                    </div>
                    <button onClick={() => removeCity(idx)} className="text-red-500 hover:text-red-700 text-xs"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================== ELECTION ==================== */}
        {activeTab === "election" && (
          <div>
            <h2 className="text-xl font-black mb-4 transition-colors duration-300" style={{ color: isDark ? darkText : '#0f172a' }}>Election Data</h2>
            <p className="text-xs mb-4 transition-colors duration-300" style={{ color: isDark ? darkTextMuted : '#64748b' }}>Each state has its own independent party list. Parties can be added, removed, or renamed per state.</p>
            <div className="rounded-xl border shadow-xs p-4 mb-4 transition-colors duration-300" style={{ backgroundColor: isDark ? darkCardBg : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0' }}>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2"><label className="text-xs font-bold transition-colors duration-300" style={{ color: isDark ? darkTextSecondary : '#475569' }}>Show Election Section:</label><button onClick={toggleElectionVisibility} className={`px-3 py-1 rounded-lg text-xs font-bold transition ${electionVisible ? "bg-emerald-600 text-white" : isDark ? "bg-slate-700 text-slate-300" : "bg-slate-300 text-slate-600"}`}>{electionVisible ? "ON" : "OFF"}</button></div>
                {!electionVisible && <div className="flex-1 flex items-center gap-2"><input type="text" placeholder="No election message..." value={noElectionMessage} onChange={(e) => setNoElectionMessageState(e.target.value)} className="flex-1 text-xs p-2 border rounded-lg focus:outline-none focus:border-red-500 transition-colors duration-300" style={{ backgroundColor: isDark ? '#2d2d2d' : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0', color: isDark ? darkText : '#0f172a' }} /><button onClick={saveNoElectionMessage} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-2 rounded-lg transition">Save Message</button></div>}
                <button onClick={autoFetchElection} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition flex items-center gap-1 disabled:opacity-50"><Radio className="w-3 h-3" /> Fetch Live</button>
              </div>
            </div>
            <div className="rounded-xl border shadow-xs p-4 mb-4 transition-colors duration-300" style={{ backgroundColor: isDark ? darkCardBg : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0' }}>
              <h3 className="text-sm font-bold mb-3 transition-colors duration-300" style={{ color: isDark ? darkText : '#0f172a' }}>Election Settings</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div><label className="block text-[10px] font-bold uppercase mb-1 transition-colors duration-300" style={{ color: isDark ? darkTextMuted : '#64748b' }}>Title</label><input type="text" value={electionConfig.title} onChange={(e) => setElectionConfigState({...electionConfig, title: e.target.value})} className="w-full text-sm p-2 border rounded-lg focus:outline-none focus:border-red-500 transition-colors duration-300" style={{ backgroundColor: isDark ? '#2d2d2d' : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0', color: isDark ? darkText : '#0f172a' }} placeholder="e.g., Election Center 2026" /></div>
                <div><label className="block text-[10px] font-bold uppercase mb-1 transition-colors duration-300" style={{ color: isDark ? darkTextMuted : '#64748b' }}>Map Title</label><input type="text" value={electionConfig.liveMapTitle} onChange={(e) => setElectionConfigState({...electionConfig, liveMapTitle: e.target.value})} className="w-full text-sm p-2 border rounded-lg focus:outline-none focus:border-red-500 transition-colors duration-300" style={{ backgroundColor: isDark ? '#2d2d2d' : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0', color: isDark ? darkText : '#0f172a' }} placeholder="e.g., Live Results Map" /></div>
                <div><label className="block text-[10px] font-bold uppercase mb-1 transition-colors duration-300" style={{ color: isDark ? darkTextMuted : '#64748b' }}>Default Total Seats</label><input type="number" value={electionConfig.totalSeats} onChange={(e) => setElectionConfigState({...electionConfig, totalSeats: Number(e.target.value)})} className="w-full text-sm p-2 border rounded-lg focus:outline-none focus:border-red-500 transition-colors duration-300" style={{ backgroundColor: isDark ? '#2d2d2d' : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0', color: isDark ? darkText : '#0f172a' }} placeholder="e.g., 403" /></div>
              </div>
              <button onClick={saveElectionConfig} className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-lg transition flex items-center gap-1"><Save className="w-3 h-3" /> Save Config</button>
            </div>
            <div className="rounded-xl border shadow-xs p-4 transition-colors duration-300" style={{ backgroundColor: isDark ? darkCardBg : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0' }}>
              <div className="flex items-center justify-between mb-4"><h3 className="text-sm font-bold transition-colors duration-300" style={{ color: isDark ? darkText : '#0f172a' }}>State-wise Management</h3><div className="flex gap-2"><button onClick={addElectionState} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition flex items-center gap-1"><Plus className="w-3 h-3" /> Add State</button><button onClick={saveElectionStates} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1 rounded-lg transition flex items-center gap-1"><Save className="w-3 h-3" /> Save All States</button></div></div>
              <div className="space-y-6 max-h-[600px] overflow-y-auto">
                {electionStates.map((state, stateIdx) => {
                  const totalSeats = state.totalSeats || electionConfig.totalSeats || 0;
                  return (
                    <div key={stateIdx} className="p-4 border rounded-xl transition-colors duration-300" style={{ backgroundColor: isDark ? darkHover : '#f8fafc', borderColor: isDark ? darkBorder : '#e2e8f0' }}>
                      <div className="flex items-center gap-3 mb-4">
                        <input type="text" value={state.name || ""} onChange={(e) => updateElectionStateField(stateIdx, 'name', e.target.value)} className="text-sm font-black p-2 border rounded-lg focus:outline-none focus:border-red-500 flex-1 transition-colors duration-300" style={{ backgroundColor: isDark ? '#2d2d2d' : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0', color: isDark ? darkText : '#0f172a' }} placeholder="State name (e.g., Uttar Pradesh)" />
                        <div className="flex items-center gap-2"><label className="text-[10px] font-bold transition-colors duration-300" style={{ color: isDark ? darkTextMuted : '#64748b' }}>Total Seats:</label><input type="number" value={state.totalSeats || 0} onChange={(e) => updateElectionStateField(stateIdx, 'totalSeats', Number(e.target.value))} className="text-xs font-bold p-2 border rounded-lg w-20 text-center focus:outline-none focus:border-red-500 transition-colors duration-300" style={{ backgroundColor: isDark ? '#2d2d2d' : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0', color: isDark ? darkText : '#0f172a' }} placeholder="Total" /></div>
                        <button onClick={() => removeElectionState(stateIdx)} className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition"><Trash2 className="w-4 h-4" /></button>
                      </div>
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2"><label className="text-[10px] font-bold uppercase transition-colors duration-300" style={{ color: isDark ? darkTextMuted : '#64748b' }}>Parties &amp; Seats</label><button onClick={() => addPartyToState(stateIdx)} className="text-blue-600 hover:text-blue-700 text-[10px] font-bold flex items-center gap-1"><Plus className="w-3 h-3" /> Add Party</button></div>
                        <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(auto-fill, minmax(120px, 1fr))` }}>
                          {state.parties.map((party, partyIdx) => {
                            const seats = state[party.key] || 0;
                            return (
                              <div key={party.key} className="border rounded-lg p-3 transition-colors duration-300" style={{ backgroundColor: isDark ? darkCardBg : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0' }}>
                                <div className="flex items-center justify-between mb-1">
                                  <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: fillColorMap[party.color] || '#94a3b8' }}></span><input type="text" value={party.name} onChange={(e) => updatePartyInState(stateIdx, partyIdx, 'name', e.target.value)} className="text-[10px] font-bold p-0.5 border rounded w-14 focus:outline-none focus:border-red-500 bg-transparent transition-colors duration-300" style={{ borderColor: isDark ? darkBorder : '#e2e8f0', color: isDark ? darkText : '#0f172a' }} /></div>
                                  {state.parties.length > 1 && <button onClick={() => removePartyFromState(stateIdx, partyIdx)} className="text-red-500 hover:text-red-700"><X className="w-3 h-3" /></button>}
                                </div>
                                <input type="number" value={seats} onChange={(e) => updateElectionStateSeat(stateIdx, party.key, Number(e.target.value))} className="w-full text-lg font-black text-center p-1 border rounded focus:outline-none focus:border-red-500 transition-colors duration-300" style={{ backgroundColor: isDark ? '#2d2d2d' : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0', color: isDark ? darkText : '#0f172a' }} min="0" />
                                <select value={party.color} onChange={(e) => updatePartyInState(stateIdx, partyIdx, 'color', e.target.value)} className="text-[8px] w-full mt-1 p-0.5 border rounded transition-colors duration-300" style={{ backgroundColor: isDark ? '#2d2d2d' : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0', color: isDark ? darkText : '#0f172a' }}><option value="orange">🟠 Orange</option><option value="red">🔴 Red</option><option value="sky">🔵 Sky</option><option value="slate">⚫ Slate</option><option value="green">🟢 Green</option><option value="purple">🟣 Purple</option><option value="yellow">🟡 Yellow</option><option value="pink">🌸 Pink</option><option value="blue">💙 Blue</option></select>
                                <div className="text-[9px] font-bold mt-1 text-center transition-colors duration-300" style={{ color: isDark ? darkTextMuted : '#94a3b8' }}>{totalSeats > 0 ? ((seats / totalSeats) * 100).toFixed(1) : 0}%</div>
                                <div className="mt-1"><input type="text" value={party.key} onChange={(e) => updatePartyInState(stateIdx, partyIdx, 'key', e.target.value)} className="text-[8px] w-full p-0.5 border rounded transition-colors duration-300" style={{ backgroundColor: isDark ? '#2d2d2d' : '#f8fafc', borderColor: isDark ? darkBorder : '#e2e8f0', color: isDark ? darkTextMuted : '#94a3b8' }} placeholder="key" /></div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <div className="mb-3"><label className="block text-[10px] font-bold uppercase mb-1 transition-colors duration-300" style={{ color: isDark ? darkTextMuted : '#64748b' }}>State Notes</label><textarea value={state.notes || ""} onChange={(e) => updateElectionStateField(stateIdx, 'notes', e.target.value)} className="w-full text-xs p-2 border rounded-lg focus:outline-none focus:border-red-500 h-16 transition-colors duration-300" style={{ backgroundColor: isDark ? '#2d2d2d' : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0', color: isDark ? darkText : '#0f172a' }} placeholder="Add notes about this state (e.g., Key battleground regions, historical context...)" /></div>
                      <div>
                        <div className="flex items-center justify-between mb-2"><label className="block text-[10px] font-bold uppercase transition-colors duration-300" style={{ color: isDark ? darkTextMuted : '#64748b' }}>Reference Links</label><button onClick={() => addLinkToState(stateIdx)} className="text-blue-600 hover:text-blue-700 text-[10px] font-bold flex items-center gap-1"><Plus className="w-3 h-3" /> Add Link</button></div>
                        {(state.links || []).map((link: any, linkIdx: number) => (
                          <div key={linkIdx} className="flex items-center gap-2 mb-2">
                            <input type="text" value={link.title || ""} onChange={(e) => updateStateLink(stateIdx, linkIdx, 'title', e.target.value)} className="flex-1 text-xs p-2 border rounded-lg focus:outline-none focus:border-red-500 transition-colors duration-300" style={{ backgroundColor: isDark ? '#2d2d2d' : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0', color: isDark ? darkText : '#0f172a' }} placeholder="Link title (e.g., Official Results)" />
                            <input type="text" value={link.url || ""} onChange={(e) => updateStateLink(stateIdx, linkIdx, 'url', e.target.value)} className="flex-1 text-xs p-2 border rounded-lg focus:outline-none focus:border-red-500 transition-colors duration-300" style={{ backgroundColor: isDark ? '#2d2d2d' : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0', color: isDark ? darkText : '#0f172a' }} placeholder="URL (https://...)" />
                            <button onClick={() => removeStateLink(stateIdx, linkIdx)} className="text-red-500 hover:text-red-700 p-1"><X className="w-3 h-3" /></button>
                          </div>
                        ))}
                        {(state.links || []).length === 0 && <p className="text-[10px] transition-colors duration-300" style={{ color: isDark ? darkTextMuted : '#94a3b8' }}>No reference links added for this state.</p>}
                      </div>
                    </div>
                  );
                })}
                {electionStates.length === 0 && <div className="text-center py-8"><p className="text-sm transition-colors duration-300" style={{ color: isDark ? darkTextMuted : '#94a3b8' }}>No states added yet.</p><button onClick={addElectionState} className="mt-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-lg transition flex items-center gap-1 mx-auto"><Plus className="w-3 h-3" /> Add First State</button></div>}
              </div>
            </div>
          </div>
        )}

        {/* ==================== TICKER ==================== */}
        {activeTab === "ticker" && (
          <div>
            <h2 className="text-xl font-black mb-4 transition-colors duration-300" style={{ color: isDark ? darkText : '#0f172a' }}>Manage Ticker Items</h2>
            <div className="rounded-xl border shadow-xs p-4 mb-6 transition-colors duration-300" style={{ backgroundColor: isDark ? darkCardBg : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0' }}>
              <h3 className="text-sm font-bold mb-3 transition-colors duration-300" style={{ color: isDark ? darkText : '#0f172a' }}>Add Ticker</h3>
              <div className="flex gap-3"><input type="text" placeholder="Ticker text..." value={newTickerText} onChange={(e) => setNewTickerText(e.target.value)} className="flex-1 text-xs p-2 border rounded-lg transition-colors duration-300" style={{ backgroundColor: isDark ? '#2d2d2d' : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0', color: isDark ? darkText : '#0f172a' }} /><button onClick={handleAddTicker} className="bg-red-600 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1"><Plus className="w-3 h-3" /> Add</button></div>
            </div>
            {editingTicker && (
              <div className="rounded-xl border shadow-xs p-4 mb-6 transition-colors duration-300" style={{ backgroundColor: isDark ? darkCardBg : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0' }}>
                <h3 className="text-sm font-bold mb-3 transition-colors duration-300" style={{ color: isDark ? darkText : '#0f172a' }}>Edit: {editingTicker.text}</h3>
                <div className="space-y-4">
                  <div><label className="block text-[10px] font-bold uppercase mb-1 transition-colors duration-300" style={{ color: isDark ? darkTextMuted : '#64748b' }}>Text</label><input type="text" value={tickerForm.text} onChange={(e) => setTickerForm({...tickerForm, text: e.target.value})} className="w-full text-xs p-2 border rounded-lg transition-colors duration-300" style={{ backgroundColor: isDark ? '#2d2d2d' : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0', color: isDark ? darkText : '#0f172a' }} /></div>
                  <div><label className="block text-[10px] font-bold uppercase mb-1 transition-colors duration-300" style={{ color: isDark ? darkTextMuted : '#64748b' }}>Active</label><button onClick={() => setTickerForm({...tickerForm, active: !tickerForm.active})} className={`px-3 py-1 rounded text-xs font-bold ${tickerForm.active ? "bg-emerald-600 text-white" : isDark ? "bg-slate-700 text-slate-300" : "bg-slate-300 text-slate-600"}`}>{tickerForm.active ? "ON" : "OFF"}</button></div>
                  <div className="border-t pt-3 transition-colors duration-300" style={{ borderColor: isDark ? darkBorder : '#e2e8f0' }}>
                    <label className="block text-[10px] font-bold uppercase mb-2 transition-colors duration-300" style={{ color: isDark ? darkTextMuted : '#64748b' }}>Filter Content</label>
                    <div className="flex gap-3 mb-3"><select value={tickerLinkLang} onChange={(e) => setTickerLinkLang(e.target.value)} className="text-xs p-2 border rounded-lg transition-colors duration-300" style={{ backgroundColor: isDark ? '#2d2d2d' : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0', color: isDark ? darkText : '#0f172a' }}><option value="">All Languages</option>{LANGUAGES.map(l => (<option key={l.code} value={l.code}>{l.nativeName}</option>))}</select><select value={tickerLinkCat} onChange={(e) => setTickerLinkCat(e.target.value)} className="text-xs p-2 border rounded-lg transition-colors duration-300" style={{ backgroundColor: isDark ? '#2d2d2d' : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0', color: isDark ? darkText : '#0f172a' }}><option value="">All Categories</option>{ALL_CATEGORIES.map(c => (<option key={c} value={c}>{c}</option>))}</select></div>
                  </div>
                  {['stories','latest','videos'].map(type => (
                    <div key={type}>
                      <label className="block text-[10px] font-bold uppercase mb-1 transition-colors duration-300" style={{ color: isDark ? darkTextMuted : '#64748b' }}>Linked {type === 'stories' ? 'Top Stories' : type === 'latest' ? 'Latest News' : 'Videos'}</label>
                      <div className="flex flex-wrap gap-2 p-2 border rounded-lg max-h-40 overflow-y-auto transition-colors duration-300" style={{ backgroundColor: isDark ? darkHover : '#f8fafc', borderColor: isDark ? darkBorder : '#e2e8f0' }}>
                        {(type === 'stories' ? getFilteredTopStories() : type === 'latest' ? getFilteredLatestNews() : getFilteredVideos()).map((item: any) => (
                          <button key={item.id} onClick={() => toggleLinkedItem(type as 'stories'|'latest'|'videos', item.id)} className={`text-xs px-3 py-1 rounded-full transition ${tickerForm[type === 'stories' ? 'linkedStories' : type === 'latest' ? 'linkedLatest' : 'linkedVideos'].includes(item.id) ? "bg-red-600 text-white" : isDark ? "bg-[#2d2d2d] text-[#c8c8c8] hover:bg-[#3d3d3d]" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                            {item.title?.substring(0,25)}{item.title?.length > 25 ? '...' : ''}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-2"><button onClick={handleUpdateTicker} className="bg-emerald-600 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1"><Save className="w-3 h-3" /> Update</button><button onClick={resetTickerForm} className="bg-slate-600 text-white font-bold text-xs px-4 py-2 rounded-lg">Cancel</button></div>
                </div>
              </div>
            )}
            <div className="rounded-xl border shadow-xs p-4 transition-colors duration-300" style={{ backgroundColor: isDark ? darkCardBg : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0' }}>
              <h3 className="text-sm font-bold mb-3 transition-colors duration-300" style={{ color: isDark ? darkText : '#0f172a' }}>Ticker Items ({ticker.length})</h3>
              <div className="flex flex-wrap gap-2">
                {ticker.map((item) => (
                  <div key={item.id} className="flex items-center gap-1 border rounded-lg px-3 py-1.5 text-xs transition-colors duration-300" style={{ backgroundColor: isDark ? darkHover : '#f8fafc', borderColor: isDark ? darkBorder : '#f1f5f9' }}>
                    <span className={item.active === false ? 'text-slate-400 line-through' : ''} style={{ color: isDark ? darkTextMuted : '#64748b' }}>{item.text}</span>
                    {item.linkedStories?.length > 0 && <span className="text-[8px] font-bold px-1 rounded transition-colors duration-300" style={{ backgroundColor: isDark ? '#1e3a5f' : '#eff6ff', color: isDark ? '#60a5fa' : '#2563eb' }}>📰{item.linkedStories.length}</span>}
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
            <h2 className="text-xl font-black mb-4 transition-colors duration-300" style={{ color: isDark ? darkText : '#0f172a' }}>TV Channels</h2>
            <div className="rounded-xl border shadow-xs p-4 mb-6 transition-colors duration-300" style={{ backgroundColor: isDark ? darkCardBg : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0' }}>
              <h3 className="text-sm font-bold mb-3 flex items-center justify-between transition-colors duration-300" style={{ color: isDark ? darkText : '#0f172a' }}>
                {editingChannel ? "Edit Channel" : "Add TV Channel"}
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 text-[10px] font-bold cursor-pointer transition-colors duration-300" style={{ color: isDark ? darkTextMuted : '#64748b' }}>
                    <input type="checkbox" checked={channelForm.featuredInAll} onChange={(e) => setChannelForm({...channelForm, featuredInAll: e.target.checked})} className="w-3 h-3 rounded border-slate-300 dark:border-[#333333] text-amber-600 focus:ring-amber-500" />
                    Show in All Languages
                  </label>
                  <span className="text-[10px] font-bold transition-colors duration-300" style={{ color: isDark ? darkTextMuted : '#64748b' }}>Language:</span>
                  <select value={channelForm.language} onChange={(e) => setChannelForm({...channelForm, language: e.target.value})} className="text-xs p-1.5 border rounded-lg transition-colors duration-300" style={{ backgroundColor: isDark ? '#2d2d2d' : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0', color: isDark ? darkText : '#0f172a' }}>
                    {LANGUAGES.map(lang => (<option key={lang.code} value={lang.code}>{lang.nativeName}</option>))}
                  </select>
                </div>
              </h3>
              <div className="grid grid-cols-1 gap-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input type="text" placeholder="Channel name..." value={channelForm.name} onChange={(e) => setChannelForm({...channelForm, name: e.target.value})} className="text-xs p-2 border rounded-lg transition-colors duration-300" style={{ backgroundColor: isDark ? '#2d2d2d' : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0', color: isDark ? darkText : '#0f172a' }} />
                  <input type="text" placeholder="Logo URL..." value={channelForm.logo} onChange={(e) => setChannelForm({...channelForm, logo: e.target.value})} className="text-xs p-2 border rounded-lg transition-colors duration-300" style={{ backgroundColor: isDark ? '#2d2d2d' : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0', color: isDark ? darkText : '#0f172a' }} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase mb-2 transition-colors duration-300" style={{ color: isDark ? darkTextMuted : '#64748b' }}>Stream URLs</label>
                  {channelForm.urls.map((url, i) => (
                    <div key={i} className="flex items-center gap-2 mb-2">
                      <input type="text" placeholder={`URL ${i + 1}...`} value={url} onChange={(e) => updateChannelUrl(i, e.target.value)} className="flex-1 text-xs p-2 border rounded-lg transition-colors duration-300" style={{ backgroundColor: isDark ? '#2d2d2d' : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0', color: isDark ? darkText : '#0f172a' }} />
                      {i === 0 && <span className="text-[8px] font-bold px-1.5 py-0.5 rounded transition-colors duration-300" style={{ backgroundColor: isDark ? '#1e3a5f' : '#eff6ff', color: isDark ? '#60a5fa' : '#2563eb' }}>Primary</span>}
                      {channelForm.urls.length > 1 && <button onClick={() => removeChannelUrl(i)} className="text-red-500"><MinusCircle className="w-4 h-4" /></button>}
                    </div>
                  ))}
                  <button onClick={addChannelUrl} className="text-blue-600 text-xs font-bold flex items-center gap-1 mt-1"><PlusCircle className="w-3 h-3" /> Add Backup URL</button>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase mb-1 transition-colors duration-300" style={{ color: isDark ? darkTextMuted : '#64748b' }}>Type (auto-detected)</label>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${channelForm.type === 'youtube' ? 'bg-red-100 text-red-700' : channelForm.type === 'hls' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                    {channelForm.type === 'youtube' ? '🎬 YouTube' : channelForm.type === 'hls' ? '📡 HLS' : '🌐 Iframe'}
                  </span>
                </div>
                <div className="flex gap-2">
                  {editingChannel ? (
                    <><button onClick={handleUpdateChannel} className="bg-emerald-600 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1"><Save className="w-3 h-3" /> Update</button><button onClick={resetChannelForm} className="bg-slate-600 text-white font-bold text-xs px-4 py-2 rounded-lg">Cancel</button></>
                  ) : (
                    <button onClick={handleAddChannel} className="bg-red-600 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1"><Plus className="w-3 h-3" /> Add Channel</button>
                  )}
                </div>
              </div>
            </div>
            <div className="rounded-xl border shadow-xs p-4 transition-colors duration-300" style={{ backgroundColor: isDark ? darkCardBg : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0' }}>
              <h3 className="text-sm font-bold mb-3 transition-colors duration-300" style={{ color: isDark ? darkText : '#0f172a' }}>Channels ({tvChannels.length})</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {tvChannels.map((channel) => (
                  <div key={channel.id} className="flex flex-col items-center p-3 border rounded-lg transition-colors duration-300" style={{ backgroundColor: isDark ? darkHover : '#f8fafc', borderColor: isDark ? darkBorder : '#f1f5f9' }}>
                    {channel.logo?.startsWith('http') ? <img src={channel.logo} alt={channel.name} className="w-14 h-14 rounded-full object-cover border-2 border-slate-200" /> : <div className="w-14 h-14 rounded-full flex items-center justify-center font-black text-sm transition-colors duration-300" style={{ backgroundColor: isDark ? '#2d2d2d' : '#e2e8f0', color: isDark ? darkTextMuted : '#94a3b8' }}>{channel.logo || channel.name?.substring(0,2).toUpperCase()}</div>}
                    <div className="flex items-center gap-1 mt-1"><span className="text-xs font-medium text-center transition-colors duration-300" style={{ color: isDark ? darkText : '#1f2937' }}>{channel.name}</span>{channel.featuredInAll && <span className="text-[10px]">⭐</span>}</div>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded mt-1 transition-colors duration-300" style={{ backgroundColor: isDark ? '#1e3a5f' : '#eff6ff', color: isDark ? '#60a5fa' : '#2563eb' }}>{LANGUAGES.find(l => l.code === channel.language)?.nativeName || channel.language || 'en'}</span>
                    <span className="text-[8px] uppercase transition-colors duration-300" style={{ color: isDark ? darkTextMuted : '#94a3b8' }}>{channel.type}</span>
                    {channel.urls?.length > 1 && <span className="text-[8px] font-bold transition-colors duration-300" style={{ color: isDark ? '#fbbf24' : '#d97706' }}>🔗 +{channel.urls.length - 1}</span>}
                    <div className="flex gap-1 mt-1"><button onClick={() => handleEditChannel(channel)} className="text-blue-500"><Edit2 className="w-3 h-3" /></button><button onClick={() => handleDeleteChannel(channel.id)} className="text-red-500"><Trash2 className="w-3 h-3" /></button></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================== FOOTER ==================== */}
        {activeTab === "footer" && (
          <div>
            <h2 className="text-xl font-black mb-4 transition-colors duration-300" style={{ color: isDark ? darkText : '#0f172a' }}>Footer Settings</h2>
            <div className="rounded-xl border shadow-xs p-4 mb-6 transition-colors duration-300" style={{ backgroundColor: isDark ? darkCardBg : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0' }}>
              <h3 className="text-sm font-bold mb-3 transition-colors duration-300" style={{ color: isDark ? darkText : '#0f172a' }}>Description</h3>
              <div><label className="block text-[10px] font-bold uppercase mb-1 transition-colors duration-300" style={{ color: isDark ? darkTextMuted : '#64748b' }}>Footer Description</label><textarea value={footerDesc} onChange={(e) => setFooterDesc(e.target.value)} className="w-full text-sm p-2 border rounded-lg h-24 transition-colors duration-300" style={{ backgroundColor: isDark ? '#2d2d2d' : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0', color: isDark ? darkText : '#0f172a' }} /></div>
              <button onClick={saveFooter} className="mt-4 bg-emerald-600 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1"><Save className="w-3 h-3" /> Save</button>
            </div>
            <div className="rounded-xl border shadow-xs p-4 transition-colors duration-300" style={{ backgroundColor: isDark ? darkCardBg : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0' }}>
              <div className="flex items-center justify-between mb-3"><h3 className="text-sm font-bold transition-colors duration-300" style={{ color: isDark ? darkText : '#0f172a' }}>Social Media Links</h3><button onClick={addSocialLink} className="bg-blue-600 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1"><Plus className="w-3 h-3" /> Add Link</button></div>
              {socialLinks.map((link, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2 border rounded-lg mb-2 transition-colors duration-300" style={{ backgroundColor: isDark ? darkHover : '#f8fafc', borderColor: isDark ? darkBorder : '#f1f5f9' }}>
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2"><input type="text" placeholder="Platform name" value={link.platform} onChange={(e) => updateSocialLink(idx, 'platform', e.target.value)} className="text-xs p-2 border rounded-lg transition-colors duration-300" style={{ backgroundColor: isDark ? '#2d2d2d' : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0', color: isDark ? darkText : '#0f172a' }} /><input type="text" placeholder="URL" value={link.url} onChange={(e) => updateSocialLink(idx, 'url', e.target.value)} className="text-xs p-2 border rounded-lg transition-colors duration-300" style={{ backgroundColor: isDark ? '#2d2d2d' : '#ffffff', borderColor: isDark ? darkBorder : '#e2e8f0', color: isDark ? darkText : '#0f172a' }} /></div>
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