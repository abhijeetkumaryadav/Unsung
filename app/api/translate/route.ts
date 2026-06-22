// app/api/translate/route.ts
import { NextResponse } from 'next/server';

const WORKING_INSTANCES = [
  'https://libretranslate.com',
  'https://libretranslate.de',
  'https://translate.argosopentech.com',
];

// IMPROVED: Split text into chunks respecting multiple languages
function splitIntoChunks(text: string, maxLength: number = 450): string[] {
  if (text.length <= maxLength) return [text];
  
  const chunks: string[] = [];
  
  // Split by multiple sentence endings: . ! ? । ॥ ۔ ۔۔ and newlines
  // This handles Hindi (।), Arabic/Urdu (۔), and standard punctuation
  const sentenceRegex = /[^.!?।॥۔\n]+(?:[.!?।॥۔]|\n\n|$)+/g;
  const sentences = text.match(sentenceRegex) || [];
  
  if (sentences.length === 0) {
    // Fallback: split by newlines or just chunk by character count
    const paragraphs = text.split(/\n+/);
    for (const para of paragraphs) {
      if (para.length <= maxLength) {
        if (para.trim()) chunks.push(para.trim());
      } else {
        // Force split by character count
        for (let i = 0; i < para.length; i += maxLength) {
          const chunk = para.substring(i, i + maxLength).trim();
          if (chunk) chunks.push(chunk);
        }
      }
    }
    return chunks.length > 0 ? chunks : [text];
  }
  
  let currentChunk = '';
  
  for (const sentence of sentences) {
    // If adding this sentence would exceed maxLength, push current chunk and start new one
    if ((currentChunk + sentence).length > maxLength && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += sentence;
    }
  }
  
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  
  // If no chunks were created (shouldn't happen), return original
  return chunks.length > 0 ? chunks : [text];
}

async function translateChunk(
  text: string, 
  targetLang: string, 
  sourceLang?: string
): Promise<string> {
  const source = sourceLang || 'auto';

  // Try LibreTranslate instances first
  for (const instance of WORKING_INSTANCES) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(`${instance}/translate`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Accept': 'application/json' 
        },
        body: JSON.stringify({
          q: text,
          source: source,
          target: targetLang,
          format: 'text',
          api_key: '' // Some instances need this even if empty
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) continue;

      const data = await response.json();
      if (data && data.translatedText && data.translatedText.trim() !== text.trim()) {
        return data.translatedText;
      }
    } catch (error: any) {
      console.warn(`LibreTranslate instance ${instance} failed:`, error.message);
    }
  }
  
  // Fallback: Google Translate
  try {
    // Google Translate has a ~5000 char limit, so ensure chunk fits
    const textToTranslate = text.length > 4500 ? text.substring(0, 4500) : text;
    const googleUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${source}&tl=${targetLang}&dt=t&q=${encodeURIComponent(textToTranslate)}`;
    const response = await fetch(googleUrl, { 
      signal: AbortSignal.timeout(10000) 
    });
    if (response.ok) {
      const data = await response.json();
      if (data && data[0]) {
        const translated = data[0]
          .filter((segment: any) => segment && segment[0])
          .map((segment: any) => segment[0])
          .join('');
        if (translated && translated.trim() !== text.trim()) {
          return translated;
        }
      }
    }
  } catch (e) {
    console.warn('Google Translate fallback failed:', e);
  }

  // Fallback: MyMemory Translation API
  try {
    const textToTranslate = text.length > 500 ? text.substring(0, 500) : text;
    const myMemoryUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(textToTranslate)}&langpair=${source}|${targetLang}`;
    const response = await fetch(myMemoryUrl, { 
      signal: AbortSignal.timeout(8000) 
    });
    if (response.ok) {
      const data = await response.json();
      if (
        data.responseData?.translatedText && 
        data.responseData.translatedText.trim() !== text.trim()
      ) {
        return data.responseData.translatedText;
      }
    }
  } catch (e) {
    console.warn('MyMemory fallback failed:', e);
  }
  
  // Last resort: return original text
  return text;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text, targetLang, sourceLang } = body;

    if (!text || !targetLang) {
      return NextResponse.json(
        { error: 'Missing text or target language' }, 
        { status: 400 }
      );
    }

    const trimmedText = text.trim();
    if (trimmedText.length < 2) {
      return NextResponse.json({ translatedText: trimmedText });
    }

    // For short text, translate directly
    if (trimmedText.length <= 450) {
      const result = await translateChunk(trimmedText, targetLang, sourceLang);
      if (result.trim() !== trimmedText.trim()) {
        return NextResponse.json({ translatedText: result });
      }
      // Fallback: try with 'auto' source
      const fallbackResult = await translateChunk(trimmedText, targetLang, undefined);
      return NextResponse.json({ 
        translatedText: fallbackResult,
        note: fallbackResult === trimmedText ? 'Translation may not have changed.' : undefined
      });
    }

    // For long text, split into chunks
    const chunks = splitIntoChunks(trimmedText, 450);
    console.log(`Translating ${chunks.length} chunks to ${targetLang} from ${sourceLang || 'auto'}`);
    
    // Translate all chunks in parallel
    const translatedChunks = await Promise.all(
      chunks.map((chunk, index) => {
        console.log(`  Chunk ${index + 1}/${chunks.length}: ${chunk.length} chars`);
        return translateChunk(chunk, targetLang, sourceLang);
      })
    );
    
    // Join with proper spacing
    const fullTranslated = translatedChunks
      .map(chunk => chunk.trim())
      .filter(chunk => chunk.length > 0)
      .join(' ');
    
    const totalOriginalChars = trimmedText.length;
    const totalTranslatedChars = fullTranslated.length;
    
    console.log(`Translation complete: ${totalOriginalChars} → ${totalTranslatedChars} chars (${chunks.length} chunks)`);
    
    return NextResponse.json({ 
      translatedText: fullTranslated,
      originalLength: totalOriginalChars,
      translatedLength: totalTranslatedChars,
      note: totalTranslatedChars < totalOriginalChars * 0.3 
        ? '⚠️ Translation may be incomplete. Some chunks may have failed.' 
        : undefined
    });

  } catch (error: any) {
    console.error('Translation error:', error);
    return NextResponse.json(
      { 
        translatedText: text || '', 
        note: 'Translation failed. Showing original text.',
        error: error.message 
      },
      { status: 200 }
    );
  }
}

export async function GET() {
  const results: any[] = [];
  for (const instance of WORKING_INSTANCES) {
    try {
      const response = await fetch(`${instance}/languages`, { 
        signal: AbortSignal.timeout(5000) 
      });
      results.push({ instance, status: response.ok ? 'online' : 'offline' });
    } catch (error: any) {
      results.push({ instance, status: 'offline', error: error.message });
    }
  }
  const online = results.filter(r => r.status === 'online');
  return NextResponse.json({
    status: online.length > 0 ? 'healthy' : 'unhealthy',
    onlineInstances: online.length,
    totalInstances: results.length,
    instances: results
  });
}