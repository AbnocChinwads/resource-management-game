import { SIMULATION_TICK_SECONDS } from "../config/simulation.js";
import { getPlayerResources } from "./resourceService.js";
import { canAddPlayerResource } from "./storageService.js";

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

export async function getProductionStatus(playerId, building, inputs) {
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

  const resources = await getPlayerResources(playerId);

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

  const canStore = await canAddPlayerResource(
    playerId,
    building.output_resource_id,
    outputAmount,
  );

  if (!canStore) {
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
