import db from "../db.js";
import { addPlayerResource } from "./resourceService.js";
import {
  canAddPlayerResource,
  getStorageForResource,
} from "./storageService.js";

export async function completeTask(playerId, taskId) {
  try {
    await db.query("BEGIN");

    const taskRes = await db.query(
      `
      SELECT
        pt.id,
        pt.recipe_id,
        r.output_resource_id,
        r.output_amount,
        r.output_building_id
      FROM player_tasks pt
      JOIN recipes r
        ON pt.recipe_id = r.id
      WHERE pt.id = $1
        AND pt.player_id = $2
        AND pt.completed = FALSE
        AND NOW() >= pt.started_at + pt.duration_seconds * INTERVAL '1 second'
      `,
      [taskId, playerId],
    );

    if (taskRes.rows.length === 0) {
      await db.query("ROLLBACK");
      throw new Error(`Could Not Complete Task ${taskId}`);
    }

    const { output_resource_id, output_amount, output_building_id } =
      taskRes.rows[0];

    await db.query(
      `
      UPDATE player_tasks
      SET completed = TRUE
      WHERE id = $1
      `,
      [taskId],
    );

    if (output_resource_id) {
      const canStore = await canAddPlayerResource(
        playerId,
        output_resource_id,
        output_amount,
      );

      if (!canStore) {
        const storage = await getStorageForResource(
          playerId,
          output_resource_id,
        );

        await db.query("ROLLBACK");

        throw new Error(
          `Not Enough Storage: ${storage.storageCategory} storage is full (${storage.used.toFixed(1)}/${storage.capacity})`,
        );
      }

      await addPlayerResource(playerId, output_resource_id, output_amount);
    }

    if (output_building_id) {
      const insertRes = await db.query(
        `
        INSERT INTO player_buildings (
          player_id,
          building_id,
          health
        )
        SELECT 
          $1,
          id,
          max_health
        FROM buildings
        WHERE id = $2
        RETURNING id
        `,
        [playerId, output_building_id],
      );

      const newBuildingId = insertRes.rows[0].id;

      const buildingRes = await db.query(
        `
        SELECT type
        FROM buildings
        WHERE id = $1
        `,
        [output_building_id],
      );

      const { type } = buildingRes.rows[0];

      if (type === "production") {
        const workerRes = await db.query(
          `
          SELECT
            workers,
            (
              SELECT COALESCE(SUM(workers_assigned), 0)
              FROM player_buildings
              WHERE player_id = $1
            ) AS assigned_workers
          FROM players
          WHERE id = $1
          `,
          [playerId],
        );

        const { workers, assigned_workers } = workerRes.rows[0];

        const availableWorkers = workers - Number(assigned_workers);

        if (availableWorkers > 0) {
          await db.query(
            `
            UPDATE player_buildings
            SET workers_assigned = 1
            WHERE id = $1
            `,
            [newBuildingId],
          );
        }
      }
    }

    await db.query("COMMIT");

    return true;
  } catch (err) {
    await db.query("ROLLBACK");
    throw err;
  }
}

export async function completeFinishedTasks(playerId) {
  const completedTasksRes = await db.query(
    `
    SELECT id
    FROM player_tasks
    WHERE player_id = $1
    AND completed = FALSE
    AND NOW() >= started_at + duration_seconds * INTERVAL '1 second'
    `,
    [playerId],
  );

  for (const task of completedTasksRes.rows) {
    await completeTask(playerId, task.id);
  }
}
