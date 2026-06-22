// app/lib/dataService.ts
// Reads from content.json - with fallback to default data

import {
  topStories as defaultTopStories,
  latestNews as defaultLatestNews,
  cricketData as defaultCricket,
  marketData as defaultMarket,
  weatherData as defaultWeather,
  electionStates as defaultElectionStates,
  electionConfig as defaultElectionConfig,
  trendingVideos as defaultVideos,
  tvChannels as defaultTvChannels,
  trendingTickerItems as defaultTicker,
  footerData as defaultFooter,
  defaultSports,
  defaultWeatherCities,
  type NewsItem,
  type CricketData,
  type MarketData,
  type WeatherData,
  type ElectionState,
  type ElectionConfig,
  type VideoData,
  type TVChannel,
  type TickerItem,
  type SportItem,
  type WeatherCity,
} from "./data";

// ============================================================
// STORAGE PREFIX & HELPERS
// ============================================================

const STORAGE_PREFIX = "unsung_news_";

function getData<T>(key: string, defaults: T): T {
  if (typeof window === "undefined") return defaults;
  try {
    const data = localStorage.getItem(STORAGE_PREFIX + key);
    return data ? JSON.parse(data) : defaults;
  } catch {
    return defaults;
  }
}

function setData<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save data:", e);
  }
}

// ============================================================
// FETCH FROM JSON FILE
// ============================================================

async function fetchJSONFile<T>(key: string): Promise<T | null> {
  try {
    const response = await fetch(`/api/get-data?key=${key}&t=${Date.now()}`, {
      headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
    });
    if (!response.ok) {
      console.warn(`Failed to fetch ${key}: ${response.status}`);
      return null;
    }
    const data = await response.json();
    return data || null;
  } catch (error) {
    console.error('Fetch error:', error);
    return null;
  }
}

// ============================================================
// DATA FUNCTIONS - Use defaults if JSON fails
// ============================================================

export async function getTopStories(): Promise<NewsItem[]> {
  try {
    const data = await fetchJSONFile<NewsItem[]>('topStories');
    if (data && data.length > 0) return data;
    return defaultTopStories;
  } catch (error) {
    console.error('Error fetching topStories:', error);
    return defaultTopStories;
  }
}

export async function getLatestNews(): Promise<NewsItem[]> {
  try {
    const data = await fetchJSONFile<NewsItem[]>('latestNews');
    if (data && data.length > 0) return data;
    return defaultLatestNews;
  } catch (error) {
    console.error('Error fetching latestNews:', error);
    return defaultLatestNews;
  }
}

export async function getCricket(): Promise<CricketData> {
  try {
    const data = await fetchJSONFile<CricketData>('cricketData');
    if (data && data.match) return data;
    return defaultCricket;
  } catch (error) {
    console.error('Error fetching cricketData:', error);
    return defaultCricket;
  }
}

export async function getMarket(): Promise<MarketData> {
  try {
    const data = await fetchJSONFile<MarketData>('marketData');
    if (data && data.usdInr) return data;
    return defaultMarket;
  } catch (error) {
    console.error('Error fetching marketData:', error);
    return defaultMarket;
  }
}

export async function getWeather(): Promise<WeatherData> {
  try {
    const data = await fetchJSONFile<WeatherData>('weatherData');
    if (data && data.temp) return data;
    return defaultWeather;
  } catch (error) {
    console.error('Error fetching weatherData:', error);
    return defaultWeather;
  }
}

export async function getElectionStates(): Promise<ElectionState[]> {
  try {
    const data = await fetchJSONFile<ElectionState[]>('electionStates');
    if (data && data.length > 0) return data;
    return defaultElectionStates;
  } catch (error) {
    console.error('Error fetching electionStates:', error);
    return defaultElectionStates;
  }
}

