
-- Core production/construction rebalance and ID cleanup.

-- ---------------------------------------------------------------------------
-- 0. Preflight checks for the exact schema/data state this migration targets.
-- ---------------------------------------------------------------------------

DO $$
BEGIN
    IF (SELECT id FROM buildings WHERE name = 'Lumber Camp') IS DISTINCT FROM 9 THEN
        RAISE EXCEPTION 'Expected Lumber Camp to be building ID 9';
    END IF;

    IF (SELECT id FROM recipes WHERE name = 'Chop Logs') IS DISTINCT FROM 8 THEN
        RAISE EXCEPTION 'Expected Chop Logs to be recipe ID 8';
    END IF;

    IF (SELECT id FROM recipes WHERE name = 'Build Lumber Camp') IS DISTINCT FROM 19 THEN
        RAISE EXCEPTION 'Expected Build Lumber Camp to be recipe ID 19';
    END IF;

    IF EXISTS (SELECT 1 FROM recipes WHERE id = 10) THEN
        RAISE EXCEPTION 'Recipe ID 10 is unexpectedly occupied';
    END IF;

    IF EXISTS (SELECT 1 FROM buildings WHERE id = 18) THEN
        RAISE EXCEPTION 'Building ID 18 is unexpectedly occupied';
    END IF;
END
$$;

-- ---------------------------------------------------------------------------
-- 1. Remove Logs / Lumber Camp without throwing away existing player progress.
-- ---------------------------------------------------------------------------

UPDATE player_buildings
SET building_id = (
    SELECT id
    FROM buildings
    WHERE name = 'Woodcutters Hut'
)
WHERE building_id = (
    SELECT id
    FROM buildings
    WHERE name = 'Lumber Camp'
);

UPDATE player_tasks
SET recipe_id = (
    SELECT id
    FROM recipes
    WHERE name = 'Build Woodcutters Hut'
)
WHERE recipe_id = (
    SELECT id
    FROM recipes
    WHERE name = 'Build Lumber Camp'
);

UPDATE player_tasks
SET recipe_id = (
    SELECT id
    FROM recipes
    WHERE name = 'Gather Wood'
)
WHERE recipe_id = (
    SELECT id
    FROM recipes
    WHERE name = 'Chop Logs'
);

INSERT INTO player_resources (player_id, resource_type_id, amount)
SELECT
    pr.player_id,
    wood.id,
    pr.amount
FROM player_resources pr
JOIN resource_types logs
    ON logs.id = pr.resource_type_id
   AND logs.name = 'Logs'
CROSS JOIN LATERAL (
    SELECT id
    FROM resource_types
    WHERE name = 'Wood'
) wood
ON CONFLICT (player_id, resource_type_id)
DO UPDATE
SET amount = player_resources.amount + EXCLUDED.amount;

DELETE FROM player_resources
WHERE resource_type_id = (
    SELECT id
    FROM resource_types
    WHERE name = 'Logs'
);

UPDATE recipe_inputs
SET resource_type_id = (
    SELECT id
    FROM resource_types
    WHERE name = 'Planks'
)
WHERE resource_type_id = (
    SELECT id
    FROM resource_types
    WHERE name = 'Logs'
)
AND recipe_id IN (
    SELECT id
    FROM recipes
    WHERE name IN ('Build Storehouse', 'Build Granary')
);

DELETE FROM recipes
WHERE name = 'Build Lumber Camp';

DELETE FROM buildings
WHERE name = 'Lumber Camp';

DELETE FROM recipes
WHERE name = 'Chop Logs';

DELETE FROM recipe_inputs
WHERE resource_type_id = (
    SELECT id
    FROM resource_types
    WHERE name = 'Logs'
);

DELETE FROM resource_types
WHERE name = 'Logs';


-- ---------------------------------------------------------------------------
-- 2. Reassign resource IDs into a stable, contiguous, logical order.
--
-- Final IDs:
--  1 Wheat
--  2 Flour
--  3 Bread
--  4 Wood
--  5 Stone
--  6 Ore
--  7 Planks
--  8 Charcoal
--  9 Iron
-- 10 Stone Tools
-- 11 Iron Tools
-- ---------------------------------------------------------------------------

