// ============================================================
// COMPLETE DATA FILE - All content in one place
// ============================================================

export interface NewsItem {
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

export interface CricketData {
  match: string;
  score: string;
  overs: string;
}

export interface MarketData {
  usdInr: string;
  usdInrChange: string;
  goldRate: string;
  goldChange: string;
  sensex?: string;
  sensexChange?: string;
  nifty?: string;
  niftyChange?: string;
}

export interface WeatherData {
  temp: string;
  city: string;
  condition: string;
}

export interface ElectionState {
  name: string;
  totalSeats?: number;
  notes?: string;
  links?: { title: string; url: string }[];
  parties: { key: string; name: string; color: string }[];
  [key: string]: any;
}

export interface ElectionConfig {
  title: string;
  liveMapTitle: string;
  totalSeats: number;
}

export interface VideoData {
  id: string;
  title: string;
  img: string;
  link: string;
  category?: string;
  language?: string;
  featuredInAll?: boolean;
  translations?: Record<string, { title: string; category?: string }>;
}

export interface TVChannel {
  id: string;
  name: string;
  logo: string;
  embedUrl?: string;
  urls?: string[];
  type: "youtube" | "hls" | "iframe";
  language?: string;
  featuredInAll?: boolean;
  translations?: Record<string, { name: string; urls: string[] }>;
}

export interface TickerItem {
  id: string;
  text: string;
  active?: boolean;
  linkedStories?: string[];
  linkedLatest?: string[];
  linkedVideos?: string[];
  translations?: Record<string, { text: string }>;
}

export interface SportItem {
  sport: string;
  match: string;
  score: string;
  detail: string;
  show?: boolean;
  translations?: Record<string, { sport: string; match: string; detail: string }>;
}

export interface WeatherCity {
  city: string;
  temp: string;
  condition: string;
  translations?: Record<string, { city: string; condition: string }>;
}

// ---------- DATA ----------

export const topStories: NewsItem[] = [
  // ... your existing top stories (keep your own)
];

export const latestNews: NewsItem[] = [
  // ... your existing latest news
];

export const cricketData: CricketData = {
  match: "IND vs AUS, 2nd Test",
  score: "India 256/4",
  overs: "62.3 Overs",
};

export const marketData: MarketData = {
  usdInr: "83.36",
  usdInrChange: "-0.12 (0.14%)",
  goldRate: "72,650",
  goldChange: "+1,250 (1.75%)",
  sensex: "72,854.21",
  sensexChange: "-520.36 (-0.71%)",
  nifty: "22,155.35",
  niftyChange: "-157.80 (-0.71%)",
};

export const weatherData: WeatherData = {
  temp: "29°C",
  city: "New Delhi",
  condition: "Haze",
};

export const electionConfig: ElectionConfig = {
  title: "Election Center 2026",
  liveMapTitle: "Live Results Map",
  totalSeats: 403,
};

export const electionStates: ElectionState[] = [
  // ... your election states (keep your own)
];

export const trendingVideos: VideoData[] = [
  // ... your videos
];

export const tvChannels: TVChannel[] = [
  // ... your TV channels
];

export const trendingTickerItems: TickerItem[] = [
  // ... your ticker items
];

export const footerData = {
  description: "News that matters, stories that inspire...",
  quickLinks: [
    { name: "About Us", link: "/info/about" },
    { name: "Advertise", link: "/info/advertise" },
    { name: "Contact Us", link: "/info/contact" },
    { name: "Privacy Policy", link: "/info/privacy" },
    { name: "Terms of Use", link: "/info/terms" },
    { name: "Disclaimer", link: "/info/disclaimer" },
  ],
  socialLinks: [
    { name: "Facebook", icon: "facebook", link: "#" },
    { name: "Twitter", icon: "twitter", link: "#" },
    { name: "Instagram", icon: "instagram", link: "#" },
    { name: "Youtube", icon: "youtube", link: "#" },
  ],
  languages: ["English", "हिंदी", "বাংলা", "తెలుగు", "मराठी", "தமிழ்", "ગુજરાતી", "ಕನ್ನಡ", "മലയാളം", "ਪੰਜਾਬੀ"],
  copyright: "Unsung News Network. All Rights Reserved.",
};

export const defaultSports: SportItem[] = [
  { sport: "Cricket", match: "IND vs AUS, 2nd Test", score: "India 256/4", detail: "62.3 Overs", show: true },
  { sport: "Kabaddi", match: "India vs Iran", score: "35-28", detail: "Final", show: false },
  { sport: "Football", match: "Barcelona vs Real Madrid", score: "2-1", detail: "90+3' goal", show: false },
];

export const defaultWeatherCities: WeatherCity[] = [
  { city: "New Delhi", temp: "29°C", condition: "Haze" },
  { city: "Mumbai", temp: "32°C", condition: "Sunny" },
  { city: "Chennai", temp: "34°C", condition: "Partly Cloudy" },
  { city: "Kolkata", temp: "30°C", condition: "Humid" },
  { city: "Bengaluru", temp: "27°C", condition: "Clear" },
  { city: "Hyderabad", temp: "31°C", condition: "Cloudy" },
];

// ============================================================
// CATEGORIES (for header)
// ============================================================

export const categories = [
  { name: "Home", link: "/" },
  { name: "Latest", link: "/category/latest" },
  { name: "India", link: "/category/india" },
  { name: "Politics", link: "/category/politics" },
  { name: "Business", link: "/category/business" },
  { name: "Sports", link: "/category/sports" },
  { name: "Entertainment", link: "/category/entertainment" },
  { name: "Tech", link: "/category/tech" },
  { name: "Lifestyle", link: "/category/lifestyle" },
];