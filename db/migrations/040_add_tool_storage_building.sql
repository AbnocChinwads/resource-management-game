-- Add tool shed to buildings table

INSERT INTO buildings
    (name, description, type, storage_category, storage_capacity)
VALUES
    ('Tool Shed', 'Storage building for tools', 'storage', 'tool', 20);

-- Add tool shed to the recipes table so it can be built

INSERT INTO recipes
    (name, craft_time_seconds, recipe_type, output_building_id)
VALUES
    (
        'Build Tool Shed',
        30,
        'build',
        (SELECT id FROM buildings WHERE name = 'Tool Shed')
    );

-- Add recipe inputs for tool shed

INSERT INTO recipe_inputs
    (recipe_id, resource_type_id, amount)
VALUES
    (
        (SELECT id FROM recipes WHERE name = 'Build Tool Shed'),
        (SELECT id FROM resource_types WHERE name = 'Planks'),
        10
    );

INSERT INTO recipe_inputs
    (recipe_id, resource_type_id, amount)
VALUES
    (
        (SELECT id FROM recipes WHERE name = 'Build Tool Shed'),
        (SELECT id FROM resource_types WHERE name = 'Stone'),
        10
    );