import db from "../db.js";
import {
  getPlayerResourceState,
  addPlayerResource,
} from "./resourceService.js";
import { getPlayerStorage } from "./storageService.js";
import {
  calculateProductionPerTick,
  calculateConsumptionPerTick,
  getProductionStatus,
} from "./productionService.js";

async function consumeInputs(
  playerId,
  inputs,
  workers,
  craftTimeSeconds,
  resources,
  storage,
) {
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

    const resource = resources.find(
      (resource) => resource.resource_type_id === input.resource_type_id,
    );

    if (resource) {
      resource.amount -= amount;

      const storageEntry = storage.find(
        (entry) => entry.storage_category === resource.storageCategory,
      );

      if (storageEntry) {
        storageEntry.used = Number(storageEntry.used) - amount;
      }
    }
  }
}

export async function processResourceTick(playerId) {
  await db.query("BEGIN");

  try {
    const inputsResult = await db.query(
      `
      SELECT
      recipe_id,
      resource_type_id,
      amount
      FROM recipe_inputs
      `,
    );

    const inputsMap = new Map();

    for (const input of inputsResult.rows) {
      if (!inputsMap.has(input.recipe_id)) {
        inputsMap.set(input.recipe_id, []);
      }

      inputsMap.get(input.recipe_id).push(input);
    }

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

    const resources = await getPlayerResourceState(playerId);
    const storage = await getPlayerStorage(playerId);

    for (const building of buildings.rows) {
      const inputs = inputsMap.get(building.recipe_id) ?? [];

      const productionStatus = getProductionStatus(
        building,
        inputs,
        resources,
        storage,
      );

      if (productionStatus.status !== "working") {
        continue;
      }

      const outputAmount = calculateProductionPerTick(building);

      await consumeInputs(
        playerId,
        inputs,
        building.workers_assigned,
        building.craft_time_seconds,
        resources,
        storage,
      );

      await addPlayerResource(
        playerId,
        building.output_resource_id,
        outputAmount,
      );

      const outputResource = resources.find(
        (resource) => resource.resource_type_id === building.output_resource_id,
      );

      if (outputResource) {
        outputResource.amount += outputAmount;

        const storageEntry = storage.find(
          (entry) => entry.storage_category === outputResource.storageCategory,
        );

        if (storageEntry) {
          storageEntry.used = Number(storageEntry.used) + outputAmount;
        }
      }
    }

    await db.query("COMMIT");
  } catch (err) {
    await db.query("ROLLBACK");
    throw err;
  }
}
