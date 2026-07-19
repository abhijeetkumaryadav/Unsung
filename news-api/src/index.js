export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Key',
    };
    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Helper: get a section (single row)
    const getSection = async (table) => {
      const result = await env.DB.prepare(`SELECT data FROM ${table} WHERE id = 1`).first();
      return result ? JSON.parse(result.data) : null;
    };

    // Helper: upsert a section
    const upsertSection = async (table, data) => {
      const json = JSON.stringify(data);
      await env.DB.prepare(`
        INSERT INTO ${table} (id, data) VALUES (1, ?)
        ON CONFLICT(id) DO UPDATE SET data = excluded.data
      `).bind(json).run();
      return true;
    };

    // GET /api/get-data
    if (path === '/api/get-data' && method === 'GET') {
      const key = url.searchParams.get('key');
      if (!key) {
        return new Response(JSON.stringify({ error: 'key required' }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
      }

      const tableMap = {
        topStories: 'top_stories',
        latestNews: 'latest_news',
        marketData: 'market_data',
        weatherData: 'weather_data',
        videos: 'videos',
        tvChannels: 'tv_channels',
        ticker: 'ticker',
        sports: 'sports',
        weatherCities: 'weather_cities',
        electionStates: 'election_states',
        electionConfig: 'election_config',
        electionVisible: 'election_visible',
        noElectionMessage: 'no_election_message',
        footerDescription: 'footer_description',
        socialLinks: 'social_links',
      };

      const table = tableMap[key];
      if (!table) {
        return new Response(JSON.stringify({ error: 'invalid key' }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
      }

      let data;
      if (key === 'electionVisible') {
        const row = await env.DB.prepare(`SELECT value FROM election_visible WHERE id = 1`).first();
        data = row ? row.value === 1 : true;
      } else if (key === 'noElectionMessage') {
        const row = await env.DB.prepare(`SELECT message FROM no_election_message WHERE id = 1`).first();
        data = row ? row.message : "No active elections at this time.";
      } else if (key === 'footerDescription') {
        const row = await env.DB.prepare(`SELECT description FROM footer_description WHERE id = 1`).first();
        data = row ? row.description : "News that matters, stories that inspire...";
      } else {
        data = await getSection(table);
      }

      return new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // POST /api/update-data
    if (path === '/api/update-data' && method === 'POST') {
      const adminKey = request.headers.get('X-Admin-Key');
      if (adminKey !== env.ADMIN_SECRET) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
      }

      const body = await request.json();
      const { section, data } = body;
      if (!section || data === undefined) {
        return new Response(JSON.stringify({ error: 'section and data required' }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
      }

      const tableMap = {
        topStories: 'top_stories',
        latestNews: 'latest_news',
        marketData: 'market_data',
        weatherData: 'weather_data',
        videos: 'videos',
        tvChannels: 'tv_channels',
        ticker: 'ticker',
        sports: 'sports',
        weatherCities: 'weather_cities',
        electionStates: 'election_states',
        electionConfig: 'election_config',
        electionVisible: 'election_visible',
        noElectionMessage: 'no_election_message',
        footerDescription: 'footer_description',
        socialLinks: 'social_links',
      };

      const table = tableMap[section];
      if (!table) {
        return new Response(JSON.stringify({ error: 'invalid section' }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
      }

      // Handle special sections
      if (section === 'electionVisible') {
        await env.DB.prepare(`INSERT OR REPLACE INTO election_visible (id, value) VALUES (1, ?)`).bind(data ? 1 : 0).run();
      } else if (section === 'noElectionMessage') {
        await env.DB.prepare(`INSERT OR REPLACE INTO no_election_message (id, message) VALUES (1, ?)`).bind(data).run();
      } else if (section === 'footerDescription') {
        await env.DB.prepare(`INSERT OR REPLACE INTO footer_description (id, description) VALUES (1, ?)`).bind(data).run();
      } else {
        await upsertSection(table, data);
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    return new Response('Not Found', { status: 404, headers: corsHeaders });
  },
};