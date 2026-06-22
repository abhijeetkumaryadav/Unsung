// app/api/extract/route.ts
import { NextResponse } from 'next/server';

// Helper to clean HTML and extract text
function cleanText(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim();
}

// Extract main content from HTML
function extractMainContent(html: string): string {
  // Remove scripts, styles, nav, header, footer, aside
  let clean = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<header[\s\S]*?<\/header>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<aside[\s\S]*?<\/aside>/gi, '')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, '');

  // Try multiple strategies to find the main content
  let contentMatch = clean.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
  if (!contentMatch) {
    const contentClasses = ['content', 'story-content', 'article-content', 'body-text', 'post-content', 'entry-content', 'article-body', 'main-content', 'story-body', 'article-text'];
    for (const cls of contentClasses) {
      const regex = new RegExp(`<div[^>]*class=["'][^"']*${cls}[^"']*["'][^>]*>([\\s\\S]*?)<\\/div>`, 'i');
      const match = clean.match(regex);
      if (match && match[1].length > 200) { contentMatch = match; break; }
    }
  }
  if (!contentMatch) contentMatch = clean.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  if (!contentMatch) {
    const ids = ['content', 'main', 'article', 'story', 'post', 'body'];
    for (const id of ids) {
      const regex = new RegExp(`<div[^>]*id=["']${id}["'][^>]*>([\\s\\S]*?)<\\/div>`, 'i');
      const match = clean.match(regex);
      if (match && match[1].length > 200) { contentMatch = match; break; }
    }
  }
  if (!contentMatch) {
    const bodyMatch = clean.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (bodyMatch) contentMatch = bodyMatch;
  }

  let paragraphs: string[] = [];
  if (contentMatch) {
    const contentHtml = contentMatch[1];
    const pMatches = contentHtml.match(/<p[^>]*>([\s\S]*?)<\/p>/gi) || [];
    const divMatches = contentHtml.match(/<div[^>]*>([\s\S]*?)<\/div>/gi) || [];
    const allElements = [...pMatches, ...divMatches];
    for (const el of allElements) {
      const text = cleanText(el);
      if (text.length > 30 && !text.match(/^[A-Z][a-z]+ [0-9]+, [0-9]+/)) {
        paragraphs.push(text);
      }
    }
  }

  if (paragraphs.length === 0) {
    const textOnly = clean
      .replace(/<[^>]*>/g, '\n')
      .split(/\n+/)
      .map(line => line.trim())
      .filter(line => line.length > 30 && !line.match(/^[A-Z][a-z]+ [0-9]+, [0-9]+/));
    paragraphs = [...new Set(textOnly)];
  }

  return paragraphs.join('\n\n');
}

// ============================================================
// STRATEGY 1: Direct fetch with browser-like headers
// ============================================================
async function fetchDirect(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    });
    if (!response.ok) return null;
    return await response.text();
  } catch { return null; }
}

// ============================================================
// STRATEGY 2: Googlebot User-Agent (often allowed)
// ============================================================
async function fetchAsGooglebot(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      }
    });
    if (!response.ok) return null;
    return await response.text();
  } catch { return null; }
}

// ============================================================
// STRATEGY 3: Archive.org fallback (cached version)
// ============================================================
async function fetchFromArchive(url: string): Promise<string | null> {
  try {
    // Use the Wayback Machine CDX API to get the latest snapshot
    const cdxUrl = `https://web.archive.org/cdx/search/cdx?url=${encodeURIComponent(url)}&output=json&limit=1`;
    const cdxResponse = await fetch(cdxUrl);
    if (!cdxResponse.ok) return null;
    const cdxData = await cdxResponse.json();
    if (!cdxData || cdxData.length < 2) return null;
    
    const timestamp = cdxData[1][1];
    const archiveUrl = `https://web.archive.org/web/${timestamp}/${url}`;
    const archiveResponse = await fetch(archiveUrl);
    if (!archiveResponse.ok) return null;
    return await archiveResponse.text();
  } catch { return null; }
}

