import db from "../db.js";

const MAINTENANCE_HEALTH_RESTORE = 10;

export async function processMaintenanceTick(playerId) {
  await db.query("BEGIN");

  try {
    const workshopResult = await db.query(
      `
      SELECT EXISTS (
        SELECT 1
        FROM player_buildings pb
        JOIN buildings b
          ON b.id = pb.building_id
        WHERE pb.player_id = $1
          AND b.name = 'Workshop'
          AND pb.health > 0
      ) AS has_functional_workshop
      `,
      [playerId],
    );

    const hasFunctionalWorkshop =
      workshopResult.rows[0]?.has_functional_workshop === true;

    if (!hasFunctionalWorkshop) {
      await db.query("COMMIT");
      return [];
    }

    const toolsResult = await db.query(
      `
      SELECT
        pr.resource_type_id,
        pr.amount
      FROM player_resources pr
      JOIN resource_types rt
        ON rt.id = pr.resource_type_id
      WHERE pr.player_id = $1
        AND rt.name = 'Iron Tools'
      FOR UPDATE OF pr
      `,
      [playerId],
    );

    if (!toolsResult.rows.length) {
      await db.query("COMMIT");
      return [];
    }

    const toolResourceId = toolsResult.rows[0].resource_type_id;
    let availableTools = Number(toolsResult.rows[0].amount);

    if (availableTools <= 0) {
      await db.query("COMMIT");
      return [];
    }

    const buildingsResult = await db.query(
      `
      SELECT
        pb.id,
        pb.health,
        b.max_health
      FROM player_buildings pb
      JOIN buildings b
        ON b.id = pb.building_id
      WHERE pb.player_id = $1
        AND pb.auto_repair = TRUE
        AND (b.max_health - pb.health) >= $2
      ORDER BY (pb.health::numeric / b.max_health) ASC, pb.id ASC
      FOR UPDATE OF pb
      `,
      [playerId, MAINTENANCE_HEALTH_RESTORE],
    );

    const repairedBuildings = [];

    for (const building of buildingsResult.rows) {
      if (availableTools <= 0) {
        break;
      }

      const newHealth = Math.min(
        Number(building.max_health),
        Number(building.health) + MAINTENANCE_HEALTH_RESTORE,
      );

      await db.query(
        `
        UPDATE player_buildings
        SET health = $1
        WHERE id = $2
        `,
        [newHealth, building.id],
      );

      repairedBuildings.push({
        id: building.id,
        health: newHealth,
      });

      availableTools -= 1;
    }

    if (repairedBuildings.length > 0) {
      await db.query(
        `
        UPDATE player_resources
        SET amount = amount - $1
        WHERE player_id = $2
          AND resource_type_id = $3
        `,
        [repairedBuildings.length, playerId, toolResourceId],
      );
    }

    await db.query("COMMIT");

    return repairedBuildings;
  } catch (err) {
    await db.query("ROLLBACK");
    throw err;
  }
}
