UPDATE resource_types
SET storage_category = 'grain'
WHERE name = 'Wheat';

UPDATE resource_types
SET storage_category = 'food'
WHERE name = 'Bread';

UPDATE resource_types
SET storage_category = 'material'
WHERE name IN (
    'Wood',
    'Stone',
    'Planks'
);