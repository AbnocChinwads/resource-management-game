UPDATE resource_types
SET name = 'Iron Tools'
WHERE id = 6;

UPDATE recipes
SET name = 'Forge Iron Tools'
WHERE id = 7;

INSERT INTO resource_types (name)
VALUES ('Stone Tools');

INSERT INTO recipes
    (name, craft_time_seconds, recipe_type, output_resource_id)
VALUES
    ('Craft Stone Tools', 10, 'craft', 11);

INSERT INTO recipe_inputs
    (recipe_id, resource_type_id, amount)
VALUES
    (29, 4, 2),
    (29, 7, 1);