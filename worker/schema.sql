-- worker/schema.sql
-- ============================================================
-- D1 DATABASE SCHEMA
-- ============================================================

-- Top Stories
CREATE TABLE IF NOT EXISTS top_stories (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    time TEXT NOT NULL,
    image TEXT NOT NULL,
    link TEXT NOT NULL,
    description TEXT,
    language TEXT DEFAULT 'en',
    featured_in_all INTEGER DEFAULT 0,
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch())
);

-- Latest News
CREATE TABLE IF NOT EXISTS latest_news (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    time TEXT NOT NULL,
    image TEXT NOT NULL,
    link TEXT NOT NULL,
    description TEXT,
    language TEXT DEFAULT 'en',
    featured_in_all INTEGER DEFAULT 0,
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch())
);

-- Translations
CREATE TABLE IF NOT EXISTS translations (
    content_id TEXT NOT NULL,
    content_type TEXT NOT NULL,
    language TEXT NOT NULL,
    field_name TEXT NOT NULL,
    translated_text TEXT NOT NULL,
    PRIMARY KEY (content_id, content_type, language, field_name)
);

-- Videos
CREATE TABLE IF NOT EXISTS videos (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    img TEXT NOT NULL,
    link TEXT NOT NULL,
    category TEXT DEFAULT 'Latest',
    language TEXT DEFAULT 'en',
    featured_in_all INTEGER DEFAULT 0,
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch())
);

-- TV Channels
CREATE TABLE IF NOT EXISTS tv_channels (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    logo TEXT,
    type TEXT DEFAULT 'hls',
    language TEXT DEFAULT 'en',
    featured_in_all INTEGER DEFAULT 0,
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch())
);

-- TV Channel URLs
CREATE TABLE IF NOT EXISTS tv_channel_urls (
    channel_id TEXT NOT NULL,
    url TEXT NOT NULL,
    is_primary INTEGER DEFAULT 0,
    created_at INTEGER DEFAULT (unixepoch()),
    FOREIGN KEY (channel_id) REFERENCES tv_channels(id) ON DELETE CASCADE
);

-- Ticker Items
CREATE TABLE IF NOT EXISTS ticker_items (
    id TEXT PRIMARY KEY,
    text TEXT NOT NULL,
    active INTEGER DEFAULT 1,
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch())
);

-- Ticker Links
CREATE TABLE IF NOT EXISTS ticker_links (
    ticker_id TEXT NOT NULL,
    linked_type TEXT NOT NULL,
    linked_id TEXT NOT NULL,
    FOREIGN KEY (ticker_id) REFERENCES ticker_items(id) ON DELETE CASCADE
);

-- Sports
CREATE TABLE IF NOT EXISTS sports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sport TEXT NOT NULL,
    match_name TEXT NOT NULL,
    score TEXT NOT NULL,
    detail TEXT NOT NULL,
    show_sport INTEGER DEFAULT 1,
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch())
);

-- Weather Cities
CREATE TABLE IF NOT EXISTS weather_cities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    city TEXT NOT NULL UNIQUE,
    temp TEXT NOT NULL,
    condition TEXT NOT NULL,
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch())
);

-- Election States
CREATE TABLE IF NOT EXISTS election_states (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    total_seats INTEGER DEFAULT 0,
    notes TEXT,
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch())
);

-- Election Parties
CREATE TABLE IF NOT EXISTS election_parties (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    state_id INTEGER NOT NULL,
    party_key TEXT NOT NULL,
    party_name TEXT NOT NULL,
    party_color TEXT DEFAULT 'slate',
    seats INTEGER DEFAULT 0,
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch()),
    FOREIGN KEY (state_id) REFERENCES election_states(id) ON DELETE CASCADE,
    UNIQUE(state_id, party_key)
);

-- State Links
CREATE TABLE IF NOT EXISTS election_state_links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    state_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    created_at INTEGER DEFAULT (unixepoch()),
    FOREIGN KEY (state_id) REFERENCES election_states(id) ON DELETE CASCADE
);

-- Election Config
CREATE TABLE IF NOT EXISTS election_config (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    title TEXT DEFAULT 'Election Center 2026',
    live_map_title TEXT DEFAULT 'Live Results Map',
    total_seats INTEGER DEFAULT 403,
    visible INTEGER DEFAULT 1,
    no_election_message TEXT DEFAULT 'No active elections at this time.',
    updated_at INTEGER DEFAULT (unixepoch())
);

-- Market Data
CREATE TABLE IF NOT EXISTS market_data (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    usd_inr TEXT,
    usd_inr_change TEXT,
    gold_rate TEXT,
    gold_change TEXT,
    sensex TEXT,
    sensex_change TEXT,
    nifty TEXT,
    nifty_change TEXT,
    updated_at INTEGER DEFAULT (unixepoch())
);

-- Weather Data
CREATE TABLE IF NOT EXISTS weather_data (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    temp TEXT,
    city TEXT,
    condition TEXT,
    updated_at INTEGER DEFAULT (unixepoch())
);

-- Footer Settings
CREATE TABLE IF NOT EXISTS footer_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    description TEXT,
    updated_at INTEGER DEFAULT (unixepoch())
);

-- Social Links
CREATE TABLE IF NOT EXISTS social_links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    platform TEXT NOT NULL,
    url TEXT NOT NULL,
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch())
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_top_stories_language ON top_stories(language);
CREATE INDEX IF NOT EXISTS idx_top_stories_created ON top_stories(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_latest_news_language ON latest_news(language);
CREATE INDEX IF NOT EXISTS idx_latest_news_created ON latest_news(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_videos_language ON videos(language);
CREATE INDEX IF NOT EXISTS idx_tv_channels_language ON tv_channels(language);
CREATE INDEX IF NOT EXISTS idx_translations_content ON translations(content_id, content_type);
CREATE INDEX IF NOT EXISTS idx_ticker_active ON ticker_items(active);