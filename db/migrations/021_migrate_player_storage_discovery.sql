-- Migrate legacy player storage data.
-- Remove storage categories that existed before storage discovery
-- became persistent.

DELETE FROM player_storage ps
WHERE NOT EXISTS (
    SELECT 1
    FROM player_resources pr
    JOIN resource_types rt
        ON rt.id = pr.resource_type_id
    WHERE pr.player_id = ps.player_id
      AND rt.storage_category = ps.storage_category
);