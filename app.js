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
  const cropsRes = await db.query(`
    SELECT crops.*, crop_types.grow_time_seconds
    FROM crops
    JOIN crop_types ON crops.crop_type_id = crop_types.id
    WHERE crops.player_id = $1
    ORDER BY crops.id ASC`
    ,[playerId]);
  const bankedRes = await db.query(`
    SELECT player_resources.*, resource_types.name
    FROM player_resources
    JOIN resource_types
    ON player_resources.resource_type_id = resource_types.id
    WHERE player_resources.player_id = $1
    ORDER BY player_resources.id ASC`
    ,[playerId]);
  res.render("index.ejs", { crops: cropsRes.rows, resources: bankedRes.rows });
});

app.post("/plant", async (req, res) => {
  const playerId = req.playerId;
  const cropTypeId = req.body.cropTypeId;
  await db.query(`
    INSERT INTO crops 
    (player_id, crop_type_id, planted_at, harvested) 
    VALUES ($1, $2, NOW(), FALSE)`
    ,[playerId, cropTypeId]);
  res.redirect("/");
});

app.post("/harvest", async (req, res) => {
  const playerId = req.playerId;
  const cropId = req.body.cropId;
  const result = await db.query(`
    UPDATE crops SET harvested = TRUE 
    FROM crop_types WHERE crops.id = $1 AND crops.player_id = $2 AND crops.harvested = FALSE AND crops.crop_type_id = crop_types.id 
    AND NOW() >= crops.planted_at + crop_types.grow_time_seconds * INTERVAL '1 second' RETURNING crops.id, crop_types.resource_type_id`,
    [cropId, playerId]);

  if (result.rows.length > 0) {
    const resourceTypeId = result.rows[0].resource_type_id;
    await db.query(`
      INSERT INTO player_resources (player_id, resource_type_id, amount)
      VALUES ($1, $2, 1)
      ON CONFLICT (player_id, resource_type_id)
      DO UPDATE SET amount = player_resources.amount + 1`,
      [playerId, resourceTypeId]);
  }

  res.redirect("/");
});

app.listen(port, () => {
  console.log(
    `Resource management game app listening at http://localhost:${port}`,
  );
});
