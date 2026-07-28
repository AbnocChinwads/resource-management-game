ALTER TABLE player_buildings
ALTER COLUMN health DROP DEFAULT;

ALTER TABLE player_buildings
ALTER COLUMN health SET NOT NULL;