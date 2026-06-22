// app/api/weather/route.ts
// Weather data extraction

import { NextResponse } from 'next/server';

// Primary: Open-Meteo (Free, no API key)
async function fetchFromOpenMeteo(city: string = 'New Delhi') {
  try {
    // Geocode the city name to coordinates
    const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`, {
      headers: { 'Accept': 'application/json' }
    });
    
    if (!geoResponse.ok) throw new Error('Geocoding failed');
    const geoData = await geoResponse.json();
    
    let lat = 28.6139;
    let lon = 77.2090;
    
    if (geoData && geoData.results && geoData.results.length > 0) {
      lat = geoData.results[0].latitude;
      lon = geoData.results[0].longitude;
    }
    
    // Get weather data
    const weatherResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto`,
      { headers: { 'Accept': 'application/json' } }
    );
    
    if (!weatherResponse.ok) throw new Error('Weather API failed');
    const data = await weatherResponse.json();
    
    if (data && data.current_weather) {
      const temp = data.current_weather.temperature;
      const weatherCode = data.current_weather.weathercode;
      
      // Map weather codes to conditions
      const conditions: Record<number, string> = {
        0: 'Clear sky',
        1: 'Mainly clear',
        2: 'Partly cloudy',
        3: 'Overcast',
        45: 'Foggy',
        48: 'Depositing rime fog',
        51: 'Light drizzle',
        53: 'Moderate drizzle',
        55: 'Dense drizzle',
        61: 'Slight rain',
        63: 'Moderate rain',
        65: 'Heavy rain',
        71: 'Slight snow',
        73: 'Moderate snow',
        75: 'Heavy snow',
        80: 'Rain showers',
        81: 'Moderate rain showers',
        82: 'Violent rain showers',
        95: 'Thunderstorm',
        96: 'Thunderstorm with hail',
        99: 'Thunderstorm with heavy hail'
      };
      
      return {
        temp: `${Math.round(temp)}°C`,
        city: city,
        condition: conditions[weatherCode] || 'Unknown',
        source: 'Open-Meteo'
      };
    }
    throw new Error('No weather data');
  } catch (error) {
    throw error;
  }
}

// Alternative: wttr.in (Free, no API key)
async function fetchFromWttr(city: string = 'New Delhi') {
  try {
    const response = await fetch(`https://wttr.in/${encodeURIComponent(city)}?format=j1`, {
      headers: { 'Accept': 'application/json' }
    });
    
    if (!response.ok) throw new Error('wttr.in failed');
    const data = await response.json();
    
    if (data && data.current_condition && data.current_condition.length > 0) {
      const current = data.current_condition[0];
      return {
        temp: `${current.temp_C}°C`,
        city: city,
        condition: current.weatherDesc[0].value || 'Unknown',
        source: 'wttr.in'
      };
    }
    throw new Error('No weather data');
  } catch (error) {
    throw error;
  }
}

// Alternative: Weather.gov API (US only, but free)
async function fetchFromWeatherGov(city: string = 'New York') {
  try {
    // This API only works for US locations
    const response = await fetch(`https://api.weather.gov/points/40.7128,-74.0060`, {
      headers: { 'Accept': 'application/json' }
    });
    
    if (!response.ok) throw new Error('Weather.gov failed');
    const data = await response.json();
    
    if (data && data.properties) {
      const forecastUrl = data.properties.forecast;
      const forecastResponse = await fetch(forecastUrl);
      const forecastData = await forecastResponse.json();
      
      if (forecastData && forecastData.properties && forecastData.properties.periods) {
        const current = forecastData.properties.periods[0];
        return {
          temp: `${current.temperature}°F`,
          city: city,
          condition: current.shortForecast || 'Unknown',
          source: 'Weather.gov'
        };
      }
    }
    throw new Error('No weather data');
  } catch (error) {
    throw error;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city') || 'New Delhi';
    
    // Try primary API first
    try {
      const data = await fetchFromOpenMeteo(city);
      return NextResponse.json(data);
    } catch (primaryError) {
      // Fallback to wttr.in
      try {
        const data = await fetchFromWttr(city);
        return NextResponse.json(data);
      } catch (secondaryError) {
        // All APIs failed - return mock data
        return NextResponse.json({
          temp: '29°C',
          city: city,
          condition: 'Partly Cloudy',
          source: 'Fallback (Mock Data)',
          note: 'All APIs failed. Showing sample data.'
        });
      }
    }
  } catch (error: any) {
    return NextResponse.json({
      temp: '29°C',
      city: 'New Delhi',
      condition: 'Haze',
      source: 'Fallback (Mock Data)',
      note: 'Weather API unavailable. Showing sample data.'
    });
  }
}