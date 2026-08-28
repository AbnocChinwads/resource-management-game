-- Remove Stone as an input from the Mine Ore recipe

DELETE FROM recipe_inputs
WHERE recipe_id = (
    SELECT id
    FROM recipes
    WHERE name = 'Mine Ore'
)
AND resource_type_id = (
    SELECT id
    FROM resource_types
    WHERE name = 'Stone'
);