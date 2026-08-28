-- Rebalance building construction requirements

BEGIN;

-- Remove existing construction recipe inputs
DELETE FROM recipe_inputs
WHERE recipe_id IN (
    11, -- Build Kiln
    12, -- Build Farm
    13, -- Build Mill
    14, -- Build Bakery
    15, -- Build Quarry
    16, -- Build Woodcutters Hut
    17, -- Build Mine
    18, -- Build Blacksmith
    19, -- Build Lumber Camp
    20, -- Build Sawmill
    21, -- Build Hut
    22  -- Build Cottage
);

-- Add revised construction requirements

-- Kiln: 5 Stone + 3 Wood
INSERT INTO recipe_inputs (recipe_id, resource_type_id, amount)
SELECT 11, rt.id, v.amount
FROM resource_types rt
JOIN (VALUES
    ('Stone', 5),
    ('Wood', 3)
) AS v(name, amount) ON v.name = rt.name;

-- Farm: 5 Stone + 5 Wood
INSERT INTO recipe_inputs (recipe_id, resource_type_id, amount)
SELECT 12, rt.id, v.amount
FROM resource_types rt
JOIN (VALUES
    ('Stone', 5),
    ('Wood', 5)
) AS v(name, amount) ON v.name = rt.name;

-- Mill: 6 Stone + 4 Logs
INSERT INTO recipe_inputs (recipe_id, resource_type_id, amount)
SELECT 13, rt.id, v.amount
FROM resource_types rt
JOIN (VALUES
    ('Stone', 6),
    ('Logs', 4)
) AS v(name, amount) ON v.name = rt.name;

-- Bakery: 8 Stone + 4 Logs
INSERT INTO recipe_inputs (recipe_id, resource_type_id, amount)
SELECT 14, rt.id, v.amount
FROM resource_types rt
JOIN (VALUES
    ('Stone', 8),
    ('Logs', 4)
) AS v(name, amount) ON v.name = rt.name;

-- Quarry: 4 Wood
INSERT INTO recipe_inputs (recipe_id, resource_type_id, amount)
SELECT 15, rt.id, v.amount
FROM resource_types rt
JOIN (VALUES
    ('Wood', 4)
) AS v(name, amount) ON v.name = rt.name;

-- Woodcutters Hut: 4 Wood
INSERT INTO recipe_inputs (recipe_id, resource_type_id, amount)
SELECT 16, rt.id, v.amount
FROM resource_types rt
JOIN (VALUES
    ('Wood', 4)
) AS v(name, amount) ON v.name = rt.name;

-- Mine: 6 Stone + 4 Wood
INSERT INTO recipe_inputs (recipe_id, resource_type_id, amount)
SELECT 17, rt.id, v.amount
FROM resource_types rt
JOIN (VALUES
    ('Stone', 6),
    ('Wood', 4)
) AS v(name, amount) ON v.name = rt.name;

-- Blacksmith: 8 Stone + 4 Logs + 2 Ore
INSERT INTO recipe_inputs (recipe_id, resource_type_id, amount)
SELECT 18, rt.id, v.amount
FROM resource_types rt
JOIN (VALUES
    ('Stone', 8),
    ('Logs', 4),
    ('Ore', 2)
) AS v(name, amount) ON v.name = rt.name;

-- Lumber Camp: 4 Stone + 6 Wood
INSERT INTO recipe_inputs (recipe_id, resource_type_id, amount)
SELECT 19, rt.id, v.amount
FROM resource_types rt
JOIN (VALUES
    ('Stone', 4),
    ('Wood', 6)
) AS v(name, amount) ON v.name = rt.name;

-- Sawmill: 4 Stone + 6 Logs + 2 Ore
INSERT INTO recipe_inputs (recipe_id, resource_type_id, amount)
SELECT 20, rt.id, v.amount
FROM resource_types rt
JOIN (VALUES
    ('Stone', 4),
    ('Logs', 6),
    ('Ore', 2)
) AS v(name, amount) ON v.name = rt.name;

-- Hut: 2 Wheat + 4 Wood
INSERT INTO recipe_inputs (recipe_id, resource_type_id, amount)
SELECT 21, rt.id, v.amount
FROM resource_types rt
JOIN (VALUES
    ('Wheat', 2),
    ('Wood', 4)
) AS v(name, amount) ON v.name = rt.name;

-- Cottage: 4 Stone + 4 Planks
INSERT INTO recipe_inputs (recipe_id, resource_type_id, amount)
SELECT 22, rt.id, v.amount
FROM resource_types rt
JOIN (VALUES
    ('Stone', 4),
    ('Planks', 4)
) AS v(name, amount) ON v.name = rt.name;

COMMIT;