export async function getElectionConfig(): Promise<ElectionConfig> {
  try {
    const data = await fetchJSONFile<ElectionConfig>('electionConfig');
    if (data && data.title) return data;
    return defaultElectionConfig;
  } catch (error) {
    console.error('Error fetching electionConfig:', error);
    return defaultElectionConfig;
  }
}

export async function getVideos(): Promise<VideoData[]> {
  try {
    const data = await fetchJSONFile<VideoData[]>('videos');
    if (data && data.length > 0) return data;
    return defaultVideos;
  } catch (error) {
    console.error('Error fetching videos:', error);
    return defaultVideos;
  }
}

export async function getVideosByCategory(category: string): Promise<VideoData[]> {
  const allVideos = await getVideos();
  if (category === "Latest" || category === "latest") {
    return allVideos;
  }
  return allVideos.filter(v => 
    v.category?.toLowerCase() === category.toLowerCase()
  );
}

export async function getTicker(): Promise<TickerItem[]> {
  try {
    const data = await fetchJSONFile<TickerItem[]>('ticker');
    if (data && data.length > 0) return data;
    return defaultTicker;
  } catch (error) {
    console.error('Error fetching ticker:', error);
    return defaultTicker;
  }
}

export async function getTvChannels(): Promise<TVChannel[]> {
  try {
    const data = await fetchJSONFile<TVChannel[]>('tvChannels');
    if (data && data.length > 0) return data;
    return defaultTvChannels;
  } catch (error) {
    console.error('Error fetching tvChannels:', error);
    return defaultTvChannels;
  }
}

export async function getElectionVisibility(): Promise<boolean> {
  try {
    const data = await fetchJSONFile<boolean>('electionVisible');
    if (data !== null && data !== undefined) return data;
    return true;
  } catch (error) {
    console.error('Error fetching electionVisible:', error);
    return true;
  }
}

export async function getNoElectionMessage(): Promise<string> {
  try {
    const data = await fetchJSONFile<string>('noElectionMessage');
    if (data) return data;
    return "No active elections at this time.";
  } catch (error) {
    console.error('Error fetching noElectionMessage:', error);
    return "No active elections at this time.";
  }
}

export async function getFooterDescription(): Promise<string> {
  try {
    const data = await fetchJSONFile<string>('footerDescription');
    if (data) return data;
    return defaultFooter.description;
  } catch (error) {
    console.error('Error fetching footerDescription:', error);
    return defaultFooter.description;
  }
}

export async function getSports(): Promise<SportItem[]> {
  try {
    const data = await fetchJSONFile<SportItem[]>('sports');
    if (data && data.length > 0) return data;
    return defaultSports;
  } catch (error) {
    console.error('Error fetching sports:', error);
    return defaultSports;
  }
}

export function setSports(data: SportItem[]): void {
  setData("sports", data);
}

export async function getWeatherCities(): Promise<WeatherCity[]> {
  try {
    const data = await fetchJSONFile<WeatherCity[]>('weatherCities');
    if (data && data.length > 0) return data;
    return defaultWeatherCities;
  } catch (error) {
    console.error('Error fetching weatherCities:', error);
    return defaultWeatherCities;
  }
}

export function setWeatherCities(data: WeatherCity[]): void {
  setData("weatherCities", data);
}

// ============================================================
// RELEVANCE-BASED SEARCH - Only returns relevant results
// ============================================================

