import db from "../db.js";

export async function getPlayerTasks(playerId) {
  const tasksRes = await db.query(
    `
    SELECT
    pt.*,
    r.name AS recipe_name,
    r.craft_time_seconds,
    r.recipe_type,
    r.output_resource_id,
    r.output_amount,
    r.output_building_id,
    rt.name AS output_resource_name
    FROM player_tasks pt
    JOIN recipes r
    ON pt.recipe_id = r.id
    LEFT JOIN resource_types rt
    ON r.output_resource_id = rt.id
    WHERE pt.player_id = $1
    AND pt.completed = FALSE
    ORDER BY pt.id ASC
    `, [playerId],
  );

  const tasks = tasksRes.rows.map((task) => {

    task.is_finished =
      new Date() >=
      new Date(task.started_at).getTime() + task.duration_seconds * 1000;

    return task;
  });

  return tasks;
}
