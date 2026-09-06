import db from "../db.js";
import {
  getPlayerResourceState,
  addPlayerResource,
} from "./resourceService.js";
import { getPlayerStorage } from "./storageService.js";
import {
  getProductionStatus,
} from "./productionService.js";
import { SIMULATION_TICK_SECONDS } from "../config/simulation.js";

async function consumeInputs(
  playerId,
  inputs,
  workers,
  completedCrafts,
  resources,
  storage,
) {
  for (const input of inputs) {
    const amount =
      Number(input.amount) * Number(workers) * Number(completedCrafts);

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
        pb.production_progress_seconds,
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

      const progress =
        Number(building.production_progress_seconds) + SIMULATION_TICK_SECONDS;
      const craftTime = Number(building.craft_time_seconds);
      const potentialCrafts = Math.floor(progress / craftTime);

      if (potentialCrafts <= 0) {
        await db.query(
          `
          UPDATE player_buildings
          SET production_progress_seconds = $1
          WHERE id = $2
          `,
          [progress, building.player_building_id],
        );

        continue;
      }

      let completedCrafts = potentialCrafts;

      for (const input of inputs) {
        const requiredPerCraft =
          Number(input.amount) * Number(building.workers_assigned);

        const available =
          resources.find(
            (resource) => resource.resource_type_id === input.resource_type_id,
          )?.amount ?? 0;

        const possibleCrafts = Math.floor(Number(available) / requiredPerCraft);

        completedCrafts = Math.min(completedCrafts, possibleCrafts);
      }

      const outputPerCraft =
        Number(building.output_amount) * Number(building.workers_assigned);

      const outputResource = resources.find(
        (resource) => resource.resource_type_id === building.output_resource_id,
      );

      const storageEntry = storage.find(
        (entry) => entry.storage_category === outputResource.storageCategory,
      );

      const availableStorage =
        Number(storageEntry.capacity) - Number(storageEntry.used);

      const possibleStorageCrafts = Math.floor(
        availableStorage / outputPerCraft,
      );

      completedCrafts = Math.min(completedCrafts, possibleStorageCrafts);

      if (completedCrafts <= 0) {
        continue;
      }

      await consumeInputs(
        playerId,
        inputs,
        building.workers_assigned,
        completedCrafts,
        resources,
        storage,
      );

      const outputAmount = outputPerCraft * completedCrafts;

      await addPlayerResource(
        playerId,
        building.output_resource_id,
        outputAmount,
      );

      outputResource.amount = Number(outputResource.amount) + outputAmount;

      storageEntry.used = Number(storageEntry.used) + outputAmount;

      const remainingProgress = progress - completedCrafts * craftTime;

      await db.query(
        `
        UPDATE player_buildings
        SET production_progress_seconds = $1
        WHERE id = $2
        `,
        [remainingProgress, building.player_building_id],
      );
    }

    await db.query("COMMIT");
  } catch (err) {
    await db.query("ROLLBACK");
    throw err;
  }
}
