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
