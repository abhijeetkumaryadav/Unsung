// app/lib/dataService.ts
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

const WORKER_API = process.env.NEXT_PUBLIC_WORKER_API || 'https://news-api.unsung.workers.dev';

// ------------------------------------------------------------------
// Helper: fetch from Worker
// ------------------------------------------------------------------
async function fetchFromWorker<T>(key: string): Promise<T | null> {
  try {
    const res = await fetch(`${WORKER_API}/api/get-data?key=${key}&t=${Date.now()}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// ------------------------------------------------------------------
// Helper: save to Worker via Next.js proxy (keeps secret safe)
// ------------------------------------------------------------------
export async function saveToWorker(section: string, data: any): Promise<boolean> {
  try {
    const res = await fetch('/api/update-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section, data }),
    });
    const result = await res.json();
    return result.success === true;
  } catch {
    return false;
  }
}

// ------------------------------------------------------------------
// Data getters – each tries Worker first, then fallback to defaults
// ------------------------------------------------------------------
export async function getTopStories(): Promise<NewsItem[]> {
  const data = await fetchFromWorker<NewsItem[]>('topStories');
  return (data && data.length > 0) ? data : defaultTopStories;
}

export async function getLatestNews(): Promise<NewsItem[]> {
  const data = await fetchFromWorker<NewsItem[]>('latestNews');
  return (data && data.length > 0) ? data : defaultLatestNews;
}

export async function getCricket(): Promise<CricketData> {
  return defaultCricket;
}

export async function getMarket(): Promise<MarketData> {
  const data = await fetchFromWorker<MarketData>('marketData');
  return data || defaultMarket;
}

export async function getWeather(): Promise<WeatherData> {
  const data = await fetchFromWorker<WeatherData>('weatherData');
  return data || defaultWeather;
}

export async function getElectionStates(): Promise<ElectionState[]> {
  const data = await fetchFromWorker<ElectionState[]>('electionStates');
  return (data && data.length > 0) ? data : defaultElectionStates;
}

export async function getElectionConfig(): Promise<ElectionConfig> {
  const data = await fetchFromWorker<ElectionConfig>('electionConfig');
  return data || defaultElectionConfig;
}

export async function getVideos(): Promise<VideoData[]> {
  const data = await fetchFromWorker<VideoData[]>('videos');
  return (data && data.length > 0) ? data : defaultVideos;
}

export async function getVideosByCategory(category: string): Promise<VideoData[]> {
  const allVideos = await getVideos();
  if (category === "Latest" || category === "latest") {
    return allVideos;
  }
  return allVideos.filter(v => v.category?.toLowerCase() === category.toLowerCase());
}

export async function getTicker(): Promise<TickerItem[]> {
  const data = await fetchFromWorker<TickerItem[]>('ticker');
  return (data && data.length > 0) ? data : defaultTicker;
}

export async function getTvChannels(): Promise<TVChannel[]> {
  const data = await fetchFromWorker<TVChannel[]>('tvChannels');
  return (data && data.length > 0) ? data : defaultTvChannels;
}

export async function getElectionVisibility(): Promise<boolean> {
  const data = await fetchFromWorker<boolean>('electionVisible');
  return data !== null ? data : true;
}

export async function getNoElectionMessage(): Promise<string> {
  const data = await fetchFromWorker<string>('noElectionMessage');
  return data || "No active elections at this time.";
}

export async function getFooterDescription(): Promise<string> {
  const data = await fetchFromWorker<string>('footerDescription');
  return data || defaultFooter.description;
}

export async function getSports(): Promise<SportItem[]> {
  const data = await fetchFromWorker<SportItem[]>('sports');
  return (data && data.length > 0) ? data : defaultSports;
}

export async function getWeatherCities(): Promise<WeatherCity[]> {
  const data = await fetchFromWorker<WeatherCity[]>('weatherCities');
  return (data && data.length > 0) ? data : defaultWeatherCities;
}

// ============================================================
// SEARCH – relevance‑based across all content
// ============================================================

export async function searchAllContent(query: string): Promise<any[]> {
  if (!query || query.trim().length === 0) return [];

  const searchTokens = query.trim().split(/\s+/).filter(t => t.length > 0);
  if (searchTokens.length === 0) return [];

  const results: any[] = [];

  // Helper: check if a field contains any token
  const fieldMatchesAnyToken = (fieldValue: string | undefined, tokens: string[]): boolean => {
    if (!fieldValue) return false;
    const lower = fieldValue.toLowerCase();
    return tokens.some(t => lower.includes(t.toLowerCase()));
  };

  // Helper: check if a field contains ALL tokens (phrase match)
  const fieldMatchesAllTokens = (fieldValue: string | undefined, tokens: string[]): boolean => {
    if (!fieldValue) return false;
    const lower = fieldValue.toLowerCase();
    return tokens.every(t => lower.includes(t.toLowerCase()));
  };

  // Helper: count token matches
  const countTokenMatches = (fieldValue: string | undefined, tokens: string[]): number => {
    if (!fieldValue) return 0;
    const lower = fieldValue.toLowerCase();
    return tokens.filter(t => lower.includes(t.toLowerCase())).length;
  };

  // Helper: get best matching translation
  const getBestMatch = (item: any, field: string, tokens: string[]): string => {
    if (fieldMatchesAnyToken(item[field], tokens)) return item[field] || '';
    if (item.translations) {
      for (const lang in item.translations) {
        const trans = item.translations[lang];
        if (trans[field] && fieldMatchesAnyToken(trans[field], tokens)) return trans[field];
      }
    }
    return item[field] || '';
  };

  // Helper: highly relevant if title contains all tokens
  const isHighlyRelevant = (item: any, tokens: string[]): boolean => {
    if (item.title && fieldMatchesAllTokens(item.title, tokens)) return true;
    if (item.translations) {
      for (const lang in item.translations) {
        const trans = item.translations[lang];
        if (trans.title && fieldMatchesAllTokens(trans.title, tokens)) return true;
      }
    }
    return false;
  };

  // Calculate relevance score
  const calculateScore = (item: any, tokens: string[]): number => {
    let score = 0;
    const fields = ['title', 'category', 'description'];

    if (item.title && fieldMatchesAllTokens(item.title, tokens)) score += 50;
    if (item.description && fieldMatchesAllTokens(item.description, tokens)) score += 20;

    for (const f of fields) {
      const matches = countTokenMatches(item[f], tokens);
      if (f === 'title') score += matches * 10;
      else if (f === 'category') score += matches * 4;
      else score += matches * 2;
    }

    if (item.translations) {
      for (const lang in item.translations) {
        const trans = item.translations[lang];
        for (const f of fields) {
          const matches = countTokenMatches(trans[f], tokens);
          if (f === 'title') {
            if (trans.title && fieldMatchesAllTokens(trans.title, tokens)) score += 40;
            score += matches * 8;
          } else if (f === 'category') score += matches * 3;
          else score += matches * 1;
        }
      }
    }
    return score;
  };

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
        _title: '💰 Market Update',
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

  // Remove duplicates
  const seen = new Set();
  const unique = allItems.filter(r => {
    const key = r.id + r.type;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Sort: exact matches first, then score, then articles
  unique.sort((a, b) => {
    if (a._isExact && !b._isExact) return -1;
    if (b._isExact && !a._isExact) return 1;
    if (a._score !== b._score) return (b._score || 0) - (a._score || 0);
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

  // Filter by relevance threshold
  const exactMatches = finalResults.filter(r => r._isExact);
  const nonExactMatches = finalResults.filter(r => !r._isExact);
  const MIN_SCORE = 5;
  const filteredNonExact = nonExactMatches.filter(r => (r._score || 0) >= MIN_SCORE);

  let final: any[] = [];
  if (exactMatches.length > 0) {
    final = [...exactMatches, ...filteredNonExact];
  } else {
    final = finalResults.filter(r => (r._score || 0) >= MIN_SCORE);
  }

  if (final.length === 0 && finalResults.length > 0) {
    return finalResults.slice(0, 5);
  }

  return final.slice(0, 20);
}