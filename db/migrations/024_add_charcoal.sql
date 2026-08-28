-- Add Charcoal resource
INSERT INTO resource_types (name, nutrition_value)
VALUES ('Charcoal', 0)
ON CONFLICT (name) DO NOTHING;


-- Add Charcoal production recipe
INSERT INTO recipes (
    name,
    output_resource_id,
    output_amount,
    craft_time_seconds,
    recipe_type
)
SELECT
    'Produce Charcoal',
    rt.id,
    1,
    10,
    'craft'
FROM resource_types rt
WHERE rt.name = 'Charcoal'
  AND NOT EXISTS (
      SELECT 1
      FROM recipes r
      WHERE r.name = 'Produce Charcoal'
  );


-- Add Wood input to Charcoal recipe
INSERT INTO recipe_inputs (
    recipe_id,
    resource_type_id,
    amount
)
SELECT
    r.id,
    rt.id,
    1
FROM recipes r
CROSS JOIN resource_types rt
WHERE r.name = 'Produce Charcoal'
  AND rt.name = 'Wood'
  AND NOT EXISTS (
      SELECT 1
      FROM recipe_inputs ri
      WHERE ri.recipe_id = r.id
        AND ri.resource_type_id = rt.id
  );


-- Make the Kiln produce Charcoal
UPDATE buildings
SET production_recipe_id = (
    SELECT id
    FROM recipes
    WHERE name = 'Produce Charcoal'
)
WHERE name = 'Kiln';

-- Change the Kilns description
UPDATE buildings
SET description = 'Simple oven used to make charcoal'
WHERE name = 'Kiln';

-- Add Charcoal as a Bread input
INSERT INTO recipe_inputs (
    recipe_id,
    resource_type_id,
    amount
)
SELECT
    r.id,
    rt.id,
    1
FROM recipes r
CROSS JOIN resource_types rt
WHERE r.name = 'Bread'
  AND rt.name = 'Charcoal'
  AND NOT EXISTS (
      SELECT 1
      FROM recipe_inputs ri
      WHERE ri.recipe_id = r.id
        AND ri.resource_type_id = rt.id
  );


-- Add Charcoal as a Tools input
INSERT INTO recipe_inputs (
    recipe_id,
    resource_type_id,
    amount
)
SELECT
    r.id,
    rt.id,
    1
FROM recipes r
CROSS JOIN resource_types rt
WHERE r.name = 'Tools'
  AND rt.name = 'Charcoal'
  AND NOT EXISTS (
      SELECT 1
      FROM recipe_inputs ri
      WHERE ri.recipe_id = r.id
        AND ri.resource_type_id = rt.id
  );