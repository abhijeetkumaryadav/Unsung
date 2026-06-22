// app/api/cricket/route.ts
// Live cricket data with proper "no match" handling

import { NextResponse } from 'next/server';

// Check if API is available
async function checkAPIHealth(): Promise<boolean> {
  try {
    const response = await fetch('https://ipl-okn0.onrender.com', {
      method: 'HEAD',
      signal: AbortSignal.timeout(3000)
    });
    return response.ok;
  } catch {
    return false;
  }
}

// Primary API
async function fetchFromIPLAPI() {
  try {
    const response = await fetch('https://ipl-okn0.onrender.com/live', {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(5000)
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        return { hasMatch: false, message: 'No live cricket matches currently' };
      }
      throw new Error('IPL API failed');
    }
    
    const data = await response.json();
    
    if (data && data.match && data.match !== 'No match') {
      return {
        hasMatch: true,
        match: data.match || '',
        score: data.score || '',
        overs: data.overs || '',
        status: data.status || 'Live',
        source: 'IPL API'
      };
    }
    return { hasMatch: false, message: 'No live cricket matches currently' };
  } catch (error) {
    throw error;
  }
}

// Alternative: Cricbuzz
async function fetchFromCricbuzz() {
  try {
    const response = await fetch('https://cricbuzz-scraper-api.vercel.app/api/matches/live', {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(5000)
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        return { hasMatch: false, message: 'No live cricket matches currently' };
      }
      throw new Error('Cricbuzz API failed');
    }
    
    const data = await response.json();
    
    if (data && data.matches && data.matches.length > 0) {
      const match = data.matches[0];
      return {
        hasMatch: true,
        match: match.title || match.name || '',
        score: match.score || match.runs || '',
        overs: match.overs || match.balls || '',
        status: match.status || 'Live',
        source: 'Cricbuzz'
      };
    }
    return { hasMatch: false, message: 'No live cricket matches currently' };
  } catch (error) {
    throw error;
  }
}

// Alternative: ESPN
async function fetchFromESPN() {
  try {
    const response = await fetch('https://www.espncricinfo.com/ci/engine/match/index.json', {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(5000)
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        return { hasMatch: false, message: 'No live cricket matches currently' };
      }
      throw new Error('ESPN API failed');
    }
    
    const data = await response.json();
    
    if (data && data.matches && data.matches.length > 0) {
      const match = data.matches.find((m: any) => m.status === 'Live');
      if (match) {
        return {
          hasMatch: true,
          match: match.name || match.series || '',
          score: match.score || '',
          overs: match.overs || '',
          status: match.status || 'Live',
          source: 'ESPN Cricinfo'
        };
      }
    }
    return { hasMatch: false, message: 'No live cricket matches currently' };
  } catch (error) {
    throw error;
  }
}

export async function GET() {
  try {
    // Check if API is healthy first
    const isHealthy = await checkAPIHealth();
    
    if (!isHealthy) {
      return NextResponse.json({
        hasMatch: false,
        message: 'No live cricket matches currently. Check back during match hours.',
        note: 'Cricket API is currently unavailable.'
      });
    }

    // Try primary API
    try {
      const result = await fetchFromIPLAPI();
      return NextResponse.json(result);
    } catch (primaryError) {
      // Try secondary API
      try {
        const result = await fetchFromCricbuzz();
        return NextResponse.json(result);
      } catch (secondaryError) {
        // Try tertiary API
        try {
          const result = await fetchFromESPN();
          return NextResponse.json(result);
        } catch (tertiaryError) {
          // All APIs failed or no matches
          return NextResponse.json({
            hasMatch: false,
            message: 'No live cricket matches currently.',
            note: 'All cricket APIs returned no matches.'
          });
        }
      }
    }
  } catch (error: any) {
    return NextResponse.json({
      hasMatch: false,
      message: 'Unable to fetch cricket data. Please try again later.',
      note: error.message || 'Unknown error'
    });
  }
}