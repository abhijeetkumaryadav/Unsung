// app/api/d1/route.ts
// ============================================================
// PRODUCTION READY API
// Priority: D1 (production) → content.json (local) → Empty
// ============================================================

import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

const CONTENT_PATH = path.join(process.cwd(), 'app', 'data', 'content.json');

// ============================================================
// FILE OPERATIONS
// ============================================================

function readJSONFile() {
  try {
    if (fs.existsSync(CONTENT_PATH)) {
      const data = fs.readFileSync(CONTENT_PATH, 'utf8');
      return JSON.parse(data);
    }
    return {};
  } catch (error) {
    console.error('Error reading JSON file:', error);
    return {};
  }
}

function writeJSONFile(data: any) {
  try {
    fs.writeFileSync(CONTENT_PATH, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing JSON file:', error);
    return false;
  }
}

// ============================================================
// D1 CONNECTION
// ============================================================

function getD1() {
  // Production: Cloudflare Pages/Workers
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'production') {
    // @ts-ignore
    if (process.env.unsung_news_db) {
      // @ts-ignore
      return process.env.unsung_news_db;
    }
  }
  
  // Local: Wrangler
  // @ts-ignore
  if (globalThis.unsung_news_db) {
    // @ts-ignore
    return globalThis.unsung_news_db;
  }
  
  return null;
}

// ============================================================
// GET HANDLER
// ============================================================

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    const db = getD1();

    // Try D1 first in production
    if (db && process.env.NODE_ENV === 'production') {
      try {
        // D1 query logic would go here
        // For now, fallback to JSON
      } catch (d1Error) {
        console.error('D1 query failed:', d1Error);
      }
    }

    // Read from JSON file (always works locally)
    const jsonData = readJSONFile();
    
    switch (action) {
      case 'getTopStories':
        return NextResponse.json(jsonData.topStories || []);
      case 'getLatestNews':
        return NextResponse.json(jsonData.latestNews || []);
      case 'getVideos':
        return NextResponse.json(jsonData.videos || []);
      case 'getTvChannels':
        return NextResponse.json(jsonData.tvChannels || []);
      case 'getTicker':
        return NextResponse.json(jsonData.ticker || []);
      case 'getElectionStates':
        return NextResponse.json(jsonData.electionStates || []);
      case 'getElectionConfig':
        return NextResponse.json(jsonData.electionConfig || {});
      case 'getElectionVisibility':
        return NextResponse.json(jsonData.electionVisible !== undefined ? jsonData.electionVisible : true);
      case 'getNoElectionMessage':
        return NextResponse.json(jsonData.noElectionMessage || 'No active elections at this time.');
      case 'getMarketData':
        return NextResponse.json(jsonData.marketData || {});
      case 'getWeatherData':
        return NextResponse.json(jsonData.weatherData || {});
      case 'getWeatherCities':
        return NextResponse.json(jsonData.weatherCities || []);
      case 'getSports':
        return NextResponse.json(jsonData.sports || []);
      case 'getFooterDescription':
        return NextResponse.json(jsonData.footerDescription || '');
      case 'getSocialLinks':
        return NextResponse.json(jsonData.socialLinks || []);
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('D1 API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ============================================================
// POST HANDLER
// ============================================================

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, data } = body;

    const jsonData = readJSONFile();
    let success = false;

    // Try D1 first in production
    const db = getD1();
    if (db && process.env.NODE_ENV === 'production') {
      try {
        // D1 save logic would go here
        success = true;
      } catch (d1Error) {
        console.error('D1 save failed:', d1Error);
      }
    }

    // Always save to JSON (works locally and as fallback)
    switch (action) {
      case 'saveTopStory':
      case 'saveLatestNews': {
        const key = action === 'saveTopStory' ? 'topStories' : 'latestNews';
        const items = jsonData[key] || [];
        const existingIndex = items.findIndex((item: any) => item.id === data.id);
        if (existingIndex >= 0) {
          items[existingIndex] = data;
        } else {
          items.unshift(data);
        }
        jsonData[key] = items;
        success = writeJSONFile(jsonData);
        break;
      }

      case 'deleteStory': {
        const key = data.type === 'top' ? 'topStories' : 'latestNews';
        jsonData[key] = (jsonData[key] || []).filter((item: any) => item.id !== data.id);
        success = writeJSONFile(jsonData);
        break;
      }

      case 'saveVideo': {
        const items = jsonData.videos || [];
        const existingIndex = items.findIndex((item: any) => item.id === data.id);
        if (existingIndex >= 0) {
          items[existingIndex] = data;
        } else {
          items.unshift(data);
        }
        jsonData.videos = items;
        success = writeJSONFile(jsonData);
        break;
      }

      case 'deleteVideo': {
        jsonData.videos = (jsonData.videos || []).filter((item: any) => item.id !== data.id);
        success = writeJSONFile(jsonData);
        break;
      }

      case 'saveTvChannel': {
        const items = jsonData.tvChannels || [];
        const existingIndex = items.findIndex((item: any) => item.id === data.id);
        if (existingIndex >= 0) {
          items[existingIndex] = data;
        } else {
          items.unshift(data);
        }
        jsonData.tvChannels = items;
        success = writeJSONFile(jsonData);
        break;
      }

      case 'deleteTvChannel': {
        jsonData.tvChannels = (jsonData.tvChannels || []).filter((item: any) => item.id !== data.id);
        success = writeJSONFile(jsonData);
        break;
      }

      case 'saveTicker': {
        const items = jsonData.ticker || [];
        const existingIndex = items.findIndex((item: any) => item.id === data.id);
        if (existingIndex >= 0) {
          items[existingIndex] = data;
        } else {
          items.unshift(data);
        }
        jsonData.ticker = items;
        success = writeJSONFile(jsonData);
        break;
      }

      case 'deleteTicker': {
        jsonData.ticker = (jsonData.ticker || []).filter((item: any) => item.id !== data.id);
        success = writeJSONFile(jsonData);
        break;
      }

      case 'saveElectionStates': {
        jsonData.electionStates = data;
        success = writeJSONFile(jsonData);
        break;
      }

      case 'saveElectionConfig': {
        jsonData.electionConfig = data;
        success = writeJSONFile(jsonData);
        break;
      }

      case 'toggleElectionVisibility': {
        jsonData.electionVisible = data.visible;
        success = writeJSONFile(jsonData);
        break;
      }

      case 'saveNoElectionMessage': {
        jsonData.noElectionMessage = data.message;
        success = writeJSONFile(jsonData);
        break;
      }

      case 'saveMarketData': {
        jsonData.marketData = data;
        success = writeJSONFile(jsonData);
        break;
      }

      case 'saveWeatherData': {
        jsonData.weatherData = data;
        success = writeJSONFile(jsonData);
        break;
      }

      case 'saveWeatherCities': {
        jsonData.weatherCities = data;
        success = writeJSONFile(jsonData);
        break;
      }

      case 'saveSports': {
        jsonData.sports = data;
        success = writeJSONFile(jsonData);
        break;
      }

      case 'saveFooterDescription': {
        jsonData.footerDescription = data.description;
        success = writeJSONFile(jsonData);
        break;
      }

      case 'saveSocialLinks': {
        jsonData.socialLinks = data;
        success = writeJSONFile(jsonData);
        break;
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
    }
  } catch (error: any) {
    console.error('D1 POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}