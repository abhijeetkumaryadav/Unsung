// app/api/get-data/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json({ error: 'Key is required' }, { status: 400 });
    }

    // Path to the JSON file
    const jsonPath = path.join(process.cwd(), 'app', 'data', 'content.json');

    // Check if file exists
    if (!fs.existsSync(jsonPath)) {
      return NextResponse.json(null, { status: 404 });
    }

    // Read the file
    const jsonContent = fs.readFileSync(jsonPath, 'utf8');
    const jsonData = JSON.parse(jsonContent);

    // Return the requested section
    const data = jsonData[key];
    if (data === undefined) {
      return NextResponse.json(null, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Get data error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}