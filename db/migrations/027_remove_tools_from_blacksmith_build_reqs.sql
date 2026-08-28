-- Remove Tools requirement from Blacksmith construction

DELETE FROM recipe_inputs
WHERE recipe_id = 18
  AND resource_type_id = (
    SELECT id
    FROM resource_types
    WHERE name = 'Tools'
  );