CREATE TEMP TABLE rebalance_resource_id_map (
    name TEXT PRIMARY KEY,
    new_id INTEGER UNIQUE NOT NULL
) ON COMMIT DROP;

INSERT INTO rebalance_resource_id_map (name, new_id)
VALUES
    ('Wheat', 1),
    ('Flour', 2),
    ('Bread', 3),
    ('Wood', 4),
    ('Stone', 5),
    ('Ore', 6),
    ('Planks', 7),
    ('Charcoal', 8),
    ('Stone Tools', 10),
    ('Iron Tools', 11);

ALTER TABLE recipes
DROP CONSTRAINT fk_output_resource;

ALTER TABLE recipes
DROP CONSTRAINT fk_recipes_output_resource;

ALTER TABLE recipe_inputs
DROP CONSTRAINT recipe_inputs_resource_type_id_fkey;

ALTER TABLE player_resources
DROP CONSTRAINT player_resources_resource_type_id_fkey;

UPDATE player_resources
SET resource_type_id = resource_type_id + 100;

UPDATE recipe_inputs
SET resource_type_id = resource_type_id + 100;

UPDATE recipes
SET output_resource_id = output_resource_id + 100
WHERE output_resource_id IS NOT NULL;

UPDATE resource_types
SET id = id + 100;

UPDATE player_resources pr
SET resource_type_id = m.new_id
FROM resource_types rt
JOIN rebalance_resource_id_map m
    ON m.name = rt.name
WHERE pr.resource_type_id = rt.id;

UPDATE recipe_inputs ri
SET resource_type_id = m.new_id
FROM resource_types rt
JOIN rebalance_resource_id_map m
    ON m.name = rt.name
WHERE ri.resource_type_id = rt.id;

UPDATE recipes r
SET output_resource_id = m.new_id
FROM resource_types rt
JOIN rebalance_resource_id_map m
    ON m.name = rt.name
WHERE r.output_resource_id = rt.id;

UPDATE resource_types rt
SET id = m.new_id
FROM rebalance_resource_id_map m
WHERE rt.name = m.name;

INSERT INTO resource_types (
    id,
    name,
    nutrition_value,
    storage_category
)
VALUES (
    9,
    'Iron',
    0,
    'material'
);

UPDATE resource_types
SET nutrition_value = 5
WHERE name = 'Bread';

UPDATE resource_types
SET storage_category = 'tool'
WHERE name IN ('Stone Tools', 'Iron Tools');

INSERT INTO player_storage (
    player_id,
    storage_category,
    capacity
)
SELECT DISTINCT
    pr.player_id,
    sd.storage_category,
    sd.default_capacity
FROM player_resources pr
JOIN resource_types rt
    ON rt.id = pr.resource_type_id
JOIN storage_defaults sd
    ON sd.storage_category = 'tool'
WHERE rt.storage_category = 'tool'
ON CONFLICT (player_id, storage_category) DO NOTHING;

ALTER TABLE recipes
ADD CONSTRAINT fk_output_resource
FOREIGN KEY (output_resource_id)
REFERENCES resource_types(id)
ON DELETE CASCADE;

ALTER TABLE recipes
ADD CONSTRAINT fk_recipes_output_resource
FOREIGN KEY (output_resource_id)
REFERENCES resource_types(id)
ON DELETE RESTRICT;

ALTER TABLE recipe_inputs
ADD CONSTRAINT recipe_inputs_resource_type_id_fkey
FOREIGN KEY (resource_type_id)
REFERENCES resource_types(id);

ALTER TABLE player_resources
ADD CONSTRAINT player_resources_resource_type_id_fkey
FOREIGN KEY (resource_type_id)
REFERENCES resource_types(id);


-- ---------------------------------------------------------------------------
-- 3. Rebalance production processes and add Iron smelting.
-- ---------------------------------------------------------------------------

UPDATE recipes r
SET
    output_resource_id = rt.id,
    output_amount = v.output_amount,
    craft_time_seconds = v.craft_time_seconds,
    recipe_type = v.recipe_type
