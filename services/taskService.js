export async function maintainBuildingTasks(playerId) {
  try {
    // Fetch all player buildings that have workers
    const buildingsRes = await db.query(
      `SELECT pb.id AS player_building_id, pb.workers_assigned, b.id AS building_id
       FROM player_buildings pb
       JOIN buildings b ON pb.building_id = b.id
       WHERE pb.player_id = $1 AND pb.workers_assigned > 0`,
      [playerId],
    );

    for (const building of buildingsRes.rows) {
      // Fetch all recipes that require this building
      const recipesRes = await db.query(
        `SELECT id AS recipe_id
         FROM recipes
         WHERE recipe_type = 'production'
           AND output_building_id IS NULL -- exclude buildings as outputs if you want
           AND building_id = $1`,
        [building.building_id],
      );

      for (const recipe of recipesRes.rows) {
        // Count active tasks for this building + recipe
        const activeRes = await db.query(
          `SELECT COUNT(*) FROM player_tasks
           WHERE player_id = $1
             AND player_building_id = $2
             AND recipe_id = $3
             AND completed = FALSE`,
          [playerId, building.player_building_id, recipe.recipe_id],
        );

        const activeTasks = parseInt(activeRes.rows[0].count);
        // Calculate missing tasks safely
        const missing = Math.max(
          0,
          Math.min(building.workers_assigned - activeTasks, 10),
        );

        for (let i = 0; i < missing; i++) {
          await db.query(
            `INSERT INTO player_tasks
             (player_id, recipe_id, player_building_id, started_at, completed)
             VALUES ($1, $2, $3, NOW(), FALSE)`,
            [playerId, recipe.recipe_id, building.player_building_id],
          );
        }
      }
    }
  } catch (err) {
    console.error("Error maintaining building tasks:", err);
  }
}
