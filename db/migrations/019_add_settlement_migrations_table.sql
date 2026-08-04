CREATE TABLE settlement_migrations (
    id SERIAL PRIMARY KEY,

    player_id INTEGER NOT NULL
        REFERENCES players(id)
        ON DELETE CASCADE,

    migration_name TEXT NOT NULL,

    applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(player_id, migration_name)
);