FROM (
    VALUES
        ('Grow Wheat',        'Wheat',       3, 15, 'gather'),
        ('Mill Flour',        'Flour',       4, 15, 'craft'),
        ('Bake Bread',        'Bread',       2, 15, 'craft'),
        ('Gather Stone',      'Stone',       3, 15, 'gather'),
        ('Gather Wood',       'Wood',        3, 15, 'gather'),
        ('Mine Ore',          'Ore',         2, 15, 'gather'),
        ('Forge Iron Tools',  'Iron Tools',  1, 60, 'craft'),
        ('Saw Planks',        'Planks',      4, 15, 'craft'),
        ('Produce Charcoal',  'Charcoal',    2, 15, 'craft'),
        ('Craft Stone Tools', 'Stone Tools', 1, 15, 'craft')
) AS v(
    recipe_name,
    resource_name,
    output_amount,
    craft_time_seconds,
    recipe_type
)
JOIN resource_types rt
    ON rt.name = v.resource_name
WHERE r.name = v.recipe_name;

INSERT INTO recipes (
    id,
    name,
    output_resource_id,
    output_amount,
    craft_time_seconds,
    recipe_type,
    output_building_id
)
OVERRIDING SYSTEM VALUE
VALUES (
    8,
    'Smelt Iron',
    (SELECT id FROM resource_types WHERE name = 'Iron'),
    2,
    15,
    'craft',
    NULL
);

DELETE FROM recipe_inputs
WHERE recipe_id IN (
    SELECT id
    FROM recipes
    WHERE name IN (
        'Mill Flour',
        'Bake Bread',
        'Forge Iron Tools',
        'Saw Planks',
        'Produce Charcoal',
        'Craft Stone Tools',
        'Smelt Iron'
    )
);

INSERT INTO recipe_inputs (
    recipe_id,
    resource_type_id,
    amount
)
SELECT
    r.id,
    rt.id,
    v.amount
FROM (
    VALUES
        ('Mill Flour',        'Wheat',     2),
        ('Bake Bread',        'Flour',     4),
        ('Bake Bread',        'Charcoal',  1),
        ('Saw Planks',        'Wood',      2),
        ('Produce Charcoal',  'Wood',      2),
        ('Smelt Iron',        'Ore',       2),
        ('Smelt Iron',        'Charcoal',  2),
        ('Forge Iron Tools',  'Iron',      2),
        ('Craft Stone Tools', 'Stone',     2),
        ('Craft Stone Tools', 'Wood',      1)
) AS v(recipe_name, resource_name, amount)
JOIN recipes r
    ON r.name = v.recipe_name
JOIN resource_types rt
    ON rt.name = v.resource_name;


-- ---------------------------------------------------------------------------
-- 4. Rebalance existing buildings and add Smelter / Workshop.
-- ---------------------------------------------------------------------------

UPDATE buildings b
SET
    description = v.description,
    max_workers = v.max_workers,
    max_health = v.max_health,
    population_gain = v.population_gain,
    type = v.type
FROM (
    VALUES
        ('Kiln',            'Produces charcoal from wood',                2, 100, 0, 'production'),
        ('Farm',            'Produces wheat',                             2, 100, 0, 'production'),
        ('Mill',            'Produces flour from wheat',                  2, 100, 0, 'production'),
        ('Bakery',          'Produces bread from flour and charcoal',     2, 100, 0, 'production'),
        ('Quarry',          'Produces stone',                             2, 100, 0, 'production'),
        ('Woodcutters Hut', 'Produces wood',                              2, 100, 0, 'production'),
        ('Mine',            'Produces ore',                               2, 100, 0, 'production'),
        ('Blacksmith',      'Forges Iron Tools from iron',                2, 100, 0, 'production'),
        ('Sawmill',         'Produces planks from wood',                   2, 100, 0, 'production'),
        ('Hut',             'Provides housing for population',            0, 100, 2, 'housing'),
        ('Cottage',         'Larger housing for more population',         0, 100, 4, 'housing')
) AS v(
    building_name,
    description,
    max_workers,
    max_health,
    population_gain,
    type
)
WHERE b.name = v.building_name;

INSERT INTO buildings (
    id,
    name,
    description,
    max_workers,
    max_health,
    production_recipe_id,
    type,
    population_gain,
    storage_category,
    storage_capacity
)
VALUES (
    9,
    'Smelter',
    'Smelts ore and charcoal into iron',
    2,
    100,
    (SELECT id FROM recipes WHERE name = 'Smelt Iron'),
    'production',
    0,
    NULL,
    0
);