export async function searchAllContent(query: string): Promise<any[]> {
  if (!query || query.trim().length === 0) return [];

  const searchTokens = query.trim().split(/\s+/).filter(t => t.length > 0);
  if (searchTokens.length === 0) return [];

  const results: any[] = [];

  // Helper: Check if a field contains any token (case insensitive)
  const fieldMatchesAnyToken = (fieldValue: string | undefined, tokens: string[]): boolean => {
    if (!fieldValue) return false;
    const lower = fieldValue.toLowerCase();
    return tokens.some(t => lower.includes(t.toLowerCase()));
  };

  // Helper: Check if a field contains ALL tokens (phrase match)
  const fieldMatchesAllTokens = (fieldValue: string | undefined, tokens: string[]): boolean => {
    if (!fieldValue) return false;
    const lower = fieldValue.toLowerCase();
    return tokens.every(t => lower.includes(t.toLowerCase()));
  };

  // Helper: Count how many tokens match in a field
  const countTokenMatches = (fieldValue: string | undefined, tokens: string[]): number => {
    if (!fieldValue) return 0;
    const lower = fieldValue.toLowerCase();
    return tokens.filter(t => lower.includes(t.toLowerCase())).length;
  };

  // Helper: Get the best matching translation for a field
  const getBestMatch = (item: any, field: string, tokens: string[]): string => {
    // Check original first
    if (fieldMatchesAnyToken(item[field], tokens)) {
      return item[field] || '';
    }
    // Check all translations
    if (item.translations) {
      for (const lang in item.translations) {
        const trans = item.translations[lang];
        if (trans[field] && fieldMatchesAnyToken(trans[field], tokens)) {
          return trans[field];
        }
      }
    }
    return item[field] || '';
  };

  // Helper: Check if item matches the search query with high relevance
  const isHighlyRelevant = (item: any, tokens: string[]): boolean => {
    // Check if title contains all tokens (phrase match)
    if (item.title && fieldMatchesAllTokens(item.title, tokens)) {
      return true;
    }
    // Check if any translation title contains all tokens
    if (item.translations) {
      for (const lang in item.translations) {
        const trans = item.translations[lang];
        if (trans.title && fieldMatchesAllTokens(trans.title, tokens)) {
          return true;
        }
      }
    }
    return false;
  };

  // Calculate relevance score for an item
  const calculateScore = (item: any, tokens: string[]): number => {
    let score = 0;
    const fields = ['title', 'category', 'description'];

    // Check if title contains ALL tokens (exact phrase match) - big bonus
    if (item.title && fieldMatchesAllTokens(item.title, tokens)) {
      score += 50;
    }

    // Check if description contains ALL tokens - medium bonus
    if (item.description && fieldMatchesAllTokens(item.description, tokens)) {
      score += 20;
    }

    // Check original fields (token-based)
    for (const f of fields) {
      const matches = countTokenMatches(item[f], tokens);
      if (f === 'title') {
        score += matches * 10; // Title matches are most important
      } else if (f === 'category') {
        score += matches * 4;
      } else {
        score += matches * 2;
      }
    }

    // Check translations
    if (item.translations) {
      for (const lang in item.translations) {
        const trans = item.translations[lang];
        for (const f of fields) {
          const matches = countTokenMatches(trans[f], tokens);
          if (f === 'title') {
            // Check if translated title contains ALL tokens
            if (trans.title && fieldMatchesAllTokens(trans.title, tokens)) {
              score += 40;
            }
            score += matches * 8;
          } else if (f === 'category') {
            score += matches * 3;
          } else {
            score += matches * 1;
          }
        }
      }
    }

    return score;
  };

  // Get all items and score them
  const allItems: any[] = [];

  // 1. Top Stories
  const top = await getTopStories();
  top.forEach(item => {
    const score = calculateScore(item, searchTokens);
    if (score > 0) {
      allItems.push({
        ...item,
        type: 'article',
        _score: score,
        _isExact: isHighlyRelevant(item, searchTokens),
        _title: getBestMatch(item, 'title', searchTokens) || item.title,
        _category: getBestMatch(item, 'category', searchTokens) || item.category,
        _description: getBestMatch(item, 'description', searchTokens) || item.description,
      });
    }
  });

  // 2. Latest News
  const latest = await getLatestNews();
  latest.forEach(item => {
    const score = calculateScore(item, searchTokens);
    if (score > 0) {
      allItems.push({
        ...item,
        type: 'article',
        _score: score,
        _isExact: isHighlyRelevant(item, searchTokens),
        _title: getBestMatch(item, 'title', searchTokens) || item.title,
        _category: getBestMatch(item, 'category', searchTokens) || item.category,
        _description: getBestMatch(item, 'description', searchTokens) || item.description,
      });
    }
  });

  // 3. Videos
  const videos = await getVideos();
  videos.forEach(v => {
    const score = calculateScore(v, searchTokens);
    if (score > 0) {
      allItems.push({
        ...v,
        type: 'video',
        _score: score,
        _isExact: isHighlyRelevant(v, searchTokens),
        _title: getBestMatch(v, 'title', searchTokens) || v.title,
        _category: getBestMatch(v, 'category', searchTokens) || v.category || 'Video',
        _description: `▶️ ${getBestMatch(v, 'title', searchTokens) || v.title}`,
        time: 'Now',
        link: v.link || '#',
      });
    }
  });

  // 4. Sports
  const sports = await getSports();
  sports.forEach(s => {
    const score = calculateScore(s, searchTokens);
    if (score > 0) {
      const sportName = getBestMatch(s, 'sport', searchTokens) || s.sport;
      const matchName = getBestMatch(s, 'match', searchTokens) || s.match;
      const detailName = getBestMatch(s, 'detail', searchTokens) || s.detail;
      allItems.push({
        id: `sport-${s.sport}`,
        title: `⚽ ${sportName}: ${matchName}`,
        category: 'Sports',
        time: 'Live',
        image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&q=80&w=400',
        link: '#',
        description: `${s.score} • ${detailName}`,
        type: 'live',
        _score: score,
        _isExact: isHighlyRelevant(s, searchTokens),
        _title: `⚽ ${sportName}: ${matchName}`,
        _category: 'Sports',
        _description: `${s.score} • ${detailName}`,
      });
    }
  });

  // 5. Cricket
  const cricket = await getCricket();
  if (cricket.match) {
    const score = calculateScore(cricket, searchTokens);
    if (score > 0) {
      allItems.push({
        id: 'cricket',
        title: `🏏 Cricket: ${cricket.match}`,
        category: 'Sports',
        time: 'Live',
        image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&q=80&w=400',
        link: '#',
        description: `Score: ${cricket.score} • ${cricket.overs}`,
        type: 'live',
        _score: score,
        _isExact: isHighlyRelevant(cricket, searchTokens),
        _title: `🏏 Cricket: ${cricket.match}`,
        _category: 'Sports',
        _description: `Score: ${cricket.score} • ${cricket.overs}`,
      });
    }
  }

  // 6. Weather
  const weather = await getWeather();
  if (weather.city || weather.condition) {
    const score = calculateScore(weather, searchTokens);
    if (score > 0) {
      allItems.push({
        id: 'weather',
        title: `🌤️ Weather in ${weather.city || 'New Delhi'}`,
        category: 'Weather',
        time: 'Live',
        image: 'https://images.unsplash.com/photo-1504370805625-d32c54b16100?auto=format&fit=crop&q=80&w=300',
        link: '#',
        description: `${weather.temp} • ${weather.condition}`,
        type: 'live',
        _score: score,
        _isExact: isHighlyRelevant(weather, searchTokens),
        _title: `🌤️ Weather in ${weather.city || 'New Delhi'}`,
        _category: 'Weather',
        _description: `${weather.temp} • ${weather.condition}`,
      });
    }
  }

  // 7. Weather Cities
  const weatherCities = await getWeatherCities();
  weatherCities.forEach(c => {
    const score = calculateScore(c, searchTokens);
    if (score > 0) {
      allItems.push({
        id: `weather-${c.city}`,
        title: `🌤️ Weather in ${c.city}`,
        category: 'Weather',
        time: 'Live',
        image: 'https://images.unsplash.com/photo-1504370805625-d32c54b16100?auto=format&fit=crop&q=80&w=300',
        link: '#',
        description: `${c.temp} • ${c.condition}`,
        type: 'live',
        _score: score,
        _isExact: isHighlyRelevant(c, searchTokens),
        _title: `🌤️ Weather in ${c.city}`,
        _category: 'Weather',
        _description: `${c.temp} • ${c.condition}`,
      });
    }
  });

  // 8. Market
  const market = await getMarket();
  if (market) {
    const marketScore = calculateScore(market, searchTokens);
    if (marketScore > 0) {
      allItems.push({
        id: 'market',
        title: `💰 Market Update`,
        category: 'Business',
        time: 'Live',
        image: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=400',
        link: '#',
        description: `Sensex: ${market.sensex || 'N/A'} | Nifty: ${market.nifty || 'N/A'} | Gold: ₹${market.goldRate}`,
        type: 'live',
        _score: marketScore,
        _isExact: false,
        _title: `💰 Market Update`,
        _category: 'Business',
        _description: `Sensex: ${market.sensex || 'N/A'} | Nifty: ${market.nifty || 'N/A'} | Gold: ₹${market.goldRate}`,
      });
    }
  }

  // 9. Ticker items
  const ticker = await getTicker();
  ticker.forEach(t => {
    if (fieldMatchesAnyToken(t.text, searchTokens)) {
      allItems.push({
        id: t.id,
        title: `🔍 ${t.text}`,
        category: 'Trending',
        time: 'Now',
        image: 'https://images.unsplash.com/photo-1504370805625-d32c54b16100?auto=format&fit=crop&q=80&w=300',
        link: `/?search=${encodeURIComponent(t.text)}`,
        description: `Search results for "${t.text}"`,
        type: 'ticker',
        _score: 1,
        _isExact: fieldMatchesAllTokens(t.text, searchTokens),
        _title: `🔍 ${t.text}`,
        _category: 'Trending',
        _description: `Search results for "${t.text}"`,
      });
    }
  });

  // Remove duplicates by ID + type
  const seen = new Set();
  const unique = allItems.filter(r => {
    const key = r.id + r.type;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Sort by: Exact matches first, then by score, then by type (articles first)
  unique.sort((a, b) => {
    // Exact matches (title contains ALL tokens) go first
    if (a._isExact && !b._isExact) return -1;
    if (b._isExact && !a._isExact) return 1;
    // Then by score
    if (a._score !== b._score) return (b._score || 0) - (a._score || 0);
    // Then prefer articles
    if (a.type === 'article' && b.type !== 'article') return -1;
    if (b.type === 'article' && a.type !== 'article') return 1;
    return 0;
  });

  // Map to final structure
  const finalResults = unique.map(item => ({
    id: item.id,
    title: item._title || item.title,
    category: item._category || item.category,
    time: item.time || 'Just now',
    image: item.image || 'https://images.unsplash.com/photo-1504370805625-d32c54b16100?auto=format&fit=crop&q=80&w=400',
    link: item.link || '#',
    description: item._description || item.description || '',
    type: item.type,
    _score: item._score,
    _isExact: item._isExact || false,
  }));

  // --- FILTERING: Only return truly relevant results ---
  
  // If we have exact matches, only show those (and maybe a few high-score partials)
  const exactMatches = finalResults.filter(r => r._isExact);
  const nonExactMatches = finalResults.filter(r => !r._isExact);

  // Threshold: exact matches always show, partial matches need score >= 5
  const MIN_SCORE = 5;
  const filteredNonExact = nonExactMatches.filter(r => (r._score || 0) >= MIN_SCORE);

  let final: any[] = [];
  
  // If we have exact matches, show them first, then high-scoring partials
  if (exactMatches.length > 0) {
    final = [...exactMatches, ...filteredNonExact];
  } else {
    // If no exact matches, show all results with score >= MIN_SCORE
    final = finalResults.filter(r => (r._score || 0) >= MIN_SCORE);
  }

  // If still no results, return top 5 lowest-scoring results (better than empty)
  if (final.length === 0 && finalResults.length > 0) {
    return finalResults.slice(0, 5);
  }

  // Limit results to 20 for performance
  return final.slice(0, 20);
}