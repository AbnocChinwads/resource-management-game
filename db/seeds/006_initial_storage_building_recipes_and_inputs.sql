-- Storehouse
INSERT INTO recipes (
    name,
    output_resource_id,
    output_amount,
    craft_time_seconds,
    recipe_type,
    output_building_id
)
SELECT
    'Build Storehouse',
    NULL,
    NULL,
    30,
    'build',
    id
FROM buildings
WHERE name = 'Storehouse';

-- Granary
INSERT INTO recipes (
    name,
    output_resource_id,
    output_amount,
    craft_time_seconds,
    recipe_type,
    output_building_id
)
SELECT
    'Build Granary',
    NULL,
    NULL,
    30,
    'build',
    id
FROM buildings
WHERE name = 'Granary';

-- Pantry
INSERT INTO recipes (
    name,
    output_resource_id,
    output_amount,
    craft_time_seconds,
    recipe_type,
    output_building_id
)
SELECT
    'Build Pantry',
    NULL,
    NULL,
    30,
    'build',
    id
FROM buildings
WHERE name = 'Pantry';

-- Food Store
INSERT INTO recipes (
    name,
    output_resource_id,
    output_amount,
    craft_time_seconds,
    recipe_type,
    output_building_id
)
SELECT
    'Build Food Store',
    NULL,
    NULL,
    30,
    'build',
    id
FROM buildings
WHERE name = 'Food Store';


-- Storehouse inputs
INSERT INTO recipe_inputs (recipe_id, resource_type_id, amount)
SELECT r.id, rt.id, 10
FROM recipes r
JOIN resource_types rt ON rt.name = 'Stone'
WHERE r.name = 'Build Storehouse';

INSERT INTO recipe_inputs (recipe_id, resource_type_id, amount)
SELECT r.id, rt.id, 20
FROM recipes r
JOIN resource_types rt ON rt.name = 'Wood'
WHERE r.name = 'Build Storehouse';

INSERT INTO recipe_inputs (recipe_id, resource_type_id, amount)
SELECT r.id, rt.id, 15
FROM recipes r
JOIN resource_types rt ON rt.name = 'Logs'
WHERE r.name = 'Build Storehouse';


-- Granary inputs
INSERT INTO recipe_inputs (recipe_id, resource_type_id, amount)
SELECT r.id, rt.id, 10
FROM recipes r
JOIN resource_types rt ON rt.name = 'Stone'
WHERE r.name = 'Build Granary';

INSERT INTO recipe_inputs (recipe_id, resource_type_id, amount)
SELECT r.id, rt.id, 20
FROM recipes r
JOIN resource_types rt ON rt.name = 'Wood'
WHERE r.name = 'Build Granary';

INSERT INTO recipe_inputs (recipe_id, resource_type_id, amount)
SELECT r.id, rt.id, 15
FROM recipes r
JOIN resource_types rt ON rt.name = 'Logs'
WHERE r.name = 'Build Granary';


-- Pantry inputs
INSERT INTO recipe_inputs (recipe_id, resource_type_id, amount)
SELECT r.id, rt.id, 5
FROM recipes r
JOIN resource_types rt ON rt.name = 'Stone'
WHERE r.name = 'Build Pantry';

INSERT INTO recipe_inputs (recipe_id, resource_type_id, amount)
SELECT r.id, rt.id, 15
FROM recipes r
JOIN resource_types rt ON rt.name = 'Wood'
WHERE r.name = 'Build Pantry';

INSERT INTO recipe_inputs (recipe_id, resource_type_id, amount)
SELECT r.id, rt.id, 10
FROM recipes r
JOIN resource_types rt ON rt.name = 'Planks'
WHERE r.name = 'Build Pantry';


-- Food Store inputs
INSERT INTO recipe_inputs (recipe_id, resource_type_id, amount)
SELECT r.id, rt.id, 10
FROM recipes r
JOIN resource_types rt ON rt.name = 'Stone'
WHERE r.name = 'Build Food Store';

INSERT INTO recipe_inputs (recipe_id, resource_type_id, amount)
SELECT r.id, rt.id, 20
FROM recipes r
JOIN resource_types rt ON rt.name = 'Wood'
WHERE r.name = 'Build Food Store';

INSERT INTO recipe_inputs (recipe_id, resource_type_id, amount)
SELECT r.id, rt.id, 15
FROM recipes r
JOIN resource_types rt ON rt.name = 'Planks'
WHERE r.name = 'Build Food Store';