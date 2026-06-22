// app/lib/data.ts
// ============================================================
// COMPLETE DATA FILE - All content in one place
// Edit this file to update your website content
// ============================================================

// ============================================================
// 1. TYPES
// ============================================================

export interface NewsItem {
  id: string;
  title: string;
  category: string;
  time: string;
  image: string;
  link: string;
  description?: string;
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
  bjp: number;
  sp: number;
  cong: number;
  oth: number;
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
}

export interface TVChannel {
  id: string;
  name: string;
  logo: string;
  embedUrl: string;
  type: "youtube" | "hls" | "iframe";
}

export interface TickerItem {
  id: string;
  text: string;
  active?: boolean;
}

export interface SportItem {
  sport: string;
  match: string;
  score: string;
  detail: string;
}

export interface WeatherCity {
  city: string;
  temp: string;
  condition: string;
}

// ============================================================
// 2. TOP STORIES
// ============================================================

export const topStories: NewsItem[] = [
  {
    id: "ts-1",
    title: "Coalition Talks Accelerate Ahead of Final Election Verdict",
    category: "Politics",
    time: "45 mins ago",
    image: "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&q=80&w=400",
    link: "/news/ts-1",
    description: "In a significant political development, coalition partners have intensified their negotiations as the final election verdict approaches. Sources indicate that both major alliances are making last-minute efforts to secure the numbers needed to form the government."
  },
  {
    id: "ts-2",
    title: "Market Index Surges To All-Time High Over Capital Inflows",
    category: "Business",
    time: "1 hour ago",
    image: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=400",
    link: "/news/ts-2",
    description: "Indian stock markets reached unprecedented heights today as foreign institutional investors continued their buying spree. The benchmark indices, Sensex and Nifty, both hit new record highs, driven by strong foreign capital inflows and positive global cues."
  },
  {
    id: "ts-3",
    title: "India beat Australia by 6 wickets in 2nd Test, level series 1-1",
    category: "Sports",
    time: "2 hours ago",
    image: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&q=80&w=400",
    link: "/news/ts-3",
    description: "In a thrilling encounter at the Melbourne Cricket Ground, India chased down a challenging target of 245 runs with six wickets in hand. The victory was powered by a brilliant century from the captain and crucial contributions from the middle order."
  }
];


// ============================================================
// 3. LATEST NEWS
// ============================================================

export const latestNews: NewsItem[] = [
  {
    id: "ln-1",
    title: "Heatwave conditions continue in north India; IMD issues orange alert",
    category: "India",
    time: "30 mins ago",
    image: "https://images.unsplash.com/photo-1504370805625-d32c54b16100?auto=format&fit=crop&q=80&w=300",
    link: "/news/ln-1",
    description: "The India Meteorological Department has issued an orange alert for several northern states as heatwave conditions persist. Temperatures are expected to remain above 45°C in many parts of the region for the next 48 hours."
  },
  {
    id: "ln-2",
    title: "OpenAI launches new AI model 'GPT-5' with advanced features",
    category: "Tech",
    time: "1 hour ago",
    image: "https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&q=80&w=300",
    link: "/news/ln-2",
    description: "OpenAI has unveiled its latest artificial intelligence model, GPT-5, which promises significant improvements in reasoning, contextual understanding, and complex problem-solving capabilities. The new model is now available to select users."
  },
  {
    id: "ln-3",
    title: "Janhvi Kapoor to star in upcoming period drama film",
    category: "Entertainment",
    time: "2 hours ago",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300",
    link: "/news/ln-3",
    description: "Actress Janhvi Kapoor has been signed for a major period drama film set in the 18th century. The film, directed by a renowned filmmaker, is expected to go on floors later this year."
  },
  {
    id: "ln-4",
    title: "Gold prices hit record high; check latest rates today",
    category: "Business",
    time: "3 hours ago",
    image: "https://images.unsplash.com/photo-1610374792793-f016b77ca51a?auto=format&fit=crop&q=80&w=300",
    link: "/news/ln-4",
    description: "Gold prices surged to an all-time high today, crossing the ₹74,000 per 10 grams mark. The rally was driven by global uncertainties, weakening dollar, and strong demand from jewellery retailers."
  },
  {
    id: "ln-5",
    title: "US and China hold talks to ease trade tensions",
    category: "World",
    time: "4 hours ago",
    image: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80&w=300",
    link: "/news/ln-5",
    description: "Senior officials from the United States and China have begun a new round of trade talks aimed at de-escalating tensions between the world's two largest economies. Both sides have expressed optimism about reaching a mutual understanding."
  }
];

