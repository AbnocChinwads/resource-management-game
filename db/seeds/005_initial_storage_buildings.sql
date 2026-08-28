-- Add storage buildings
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
VALUES
  (
    'Storehouse',
    'General storage building for settlement materials',
    0,
    100,
    NULL,
    'storage',
    0,
    'material',
    250
  ),
  (
    'Granary',
    'Storage building for grain',
    0,
    100,
    NULL,
    'storage',
    0,
    'grain',
    100
  ),
  (
    'Pantry',
    'Storage building for ingredients',
    0,
    100,
    NULL,
    'storage',
    0,
    'ingredient',
    100
  ),
  (
    'Food Store',
    'Storage building for prepared food',
    0,
    100,
    NULL,
    'storage',
    0,
    'food',
    100
  );