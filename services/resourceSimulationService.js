import db from "../db.js";
import { SIMULATION_TICK_SECONDS } from "../config/simulation.js";
import { getPlayerResources, addPlayerResource } from "./resourceService.js";
import { canAddPlayerResource } from "./storageService.js";
import {
  calculateProductionPerTick,
  calculateConsumptionPerTick,
} from "./productionService.js";

async function getRecipeInputs(recipeId) {
  const result = await db.query(
    `
    SELECT
    resource_type_id,
    amount
    FROM recipe_inputs
    WHERE recipe_id = $1
    `,
    [recipeId],
  );

  return result.rows;
}

async function buildingHasResources(playerId, inputs, workers) {
  const resources = await getPlayerResources(playerId);

  const resourceAmounts = new Map(
    resources.map((resource) => [
      resource.resource_type_id,
      Number(resource.amonut),
    ]),
  );

  for (const input of inputs) {
    const availabe = resourceAmounts.get(input.resource_type_id) ?? 0;

    const required =
      Number(input.amount) * workers * (SIMULATION_TICK_SECONDS / 60);

    if (availabe < required) {
      return false;
    }
  }

  return true;
}

async function consumeInputs(playerId, inputs, workers, craftTimeSeconds,) {
  for (const input of inputs) {
    const amount = calculateConsumptionPerTick(
      input,
      workers,
      craftTimeSeconds,
    );

    await db.query(
      `
        UPDATE player_resources
        SET amount = amount - $1
        WHERE player_id = $2
        AND resource_type_id = $3
        `,
      [amount, playerId, input.resource_type_id],
    );
  }
}

export async function processResourceTick(playerId) {
  await db.query("BEGIN");

  try {
    const buildings = await db.query(
      `
        SELECT
        pb.id AS player_building_id,
        pb.workers_assigned,
        pb.health,
        r.id AS recipe_id,
        r.name,
        r.craft_time_seconds,
        r.output_resource_id,
        r.output_amount
        FROM player_buildings pb
        JOIN buildings b
        ON b.id = pb.building_id
        JOIN recipes r
        ON r.id = b.production_recipe_id
        WHERE pb.player_id = $1
        AND pb.workers_assigned > 0
        AND pb.health > 0
        `,
      [playerId],
    );

    for (const building of buildings.rows) {
      const inputs = await getRecipeInputs(building.recipe_id);

      const canRun = await buildingHasResources(
        playerId,
        inputs,
        building.workers_assigned,
      );

      if (!canRun) {
        continue;
      }

      const outputAmount = calculateProductionPerTick(building);

      const canStore = await canAddPlayerResource(
        playerId,
        building.output_resource_id,
        outputAmount,
      );

      if (!canStore) {
        continue;
      }

      await consumeInputs(playerId, inputs, building.workers_assigned, building.craftTimeSeconds,);

      await addPlayerResource(
        playerId,
        building.output_resource_id,
        outputAmount,
      );
    }

    await db.query("COMMIT");
  } catch (err) {
    await db.query("ROLLBACK");
    throw err;
  }
}
