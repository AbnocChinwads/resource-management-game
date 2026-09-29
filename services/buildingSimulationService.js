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

  const updates = [];

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

    updates.push({
      id: building.player_building_id,
      health: newHealth,
      workersAssigned: newWorkers,
      degradationTicks,
      productionWearTicks,
    });
  }

  if (updates.length === 0) {
    return;
  }

  await db.query(
    `
    UPDATE player_buildings AS pb
    SET
      health = update_data.health,
      workers_assigned = update_data.workers_assigned,
      degradation_ticks = update_data.degradation_ticks,
      production_wear_ticks = update_data.production_wear_ticks
    FROM (
      SELECT *
      FROM UNNEST(
        $1::integer[],
        $2::integer[],
        $3::integer[],
        $4::integer[],
        $5::integer[]
      )
      AS data(
        id,
        health,
        workers_assigned,
        degradation_ticks,
        production_wear_ticks
      )
    ) AS update_data
    WHERE pb.id = update_data.id
    `,
    [
      updates.map((update) => update.id),
      updates.map((update) => update.health),
      updates.map((update) => update.workersAssigned),
      updates.map((update) => update.degradationTicks),
      updates.map((update) => update.productionWearTicks),
    ],
  );
}
