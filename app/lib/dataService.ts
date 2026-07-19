// app/lib/dataService.ts
// ============================================================
// COMPLETE DATA SERVICE - Production Ready
// ============================================================

import {
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
  categories,
  languages,
  footerData,
  socialLinks
} from "./data";

// ============================================================
// HELPER FUNCTIONS
// ============================================================

async function callD1<T>(action: string, params?: any): Promise<T | null> {
  try {
    const url = new URL(
      `/api/d1?action=${action}`,
      typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
    );
    
    let language = 'all';
    if (typeof window !== 'undefined') {
      language = localStorage.getItem('unsung_language') || 'all';
    }
    url.searchParams.set('language', language);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value));
        }
      });
    }

    const response = await fetch(url.toString(), {
      headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
    });

    if (!response.ok) {
      console.warn(`D1 API failed for ${action}: ${response.status}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error(`D1 API error for ${action}:`, error);
    return null;
  }
}

async function saveToD1(action: string, data: any): Promise<boolean> {
  try {
    const response = await fetch('/api/d1', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, data })
    });
    const result = await response.json();
    return result.success === true;
  } catch (error) {
    console.error(`D1 save error for ${action}:`, error);
    return false;
  }
}

// ============================================================
// GET FUNCTIONS
// ============================================================

export async function getTopStories(): Promise<NewsItem[]> {
  try {
    const data = await callD1<NewsItem[]>('getTopStories');
    return data || [];
  } catch (error) {
    console.error('Error fetching topStories:', error);
    return [];
  }
}

export async function getLatestNews(): Promise<NewsItem[]> {
  try {
    const data = await callD1<NewsItem[]>('getLatestNews');
    return data || [];
  } catch (error) {
    console.error('Error fetching latestNews:', error);
    return [];
  }
}

export async function getCricket(): Promise<CricketData> {
  try {
    const response = await fetch('/api/cricket');
    if (response.ok) {
      const data = await response.json();
      if (data && data.match) return data;
    }
    return { match: "", score: "", overs: "" };
  } catch (error) {
    console.error('Error fetching cricket:', error);
    return { match: "", score: "", overs: "" };
  }
}

export async function getMarket(): Promise<MarketData> {
  try {
    const data = await callD1<MarketData>('getMarketData');
    if (data && data.usdInr) return data;
    return {} as MarketData;
  } catch (error) {
    console.error('Error fetching marketData:', error);
    return {} as MarketData;
  }
}

export async function getWeather(): Promise<WeatherData> {
  try {
    const data = await callD1<WeatherData>('getWeatherData');
    if (data && data.temp) return data;
    return {} as WeatherData;
  } catch (error) {
    console.error('Error fetching weatherData:', error);
    return {} as WeatherData;
  }
}

export async function getElectionStates(): Promise<ElectionState[]> {
  try {
    const data = await callD1<ElectionState[]>('getElectionStates');
    return data || [];
  } catch (error) {
    console.error('Error fetching electionStates:', error);
    return [];
  }
}

export async function getElectionConfig(): Promise<ElectionConfig> {
  try {
    const data = await callD1<ElectionConfig>('getElectionConfig');
    if (data && data.title) return data;
    return { title: "Election Center 2026", liveMapTitle: "Live Results Map", totalSeats: 403 };
  } catch (error) {
    console.error('Error fetching electionConfig:', error);
    return { title: "Election Center 2026", liveMapTitle: "Live Results Map", totalSeats: 403 };
  }
}

export async function getVideos(): Promise<VideoData[]> {
  try {
    const data = await callD1<VideoData[]>('getVideos');
    return data || [];
  } catch (error) {
    console.error('Error fetching videos:', error);
    return [];
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
    const data = await callD1<TickerItem[]>('getTicker');
    return data || [];
  } catch (error) {
    console.error('Error fetching ticker:', error);
    return [];
  }
}

export async function getTvChannels(): Promise<TVChannel[]> {
  try {
    const data = await callD1<TVChannel[]>('getTvChannels');
    return data || [];
  } catch (error) {
    console.error('Error fetching tvChannels:', error);
    return [];
  }
}

export async function getElectionVisibility(): Promise<boolean> {
  try {
    const data = await callD1<boolean>('getElectionVisibility');
    return data !== null && data !== undefined ? data : true;
  } catch (error) {
    console.error('Error fetching electionVisibility:', error);
    return true;
  }
}

export async function getNoElectionMessage(): Promise<string> {
  try {
    const data = await callD1<string>('getNoElectionMessage');
    return data || "No active elections at this time.";
  } catch (error) {
    console.error('Error fetching noElectionMessage:', error);
    return "No active elections at this time.";
  }
}

export async function getFooterDescription(): Promise<string> {
  try {
    const data = await callD1<string>('getFooterDescription');
    return data || footerData.description;
  } catch (error) {
    console.error('Error fetching footerDescription:', error);
    return footerData.description;
  }
}

export async function getSports(): Promise<SportItem[]> {
  try {
    const data = await callD1<SportItem[]>('getSports');
    return data || [];
  } catch (error) {
    console.error('Error fetching sports:', error);
    return [];
  }
}

export async function getWeatherCities(): Promise<WeatherCity[]> {
  try {
    const data = await callD1<WeatherCity[]>('getWeatherCities');
    return data || [];
  } catch (error) {
    console.error('Error fetching weatherCities:', error);
    return [];
  }
}

// ============================================================
// SOCIAL LINKS - Both names exported
// ============================================================

// Primary API function
export async function getSocialLinksFromAPI(): Promise<{ platform: string; url: string }[]> {
  try {
    const data = await callD1<{ platform: string; url: string }[]>('getSocialLinks');
    return data || [];
  } catch (error) {
    console.error('Error fetching socialLinks:', error);
    return [];
  }
}

// Alias for admin panel - same function
export async function getSocialLinks(): Promise<{ platform: string; url: string }[]> {
  return getSocialLinksFromAPI();
}

// ============================================================
// EXPORT STATIC DATA
// ============================================================

export { categories, languages, footerData, socialLinks };

// ============================================================
// SAVE FUNCTIONS
// ============================================================

export async function saveStory(data: any, type: 'top' | 'latest'): Promise<boolean> {
  const action = type === 'top' ? 'saveTopStory' : 'saveLatestNews';
  return saveToD1(action, data);
}

export async function deleteStory(id: string, type: 'top' | 'latest'): Promise<boolean> {
  return saveToD1('deleteStory', { id, type });
}

export async function saveVideo(data: any): Promise<boolean> {
  return saveToD1('saveVideo', data);
}

export async function deleteVideo(id: string): Promise<boolean> {
  return saveToD1('deleteVideo', { id });
}

export async function saveTvChannel(data: any): Promise<boolean> {
  return saveToD1('saveTvChannel', data);
}

export async function deleteTvChannel(id: string): Promise<boolean> {
  return saveToD1('deleteTvChannel', { id });
}

export async function saveTicker(data: any): Promise<boolean> {
  return saveToD1('saveTicker', data);
}

export async function deleteTicker(id: string): Promise<boolean> {
  return saveToD1('deleteTicker', { id });
}

export async function saveElectionStates(data: any): Promise<boolean> {
  return saveToD1('saveElectionStates', data);
}

export async function saveElectionConfig(data: any): Promise<boolean> {
  return saveToD1('saveElectionConfig', data);
}

export async function toggleElectionVisibility(visible: boolean): Promise<boolean> {
  return saveToD1('toggleElectionVisibility', { visible });
}

export async function saveNoElectionMessage(message: string): Promise<boolean> {
  return saveToD1('saveNoElectionMessage', { message });
}

export async function saveMarketData(data: any): Promise<boolean> {
  return saveToD1('saveMarketData', data);
}

export async function saveWeatherData(data: any): Promise<boolean> {
  return saveToD1('saveWeatherData', data);
}

export async function saveWeatherCities(data: any): Promise<boolean> {
  return saveToD1('saveWeatherCities', data);
}

export async function saveSports(data: any): Promise<boolean> {
  return saveToD1('saveSports', data);
}

export async function saveFooterDescription(description: string): Promise<boolean> {
  return saveToD1('saveFooterDescription', { description });
}

export async function saveSocialLinks(data: any): Promise<boolean> {
  return saveToD1('saveSocialLinks', data);
}

// ============================================================
// SEARCH
// ============================================================

export async function searchAllContent(query: string): Promise<any[]> {
  if (!query || query.trim().length === 0) return [];

  const searchTokens = query.trim().split(/\s+/).filter(t => t.length > 0);
  if (searchTokens.length === 0) return [];

  const allItems: any[] = [];

  const fieldMatchesAnyToken = (fieldValue: string | undefined, tokens: string[]): boolean => {
    if (!fieldValue) return false;
    const lower = fieldValue.toLowerCase();
    return tokens.some(t => lower.includes(t.toLowerCase()));
  };

  const fieldMatchesAllTokens = (fieldValue: string | undefined, tokens: string[]): boolean => {
    if (!fieldValue) return false;
    const lower = fieldValue.toLowerCase();
    return tokens.every(t => lower.includes(t.toLowerCase()));
  };

  const countTokenMatches = (fieldValue: string | undefined, tokens: string[]): number => {
    if (!fieldValue) return 0;
    const lower = fieldValue.toLowerCase();
    return tokens.filter(t => lower.includes(t.toLowerCase())).length;
  };

  const getBestMatch = (item: any, field: string, tokens: string[]): string => {
    if (fieldMatchesAnyToken(item[field], tokens)) {
      return item[field] || '';
    }
    if (item.translations) {
      const parsed = typeof item.translations === 'string' 
        ? JSON.parse(item.translations) 
        : item.translations;
      if (parsed) {
        for (const lang in parsed) {
          const trans = parsed[lang];
          if (trans && trans[field] && fieldMatchesAnyToken(trans[field], tokens)) {
            return trans[field];
          }
        }
      }
    }
    return item[field] || '';
  };

  const isHighlyRelevant = (item: any, tokens: string[]): boolean => {
    if (item.title && fieldMatchesAllTokens(item.title, tokens)) return true;
    if (item.translations) {
      const parsed = typeof item.translations === 'string' 
        ? JSON.parse(item.translations) 
        : item.translations;
      if (parsed) {
        for (const lang in parsed) {
          const trans = parsed[lang];
          if (trans && trans.title && fieldMatchesAllTokens(trans.title, tokens)) return true;
        }
      }
    }
    return false;
  };

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
      const parsed = typeof item.translations === 'string' 
        ? JSON.parse(item.translations) 
        : item.translations;
      if (parsed) {
        for (const lang in parsed) {
          const trans = parsed[lang];
          if (trans) {
            for (const f of fields) {
              const matches = countTokenMatches(trans[f], tokens);
              if (f === 'title') {
                if (trans.title && fieldMatchesAllTokens(trans.title, tokens)) score += 40;
                score += matches * 8;
              } else if (f === 'category') {
                score += matches * 3;
              } else {
                score += matches * 1;
              }
            }
          }
        }
      }
    }

    return score;
  };

  // ----------- TOP STORIES -----------
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

  // ----------- LATEST NEWS -----------
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

  // ----------- VIDEOS -----------
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
        _description: getBestMatch(v, 'title', searchTokens) || v.title,
        time: 'Now',
        link: v.link || '#',
      });
    }
  });

  // ----------- SPORTS -----------
  const sports = await getSports();
  sports.forEach(s => {
    const score = calculateScore(s, searchTokens);
    if (score > 0) {
      const sportId = s.id ? `sport-${s.id}` : `sport-${s.sport}`;
      allItems.push({
        id: sportId,
        title: `⚽ ${s.sport}: ${s.match}`,
        category: 'Sports',
        time: 'Live',
        image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&q=80&w=400',
        link: '#',
        description: `${s.score} • ${s.detail}`,
        type: 'live',
        _score: score,
        _isExact: isHighlyRelevant(s, searchTokens),
        _title: `⚽ ${s.sport}: ${s.match}`,
        _category: 'Sports',
        _description: `${s.score} • ${s.detail}`,
      });
    }
  });

  // ----------- CRICKET -----------
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

  // ----------- WEATHER -----------
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

  // ----------- WEATHER CITIES -----------
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

  // ----------- MARKET -----------
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

  // ----------- TICKER -----------
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

  // ----------- DEDUPLICATE -----------
  const seen = new Set();
  const unique = allItems.filter(r => {
    const key = r.id + r.type;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // ----------- SORT -----------
  unique.sort((a, b) => {
    if (a._isExact && !b._isExact) return -1;
    if (b._isExact && !a._isExact) return 1;
    return (b._score || 0) - (a._score || 0);
  });

  // ----------- FORMAT RESULTS -----------
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

  const MIN_SCORE = 3;
  const filtered = finalResults.filter(r => (r._score || 0) >= MIN_SCORE);

  const exactMatches = filtered.filter(r => r._isExact);
  const nonExactMatches = filtered.filter(r => !r._isExact);

  let final: any[] = [];
  if (exactMatches.length > 0) {
    final = [...exactMatches, ...nonExactMatches];
  } else {
    final = filtered;
  }

  if (final.length === 0 && finalResults.length > 0) {
    return finalResults.slice(0, 5);
  }

  return final.slice(0, 20);
}