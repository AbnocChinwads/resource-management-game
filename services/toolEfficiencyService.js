import db from "../db.js";
import {
  SIMULATION_TICK_SECONDS,
  TOOL_DURABILITY_SECONDS,
  TOOL_EFFICIENCY,
} from "../config/simulation.js";

export function calculateToolEfficiencyMultiplier(workers, equippedTools) {
  const workerCount = Number(workers);

  if (!Number.isInteger(workerCount) || workerCount <= 0) {
    return 1;
  }

  let ironWorkers = 0;
  let stoneWorkers = 0;

  for (const tool of equippedTools) {
    const count = Number(tool.equipped_count);

    if (tool.name === "Iron Tools") {
      ironWorkers += count;
    }

    if (tool.name === "Stone Tools") {
      stoneWorkers += count;
    }
  }

  // Never allow more tool bonuses than there are workers.
  ironWorkers = Math.min(ironWorkers, workerCount);

  stoneWorkers = Math.min(stoneWorkers, workerCount - ironWorkers);

  const untooledWorkers = workerCount - ironWorkers - stoneWorkers;

  const totalEfficiency =
    untooledWorkers +
    stoneWorkers * TOOL_EFFICIENCY["Stone Tools"] +
    ironWorkers * TOOL_EFFICIENCY["Iron Tools"];

  return totalEfficiency / workerCount;
}

export async function getPlayerToolStates(playerId) {
  const result = await db.query(
    `
    SELECT
      pb.id AS player_building_id,
      pb.workers_assigned,
      pbt.equipped_count,
      pbt.remaining_seconds,
      rt.name
    FROM player_buildings pb
    LEFT JOIN player_building_tools pbt
      ON pbt.player_building_id = pb.id
      AND pbt.equipped_count > 0
      AND pbt.remaining_seconds > 0
    LEFT JOIN resource_types rt
      ON rt.id = pbt.resource_type_id
    WHERE pb.player_id = $1
    `,
    [playerId],
  );

  const buildings = new Map();

  for (const row of result.rows) {
    const buildingId = Number(row.player_building_id);

    if (!buildings.has(buildingId)) {
      buildings.set(buildingId, {
        workers: Number(row.workers_assigned),
        tools: [],
      });
    }

    if (row.name) {
      buildings.get(buildingId).tools.push({
        name: row.name,
        equipped_count: Number(row.equipped_count),
        remaining_seconds: Number(row.remaining_seconds),
      });
    }
  }

  const states = new Map();

  for (const [buildingId, building] of buildings) {
    const remainingSeconds =
      building.tools.length > 0
        ? Math.max(...building.tools.map((tool) => tool.remaining_seconds))
        : 0;

    states.set(buildingId, {
      multiplier: calculateToolEfficiencyMultiplier(
        building.workers,
        building.tools,
      ),
      remainingSeconds,
      durationSeconds: TOOL_DURABILITY_SECONDS,
    });
  }

  return states;
}

export async function getPlayerToolEfficiencyMultipliers(playerId) {
  const states = await getPlayerToolStates(playerId);

  return new Map(
    [...states.entries()].map(([buildingId, state]) => [
      buildingId,
      state.multiplier,
    ]),
  );
}

function claimTools(
  toolName,
  requestedCount,
  resources,
  storage,
  resourceChanges,
) {
  const requested = Number(requestedCount);

  if (!Number.isInteger(requested) || requested <= 0) {
    return null;
  }

  const tool = resources.find((resource) => resource.name === toolName);

  if (!tool) {
    return null;
  }

  const available = Number(tool.amount);

  if (!Number.isFinite(available)) {
    throw new Error(`Invalid ${toolName} amount: ${tool.amount}`);
  }

  const claimedCount = Math.min(available, requested);

  if (claimedCount <= 0) {
    return null;
  }

  const currentChange = resourceChanges.get(tool.resource_type_id) ?? 0;

  resourceChanges.set(tool.resource_type_id, currentChange - claimedCount);

  const storageEntry = storage.find(
    (entry) => entry.storage_category === tool.storage_category,
  );

  if (storageEntry) {
    storageEntry.used = Number(storageEntry.used) - claimedCount;
  }

  return {
    resourceTypeId: tool.resource_type_id,
    count: claimedCount,
  };
}