// ============================================================
// 4. CRICKET DATA
// ============================================================

export const cricketData: CricketData = {
  match: "IND vs AUS, 2nd Test",
  score: "India 256/4",
  overs: "62.3 Overs"
};

// ============================================================
// 5. MARKET DATA (extended with Sensex and Nifty)
// ============================================================

export const marketData: MarketData = {
  usdInr: "83.36",
  usdInrChange: "-0.12 (0.14%)",
  goldRate: "72,650",
  goldChange: "+1,250 (1.75%)",
  sensex: "72,854.21",
  sensexChange: "-520.36 (-0.71%)",
  nifty: "22,155.35",
  niftyChange: "-157.80 (-0.71%)"
};

// ============================================================
// 6. WEATHER DATA (legacy single city)
// ============================================================

export const weatherData: WeatherData = {
  temp: "29°C",
  city: "New Delhi",
  condition: "Haze"
};

// ============================================================
// 7. ELECTION CONFIG
// ============================================================

export const electionConfig: ElectionConfig = {
  title: "Election Center 2026",
  liveMapTitle: "Live Results Map",
  totalSeats: 403
};

// ============================================================
// 8. ELECTION STATES
// ============================================================

export const electionStates: ElectionState[] = [
  { name: "Uttar Pradesh", bjp: 215, sp: 125, cong: 45, oth: 18 },
  { name: "Maharashtra", bjp: 145, sp: 12, cong: 88, oth: 43 },
  { name: "West Bengal", bjp: 77, sp: 0, cong: 0, oth: 217 },
  { name: "Bihar", bjp: 74, sp: 0, cong: 19, oth: 150 },
  { name: "Tamil Nadu", bjp: 4, sp: 0, cong: 9, oth: 221 },
  { name: "Karnataka", bjp: 66, sp: 0, cong: 135, oth: 23 },
  { name: "Gujarat", bjp: 156, sp: 0, cong: 17, oth: 9 }
];

// ============================================================
// 9. VIDEOS
// ============================================================

export const trendingVideos: VideoData[] = [
  { 
    id: "vid-1",
    title: "Public Reaction on Election results", 
    img: "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&q=80&w=300",
    link: "/watch/election-reaction",
    category: "Politics"
  },
  { 
    id: "vid-2",
    title: "Stock Market Crash Explained", 
    img: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=300",
    link: "/watch/market-crash",
    category: "Business"
  },
  { 
    id: "vid-3",
    title: "Match Highlights: IND vs AUS", 
    img: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&q=80&w=300",
    link: "/watch/match-highlights",
    category: "Sports"
  },
  { 
    id: "vid-4",
    title: "Behind the Scenes of Film Set", 
    img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300",
    link: "/watch/film-set",
    category: "Entertainment"
  }
];

// ============================================================
// 10. HERO SECTION
// ============================================================

export const heroData = {
  title: "West Bengal Election Results 2026 Live Updates",
  image: "https://images.unsplash.com/photo-1614728263952-84ea206f99b6?auto=format&fit=crop&q=80&w=1200",
  time: "2 mins ago",
  viewers: "12.4K",
  category: "Elections 2026",
  link: "/news/election-2026"
};

// ============================================================
// 11. ELECTION BANNER
// ============================================================

export const electionBanner = {
  title: "Election Results 2026",
  description: "Get real-time updates, live analytics and trend results.",
  buttonText: "Explore Now",
  buttonLink: "/election-2026"
};

// ============================================================
// 12. HEADER DATA
// ============================================================

export const headerData = {
  dateFormat: "long",
  weather: "29°C New Delhi"
};

// ============================================================
// 13. CATEGORIES
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
  { name: "Lifestyle", link: "/category/lifestyle" }
];

// ============================================================
// 14. TRENDING TICKER
// ============================================================

