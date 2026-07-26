import db from "../db.js";

export async function maintainBuildingTasks(playerId) {
  try {
    // Fetch all player buildings that have workers assigned
    const buildingsRes = await db.query(
      `SELECT pb.id AS player_building_id, pb.workers_assigned, b.production_recipe_id
       FROM player_buildings pb
       JOIN buildings b ON pb.building_id = b.id
       WHERE pb.player_id = $1 AND pb.workers_assigned > 0`,
      [playerId],
    );

    for (const building of buildingsRes.rows) {
      // Skip buildings that do not produce anything
      if (!building.production_recipe_id) continue;

      // Fetch the recipe this building produces
      const recipesRes = await db.query(
        `SELECT id, craft_time_seconds
         FROM recipes
         WHERE id = $1
        `,
        [building.production_recipe_id],
      );

      const recipe = recipesRes.rows[0];

      if (!recipe) continue;

      // Check if this building has an active task
      const activeRes = await db.query(
        `SELECT COUNT(*) FROM player_tasks
           WHERE player_id = $1
             AND player_building_id = $2
             AND recipe_id = $3
             AND completed = FALSE`,
        [playerId, building.player_building_id, recipe.id],
      );

      const activeTasks = Number(activeRes.rows[0].count);

      //Already producing -> do nothing
      if (activeTasks > 0) continue;

      //Calculate production time based on workers assigned
      const durationSeconds = Math.ceil(
        recipe.craft_time_seconds / Math.max(building.workers_assigned, 1),
      );

      // Check inputs
      const resourceRes = await db.query(
        "SELECT resource_type_id, amount FROM recipe_inputs WHERE recipe_id = $1",
        [recipe.id],
      );

      let canProduce = true;

      for (const resource of resourceRes.rows) {
        const playerRes = await db.query(
          "SELECT amount FROM player_resources WHERE player_id = $1 AND resource_type_id = $2",
          [playerId, resource.resource_type_id],
        );

        const playerAmount = playerRes.rows[0]?.amount || 0;

        if (playerAmount < resource.amount) {
          canProduce = false;
          break;
        }
      }

      if (!canProduce) continue;

      // Deduct resources
      for (const resource of resourceRes.rows) {
        await db.query(
          "UPDATE player_resources SET amount = amount - $1 WHERE player_id = $2 AND resource_type_id = $3",
          [resource.amount, playerId, resource.resource_type_id],
        );
      }

      //Create new production task
      await db.query(
        `INSERT INTO player_tasks
             (player_id, recipe_id, player_building_id, started_at, completed, duration_seconds)
             VALUES ($1, $2, $3, NOW(), FALSE, $4)`,
        [playerId, recipe.id, building.player_building_id, durationSeconds],
      );
    }
  } catch (err) {
    console.error("Error maintaining building tasks:", err);
  }
}

export async function getPlayerTasks(playerId) {
  const tasksRes = await db.query(
    `
    SELECT pt.*, r.name AS recipe_name, r.craft_time_seconds, 
    r.recipe_type, r.output_resource_id, r.output_amount, 
    r.output_building_id, pb.workers_assigned, 
    b.name AS building_name, 
    rt.name AS output_resource_name, 
    ROW_NUMBER() OVER ( 
    PARTITION BY pb.building_id 
    ORDER BY pb.id ASC 
    ) AS building_number 
    FROM player_tasks pt 
    JOIN recipes r ON pt.recipe_id = r.id 
    LEFT JOIN player_buildings pb ON pt.player_building_id = pb.id 
    LEFT JOIN buildings b ON pb.building_id = b.id
    LEFT JOIN resource_types rt ON r.output_resource_id = rt.id 
    WHERE pt.player_id = $1
    AND pt.completed = FALSE
    ORDER BY pt.id ASC`,
    [playerId],
  );

  const tasks = tasksRes.rows.map((task) => {
    if (task.player_building_id) {
      task.production_per_minute = Number(
        (
          (task.output_amount * task.workers_assigned * 60) /
          task.craft_time_seconds
        ).toFixed(1),
      );
    }

    return task;
  });

  return tasks;

  return tasksRes.rows;
}
