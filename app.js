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
  req.playerId = 1;
  next();
});

// Nutrition & population middleware
app.use(async (req, res, next) => {
  const playerId = req.playerId;
  if (!playerId) return next();

  try {
    // Fetch player info
    const playerRes = await db.query(
      `SELECT id, population, workers, food_tick_rate_seconds, last_food_tick
       FROM players
       WHERE id = $1`,
      [playerId],
    );
    const player = playerRes.rows[0];
    if (!player) return next();

    const now = new Date();
    const lastTick = player.last_food_tick
      ? new Date(player.last_food_tick)
      : now;
    const tickRate = player.food_tick_rate_seconds || 1;

    const secondsPassed = Math.floor((now - lastTick) / 1000);
    const ticks = Math.floor(secondsPassed / tickRate);

    let population = player.population;
    let workers = player.workers;

    // Get all edible resources
    const foodRes = await db.query(
      `SELECT pr.resource_type_id, pr.amount, rt.nutrition_value
       FROM player_resources pr
       JOIN resource_types rt ON pr.resource_type_id = rt.id
       WHERE pr.player_id = $1 AND rt.nutrition_value > 0
       ORDER BY rt.nutrition_value DESC`,
      [playerId],
    );

    const foods = foodRes.rows;

    // Calculate total nutrition for display before consumption
    let totalNutrition = foods.reduce(
      (sum, f) => sum + f.amount * f.nutrition_value,
      0,
    );
    res.locals.food = totalNutrition;
    res.locals.population = population;
    res.locals.workers = workers;

    if (ticks <= 0) return next(); // Nothing to consume yet

    // Calculate total nutrition needed
    let totalNutritionNeeded = population * ticks;

    for (let food of foods) {
      if (totalNutritionNeeded <= 0) break;

      const foodNutrition = food.amount * food.nutrition_value;

      if (foodNutrition <= totalNutritionNeeded) {
        totalNutritionNeeded -= foodNutrition;
        food.amount = 0;
      } else {
        const foodNeeded = Math.ceil(
          totalNutritionNeeded / food.nutrition_value,
        );
        food.amount -= foodNeeded;
        totalNutritionNeeded = 0;
      }
    }

    // Population reduction if deficit
    if (totalNutritionNeeded > 0) {
      const starvation = Math.ceil(totalNutritionNeeded / ticks);
      population = Math.max(population - starvation, 0);
    }

    // Update food amounts in DB
    for (let food of foods) {
      await db.query(
        `UPDATE player_resources
         SET amount = $1
         WHERE player_id = $2 AND resource_type_id = $3`,
        [food.amount, playerId, food.resource_type_id],
      );
    }

    // Update player population & last tick
    await db.query(
      `UPDATE players
       SET population = $1, last_food_tick = NOW()
       WHERE id = $2`,
      [population, playerId],
    );

    // Update locals after consumption
    res.locals.population = population;
    res.locals.workers = workers;

    next();
  } catch (err) {
    console.error("Nutrition middleware error:", err);
    next(err);
  }
});

// Homepage
app.get("/", async (req, res) => {
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
      [recipeId],
    );

    for (const resource of resourceRes.rows) {
      const playerRes = await db.query(
        "SELECT amount FROM player_resources WHERE player_id = $1 AND resource_type_id = $2 FOR UPDATE",
        [playerId, resource.resource_type_id],
      );

      const playerAmount = playerRes.rows[0]?.amount || 0;
      if (playerAmount < resource.amount) {
        await db.query("ROLLBACK");
        return res.redirect("/?error=NotEnoughResources");
      }
    }

    for (const resource of resourceRes.rows) {
      await db.query(
        "UPDATE player_resources SET amount = amount - $1 WHERE player_id = $2 AND resource_type_id = $3",
        [resource.amount, playerId, resource.resource_type_id],
      );
    }

    await db.query(
      "INSERT INTO player_tasks (player_id, recipe_id, started_at, completed) VALUES ($1, $2, NOW(), FALSE)",
      [playerId, recipeId],
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
      `UPDATE player_tasks pt
       SET completed = TRUE
       FROM recipes r
       WHERE pt.id = $1 AND pt.player_id = $2 AND pt.completed = FALSE AND pt.recipe_id = r.id
         AND NOW() >= pt.started_at + r.craft_time_seconds * INTERVAL '1 second'
       RETURNING r.output_resource_id, r.output_amount, r.output_building_id`,
      [taskId, playerId],
    );

    if (result.rows.length === 0) {
      await db.query("ROLLBACK");
      return res.redirect("/?error=CouldNotComplete");
    }

    const { output_resource_id, output_amount, output_building_id } =
      result.rows[0];

    if (output_resource_id) {
      await db.query(
        `INSERT INTO player_resources (player_id, resource_type_id, amount)
         VALUES ($1, $2, $3)
         ON CONFLICT (player_id, resource_type_id)
         DO UPDATE SET amount = player_resources.amount + EXCLUDED.amount`,
        [playerId, output_resource_id, output_amount],
      );
    }

    if (output_building_id) {
      await db.query(
        `INSERT INTO player_buildings (player_id, building_id, health, workers, built_at)
         VALUES ($1, $2, 100, 0, NOW())`,
        [playerId, output_building_id],
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
