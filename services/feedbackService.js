import db from "../db.js";

export async function createBugReport(
  playerId,
  title,
  description,
  page,
  metadata = {},
) {
  const result = await db.query(
    `
    INSERT INTO bug_reports (
      player_id,
      title,
      description,
      page,
      metadata
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id
    `,
    [playerId, title, description, page, metadata],
  );

  return result.rows[0].id;
}

export async function createSuggestion(
  playerId,
  title,
  description,
  page,
  metadata = {},
) {
  const result = await db.query(
    `
    INSERT INTO gameplay_suggestions (
      player_id,
      title,
      description,
      page,
      metadata
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id
    `,
    [playerId, title, description, page, metadata],
  );

  return result.rows[0].id;
}