// ============================================================
// STRATEGY 4: textise dot iitty (alternative text extraction)
// ============================================================
async function fetchFromTextise(url: string): Promise<string | null> {
  try {
    // Use textise.iitty to get clean text
    const textiseUrl = `https://r.jina.ai/http://${url.replace(/^https?:\/\//, '')}`;
    const response = await fetch(textiseUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; TextiseBot/1.0)' }
    });
    if (!response.ok) return null;
    return await response.text();
  } catch { return null; }
}

// ============================================================
// MAIN EXTRACTOR
// ============================================================
export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Try strategies in order
    let html: string | null = null;
    let usedStrategy = '';

    // Strategy 1: Direct fetch with browser headers
    html = await fetchDirect(url);
    if (html) { usedStrategy = 'Direct fetch'; }

    // Strategy 2: Googlebot
    if (!html) {
      html = await fetchAsGooglebot(url);
      if (html) usedStrategy = 'Googlebot';
    }

    // Strategy 3: Archive.org
    if (!html || html.includes('Please enable JS') || html.includes('401')) {
      html = await fetchFromArchive(url);
      if (html) usedStrategy = 'Archive.org (cached)';
    }

    // Strategy 4: Textise
    if (!html || html.includes('Please enable JS') || html.includes('401')) {
      html = await fetchFromTextise(url);
      if (html) usedStrategy = 'Textise';
    }

    if (!html) {
      return NextResponse.json({
        error: 'Unable to fetch content. Please try a different URL or check if the site is accessible.',
        note: 'Some sites like Reuters block automated scrapers.'
      }, { status: 404 });
    }

    // Check if we got a 401 or JS-required page
    if (html.includes('401') || html.includes('Please enable JS') || html.includes('DataDome')) {
      // Try archive.org as last resort
      html = await fetchFromArchive(url);
      if (html) usedStrategy = 'Archive.org (cached)';
      
      if (!html || html.includes('401') || html.includes('Please enable JS')) {
        return NextResponse.json({
          error: 'This site blocks automated access (401 error). Please try extracting from a different source.',
          note: 'You can try: 1) Paste the article text manually, 2) Use a browser extension to extract, 3) Try a different URL'
        }, { status: 401 });
      }
    }

    // Extract metadata
    const ogTitle = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i)?.[1] || '';
    const ogImage = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i)?.[1] || '';
    const ogDescription = html.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i)?.[1] || '';
    const ogSiteName = html.match(/<meta\s+property=["']og:site_name["']\s+content=["']([^"']+)["']/i)?.[1] || '';
    const titleTag = html.match(/<title>([^<]*)<\/title>/i)?.[1] || '';
    const metaDescription = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i)?.[1] || '';

    // Extract full content
    const fullContent = extractMainContent(html);

    // Try to find author
    const authorMatch = html.match(/<meta\s+name=["']author["']\s+content=["']([^"']+)["']/i)?.[1] || '';
    const authorByline = html.match(/<span[^>]*class=["'][^"']*author[^"']*["'][^>]*>([^<]+)<\/span>/i)?.[1] || '';
    const author = authorMatch || authorByline || '';

    // Try to find publish date
    const pubDate = html.match(/<meta\s+property=["']article:published_time["']\s+content=["']([^"']+)["']/i)?.[1] || '';
    const pubDateAlt = html.match(/<meta\s+name=["']pubdate["']\s+content=["']([^"']+)["']/i)?.[1] || '';

    const result = {
      title: ogTitle || titleTag || '',
      image: ogImage || '',
      description: ogDescription || metaDescription || '',
      content: fullContent || ogDescription || metaDescription || '',
      siteName: ogSiteName || '',
      sourceUrl: url,
      author: author,
      publishedDate: pubDate || pubDateAlt || '',
      wordCount: fullContent.split(/\s+/).length,
      paragraphs: fullContent.split('\n\n').filter(p => p.length > 0).length,
      usedStrategy: usedStrategy,
      note: usedStrategy === 'Archive.org (cached)' ? 'Content retrieved from archived version. May not be the latest version.' : undefined
    };

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('Extraction error:', error);
    return NextResponse.json({
      error: error.message || 'Extraction failed. Please try a different URL.'
    }, { status: 500 });
  }
}