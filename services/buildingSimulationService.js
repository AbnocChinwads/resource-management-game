import db from "../db.js";
import {
  degradeBuilding,
  getEffectiveWorkerCapacity,
} from "./buildingService.js";
import {
  BUILDING_DEGRADATION_TICKS,
  PRODUCTION_DEGRADATION_TICKS,
} from "../config/simulation.js";

export async function processBuildingDegradationTick(
  playerId,
  workingBuildings,
) {
  const buildings = await db.query(
    `
    SELECT
      pb.id AS player_building_id,
      pb.health,
      pb.workers_assigned,
      pb.degradation_ticks,
      pb.production_wear_ticks,
      b.max_workers,
      b.max_health
    FROM player_buildings pb
    JOIN buildings b
      ON b.id = pb.building_id
    WHERE pb.player_id = $1
      AND pb.health > 0
    `,
    [playerId],
  );

  for (const building of buildings.rows) {
    const isWorking = workingBuildings.includes(building.player_building_id);

    let degradationTicks = building.degradation_ticks + 1;

    let degradation = 0;

    if (degradationTicks >= BUILDING_DEGRADATION_TICKS) {
      degradation += 1;
      degradationTicks = 0;
    }

    let productionWearTicks = building.production_wear_ticks;

    if (isWorking) {
      productionWearTicks += 1;

      if (productionWearTicks >= PRODUCTION_DEGRADATION_TICKS) {
        degradation += 1;
        productionWearTicks = 0;
      }
    } else {
      productionWearTicks = 0;
    }

    const newHealth = degradeBuilding({
      health: building.health,
      degradation,
    });

    const effectiveWorkerCapacity = getEffectiveWorkerCapacity({
      health: newHealth,
      max_workers: building.max_workers,
      max_health: building.max_health,
    });

    const newWorkers = Math.min(
      building.workers_assigned,
      effectiveWorkerCapacity,
    );

    await db.query(
      `
      UPDATE player_buildings
      SET
        health = $1,
        workers_assigned = $2,
        degradation_ticks = $3,
        production_wear_ticks = $4
      WHERE id = $5
      `,
      [
        newHealth,
        newWorkers,
        degradationTicks,
        productionWearTicks,
        building.player_building_id,
      ],
    );
  }
}
