import express from "express";
import db from "../db.js";
const router = express.Router();

// Homepage
router.get("/", async (req, res) => {
  const playerId = req.playerId;

  try {
    const tasksRes = await db.query(
      `SELECT pt.*, r.name AS recipe_name, r.craft_time_seconds, r.recipe_type, 
              r.output_resource_id, r.output_amount, r.output_building_id
       FROM player_tasks pt
       JOIN recipes r ON pt.recipe_id = r.id
       WHERE pt.player_id = $1 AND pt.completed = FALSE
       ORDER BY pt.id ASC`,
      [playerId],
    );

    const resourcesRes = await db.query(
      `SELECT pr.*, rt.name
       FROM player_resources pr
       JOIN resource_types rt ON pr.resource_type_id = rt.id
       WHERE pr.player_id = $1
       ORDER BY pr.resource_type_id ASC`,
      [playerId],
    );

    const recipesRes = await db.query(`SELECT * FROM recipes ORDER BY id ASC`);

    const recipeInputsRes = await db.query(
      `SELECT * FROM recipe_inputs ORDER BY recipe_id, resource_type_id`,
    );

    const buildingsRes = await db.query(
      `SELECT pb.*, b.name, b.max_workers, b.max_health
       FROM player_buildings pb
       JOIN buildings b ON pb.building_id = b.id
       WHERE pb.player_id = $1
       ORDER BY pb.id ASC`,
      [playerId],
    );

    // Sum all workers assigned
    const totalWorkers = buildingsRes.rows.reduce(
      (sum, b) => sum + b.workers_assigned,
      0,
    );

    res.render("index.ejs", {
      tasks: tasksRes.rows,
      resources: resourcesRes.rows,
      recipes: recipesRes.rows,
      recipeInputs: recipeInputsRes.rows,
      buildings: buildingsRes.rows,
      population: res.locals.population,
      workers: totalWorkers,
      food: res.locals.food,
    });
  } catch (err) {
    console.error("Error loading homepage:", err);
    res.status(500).send("Server error");
  }
});

export default router;
