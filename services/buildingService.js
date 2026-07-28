import db from "../db.js";

export async function getPlayerBuildings(playerId) {
  const result = await db.query(
    `
    SELECT 
    pb.*, 
    b.name, 
    b.type, 
    b.max_workers, 
    b.max_health, 
    b.population_gain,
    ROW_NUMBER() OVER (
    PARTITION BY pb.building_id
    ORDER BY pb.id ASC
    ) AS building_number
    FROM player_buildings pb
    JOIN buildings b ON pb.building_id = b.id
    WHERE pb.player_id = $1
    ORDER BY b.type ASC, 
    b.name ASC, 
    pb.id ASC`,
    [playerId],
  );

  return result.rows;
}
