ALTER TABLE resource_types
ADD COLUMN storage_category storage_category
NOT NULL DEFAULT 'material';