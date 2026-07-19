-- worker/seed.sql
-- ============================================================
-- EMPTY SEED DATA
-- All tables start empty
-- ============================================================

-- Insert default election config
INSERT OR REPLACE INTO election_config (id, title, live_map_title, total_seats, visible, no_election_message) 
VALUES (1, 'Election Center 2026', 'Live Results Map', 403, 1, 'No active elections at this time.');

-- Insert default footer description
INSERT OR REPLACE INTO footer_settings (id, description) 
VALUES (1, 'News that matters, stories that inspire. Delivering objective, real-time journalism covering politics, business, culture, and sports across the globe.');