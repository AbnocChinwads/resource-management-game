-- Update Kiln configuration

UPDATE buildings
SET
    max_workers = 1,
    type = 'production'
WHERE name = 'Kiln';