export const trendingTickerItems: TickerItem[] = [
  { id: "tick-1", text: "India vs Australia Test Series", active: true },
  { id: "tick-2", text: "Sensex Today", active: true },
  { id: "tick-3", text: "Election Results 2026", active: true },
  { id: "tick-4", text: "Weather Update", active: true },
  { id: "tick-5", text: "Gold Rate Today", active: true },
  { id: "tick-6", text: "IPL 2025", active: true },
  { id: "tick-7", text: "Stock Market Live", active: true }
];

// ============================================================
// 15. TV CHANNELS
// ============================================================

export const tvChannels: TVChannel[] = [
  {
    id: "ch-1",
    name: "News 1",
    logo: "N1",
    embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1",
    type: "youtube"
  },
  {
    id: "ch-2",
    name: "News 2",
    logo: "N2",
    embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1",
    type: "youtube"
  },
  {
    id: "ch-3",
    name: "News 3",
    logo: "N3",
    embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1",
    type: "youtube"
  },
  {
    id: "ch-4",
    name: "News 4",
    logo: "N4",
    embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1",
    type: "youtube"
  },
  {
    id: "ch-5",
    name: "News 5",
    logo: "N5",
    embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1",
    type: "youtube"
  },
  {
    id: "ch-6",
    name: "News 6",
    logo: "N6",
    embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1",
    type: "youtube"
  },
  {
    id: "ch-7",
    name: "News 7",
    logo: "N7",
    embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1",
    type: "youtube"
  },
  {
    id: "ch-8",
    name: "News 8",
    logo: "N8",
    embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1",
    type: "youtube"
  }
];

// ============================================================
// 16. LANGUAGES
// ============================================================

export const languages = [
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

// ============================================================
// 17. SOCIAL LINKS
// ============================================================

export const socialLinks = {
  youtube: "https://www.youtube.com/@Unsung-v2l",
  facebook: "#",
  twitter: "#",
  instagram: "#"
};

// ============================================================
// 18. FOOTER DATA
// ============================================================

export const footerData = {
  brandName: "UNSUNG",
  brandTagline: "News Network",
  description: "News that matters, stories that inspire. Delivering objective, real-time journalism covering politics, business, culture, and sports across the globe.",
  quickLinks: [
    { name: "About Us", link: "/info/about" },
    { name: "Advertise", link: "/info/advertise" },
    { name: "Contact Us", link: "/info/contact" },
    { name: "Privacy Policy", link: "/info/privacy" },
    { name: "Terms of Use", link: "/info/terms" },
    { name: "Disclaimer", link: "/info/disclaimer" }
  ],
  socialLinks: [
    { name: "Facebook", icon: "facebook", link: "#" },
    { name: "Twitter", icon: "twitter", link: "#" },
    { name: "Instagram", icon: "instagram", link: "#" },
    { name: "Youtube", icon: "youtube", link: "#" }
  ],
  newsletterPlaceholder: "Enter your email",
  newsletterButton: "Subscribe",
  copyright: "Unsung News Network. All Rights Reserved.",
  languages: ["English", "हिंदी", "বাংলা", "తెలుగు", "मराठी", "தமிழ்", "ગુજરાતી", "ಕನ್ನಡ", "മലയാളം", "ਪੰਜਾਬੀ"]
};

// ============================================================
// 19. SPORTS DATA
// ============================================================

export const defaultSports: SportItem[] = [
  { sport: "Cricket", match: "IND vs AUS, 2nd Test", score: "India 256/4", detail: "62.3 Overs" },
  { sport: "Kabaddi", match: "India vs Iran", score: "35-28", detail: "Final" },
  { sport: "Football", match: "Barcelona vs Real Madrid", score: "2-1", detail: "90+3' goal" },
];

// ============================================================
// 20. WEATHER CITIES DATA
// ============================================================

export const defaultWeatherCities: WeatherCity[] = [
  { city: "New Delhi", temp: "29°C", condition: "Haze" },
  { city: "Mumbai", temp: "32°C", condition: "Sunny" },
  { city: "Chennai", temp: "34°C", condition: "Partly Cloudy" },
  { city: "Kolkata", temp: "30°C", condition: "Humid" },
  { city: "Bengaluru", temp: "27°C", condition: "Clear" },
  { city: "Hyderabad", temp: "31°C", condition: "Cloudy" },
];