import db from "../db.js";
import { calculateAvailableWorkers } from "./workerService.js";

export async function getPopulation(playerId) {
  const result = await db.query(
    `
    SELECT
      population,
      workers,
      historical_max_population,
      food_tick_rate_seconds
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

export async function increasePopulation(playerId, amount) {
  const player = await getPopulation(playerId);
  const capacity = await getPopulationCapacity(playerId);

  const population = Number(player.population);
  const historicalMaxPopulation = Number(player.historical_max_population);

  const availableCapacity = Math.max(capacity - population, 0);

  const actualIncrease = Math.min(Number(amount), availableCapacity);

  if (actualIncrease <= 0) {
    return 0;
  }

  const newPopulation = population + actualIncrease;

  const newHistoricalMax = Math.max(historicalMaxPopulation, newPopulation);

  await db.query(
    `
    UPDATE players
    SET
      population = $1,
      historical_max_population = $2
    WHERE id = $3
    `,
    [newPopulation, newHistoricalMax, playerId],
  );

  return actualIncrease;
}

export async function reducePopulation(playerId) {
  const player = await getPopulation(playerId);

  const population = Number(player.population);
  const historicalMaxPopulation = Number(player.historical_max_population);

  const populationFloor = Math.ceil(historicalMaxPopulation * 0.1);

  const populationLoss = Math.ceil(population * 0.1);

  const newPopulation = Math.max(population - populationLoss, populationFloor);

  const actualReduction = population - newPopulation;

  if (actualReduction <= 0) {
    return 0;
  }

  await db.query(
    `
    UPDATE players
    SET population = $1
    WHERE id = $2
    `,
    [newPopulation, playerId],
  );

  return actualReduction;
}
