-- Add the Toolmaker production building for Stone Tools.

INSERT INTO buildings (
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
    'Toolmaker',
    'Crafts Stone Tools from stone and wood',
    2,
    100,
    (SELECT id FROM recipes WHERE name = 'Craft Stone Tools'),
    'production',
    0,
    NULL,
    0
);

INSERT INTO recipes (
    name,
    output_resource_id,
    output_amount,
    craft_time_seconds,
    recipe_type,
    output_building_id
)
VALUES (
    'Build Toolmaker',
    NULL,
    NULL,
    45,
    'build',
    (SELECT id FROM buildings WHERE name = 'Toolmaker')
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
        ('Build Toolmaker', 'Wood',  8),
        ('Build Toolmaker', 'Stone', 8)
) AS v(recipe_name, resource_name, amount)
JOIN recipes r
    ON r.name = v.recipe_name
JOIN resource_types rt
    ON rt.name = v.resource_name;

ALTER TABLE recipes
ADD COLUMN display_order INTEGER;

UPDATE recipes
SET display_order = CASE name
    WHEN 'Build Hut' THEN 10
    WHEN 'Build Woodcutters Hut' THEN 20
    WHEN 'Build Quarry' THEN 30
    WHEN 'Build Farm' THEN 40
    WHEN 'Build Toolmaker' THEN 50
    WHEN 'Build Sawmill' THEN 60
    WHEN 'Build Kiln' THEN 70
    WHEN 'Build Mill' THEN 80
    WHEN 'Build Mine' THEN 90
    WHEN 'Build Bakery' THEN 100
    WHEN 'Build Smelter' THEN 110
    WHEN 'Build Blacksmith' THEN 120
    WHEN 'Build Workshop' THEN 130
    WHEN 'Build Cottage' THEN 140
    ELSE display_order
END
WHERE recipe_type = 'build';