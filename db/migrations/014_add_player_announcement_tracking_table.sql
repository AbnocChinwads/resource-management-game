CREATE TABLE player_announcements (
    player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    announcement_id INTEGER NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
    seen_at TIMESTAMPTZ NULL,

    PRIMARY KEY(player_id, announcement_id)
);