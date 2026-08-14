import db from "../db.js";

export async function getPopulation(playerId) {
  const result = await db.query(
    `
    SELECT
      population,
      workers,
      historical_max_population
    FROM players
    WHERE id = $1
    `,
    [playerId],
  );

  if (result.rows.length === 0) {
    throw new Error("Player not found");
  }
  return result.rows[0];
}

export async function getPopulationCapacity(playerId) {
  const result = await db.query(
    `
    SELECT COALESCE(SUM(b.population_gain), 0) AS population_capacity
    FROM player_buildings pb
    JOIN buildings b
      ON b.id = pb.building_id
    WHERE pb.player_id = $1
      AND b.type = 'housing'
    `,
    [playerId],
  );
  return Number(result.rows[0].population_capacity);
}
