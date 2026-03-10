import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = process.env.APP_PORT;

// Initiliase Database connection

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

// Homepage
app.get("/", async (req, res) => {
  const playerId = req.playerId;

  // Fetch all player tasks in progress
  const tasksRes = await db.query(
    `
    SELECT pt.*, r.name AS recipe_name, r.craft_time_seconds, r.input_resource_id, r.input_amount, r.output_resource_id, r.output_amount
    FROM player_tasks pt
    JOIN recipes r ON pt.recipe_id = r.id
    WHERE pt.player_id = $1
    ORDER BY pt.id ASC
  `,
    [playerId],
  );

  // Fetch all resources for the player
  const resourcesRes = await db.query(
    `
    SELECT pr.*, rt.name
    FROM player_resources pr
    JOIN resource_types rt ON pr.resource_type_id = rt.id
    WHERE pr.player_id = $1
    ORDER BY pr.resource_type_id ASC
  `,
    [playerId],
  );

  // Fetch all recipes for planting/starting tasks
  const recipesRes = await db.query(`
    SELECT *
    FROM recipes
    ORDER BY id ASC
  `);

  res.render("index.ejs", {
    tasks: tasksRes.rows,
    resources: resourcesRes.rows,
    recipes: recipesRes.rows,
  });
});

// Start a task (plant or craft)
app.post("/start-task", async (req, res) => {
  const playerId = req.playerId;
  const recipeId = req.body.recipeId;

  // Get recipe info
  const recipeRes = await db.query("SELECT * FROM recipes WHERE id = $1", [
    recipeId,
  ]);
  const recipe = recipeRes.rows[0];

  // Check if player has enough of input resource
  const playerRes = await db.query(
    "SELECT amount FROM player_resources WHERE player_id = $1 AND resource_type_id = $2",
    [playerId, recipe.input_resource_id],
  );
  const playerAmount = playerRes.rows[0]?.amount || 0;

  if (playerAmount < recipe.input_amount) {
    // Not enough resources
    return res.redirect("/?error=NotEnoughResources");
  }

  // Deduct resources
  await db.query(
    "UPDATE player_resources SET amount = amount - $1 WHERE player_id = $2 AND resource_type_id = $3",
    [recipe.input_amount, playerId, recipe.input_resource_id],
  );

  // Start task
  await db.query(
    "INSERT INTO player_tasks (player_id, recipe_id, started_at, completed) VALUES ($1, $2, NOW(), FALSE)",
    [playerId, recipeId],
  );

  res.redirect("/");
});

// Complete a task
app.post("/complete-task", async (req, res) => {
  const playerId = req.playerId;
  const taskId = req.body.taskId;

  // Mark task complete and add output to player_resources
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
    RETURNING r.output_resource_id, r.output_amount
  `,
    [taskId, playerId],
  );

  if (result.rows.length > 0) {
    const { output_resource_id, output_amount } = result.rows[0];

    // Add to player_resources (create if doesn't exist)
    await db.query(
      `
      INSERT INTO player_resources (player_id, resource_type_id, amount)
      VALUES ($1, $2, $3)
      ON CONFLICT (player_id, resource_type_id)
      DO UPDATE SET amount = player_resources.amount + EXCLUDED.amount
    `,
      [playerId, output_resource_id, output_amount],
    );
  }

  res.redirect("/");
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
