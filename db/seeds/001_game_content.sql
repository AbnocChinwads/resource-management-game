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
ON CONFLICT (id) DO UPDATE;

SELECT pg_catalog.setval('public.resources_id_seq', 9, true);

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
    (11, 'Build Kiln', NULL, NULL, 30, 'build', 1),
    (12, 'Build Farm', NULL, NULL, 30, 'build', 2),
    (13, 'Build Mill', NULL, NULL, 30, 'build', 3),
    (14, 'Build Bakery', NULL, NULL, 30, 'build', 4),
    (15, 'Build Quarry', NULL, NULL, 30, 'build', 5),
    (16, 'Build Woodcutters Hut', NULL, NULL, 30, 'build', 6),
    (17, 'Build Mine', NULL, NULL, 30, 'build', 7),
    (18, 'Build Blacksmith', NULL, NULL, 30, 'build', 8),
    (19, 'Build Lumber Camp', NULL, NULL, 30, 'build', 9),
    (20, 'Build Sawmill', NULL, NULL, 30, 'build', 10),
    (21, 'Build Hut', NULL, NULL, 30, 'build', 11),
    (22, 'Build Cottage', NULL, NULL, 30, 'build', 12)
ON CONFLICT (id) DO UPDATE;

SELECT pg_catalog.setval('public.recipes_id_seq', 22, true);

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
ON CONFLICT (id) DO UPDATE;

SELECT pg_catalog.setval('public.recipe_inputs_id_seq', 28, true);

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
ON CONFLICT (id) DO UPDATE;

SELECT pg_catalog.setval('public.buildings_id_seq', 12, true);
