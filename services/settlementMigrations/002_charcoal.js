import db from "../../db.js";

export default async function migrate(playerId) {
  const resourceRes = await db.query(
    `
    SELECT id
    FROM resource_types
    WHERE name = 'Charcoal'
    `,
  );

  if (resourceRes.rows.length === 0) {
    throw new Error("Charcoal resource type not found");
  }

  const charcoalId = resourceRes.rows[0].id;

  await db.query(
    `
    INSERT INTO player_resources (
      player_id,
      resource_type_id,
      amount
    )
    VALUES ($1, $2, 0)
    ON CONFLICT (player_id, resource_type_id)
    DO NOTHING
    `,
    [playerId, charcoalId],
  );
}