async function saveEquippedTools(
  playerBuildingId,
  resourceTypeId,
  count,
  queryRunner = db,
) {
  if (count <= 0) {
    return;
  }

  await queryRunner.query(
    `
        INSERT INTO player_building_tools(player_building_id, resource_type_id, equipped_count, remaining_seconds)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (player_building_id, resource_type_id)
        DO UPDATE SET equipped_count = EXCLUDED.equipped_count, remaining_seconds = EXCLUDED.remaining_seconds
        `,
    [
      playerBuildingId,
      resourceTypeId,
      count,
      TOOL_DURABILITY_SECONDS - SIMULATION_TICK_SECONDS,
    ],
  );
}

export async function processBuildingToolTick(
  playerId,
  building,
  resources,
  storage,
  resourceChanges,
  queryRunner = db,
) {
  const workers = Number(building.workers_assigned);

  if (!Number.isInteger(workers) || workers < 0) {
    throw new Error(
      `Invalid workers_assigned for building ${building.player_building_id}: ${building.workers_assigned}`,
    );
  }

  const equippedResult = await queryRunner.query(
    `
    SELECT pbt.resource_type_id, pbt.equipped_count, pbt.remaining_seconds, rt.name
    FROM player_building_tools pbt
    JOIN resource_types rt
    ON rt.id = pbt.resource_type_id
    WHERE pbt.player_building_id = $1
    FOR UPDATE OF pbt
    `,
    [building.player_building_id],
  );

  const activeTools = equippedResult.rows.filter(
    (tool) =>
      Number(tool.equipped_count) > 0 && Number(tool.remaining_seconds) > 0,
  );

  if (activeTools.length > 0) {
    for (const tool of activeTools) {
      const remainingSeconds = Math.max(
        0,
        Number(tool.remaining_seconds) - SIMULATION_TICK_SECONDS,
      );

      await queryRunner.query(
        `
        UPDATE player_building_tools
        SET remaining_seconds = $1
        WHERE player_building_id = $2
        AND resource_type_id = $3
        `,
        [remainingSeconds, building.player_building_id, tool.resource_type_id],
      );
    }

    return calculateToolEfficiencyMultiplier(workers, activeTools);
  }

  // Previous tools have expired.
  await queryRunner.query(
    `
    DELETE FROM player_building_tools
    WHERE player_building_id = $1
    `,
    [building.player_building_id],
  );

  if (workers === 0 || building.tool_policy === "none") {
    return 1;
  }

  let workersWithoutTools = workers;

  const equippedTools = [];

  if (building.tool_policy === "iron") {
    const ironTools = claimTools(
      "Iron Tools",
      workersWithoutTools,
      resources,
      storage,
      resourceChanges,
    );

    if (ironTools) {
      await saveEquippedTools(
        building.player_building_id,
        ironTools.resourceTypeId,
        ironTools.count,
        queryRunner,
      );

      equippedTools.push({
        name: "Iron Tools",
        equipped_count: ironTools.count,
      });

      workersWithoutTools -= ironTools.count;
    }
  }

  /* Stone is used directly for Stone policy,
   or as fallback when Iron Tools are unavailable. */
  if (
    workersWithoutTools > 0 &&
    (building.tool_policy === "iron" || building.tool_policy === "stone")
  ) {
    const stoneTools = claimTools(
      "Stone Tools",
      workersWithoutTools,
      resources,
      storage,
      resourceChanges,
    );

    if (stoneTools) {
      await saveEquippedTools(
        building.player_building_id,
        stoneTools.resourceTypeId,
        stoneTools.count,
        queryRunner,
      );

      equippedTools.push({
        name: "Stone Tools",
        equipped_count: stoneTools.count,
      });
    }
  }

  return calculateToolEfficiencyMultiplier(workers, equippedTools);
}
