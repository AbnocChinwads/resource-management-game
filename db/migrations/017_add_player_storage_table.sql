CREATE TABLE player_storage (
    player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    storage_category storage_category NOT NULL,
    capacity INTEGER NOT NULL,

    PRIMARY KEY(player_id, storage_category)
);