INSERT INTO buildings (
    id,
    name,
    description,
    max_workers,
    max_health,
    production_recipe_id,
    type,
    population_gain,
    storage_category,
    storage_capacity
)
VALUES (
    18,
    'Workshop',
    'Enables building maintenance using Iron Tools.',
    0,
    100,
    NULL,
    'maintenance',
    0,
    NULL,
    0
);

UPDATE buildings b
SET production_recipe_id = r.id
FROM (
    VALUES
        ('Kiln',            'Produce Charcoal'),
        ('Farm',            'Grow Wheat'),
        ('Mill',            'Mill Flour'),
        ('Bakery',          'Bake Bread'),
        ('Quarry',          'Gather Stone'),
        ('Woodcutters Hut', 'Gather Wood'),
        ('Mine',            'Mine Ore'),
        ('Blacksmith',      'Forge Iron Tools'),
        ('Smelter',         'Smelt Iron'),
        ('Sawmill',         'Saw Planks')
) AS v(building_name, recipe_name)
JOIN recipes r
    ON r.name = v.recipe_name
WHERE b.name = v.building_name;


-- ---------------------------------------------------------------------------
-- 5. Rebalance construction recipes and add Smelter / Workshop construction.
-- ---------------------------------------------------------------------------

UPDATE recipes r
SET craft_time_seconds = v.craft_time_seconds
FROM (
    VALUES
        ('Build Kiln',            45),
        ('Build Farm',            30),
        ('Build Mill',            60),
        ('Build Bakery',          60),
        ('Build Quarry',          30),
        ('Build Woodcutters Hut', 30),
        ('Build Mine',            60),
        ('Build Blacksmith',      90),
        ('Build Sawmill',         60),
        ('Build Hut',             30),
        ('Build Cottage',         60)
) AS v(recipe_name, craft_time_seconds)
WHERE r.name = v.recipe_name;

-- Recipe ID 10 was already unused.
INSERT INTO recipes (
    id,
    name,
    output_resource_id,
    output_amount,
    craft_time_seconds,
    recipe_type,
    output_building_id
)
OVERRIDING SYSTEM VALUE
VALUES (
    10,
    'Build Smelter',
    NULL,
    NULL,
    90,
    'build',
    (SELECT id FROM buildings WHERE name = 'Smelter')
);

-- Recipe ID 19 was Build Lumber Camp and is now free.
INSERT INTO recipes (
    id,
    name,
    output_resource_id,
    output_amount,
    craft_time_seconds,
    recipe_type,
    output_building_id
)
OVERRIDING SYSTEM VALUE
VALUES (
    19,
    'Build Workshop',
    NULL,
    NULL,
    60,
    'build',
    (SELECT id FROM buildings WHERE name = 'Workshop')
);

DELETE FROM recipe_inputs
WHERE recipe_id IN (
    SELECT id
    FROM recipes
    WHERE name IN (
        'Build Kiln',
        'Build Farm',
        'Build Mill',
        'Build Bakery',
        'Build Quarry',
        'Build Woodcutters Hut',
        'Build Mine',
        'Build Blacksmith',
        'Build Sawmill',
        'Build Hut',
        'Build Cottage',
        'Build Smelter',
        'Build Workshop'
    )
);

INSERT INTO recipe_inputs (
    recipe_id,
    resource_type_id,
    amount
)
SELECT
    r.id,
    rt.id,
    v.amount
