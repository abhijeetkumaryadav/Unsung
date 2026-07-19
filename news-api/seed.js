import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to your content.json – adjust if needed
const contentPath = resolve(__dirname, '../app/data/content.json');
console.log(`📂 Loading from ${contentPath}`);

let content;
try {
  content = JSON.parse(readFileSync(contentPath, 'utf8'));
  console.log('✅ Loaded content.json');
} catch (e) {
  console.error('❌ Failed to read content.json:', e.message);
  process.exit(1);
}

const WORKER_URL = 'https://news-api.unsung.workers.dev';
const ADMIN_SECRET = 'your-very-strong-secret-key'; // Must match wrangler.toml

const sections = [
  'topStories',
  'latestNews',
  'marketData',
  'weatherData',
  'electionStates',
  'electionConfig',
  'videos',
  'ticker',
  'tvChannels',
  'electionVisible',
  'noElectionMessage',
  'footerDescription',
  'sports',
  'weatherCities',
  'socialLinks',
];

for (const section of sections) {
  if (!content.hasOwnProperty(section)) {
    console.warn(`⚠️ Section ${section} not found, skipping`);
    continue;
  }
  const data = content[section];
  try {
    const res = await fetch(`${WORKER_URL}/api/update-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Key': ADMIN_SECRET,
      },
      body: JSON.stringify({ section, data }),
    });
    const result = await res.json();
    if (result.success) {
      console.log(`✅ ${section} seeded`);
    } else {
      console.log(`❌ ${section} failed:`, result.error || 'Unknown error');
    }
  } catch (err) {
    console.log(`❌ ${section} error:`, err.message);
  }
}