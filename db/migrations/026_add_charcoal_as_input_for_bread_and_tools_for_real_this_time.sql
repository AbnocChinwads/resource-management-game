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
WHERE r.name = 'Bake Bread'
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
WHERE r.name = 'Forge Tools'
  AND rt.name = 'Charcoal'
  AND NOT EXISTS (
      SELECT 1
      FROM recipe_inputs ri
      WHERE ri.recipe_id = r.id
        AND ri.resource_type_id = rt.id
