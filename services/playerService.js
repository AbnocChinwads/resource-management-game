import db from "../db.js";

export async function getAllPlayers() {
  const result = await db.query(`
        SELECT id, name
        FROM players
        ORDER BY name
    `);

  return result.rows;
}

export async function getActivePlayers() {
  const result = await db.query(
    `
    SELECT id
    FROM players
    `,
  );

  return result.rows;
}
