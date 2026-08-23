import db from "../db.js";
import { SIMULATION_TICK_SECONDS } from "../config/simulation.js";

export async function getProductionBuildings(playerId) {
  const buildingsResult = await db.query(
    `
    SELECT
      pb.id,
      pb.workers_assigned,
      pb.health,
      r.id AS recipe_id,
      r.output_resource_id,
      r.output_amount,
      r.craft_time_seconds
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

  const inputsResult = await db.query(
    `
    SELECT
      ri.recipe_id,
      ri.resource_type_id,
      ri.amount
    FROM recipe_inputs ri
    `,
  );

  const inputsMap = new Map();

  for (const input of inputsResult.rows) {
    if (!inputsMap.has(input.recipe_id)) {
      inputsMap.set(input.recipe_id, []);
    }

    inputsMap.get(input.recipe_id).push(input);
  }

  return buildingsResult.rows.map((building) => ({
    ...building,
    inputs: inputsMap.get(building.recipe_id) ?? [],
  }));
}

export function calculateProductionRate(building) {
  return (
    Number(building.output_amount) *
    Number(building.workers_assigned) *
    (60 / Number(building.craft_time_seconds))
  );
}

export function calculateProductionPerTick(building) {
  return calculateProductionRate(building) * (SIMULATION_TICK_SECONDS / 60);
}

export function calculateConsumptionRate(input, workers, craftTimeSeconds) {
  return (
    Number(input.amount) * Number(workers) * (60 / Number(craftTimeSeconds))
  );
}

export function calculateConsumptionPerTick(input, workers, craftTimeSeconds) {
  return (
    calculateConsumptionRate(input, workers, craftTimeSeconds) *
    (SIMULATION_TICK_SECONDS / 60)
  );
}

export function getProductionStatus(building, inputs, resources, storage) {
  if (building.workers_assigned <= 0) {
    return {
      status: "idle",
      reason: "no_workers",
    };
  }

  if (building.health <= 0) {
    return {
      status: "idle",
      reason: "building_damaged",
    };
  }

  const resourceAmounts = new Map(
    resources.map((resource) => [
      resource.resource_type_id,
      Number(resource.amount),
    ]),
  );

  for (const input of inputs) {
    const required = calculateConsumptionPerTick(
      input,
      building.workers_assigned,
      building.craft_time_seconds,
    );

    const available = resourceAmounts.get(input.resource_type_id) ?? 0;

    if (available < required) {
      return {
        status: "idle",
        reason: "insufficient_inputs",
      };
    }
  }

  const outputAmount = calculateProductionPerTick(building);

  const outputResource = resources.find(
    (resource) => resource.resource_type_id === building.output_resource_id,
  );

  if (!outputResource) {
    return {
      status: "idle",
      reason: "output_resource_not_found",
    };
  }

  const storageCategory = outputResource.storageCategory;

  const storageEntry = storageCategory
    ? storage.find((entry) => entry.storage_category === storageCategory)
    : null;

  if (!storageEntry) {
    return {
      status: "idle",
      reason: "storage_not_found",
    };
  }

  if (outputAmount > Number(storageEntry.capacity) - Number(storageEntry.used)) {
    return {
      status: "idle",
      reason: "insufficient_storage",
    };
  }

  return {
    status: "working",
    reason: null,
  };
}

export function getWorkingProductionBuildings(buildings, resources, storage) {
  const workingBuildings = [];

  for (const building of buildings) {
    const status = getProductionStatus(
      building,
      building.inputs,
      resources,
      storage,
    );

    if (status.status === "working") {
      workingBuildings.push(building);
    }
  }

  return workingBuildings;
}
