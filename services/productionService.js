import { SIMULATION_TICK_SECONDS } from "../config/simulation.js";

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
