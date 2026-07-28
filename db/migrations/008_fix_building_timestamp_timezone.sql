UPDATE player_buildings
SET built_at = built_at - INTERVAL '1 hour'
WHERE built_at IS NOT NULL;