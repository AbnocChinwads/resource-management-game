import db from "../db.js";
import {
  calculateProductionRate,
  calculateConsumptionRate,
  getProductionStatus,
} from "./productionService.js";

export function degradeBuilding(building) {
  return Math.max(0, building.health - building.degradation);
}

export function getEffectiveWorkerCapacity(building) {
  if (building.health <= 0) {
    return 0;
  }

  return Math.ceil(
    building.max_workers * (building.health / building.max_health),
  );
}

export async function getPlayerBuildings(
  playerId,
  resources,
  storage,
  recipeInputs,
) {
  const result = await db.query(
    `
    SELECT 
    pb.*, 
    b.name, 
    b.type, 
    b.max_workers, 
    b.max_health, 
    b.population_gain,
    b.storage_category,
    b.storage_capacity,
    r.id AS recipe_id,
    r.output_resource_id,
    r.output_amount,
    r.craft_time_seconds,
    rt.name AS output_resource_name,
    ROW_NUMBER() OVER (
    PARTITION BY pb.building_id
    ORDER BY pb.id ASC
    ) AS building_number
    FROM player_buildings pb
    JOIN buildings b ON pb.building_id = b.id
    LEFT JOIN recipes r
    ON r.id = b.production_recipe_id
    LEFT JOIN resource_types rt
    ON rt.id = r.output_resource_id
    WHERE pb.player_id = $1
    ORDER BY
    b.type ASC,
    b.name ASC,
    pb.id ASC`,
    [playerId],
  );

  const buildings = result.rows;

  const recipeInputsMap = new Map();

  for (const input of recipeInputs) {
    if (!recipeInputsMap.has(input.recipe_id)) {
      recipeInputsMap.set(input.recipe_id, []);
    }

    recipeInputsMap.get(input.recipe_id).push(input);
  }

  for (const building of buildings) {
    building.effectiveWorkerCapacity = getEffectiveWorkerCapacity(building);

    if (!building.recipe_id) {
      building.productionRate = 0;
      building.consumptionRates = [];
      continue;
    }

    building.productionRate = calculateProductionRate(building);

    const inputs = recipeInputsMap.get(building.recipe_id) || [];

    building.consumptionRates = inputs.map((input) => ({
      resource_type_id: input.resource_type_id,
      name: input.name,
      amount: calculateConsumptionRate(
        input,
        building.workers_assigned,
        building.craft_time_seconds,
      ),
    }));

    building.productionStatus = getProductionStatus(
      building,
      inputs,
      resources,
      storage,
    );
  }

  return buildings;
}

export async function repairBuilding(playerId, buildingId) {
  await db.query("BEGIN");

  try {
    const buildingResult = await db.query(
      `
      SELECT
        pb.health,
        b.max_health
      FROM player_buildings pb
      JOIN buildings b
        ON b.id = pb.building_id
      WHERE pb.id = $1
        AND pb.player_id = $2
      FOR UPDATE
      `,
      [buildingId, playerId],
    );

    if (!buildingResult.rows.length) {
      await db.query("ROLLBACK");
      return {
        success: false,
        error: "InvalidBuilding",
      };
    }

    const { health, max_health } = buildingResult.rows[0];

    if (health >= max_health) {
      await db.query("ROLLBACK");
      return {
        success: false,
        error: "BuildingAlreadyRepaired",
      };
    }

    const toolResult = await db.query(
      `
      SELECT amount
      FROM player_resources
      WHERE player_id = $1
        AND resource_type_id = 6
      FOR UPDATE
      `,
      [playerId],
    );

    const tools = toolResult.rows[0]?.amount ?? 0;

    if (Number(tools) < 1) {
      await db.query("ROLLBACK");
      return {
        success: false,
        error: "InsufficientTools",
      };
    }

    const newHealth = Math.min(Number(max_health), Number(health) + 10);

    await db.query(
      `
      UPDATE player_resources
      SET amount = amount - 1
      WHERE player_id = $1
        AND resource_type_id = 6
      `,
      [playerId],
    );

    await db.query(
      `
      UPDATE player_buildings
      SET health = $1
      WHERE id = $2
        AND player_id = $3
      `,
      [newHealth, buildingId, playerId],
    );

    await db.query("COMMIT");

    return {
      success: true,
      health: newHealth,
    };
  } catch (err) {
    await db.query("ROLLBACK");
    throw err;
  }
}
