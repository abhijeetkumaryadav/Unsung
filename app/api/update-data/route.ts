// app/api/update-data/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { section, data } = body;

    if (!section || data === undefined) {
      return NextResponse.json({ error: 'section and data required' }, { status: 400 });
    }

    // TEMPORARY: Hardcode for testing
    const workerUrl = 'https://news-api.unsung.workers.dev';
    const secret = 'your-very-strong-secret-key';

    const response = await fetch(`${workerUrl}/api/update-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Key': secret,
      },
      body: JSON.stringify({ section, data }),
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: result.error || 'Worker error' }, { status: response.status });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Proxy error:', error.message);
    return NextResponse.json({ error: 'Proxy error: ' + error.message }, { status: 500 });
  }
}