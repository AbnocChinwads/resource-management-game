ALTER TABLE player_buildings
ADD COLUMN production_progress_seconds INTEGER NOT NULL DEFAULT 0,
ADD CONSTRAINT production_progress_nonnegative
CHECK (production_progress_seconds >= 0);