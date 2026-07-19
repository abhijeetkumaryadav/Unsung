// app/lib/data.ts
// ============================================================
// COMPLETE DATA FILE - Types and Static Data Only
// No hardcoded content - All content comes from API/content.json
// ============================================================

// ============================================================
// 1. ALL TYPES
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
  totalSeats: number;
  notes?: string;
  links?: { title: string; url: string }[];
  parties?: { key: string; name: string; color: string }[];
  [key: string]: string | number | any;
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
  translations?: Record<string, { name: string }>;
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
  id?: number;
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

// ============================================================
// 2. CATEGORIES
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
// 3. LANGUAGES
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
// 4. SOCIAL LINKS (Static Fallback)
// ============================================================

export const socialLinks = {
  youtube: "https://www.youtube.com/@Unsung-v2l",
  facebook: "#",
  twitter: "#",
  instagram: "#"
};

// ============================================================
// 5. FOOTER DATA (Static)
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
  copyright: "Unsung News Network. All Rights Reserved.",
  languages: ["English", "हिंदी", "বাংলা", "తెలుగు", "मराठी", "தமிழ்", "ગુજરાતી", "ಕನ್ನಡ", "മലയാളം", "ਪੰਜਾਬੀ"]
};

// ============================================================
// 6. HERO DATA (Static Fallback - Used by HeroSection)
// ============================================================

export const heroData = {
  title: "West Bengal Election Results 2026 Live Updates",
  image: "https://images.unsplash.com/photo-1614728263952-84ea206f99b6?auto=format&fit=crop&q=80&w=1200",
  time: "2 mins ago",
  viewers: "12.4K",
  category: "Elections 2026",
  link: "/news/election-2026"
};