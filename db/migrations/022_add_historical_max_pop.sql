ALTER TABLE players
ADD COLUMN historical_max_population INTEGER NOT NULL DEFAULT 0;

UPDATE players
SET historical_max_population = population
WHERE historical_max_population < population;