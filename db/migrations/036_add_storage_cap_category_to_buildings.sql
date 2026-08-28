ALTER TABLE buildings
ADD COLUMN storage_category storage_category,
ADD COLUMN storage_capacity INTEGER NOT NULL DEFAULT 0;