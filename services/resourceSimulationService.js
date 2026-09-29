import { withTransaction } from "../db.js";
import { getPlayerResourceState } from "./resourceService.js";
import { getPlayerStorage } from "./storageService.js";
import { getProductionStatus } from "./productionService.js";
import {
  getPlayerBuildingToolsForSimulation,
  processBuildingToolTick,
  savePlayerBuildingToolChanges,
} from "./toolEfficiencyService.js";
import { SIMULATION_TICK_SECONDS } from "../config/simulation.js";

function addResourceChange(resourceChanges, resourceTypeId, amount) {
  const current = resourceChanges.get(resourceTypeId) ?? 0;

  resourceChanges.set(resourceTypeId, current + Number(amount));
}

function consumeInputs(
  inputs,
  workers,
  completedCrafts,
  resources,
  storage,
  resourceChanges,
) {
  for (const input of inputs) {
    const amount =
      Number(input.amount) * Number(workers) * Number(completedCrafts);

    const resource = resources.find(
      (resource) => resource.resource_type_id === input.resource_type_id,
    );

    if (resource) {
      resource.amount -= amount;

      addResourceChange(resourceChanges, input.resource_type_id, -amount);

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
  return withTransaction(async (client) => {
    const workingBuildings = [];
    const progressUpdates = [];
    const resourceChanges = new Map();

    const inputsResult = await client.query(
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

    const buildings = await client.query(
      `
        SELECT
        pb.id AS player_building_id,
        pb.workers_assigned,
        pb.health,
        pb.production_progress_seconds,
        pb.tool_policy,
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

    const resources = await getPlayerResourceState(playerId, client, true);
    const storage = await getPlayerStorage(playerId, client);
    const toolsByBuilding = await getPlayerBuildingToolsForSimulation(
      playerId,
      client,
    );
    const toolUpdates = new Map();
    const toolClearBuildingIds = new Set();

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

      const efficiencyMultiplier = processBuildingToolTick(
        building,
        resources,
        storage,
        resourceChanges,
        toolsByBuilding,
        toolUpdates,
        toolClearBuildingIds,
      );

      workingBuildings.push(building.player_building_id);

      const progress =
        Number(building.production_progress_seconds) +
        SIMULATION_TICK_SECONDS * efficiencyMultiplier;
      const craftTime = Number(building.craft_time_seconds);
      const potentialCrafts = Math.floor(progress / craftTime);

      if (potentialCrafts <= 0) {
        progressUpdates.push({
          id: building.player_building_id,
          progress,
        });

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

      consumeInputs(
        inputs,
        building.workers_assigned,
        completedCrafts,
        resources,
        storage,
        resourceChanges,
      );

      const outputAmount = outputPerCraft * completedCrafts;

      addResourceChange(
        resourceChanges,
        building.output_resource_id,
        outputAmount,
      );

      outputResource.amount = Number(outputResource.amount) + outputAmount;

      storageEntry.used = Number(storageEntry.used) + outputAmount;

      const remainingProgress = progress - completedCrafts * craftTime;

      progressUpdates.push({
        id: building.player_building_id,
        progress: remainingProgress,
      });
    }

    await savePlayerBuildingToolChanges(
      toolClearBuildingIds,
      toolUpdates,
      client,
    );

    if (progressUpdates.length > 0) {
      await client.query(
        `
        UPDATE player_buildings AS pb
        SET production_progress_seconds =
          update_data.production_progress_seconds
        FROM (
          SELECT *
          FROM UNNEST(
            $1::integer[],
            $2::numeric[]
          )
          AS data(
            id,
            production_progress_seconds
          )
        ) AS update_data
        WHERE pb.id = update_data.id
        `,
        [
          progressUpdates.map((update) => update.id),
          progressUpdates.map((update) => update.progress),
        ],
      );
    }

    const changedResources = [...resourceChanges.entries()].filter(
      ([, amount]) => amount !== 0,
    );

    if (changedResources.length > 0) {
      await client.query(
        `
        UPDATE player_resources AS pr
        SET amount = pr.amount + changes.amount
        FROM (
          SELECT *
          FROM UNNEST(
            $1::integer[],
            $2::integer[]
          )
          AS data(
            resource_type_id,
            amount
          )
        ) AS changes
        WHERE pr.player_id = $3
          AND pr.resource_type_id = changes.resource_type_id
        `,
        [
          changedResources.map(([resourceTypeId]) => resourceTypeId),
          changedResources.map(([, amount]) => amount),
          playerId,
        ],
      );
    }

    return workingBuildings;
  });
}
