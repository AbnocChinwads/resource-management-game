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

app.get('/', async (req, res) => {
    const cropsRes = await db.query("SELECT * FROM crops ORDER BY id ASC");
    const resourcesRes = await db.query("SELECT * FROM resources ORDER BY id ASC");
    res.render('index.ejs', { crops: cropsRes.rows, resources: resourcesRes.rows });
});

app.post('/plant', async (req, res) => {
    await db.query("INSERT INTO crops (planted_at) VALUES (NOW())");
    res.redirect('/');
});

app.post('/harvest', async (req, res) => {
    const result = await db.query("SELECT id FROM crops WHERE harvested = FALSE AND NOW() >= planted_at + INTERVAL '10 seconds'");
    if (result.rows.length === 0) {
        return res.redirect('/');
    }
    const ids = result.rows.map(crop => crop.id);
    for (const id of ids) {
      await db.query("UPDATE crops SET harvested = TRUE WHERE id = $1", [id]);
    }
    await db.query("UPDATE resources SET amount = amount + $1 WHERE resource_type = 'wheat'", [ids.length]);
    
    res.redirect('/');
});

app.listen(port, () => {
  console.log(`Resource management game app listening at http://localhost:${port}`);
});
