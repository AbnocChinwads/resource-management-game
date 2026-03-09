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
  process.exit(1); // Exit the application if the database connection fails
}

app.use(bodyParser.urlencoded({ extended: true })); // Allows us to pass webpage information to the server
app.use(express.static("public")); // Allows use of static files with expressjs

// Temp development player
app.use((req, res, next) => {
  req.playerId = 1;
  next();
});

app.get("/", async (req, res) => {
  const playerId = req.playerId;

  // Player tasks (active jobs)
  const tasksRes = await db.query(`
    SELECT pt.*, r.name AS recipe_name, r.craft_time_seconds, r.output_resource_id, r.output_amount
    FROM player_tasks pt
    JOIN recipes r ON pt.recipe_id = r.id
    WHERE pt.player_id = $1
    ORDER BY pt.id ASC
  `, [playerId]);

  // All recipes (for planting buttons)
  const recipesRes = await db.query(`
    SELECT * FROM recipes ORDER BY id ASC
  `);

  // Player resources
  const resourcesRes = await db.query(`
    SELECT pr.*, rt.name
    FROM player_resources pr
    JOIN resource_types rt ON pr.resource_type_id = rt.id
    WHERE pr.player_id = $1
    ORDER BY pr.resource_type_id ASC
  `, [playerId]);

  res.render("index.ejs", { tasks: tasksRes.rows, recipes: recipesRes.rows, resources: resourcesRes.rows });
});

app.post("/start-task", async (req, res) => {
  const playerId = req.playerId;
  const recipeId = req.body.recipeId;

  await db.query(
    `INSERT INTO player_tasks (player_id, recipe_id) VALUES ($1, $2)`,
    [playerId, recipeId]
  );

  res.redirect("/");
});

app.post("/complete-task", async (req, res) => {
  const playerId = req.playerId;
  const taskId = req.body.taskId;

  const result = await db.query(`
    SELECT pt.id, r.output_resource_id, r.output_amount, r.craft_time_seconds
    FROM player_tasks pt
    JOIN recipes r ON pt.recipe_id = r.id
    WHERE pt.id = $1 AND pt.player_id = $2 AND pt.finished = FALSE
      AND NOW() >= pt.started_at + r.craft_time_seconds * INTERVAL '1 second'
  `, [taskId, playerId]);

  if (result.rows.length > 0) {
    const { id, output_resource_id, output_amount } = result.rows[0];

    // Mark task as finished
    await db.query(`UPDATE player_tasks SET finished = TRUE WHERE id = $1`, [id]);

    // Add resources
    await db.query(`
      INSERT INTO player_resources (player_id, resource_type_id, amount)
      VALUES ($1, $2, $3)
      ON CONFLICT (player_id, resource_type_id)
      DO UPDATE SET amount = player_resources.amount + EXCLUDED.amount
    `, [playerId, output_resource_id, output_amount]);
  }

  res.redirect("/");
});

app.listen(port, () => {
  console.log(
    `Resource management game app listening at http://localhost:${port}`,
  );
});
