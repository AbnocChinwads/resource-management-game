ALTER TABLE player_buildings
ADD COLUMN production_wear_ticks INTEGER NOT NULL DEFAULT 0,
ADD CONSTRAINT production_wear_ticks_nonnegative
CHECK (production_wear_ticks >= 0);

ALTER TABLE player_buildings
ADD COLUMN degradation_ticks INTEGER NOT NULL DEFAULT 0,
ADD CONSTRAINT degradation_ticks_nonnegative
CHECK (degradation_ticks >= 0);