FROM (
    VALUES
        ('Build Hut',             'Wood',       8),

        ('Build Cottage',         'Wood',      12),
        ('Build Cottage',         'Stone',      8),

        ('Build Woodcutters Hut', 'Wood',      12),

        ('Build Quarry',          'Wood',      12),

        ('Build Farm',            'Wood',       8),
        ('Build Farm',            'Stone',      4),

        ('Build Sawmill',         'Wood',      12),
        ('Build Sawmill',         'Stone',      8),

        ('Build Kiln',            'Stone',     12),
        ('Build Kiln',            'Planks',     4),

        ('Build Mill',            'Stone',      8),
        ('Build Mill',            'Planks',    12),

        ('Build Mine',            'Stone',     12),
        ('Build Mine',            'Planks',    12),

        ('Build Bakery',          'Stone',     12),
        ('Build Bakery',          'Planks',    16),

        ('Build Smelter',         'Stone',     20),
        ('Build Smelter',         'Planks',     8),

        ('Build Blacksmith',      'Stone',     16),
        ('Build Blacksmith',      'Planks',    12),
        ('Build Blacksmith',      'Iron',       4),

        ('Build Workshop',        'Stone',     20),
        ('Build Workshop',        'Planks',    16),
        ('Build Workshop',        'Iron',       8)
) AS v(recipe_name, resource_name, amount)
JOIN recipes r
    ON r.name = v.recipe_name
JOIN resource_types rt
    ON rt.name = v.resource_name;


-- ---------------------------------------------------------------------------
-- 6. Normalise existing player buildings after capacity/health changes.
-- ---------------------------------------------------------------------------

UPDATE player_buildings pb
SET workers_assigned = b.max_workers
FROM buildings b
WHERE pb.building_id = b.id
  AND pb.workers_assigned > b.max_workers;

UPDATE player_buildings pb
SET health = b.max_health
FROM buildings b
WHERE pb.building_id = b.id
  AND pb.health > b.max_health;


-- ---------------------------------------------------------------------------
-- 7. Clean up internal IDs and reset sequences.
-- ---------------------------------------------------------------------------

CREATE TEMP TABLE rebalance_recipe_input_id_map
ON COMMIT DROP
AS
SELECT
    id AS old_id,
    ROW_NUMBER() OVER (
        ORDER BY recipe_id, resource_type_id, id
    )::INTEGER AS new_id
FROM recipe_inputs;

UPDATE recipe_inputs
SET id = -id;

UPDATE recipe_inputs ri
SET id = m.new_id
FROM rebalance_recipe_input_id_map m
WHERE ri.id = -m.old_id;

SELECT setval(
    pg_get_serial_sequence('resource_types', 'id'),
    (SELECT MAX(id) FROM resource_types),
    true
);

SELECT setval(
    pg_get_serial_sequence('buildings', 'id'),
    (SELECT MAX(id) FROM buildings),
    true
);

SELECT setval(
    pg_get_serial_sequence('recipes', 'id'),
    (SELECT MAX(id) FROM recipes),
    true
);

SELECT setval(
    pg_get_serial_sequence('recipe_inputs', 'id'),
    (SELECT MAX(id) FROM recipe_inputs),
    true
);


-- ---------------------------------------------------------------------------
-- 8. Safety checks: fail the migration if the intended final ID layout was
--    not produced.
-- ---------------------------------------------------------------------------

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM (
            SELECT
                id,
                ROW_NUMBER() OVER (ORDER BY id)::INTEGER AS expected_id
            FROM resource_types
        ) ids
        WHERE id <> expected_id
    ) THEN
        RAISE EXCEPTION 'resource_types IDs are not contiguous after rebalance';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM (
            SELECT
                id,
                ROW_NUMBER() OVER (ORDER BY id)::INTEGER AS expected_id
            FROM buildings
        ) ids
        WHERE id <> expected_id
    ) THEN
        RAISE EXCEPTION 'buildings IDs are not contiguous after rebalance';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM (
            SELECT
                id,
                ROW_NUMBER() OVER (ORDER BY id)::INTEGER AS expected_id
            FROM recipes
        ) ids
        WHERE id <> expected_id
    ) THEN
        RAISE EXCEPTION 'recipes IDs are not contiguous after rebalance';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM (
            SELECT
                id,
                ROW_NUMBER() OVER (ORDER BY id)::INTEGER AS expected_id
            FROM recipe_inputs
        ) ids
        WHERE id <> expected_id
    ) THEN
        RAISE EXCEPTION 'recipe_inputs IDs are not contiguous after rebalance';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM resource_types
        WHERE name = 'Logs'
    ) THEN
        RAISE EXCEPTION 'Logs still exists after rebalance';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM buildings
        WHERE name = 'Lumber Camp'
    ) THEN
        RAISE EXCEPTION 'Lumber Camp still exists after rebalance';
    END IF;
END
$$;
