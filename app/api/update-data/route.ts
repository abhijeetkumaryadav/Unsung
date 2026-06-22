// app/api/update-data/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { section, data } = body;

    if (!section || data === undefined) {
      return NextResponse.json({ error: 'Section and data are required' }, { status: 400 });
    }

    // Path to the JSON file
    const jsonPath = path.join(process.cwd(), 'app', 'data', 'content.json');

    // Read existing JSON
    let jsonData: any = {};
    try {
      const jsonContent = fs.readFileSync(jsonPath, 'utf8');
      jsonData = JSON.parse(jsonContent);
    } catch (e) {
      // File doesn't exist, start with empty
    }

    // Update the section
    jsonData[section] = data;

    // Write back to JSON
    fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2));

    return NextResponse.json({
      success: true,
      message: `${section} updated successfully`
    });

  } catch (error: any) {
    console.error('Update error:', error);
    return NextResponse.json({
      error: error.message || 'Failed to update data'
    }, { status: 500 });
  }
}