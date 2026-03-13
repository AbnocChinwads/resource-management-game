import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = process.env.APP_PORT;

// Initialise Database connection
const db = new pg.Client({
  user: process.env.DB_USER,
  host: process.env.DB_URL,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});
try {
  db.connect();
  console.log("Database connected successfully.");
} catch (err) {
  console.error("Database connection error:", err.stack);
  process.exit(1);
}

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Temp dev player
app.use((req, res, next) => {
  req.playerId = 1; // For now, always test as player 1
  next();
});

// Update population/food tick before each route
app.use(async (req, res, next) => {
  const playerId = req.playerId;
  if (!playerId) return next();

  try {
    // Fetch player info
    const playerRes = await db.query(
      `SELECT id, population, workers, food_tick_rate_seconds
       FROM players
       WHERE id = $1`,
      [playerId]
    );

    const player = playerRes.rows[0];
    if (!player) return next();

    // Get Food resource id
    const foodTypeRes = await db.query(
      `SELECT id FROM resource_types WHERE name = 'Food'`
    );

    const foodTypeId = foodTypeRes.rows[0]?.id;

    // Fetch player's current food
    const foodRes = await db.query(
      `SELECT amount
       FROM player_resources
       WHERE player_id = $1 AND resource_type_id = $2`,
      [playerId, foodTypeId]
    );

    let currentFood = foodRes.rows[0]?.amount || 0;

    // Food consumption per tick (1 per worker)
    const foodConsumption = player.workers;

    let newPopulation = player.population;

    if (currentFood >= foodConsumption) {
      currentFood -= foodConsumption;
    } else {
      const deficit = foodConsumption - currentFood;
      newPopulation = Math.max(player.population - deficit, 0);
      currentFood = 0;
    }

    // Update population if changed
    if (newPopulation !== player.population) {
      await db.query(
        `UPDATE players SET population = $1 WHERE id = $2`,
        [newPopulation, playerId]
      );
    }

    // Update food resource
    await db.query(
      `UPDATE player_resources
       SET amount = $1
       WHERE player_id = $2 AND resource_type_id = $3`,
      [currentFood, playerId, foodTypeId]
    );

    // Pass values to frontend
    res.locals.population = newPopulation;
    res.locals.workers = player.workers;
    res.locals.food = currentFood;

    next();
  } catch (err) {
    console.error("Error in food tick middleware:", err);
    next(err);
  }
});

// Homepage
app.get("/", async (req, res) => {
  const playerId = req.playerId;

  try {
    // Active tasks
    const tasksRes = await db.query(
      `
      SELECT pt.*, r.name AS recipe_name, r.craft_time_seconds, r.recipe_type, r.output_resource_id, r.output_amount, r.output_building_id
      FROM player_tasks pt
      JOIN recipes r ON pt.recipe_id = r.id
      WHERE pt.player_id = $1 AND pt.completed = FALSE
      ORDER BY pt.id ASC
      `,
      [playerId]
    );

    // Player resources
    const resourcesRes = await db.query(
      `
      SELECT pr.*, rt.name
      FROM player_resources pr
      JOIN resource_types rt ON pr.resource_type_id = rt.id
      WHERE pr.player_id = $1
      ORDER BY pr.resource_type_id ASC
      `,
      [playerId]
    );

    // All recipes
    const recipesRes = await db.query(
      `
      SELECT *
      FROM recipes
      ORDER BY id ASC
      `
    );

    // Recipe inputs
    const recipeInputsRes = await db.query(
      `
      SELECT *
      FROM recipe_inputs
      ORDER BY recipe_id, resource_type_id
      `
    );

    // Player buildings
    const buildingsRes = await db.query(
      `
      SELECT pb.*, b.name, b.max_workers, b.max_health
      FROM player_buildings pb
      JOIN buildings b ON pb.building_id = b.id
      WHERE pb.player_id = $1
      ORDER BY pb.id ASC
      `,
      [playerId]
    );

    res.render("index.ejs", {
      tasks: tasksRes.rows,
      resources: resourcesRes.rows,
      recipes: recipesRes.rows,
      recipeInputs: recipeInputsRes.rows,
      buildings: buildingsRes.rows,
      population: res.locals.population,
      workers: res.locals.workers,
      food: res.locals.food,
    });
  } catch (err) {
    console.error("Error loading homepage:", err);
    res.status(500).send("Server error");
  }
});

// Start a task
app.post("/start-task", async (req, res) => {
  const playerId = req.playerId;
  const recipeId = req.body.recipeId;

  try {
    await db.query("BEGIN");

    const recipeRes = await db.query("SELECT * FROM recipes WHERE id = $1", [
      recipeId,
    ]);
    const recipe = recipeRes.rows[0];

    const resourceRes = await db.query(
      `SELECT resource_type_id, amount FROM recipe_inputs WHERE recipe_id = $1`,
      [recipeId]
    );

    // Check all inputs
    for (const resource of resourceRes.rows) {
      const playerRes = await db.query(
        "SELECT amount FROM player_resources WHERE player_id = $1 AND resource_type_id = $2 FOR UPDATE",
        [playerId, resource.resource_type_id]
      );

      const playerAmount = playerRes.rows[0]?.amount || 0;
      if (playerAmount < resource.amount) {
        await db.query("ROLLBACK");
        return res.redirect("/?error=NotEnoughResources");
      }
    }

    // Deduct all inputs
    for (const resource of resourceRes.rows) {
      await db.query(
        "UPDATE player_resources SET amount = amount - $1 WHERE player_id = $2 AND resource_type_id = $3",
        [resource.amount, playerId, resource.resource_type_id]
      );
    }

    // Start task
    await db.query(
      "INSERT INTO player_tasks (player_id, recipe_id, started_at, completed) VALUES ($1, $2, NOW(), FALSE)",
      [playerId, recipeId]
    );

    await db.query("COMMIT");
  } catch (err) {
    await db.query("ROLLBACK");
    console.error(err);
  }

  res.redirect("/");
});

// Complete a task
app.post("/complete-task", async (req, res) => {
  const playerId = req.playerId;
  const taskId = req.body.taskId;

  try {
    await db.query("BEGIN");

    const result = await db.query(
      `
      UPDATE player_tasks pt
      SET completed = TRUE
      FROM recipes r
      WHERE pt.id = $1
        AND pt.player_id = $2
        AND pt.completed = FALSE
        AND pt.recipe_id = r.id
        AND NOW() >= pt.started_at + r.craft_time_seconds * INTERVAL '1 second'
      RETURNING r.output_resource_id, r.output_amount, r.output_building_id
      `,
      [taskId, playerId]
    );

    if (result.rows.length === 0) {
      await db.query("ROLLBACK");
      return res.redirect("/?error=CouldNotComplete");
    }

    const { output_resource_id, output_amount, output_building_id } = result.rows[0];

    // Add resource output
    if (output_resource_id) {
      await db.query(
        `
        INSERT INTO player_resources (player_id, resource_type_id, amount)
        VALUES ($1, $2, $3)
        ON CONFLICT (player_id, resource_type_id)
        DO UPDATE SET amount = player_resources.amount + EXCLUDED.amount
        `,
        [playerId, output_resource_id, output_amount]
      );
    }

    // Add building output
    if (output_building_id) {
      await db.query(
        `
        INSERT INTO player_buildings (player_id, building_id, health, workers, built_at)
        VALUES ($1, $2, 100, 0, NOW())
        `,
        [playerId, output_building_id]
      );
    }

    await db.query("COMMIT");
  } catch (err) {
    await db.query("ROLLBACK");
    console.error(err);
  }

  res.redirect("/");
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
