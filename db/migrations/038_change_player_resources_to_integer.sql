ALTER TABLE player_resources
DROP CONSTRAINT amount_nonnegative;

ALTER TABLE player_resources
ALTER COLUMN amount TYPE INTEGER
USING GREATEST(0, FLOOR(amount))::INTEGER;

ALTER TABLE player_resources
ADD CONSTRAINT amount_nonnegative CHECK (amount >= 0);