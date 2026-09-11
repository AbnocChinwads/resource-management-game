ALTER TABLE player_buildings
ADD COLUMN tool_policy TEXT NOT NULL DEFAULT 'none',
ADD CONSTRAINT player_buildings_tool_policy_check
CHECK (tool_policy IN ('none', 'stone', 'iron'));


CREATE TABLE player_building_tools (
    player_building_id INTEGER NOT NULL,
    resource_type_id INTEGER NOT NULL,
    equipped_count INTEGER NOT NULL DEFAULT 0,
    remaining_seconds INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (player_building_id, resource_type_id),

    CONSTRAINT player_building_tools_building_fkey
        FOREIGN KEY (player_building_id)
        REFERENCES player_buildings(id)
        ON DELETE CASCADE,

    CONSTRAINT player_building_tools_resource_fkey
        FOREIGN KEY (resource_type_id)
        REFERENCES resource_types(id),

    CONSTRAINT player_building_tools_equipped_nonnegative
        CHECK (equipped_count >= 0),

    CONSTRAINT player_building_tools_remaining_nonnegative
        CHECK (remaining_seconds >= 0)
);

ALTER TABLE player_buildings
ALTER COLUMN production_progress_seconds
TYPE NUMERIC(10, 2)
USING production_progress_seconds::NUMERIC(10, 2);