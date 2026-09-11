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

export async function getPlayerToolEfficiencyMultipliers(playerId) {
  const result = await db.query(
    `
    SELECT
      pb.id AS player_building_id,
      pb.workers_assigned,
      pbt.equipped_count,
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
      });
    }
  }

  const multipliers = new Map();

  for (const [buildingId, building] of buildings) {
    multipliers.set(
      buildingId,
      calculateToolEfficiencyMultiplier(building.workers, building.tools),
    );
  }

  return multipliers;
}

async function claimTools(
  playerId,
  toolName,
  requestedCount,
  resources,
  storage,
) {
  const requested = Number(requestedCount);

  if (!Number.isInteger(requested) || requested <= 0) {
    return null;
  }

  const result = await db.query(
    `
        SELECT
        pr.resource_type_id,
        pr.amount,
        rt.storage_category
        FROM player_resources pr
        JOIN resource_types rt
        ON rt.id = pr.resource_type_id
        WHERE pr.player_id = $1
        AND rt.name = $2
        FOR UPDATE OF pr
        `,
    [playerId, toolName],
  );

  if (!result.rows.length) {
    return null;
  }

  const tool = result.rows[0];
  const available = Number(tool.amount);

  if (!Number.isFinite(available)) {
    throw new Error(
      `Invalid ${toolName} amount for player ${playerId}: ${tool.amount}`,
    );
  }

  const claimedCount = Math.min(available, requested);

  if (claimedCount <= 0) {
    return null;
  }

  await db.query(
    `
        UPDATE player_resources
        SET amount = amount - $1
        WHERE player_id = $2
        AND resource_type_id = $3
        `,
    [claimedCount, playerId, tool.resource_type_id],
  );

  const resource = resources.find(
    (resource) => resource.resource_type_id === tool.resource_type_id,
  );

  if (resource) {
    resource.amount -= claimedCount;
  }

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

async function saveEquippedTools(playerBuildingId, resourceTypeId, count) {
  if (count <= 0) {
    return;
  }

  await db.query(
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
) {
  const workers = Number(building.workers_assigned);

  if (!Number.isInteger(workers) || workers < 0) {
    throw new Error(
      `Invalid workers_assigned for building ${building.player_building_id}: ${building.workers_assigned}`,
    );
  }

  const equippedResult = await db.query(
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

      await db.query(
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
  await db.query(
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
    const ironTools = await claimTools(
      playerId,
      "Iron Tools",
      workersWithoutTools,
      resources,
      storage,
    );

    if (ironTools) {
      await saveEquippedTools(
        building.player_building_id,
        ironTools.resourceTypeId,
        ironTools.count,
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
    const stoneTools = await claimTools(
      playerId,
      "Stone Tools",
      workersWithoutTools,
      resources,
      storage,
    );

    if (stoneTools) {
      await saveEquippedTools(
        building.player_building_id,
        stoneTools.resourceTypeId,
        stoneTools.count,
      );

      equippedTools.push({
        name: "Stone Tools",
        equipped_count: stoneTools.count,
      });
    }
  }

  return calculateToolEfficiencyMultiplier(workers, equippedTools);
}
