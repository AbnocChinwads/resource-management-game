-- Resource types
INSERT INTO public.resource_types (id, name, nutrition_value)
VALUES
    (1, 'Wheat', 1),
    (2, 'Flour', 0),
    (3, 'Bread', 4),
    (4, 'Stone', 0),
    (5, 'Ore', 0),
    (6, 'Tools', 0),
    (7, 'Wood', 0),
    (8, 'Logs', 0),
    (9, 'Planks', 0)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    nutrition_value = EXCLUDED.nutrition_value;

SELECT setval(
    pg_get_serial_sequence('public.resource_types', 'id'),
    (SELECT MAX(id) FROM public.resource_types),
    true
);

-- Recipes
INSERT INTO public.recipes
    (id, name, output_resource_id, output_amount, craft_time_seconds, recipe_type, output_building_id)
VALUES
    (1, 'Grow Wheat', 1, 1, 3, 'gather', NULL),
    (2, 'Mill Flour', 2, 1, 5, 'craft', NULL),
    (3, 'Bake Bread', 3, 1, 10, 'craft', NULL),
    (4, 'Gather Stone', 4, 1, 3, 'gather', NULL),
    (5, 'Gather Wood', 7, 1, 3, 'gather', NULL),
    (6, 'Mine Ore', 5, 1, 5, 'craft', NULL),
    (7, 'Forge Tools', 6, 1, 10, 'craft', NULL),
    (8, 'Chop Logs', 8, 1, 5, 'craft', NULL),
    (9, 'Saw Planks', 9, 1, 10, 'craft', NULL),
    (11, 'Build Kiln', NULL, NULL, 30, 'build', NULL),
    (12, 'Build Farm', NULL, NULL, 30, 'build', NULL),
    (13, 'Build Mill', NULL, NULL, 30, 'build', NULL),
    (14, 'Build Bakery', NULL, NULL, 30, 'build', NULL),
    (15, 'Build Quarry', NULL, NULL, 30, 'build', NULL),
    (16, 'Build Woodcutters Hut', NULL, NULL, 30, 'build', NULL),
    (17, 'Build Mine', NULL, NULL, 30, 'build', NULL),
    (18, 'Build Blacksmith', NULL, NULL, 30, 'build', NULL),
    (19, 'Build Lumber Camp', NULL, NULL, 30, 'build', NULL),
    (20, 'Build Sawmill', NULL, NULL, 30, 'build', NULL),
    (21, 'Build Hut', NULL, NULL, 30, 'build', NULL),
    (22, 'Build Cottage', NULL, NULL, 30, 'build', NULL)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    output_resource_id = EXCLUDED.output_resource_id,
    output_amount = EXCLUDED.output_amount,
    craft_time_seconds = EXCLUDED.craft_time_seconds,
    recipe_type = EXCLUDED.recipe_type,
    output_building_id = EXCLUDED.output_building_id;

SELECT setval(
    pg_get_serial_sequence('public.recipes', 'id'),
    (SELECT MAX(id) FROM public.recipes),
    true
);

-- Recipe inputs
INSERT INTO public.recipe_inputs
    (id, recipe_id, resource_type_id, amount)
VALUES
    (1, 2, 1, 1),
    (2, 3, 2, 2),
    (3, 6, 4, 1),
    (4, 7, 5, 2),
    (5, 8, 7, 1),
    (6, 9, 8, 2),
    (7, 11, 4, 5),
    (8, 11, 7, 3),
    (9, 12, 7, 5),
    (10, 12, 4, 5),
    (11, 13, 8, 4),
    (12, 13, 4, 6),
    (13, 14, 8, 6),
    (14, 14, 4, 6),
    (15, 15, 7, 5),
    (16, 16, 7, 5),
    (17, 17, 7, 4),
    (18, 17, 4, 6),
    (19, 18, 6, 2),
    (20, 18, 8, 4),
    (21, 18, 4, 8),
    (22, 19, 7, 4),
    (23, 20, 4, 4),
    (24, 20, 8, 6),
    (25, 21, 1, 2),
    (26, 21, 7, 4),
    (27, 22, 4, 4),
    (28, 22, 9, 6)
ON CONFLICT (id) DO UPDATE SET
    recipe_id = EXCLUDED.recipe_id,
    resource_type_id = EXCLUDED.resource_type_id,
    amount = EXCLUDED.amount;

SELECT setval(
    pg_get_serial_sequence('public.recipe_inputs', 'id'),
    (SELECT MAX(id) FROM public.recipe_inputs),
    true
);

-- Buildings
INSERT INTO public.buildings
    (id, name, description, max_workers, max_health, production_recipe_id, type, population_gain)
VALUES
    (1, 'Kiln', 'Simple oven used to bake bread', 0, 100, NULL, NULL, 0),
    (2, 'Farm', 'Produces wheat', 3, 100, 1, 'production', 0),
    (3, 'Mill', 'Produces flour from wheat', 3, 100, 2, 'production', 0),
    (4, 'Bakery', 'Produces bread from flour', 2, 100, 3, 'production', 0),
    (5, 'Quarry', 'Produces stone', 2, 100, 4, 'production', 0),
    (6, 'Woodcutters Hut', 'Produces wood', 5, 100, 5, 'production', 0),
    (7, 'Mine', 'Produces ore', 2, 100, 6, 'production', 0),
    (8, 'Blacksmith', 'Converts ore into tools', 2, 100, 7, 'production', 0),
    (9, 'Lumber Camp', 'Produces logs', 2, 100, 8, 'production', 0),
    (10, 'Sawmill', 'Converts logs into planks', 2, 100, 9, 'production', 0),
    (11, 'Hut', 'Provides housing for population', 0, 100, NULL, 'housing', 2),
    (12, 'Cottage', 'Larger housing for more population', 0, 150, NULL, 'housing', 5)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    max_workers = EXCLUDED.max_workers,
    max_health = EXCLUDED.max_health,
    production_recipe_id = EXCLUDED.production_recipe_id,
    type = EXCLUDED.type,
    population_gain = EXCLUDED.population_gain;

SELECT setval(
    pg_get_serial_sequence('public.buildings', 'id'),
    (SELECT MAX(id) FROM public.buildings),
    true
);

UPDATE public.recipes
SET output_building_id = CASE id
    WHEN 11 THEN 1
    WHEN 12 THEN 2
    WHEN 13 THEN 3
    WHEN 14 THEN 4
    WHEN 15 THEN 5
    WHEN 16 THEN 6
    WHEN 17 THEN 7
    WHEN 18 THEN 8
    WHEN 19 THEN 9
    WHEN 20 THEN 10
    WHEN 21 THEN 11
    WHEN 22 THEN 12
END
WHERE id BETWEEN 11 AND 22;
